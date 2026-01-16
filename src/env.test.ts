import { describe, expect, it } from "vitest";
import { z } from "zod";

// Test the validation schema logic directly rather than the env module
// (which has side effects on import and module caching issues)
describe("env validation schema", () => {
  // Replicate the server schema from env.js
  const createServerSchema = (nodeEnv: string) => ({
    AUTH_SECRET:
      nodeEnv === "production" ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  });

  describe("DATABASE_URL", () => {
    it("requires a valid URL format", () => {
      const schema = z.object(createServerSchema("development"));

      const validResult = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
      });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({
        DATABASE_URL: "not-a-url",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("AUTH_DISCORD_ID", () => {
    it("is required", () => {
      const schema = z.object(createServerSchema("development"));

      const result = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_SECRET: "test-secret",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("AUTH_DISCORD_SECRET", () => {
    it("is required", () => {
      const schema = z.object(createServerSchema("development"));

      const result = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("AUTH_SECRET", () => {
    it("is optional in development", () => {
      const schema = z.object(createServerSchema("development"));

      const result = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
        // AUTH_SECRET not provided
      });
      expect(result.success).toBe(true);
    });

    it("is required in production", () => {
      const schema = z.object(createServerSchema("production"));

      const resultWithoutSecret = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
        NODE_ENV: "production",
      });
      expect(resultWithoutSecret.success).toBe(false);

      const resultWithSecret = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
        AUTH_SECRET: "my-secret-key",
        NODE_ENV: "production",
      });
      expect(resultWithSecret.success).toBe(true);
    });
  });

  describe("NODE_ENV", () => {
    it("defaults to development", () => {
      const schema = z.object(createServerSchema("development"));

      const result = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
      }
    });

    it("only accepts valid environment values", () => {
      const schema = z.object(createServerSchema("development"));

      const validEnvs = ["development", "test", "production"];
      for (const env of validEnvs) {
        const result = schema.safeParse({
          DATABASE_URL: "file:./db.sqlite",
          AUTH_DISCORD_ID: "test-id",
          AUTH_DISCORD_SECRET: "test-secret",
          NODE_ENV: env,
        });
        expect(result.success).toBe(true);
      }

      const invalidResult = schema.safeParse({
        DATABASE_URL: "file:./db.sqlite",
        AUTH_DISCORD_ID: "test-id",
        AUTH_DISCORD_SECRET: "test-secret",
        NODE_ENV: "staging",
      });
      expect(invalidResult.success).toBe(false);
    });
  });
});
