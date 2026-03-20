import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

/**
 * Validates the `Authorization: Bearer <key>` header against API_SECRET_KEY.
 * Returns an error Response on failure, or null if the key is valid.
 */
export function validateApiKey(request: Request): Response | null {
  if (!env.API_SECRET_KEY) {
    return Response.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "API key not configured on this server." } },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Missing Authorization header. Use: Authorization: Bearer <key>" } },
      { status: 401 },
    );
  }

  // Constant-time comparison to prevent timing attacks
  const expected = Buffer.from(env.API_SECRET_KEY, "utf8");
  const provided = Buffer.from(token, "utf8");

  const valid =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!valid) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid API key." } },
      { status: 401 },
    );
  }

  return null;
}
