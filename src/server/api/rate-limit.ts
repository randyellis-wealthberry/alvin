import { Ratelimit } from "@upstash/ratelimit";
import { TRPCError } from "@trpc/server";
import { redis } from "~/lib/redis";

/**
 * Redis-backed rate limiters using @upstash/ratelimit sliding window algorithm.
 * Each limiter targets a different use case with appropriate limits.
 */

/** General API rate limit: 100 requests per 60s per IP */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  prefix: "ratelimit:api",
});

/** Auth rate limit: 10 attempts per 60s per IP (login, register) */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:auth",
});

/** AI chat rate limit: 20 messages per 60s per user */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "ratelimit:chat",
});

/**
 * Check rate limit and throw TRPCError if exceeded.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<void> {
  const { success } = await limiter.limit(identifier);
  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }
}
