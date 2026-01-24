import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback for development when Redis isn't configured
class InMemoryRedis {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

  async set<T>(
    key: string,
    value: T,
    options?: { ex?: number },
  ): Promise<"OK"> {
    const expiresAt = options?.ex
      ? Date.now() + options.ex * 1000
      : undefined;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

// Use real Redis in production, fallback to in-memory in development
export const redis: Pick<Redis, "set" | "get" | "del"> = isRedisConfigured
  ? Redis.fromEnv()
  : new InMemoryRedis();

// Log warning in development if using fallback
if (!isRedisConfigured && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  Redis not configured - using in-memory fallback. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production parity.",
  );
}
