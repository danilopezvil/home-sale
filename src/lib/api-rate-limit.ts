/**
 * In-memory sliding-window rate limiter.
 *
 * Works per Vercel serverless instance. For high-traffic production use,
 * replace the store with Upstash Redis (@upstash/ratelimit).
 */

type Window = { count: number; resetAt: number };

const store = new Map<string, Window>();

// Clean up expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of store) {
    if (now > window.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export type RateLimitResult =
  | { limited: false; remaining: number; limit: number; resetAt: number }
  | { limited: true; remaining: 0; limit: number; resetAt: number };

/**
 * @param key    Unique identifier (e.g. IP address)
 * @param limit  Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, limit, resetAt: now + windowMs };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return { limited: true, remaining: 0, limit, resetAt: existing.resetAt };
  }

  return { limited: false, remaining: limit - existing.count, limit, resetAt: existing.resetAt };
}

/** Returns the client IP from standard Vercel/proxy headers. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Adds rate-limit headers to a response. */
export function applyRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
): void {
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  if (result.limited) {
    headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
  }
}
