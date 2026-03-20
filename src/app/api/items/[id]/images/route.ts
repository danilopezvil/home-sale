import crypto from "crypto";

import { validateApiKey } from "@/lib/api-auth";
import { rateLimit, getClientIp, applyRateLimitHeaders } from "@/lib/api-rate-limit";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_REQUEST = 10;

function normalizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

// POST /api/items/[id]/images
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth
  const authError = validateApiKey(request);
  if (authError) return authError;

  // 2. Rate limit — 20 write requests / 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`images-write:${ip}`, 20, 60_000);
  const headers = new Headers({ "Content-Type": "application/json" });
  applyRateLimitHeaders(headers, rl);

  if (rl.limited) {
    return new Response(
      JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Check Retry-After header." } }),
      { status: 429, headers },
    );
  }

  const { id: itemId } = await params;

  // 3. Verify item exists
  const { data: item, error: itemError } = await supabaseServiceRoleClient
    .from("items")
    .select("id")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return new Response(
      JSON.stringify({ error: { code: "NOT_FOUND", message: `Item ${itemId} not found.` } }),
      { status: 404, headers },
    );
  }

  // 4. Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: "Request must be multipart/form-data." } }),
      { status: 400, headers },
    );
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: 'No files found. Use field name "images".' } }),
      { status: 400, headers },
    );
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: `Max ${MAX_FILES_PER_REQUEST} files per request.` } }),
      { status: 400, headers },
    );
  }

  // 5. Validate each file before uploading anything
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `File "${file.name}" has unsupported type "${file.type}". Allowed: jpeg, png, webp.`,
          },
        }),
        { status: 415, headers },
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `File "${file.name}" exceeds the 10 MB limit.`,
          },
        }),
        { status: 413, headers },
      );
    }
  }

  // 6. Get current max sort_order for this item
  const { data: existingImages } = await supabaseServiceRoleClient
    .from("item_images")
    .select("sort_order")
    .eq("item_id", itemId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let nextSortOrder = existingImages && existingImages.length > 0
    ? (existingImages[0].sort_order ?? 0) + 1
    : 1;

  // 7. Upload files and insert DB rows
  const results: Array<{ file: string; success: boolean; data?: { id: string; image_url: string; sort_order: number }; error?: string }> = [];

  for (const file of files) {
    const filePath = `items/${itemId}/${Date.now()}-${crypto.randomUUID()}-${normalizeFilename(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseServiceRoleClient.storage
      .from("item-images")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[POST /api/items/[id]/images] Storage upload error", uploadError);
      results.push({ file: file.name, success: false, error: "Storage upload failed." });
      continue;
    }

    const { data: urlData } = supabaseServiceRoleClient.storage
      .from("item-images")
      .getPublicUrl(filePath);

    const { data: row, error: dbError } = await supabaseServiceRoleClient
      .from("item_images")
      .insert({ item_id: itemId, image_url: urlData.publicUrl, sort_order: nextSortOrder })
      .select("id, image_url, sort_order")
      .single();

    if (dbError) {
      console.error("[POST /api/items/[id]/images] DB insert error", dbError);
      // Best-effort: remove the orphaned storage file
      await supabaseServiceRoleClient.storage.from("item-images").remove([filePath]);
      results.push({ file: file.name, success: false, error: "Database insert failed." });
      continue;
    }

    results.push({ file: file.name, success: true, data: row });
    nextSortOrder += 1;
  }

  const successCount = results.filter((r) => r.success).length;
  const status = successCount === 0 ? 500 : successCount < files.length ? 207 : 201;

  return new Response(
    JSON.stringify({
      data: results.filter((r) => r.success).map((r) => r.data),
      meta: { total: files.length, uploaded: successCount, failed: files.length - successCount },
      ...(results.some((r) => !r.success) ? { errors: results.filter((r) => !r.success) } : {}),
    }),
    { status, headers },
  );
}
