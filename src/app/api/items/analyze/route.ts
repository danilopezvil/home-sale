import crypto from "crypto";

import { validateApiKey } from "@/lib/api-auth";
import { rateLimit, getClientIp, applyRateLimitHeaders } from "@/lib/api-rate-limit";
import { analyzeImage, isLLMConfigured, getLLMProviderName } from "@/lib/llm";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 100 * 1024; // 100 KB

// POST /api/items/analyze
export async function POST(request: Request) {
  // 1. Auth
  const authError = validateApiKey(request);
  if (authError) return authError;

  // 2. LLM key check
  if (!isLLMConfigured()) {
    return Response.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: `Image analysis is not configured on this server (provider: ${getLLMProviderName()}).` } },
      { status: 503 },
    );
  }

  // 3. Rate limit — 10 analyze requests / 60 s per IP (LLM calls are expensive)
  const ip = getClientIp(request);
  const rl = rateLimit(`analyze:${ip}`, 10, 60_000);
  const headers = new Headers({ "Content-Type": "application/json" });
  applyRateLimitHeaders(headers, rl);

  if (rl.limited) {
    return new Response(
      JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Check Retry-After header." } }),
      { status: 429, headers },
    );
  }

  // 4. Parse multipart
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: "Request must be multipart/form-data." } }),
      { status: 400, headers },
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: 'No file found. Use field name "image".' } }),
      { status: 400, headers },
    );
  }

  // 5. Validate type and size
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return new Response(
      JSON.stringify({
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: `Unsupported file type "${file.type}". Allowed: image/jpeg, image/png, image/webp.`,
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
          message: `Image exceeds the 100 KB limit (received ${(file.size / 1024).toFixed(1)} KB).`,
        },
      }),
      { status: 413, headers },
    );
  }

  // 6. Upload to Storage under drafts/
  const draftId = crypto.randomUUID();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `items/drafts/${draftId}/original.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseServiceRoleClient.storage
    .from("item-images")
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[POST /api/items/analyze] Storage upload error", uploadError);
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Failed to upload image." } }),
      { status: 500, headers },
    );
  }

  const { data: urlData } = supabaseServiceRoleClient.storage
    .from("item-images")
    .getPublicUrl(filePath);

  // 7. Call LLM
  let suggestion: Awaited<ReturnType<typeof analyzeImage>>;
  try {
    const base64 = buffer.toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";
    suggestion = await analyzeImage(base64, mediaType);
  } catch (err) {
    console.error("[POST /api/items/analyze] LLM error", err);
    // Clean up the uploaded draft image on LLM failure
    await supabaseServiceRoleClient.storage.from("item-images").remove([filePath]);
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Image analysis failed." } }),
      { status: 500, headers },
    );
  }

  return new Response(
    JSON.stringify({
      draft_id: draftId,
      image_url: urlData.publicUrl,
      suggestion,
    }),
    { status: 200, headers },
  );
}
