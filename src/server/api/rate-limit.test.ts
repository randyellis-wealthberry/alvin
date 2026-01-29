import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock the Redis module before importing rate-limit
vi.mock("~/lib/redis", () => ({
  redis: {
    eval: vi.fn(),
    evalsha: vi.fn(),
    scriptLoad: vi.fn(),
  },
}));

// Mock @upstash/ratelimit
const mockLimit = vi.fn();
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class MockRatelimit {
    static slidingWindow() {
      return {};
    }
    limit = mockLimit;
  },
}));

import { checkRateLimit, apiRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  describe("checkRateLimit", () => {
    it("allows requests when under limit", async () => {
      mockLimit.mockResolvedValueOnce({ success: true });
      await expect(
        checkRateLimit(apiRateLimit, "user-1"),
      ).resolves.toBeUndefined();
    });

    it("throws TOO_MANY_REQUESTS when limit exceeded", async () => {
      mockLimit.mockResolvedValueOnce({ success: false });
      await expect(checkRateLimit(apiRateLimit, "user-1")).rejects.toThrow(
        TRPCError,
      );
      await expect(checkRateLimit(apiRateLimit, "user-1")).rejects.toThrow(
        "Rate limit exceeded",
      );
    });
  });
});
