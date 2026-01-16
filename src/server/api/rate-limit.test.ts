import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkRateLimit,
  resetRateLimitStore,
  type RateLimitConfig,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    const config: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 3,
    };

    it("allows requests under the limit", () => {
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
    });

    it("throws TOO_MANY_REQUESTS when limit exceeded", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      expect(() => checkRateLimit("user-1", config)).toThrow(
        "Rate limit exceeded"
      );
    });

    it("resets after window expires", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      // Advance time past the window
      vi.advanceTimersByTime(60001);

      // Should allow requests again
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
    });

    it("tracks different identifiers independently", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      // user-2 should still be able to make requests
      expect(() => checkRateLimit("user-2", config)).not.toThrow();
    });

    it("uses default config when none provided", () => {
      // Should not throw with default config (100 requests per minute)
      for (let i = 0; i < 100; i++) {
        expect(() => checkRateLimit("user-1")).not.toThrow();
      }
    });
  });
});
