import { z } from "zod";

import { validateApiKey } from "@/lib/api-auth";
import { rateLimit, getClientIp, applyRateLimitHeaders } from "@/lib/api-rate-limit";
import { categoryValues } from "@/lib/category-meta";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const conditionValues = ["new", "like_new", "good", "fair", "parts"] as const;

const confirmSchema = z.object({
  draft_id: z.string().uuid("draft_id must be a valid UUID from the analyze step"),
  image_url: z.string().url("image_url must be a valid URL from the analyze step"),
  title: z.string().trim().min(1, "title is required"),
  description: z.string().trim().optional(),
  price: z
    .number({ invalid_type_error: "price must be a number" })
    .finite()
    .min(0, "price must be 0 or greater"),
  category: z.enum(categoryValues, {
    errorMap: () => ({ message: `category must be one of: ${categoryValues.join(", ")}` }),
  }),
  condition: z.enum(conditionValues, {
    errorMap: () => ({ message: `condition must be one of: ${conditionValues.join(", ")}` }),
  }),
  pickup_area: z.string().trim().min(1, "pickup_area is required"),
});

// POST /api/items/confirm
export async function POST(request: Request) {
  // 1. Auth
  const authError = validateApiKey(request);
  if (authError) return authError;

  // 2. Rate limit — 20 write requests / 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`confirm:${ip}`, 20, 60_000);
  const headers = new Headers({ "Content-Type": "application/json" });
  applyRateLimitHeaders(headers, rl);

  if (rl.limited) {
    return new Response(
      JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Check Retry-After header." } }),
      { status: 429, headers },
    );
  }

  // 3. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "BAD_REQUEST", message: "Request body must be valid JSON." } }),
      { status: 400, headers },
    );
  }

  // 4. Validate
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return new Response(
      JSON.stringify({ error: { code: "VALIDATION_ERROR", message: "Validation failed.", fields } }),
      { status: 422, headers },
    );
  }

  const { draft_id, image_url, ...itemFields } = parsed.data;

  // 5. Verify the draft image exists in storage
  const expectedPathPrefix = `items/drafts/${draft_id}/`;
  if (!image_url.includes(expectedPathPrefix)) {
    return new Response(
      JSON.stringify({
        error: {
          code: "BAD_REQUEST",
          message: "image_url does not match draft_id. Use the values returned by /api/items/analyze.",
        },
      }),
      { status: 400, headers },
    );
  }

  // 6. Create item
  const { data: item, error: itemError } = await supabaseServiceRoleClient
    .from("items")
    .insert({
      title: itemFields.title,
      description: itemFields.description?.trim() || null,
      price: itemFields.price,
      category: itemFields.category,
      condition: itemFields.condition,
      pickup_area: itemFields.pickup_area,
      status: "available",
    })
    .select("id, title, description, price, category, condition, pickup_area, status, created_at")
    .single();

  if (itemError || !item) {
    console.error("[POST /api/items/confirm] Item insert error", itemError);
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Failed to create item." } }),
      { status: 500, headers },
    );
  }

  // 7. Link the draft image to the new item
  const { data: imageRow, error: imageError } = await supabaseServiceRoleClient
    .from("item_images")
    .insert({ item_id: item.id, image_url, sort_order: 1 })
    .select("id, image_url, sort_order")
    .single();

  if (imageError) {
    console.error("[POST /api/items/confirm] Image insert error", imageError);
    // Item was created — return it without the image rather than rolling back
    return new Response(
      JSON.stringify({
        data: { ...item, images: [] },
        warning: "Item created but image could not be linked. Upload it manually via POST /api/items/:id/images.",
      }),
      { status: 201, headers },
    );
  }

  return new Response(
    JSON.stringify({
      data: {
        ...item,
        images: [imageRow],
      },
    }),
    { status: 201, headers },
  );
}
