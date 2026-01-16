/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth before importing anything that uses it
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

// Mock Prisma
vi.mock("~/server/db", () => ({
  db: {
    post: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

// Mock rate limit to avoid interference
vi.mock("~/server/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  resetRateLimitStore: vi.fn(),
}));

import { appRouter } from "~/server/api/root";
import { type createTRPCContext } from "~/server/api/trpc";
import { db } from "~/server/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDb = db as any;

describe("post router", () => {
  const mockSession = {
    user: { id: "user-123", name: "Test User", email: "test@example.com" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const createCaller = (session: typeof mockSession | null) => {
    const ctx = {
      db: mockDb,
      session,
      headers: new Headers(),
    } as unknown as Awaited<ReturnType<typeof createTRPCContext>>;
    return appRouter.createCaller(ctx);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hello", () => {
    it("returns greeting with input text", async () => {
      const caller = createCaller(null);
      const result = await caller.post.hello({ text: "World" });
      expect(result.greeting).toBe("Hello World");
    });
  });

  describe("create", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.create({ name: "Test Post" })).rejects.toThrow(
        TRPCError,
      );
    });

    it("creates post with valid input", async () => {
      const caller = createCaller(mockSession);
      const mockPost = {
        id: 1,
        name: "Test Post",
        createdById: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.post.create.mockResolvedValue(mockPost);

      const result = await caller.post.create({ name: "Test Post" });

      expect(result).toEqual(mockPost);
      expect(mockDb.post.create).toHaveBeenCalledWith({
        data: {
          name: "Test Post",
          createdBy: { connect: { id: "user-123" } },
        },
      });
    });
  });

  describe("getLatest", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.getLatest()).rejects.toThrow(TRPCError);
    });

    it("returns the most recent post for user", async () => {
      const caller = createCaller(mockSession);
      const mockPost = {
        id: 1,
        name: "Latest Post",
        createdById: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.post.findFirst.mockResolvedValue(mockPost);

      const result = await caller.post.getLatest();

      expect(result).toEqual(mockPost);
      expect(mockDb.post.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        where: { createdBy: { id: "user-123" } },
      });
    });

    it("returns null when no posts exist", async () => {
      const caller = createCaller(mockSession);
      mockDb.post.findFirst.mockResolvedValue(null);

      const result = await caller.post.getLatest();

      expect(result).toBeNull();
    });
  });

  describe("getSecretMessage", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.getSecretMessage()).rejects.toThrow(TRPCError);
    });

    it("returns secret message when authenticated", async () => {
      const caller = createCaller(mockSession);
      const result = await caller.post.getSecretMessage();
      expect(result).toBe("you can now see this secret message!");
    });
  });
});
