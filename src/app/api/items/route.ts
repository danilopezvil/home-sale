import { z } from "zod";

import { validateApiKey } from "@/lib/api-auth";
import { rateLimit, getClientIp, applyRateLimitHeaders } from "@/lib/api-rate-limit";
import { categoryValues } from "@/lib/category-meta";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const conditionValues = ["new", "like_new", "good", "fair", "parts"] as const;

const createItemSchema = z.object({
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

// POST /api/items
export async function POST(request: Request) {
  // 1. Auth
  const authError = validateApiKey(request);
  if (authError) return authError;

  // 2. Rate limit — 20 write requests / 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`items-write:${ip}`, 20, 60_000);
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
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return new Response(
      JSON.stringify({ error: { code: "VALIDATION_ERROR", message: "Validation failed.", fields } }),
      { status: 422, headers },
    );
  }

  // 5. Insert
  const { data, error } = await supabaseServiceRoleClient
    .from("items")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description?.trim() || null,
      price: parsed.data.price,
      category: parsed.data.category,
      condition: parsed.data.condition,
      pickup_area: parsed.data.pickup_area,
      status: "available",
    })
    .select("id, title, description, price, category, condition, pickup_area, status, created_at")
    .single();

  if (error) {
    console.error("[POST /api/items] DB error", error);
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Failed to create item." } }),
      { status: 500, headers },
    );
  }

  return new Response(JSON.stringify({ data }), { status: 201, headers });
}
