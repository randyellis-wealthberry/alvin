/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth before importing trpc
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {},
}));

import { auth } from "~/server/auth";
import { createTRPCContext } from "./trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = auth as any;

describe("tRPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTRPCContext", () => {
    it("creates context with session when authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", name: "Test", email: "test@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const headers = new Headers();
      headers.set("x-test", "value");

      const ctx = await createTRPCContext({ headers });

      expect(ctx.session).toEqual(mockSession);
      expect(ctx.headers).toBe(headers);
      expect(ctx.db).toBeDefined();
    });

    it("creates context without session when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx.session).toBeNull();
      expect(ctx.headers).toBe(headers);
    });
  });
});
