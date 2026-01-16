import { TRPCError } from "@trpc/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): void {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now);
  }

  if (!entry || now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return;
  }

  if (entry.count >= config.maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  entry.count++;
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export function resetRateLimitStore(): void {
  store.clear();
}
