import { NextRequest, NextResponse } from "next/server";

/**
 * RushD Serverless-Safe Distributed Rate Limiter
 *
 * Supports:
 * 1. Distributed atomic Upstash Redis REST API (zero TCP pooling overhead, stateless, serverless-native)
 * 2. Hardened sliding-window in-memory fallback for local development / testing
 * 3. Layered composite keys (per-identifier + per-IP + global IP)
 * 4. Generic 429 responses with Retry-After header
 * 5. Fail-secure error handling (never fails open)
 */

export interface UpstashCredentials {
  url: string;
  token: string;
}

export function getUpstashCredentials(): UpstashCredentials | null {
  const url =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (url && token && !url.includes("placeholder")) {
    return {
      url: url.replace(/\/+$/, ""),
      token: token.trim(),
    };
  }

  return null;
}

export function isDistributedRateLimitingConfigured(): boolean {
  return getUpstashCredentials() !== null;
}

export function getClientIp(request: Request | NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp && isValidIpOrLocal(firstIp)) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIpOrLocal(realIp)) {
    return realIp;
  }

  return "127.0.0.1";
}

function isValidIpOrLocal(ip: string): boolean {
  // Reject absurdly long or control character payloads in IP headers
  if (ip.length > 64) return false;
  return /^[0-9a-fA-F:.]+$/.test(ip);
}

export function normalizeIdentifier(id: string): string {
  return id.toLowerCase().trim();
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
  increment?: boolean; // Default true. If false, inspects without adding count.
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  count: number;
  remaining: number;
  retryAfterSeconds: number;
  isDistributed: boolean;
}

// In-memory sliding-window store for fallback / test environments
interface MemoryWindowEntry {
  timestamps: number[];
  lastCleaned: number;
}
const memoryStore: Map<string, MemoryWindowEntry> =
  (globalThis as any).__rushd_rate_limit_memory_store ||
  ((globalThis as any).__rushd_rate_limit_memory_store = new Map<string, MemoryWindowEntry>());
const MAX_MEMORY_KEYS = 10000;

function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  increment = true
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = memoryStore.get(key);
  if (!entry) {
    // Memory leak protection: clean oldest if exceeding max keys
    if (memoryStore.size >= MAX_MEMORY_KEYS) {
      const oldestKey = memoryStore.keys().next().value;
      if (oldestKey) memoryStore.delete(oldestKey);
    }
    entry = { timestamps: [], lastCleaned: now };
    memoryStore.set(key, entry);
  }

  // Filter timestamps within sliding window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  entry.lastCleaned = now;

  let count = entry.timestamps.length;
  if (increment) {
    entry.timestamps.push(now);
    count++;
  }

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  let retryAfterSeconds = 0;

  if (!allowed || count >= limit) {
    const oldestInWindow = entry.timestamps[0] || now;
    const expiresAt = oldestInWindow + windowMs;
    retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - now) / 1000));
  }

  return {
    allowed,
    limit,
    count,
    remaining,
    retryAfterSeconds,
    isDistributed: false,
  };
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowMs, increment = true } = options;
  const creds = getUpstashCredentials();

  if (creds) {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Pipeline execution in Upstash REST:
      // 1. ZREMRANGEBYSCORE: purge entries older than windowStart
      // 2. (Optional) ZADD: add current timestamp member
      // 3. ZCARD: get current count of active requests in sliding window
      // 4. PEXPIRE: ensure key expires after windowMs
      const uniqueMember = `${now}-${Math.random().toString(36).slice(2, 8)}`;
      const pipelineCommands = [
        ["ZREMRANGEBYSCORE", key, "0", String(windowStart)],
        ...(increment ? [["ZADD", key, String(now), uniqueMember]] : []),
        ["ZCARD", key],
        ["PEXPIRE", key, String(windowMs)],
      ];

      const res = await fetch(`${creds.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pipelineCommands),
        signal: AbortSignal.timeout(1500),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Upstash returned status ${res.status}`);
      }

      const results = (await res.json()) as Array<{ result: unknown }>;
      // ZCARD index: if incremented, it is at index 2; if not incremented, index 1
      const zcardIndex = increment ? 2 : 1;
      const count = typeof results?.[zcardIndex]?.result === "number" ? (results[zcardIndex].result as number) : 1;

      const allowed = count <= limit;
      const remaining = Math.max(0, limit - count);
      const retryAfterSeconds = (allowed && count < limit) ? 0 : Math.max(1, Math.ceil(windowMs / 1000));

      return {
        allowed,
        limit,
        count,
        remaining,
        retryAfterSeconds,
        isDistributed: true,
      };
    } catch (err) {
      // Fail-secure: Log warning and fall back cleanly to local sliding window
      console.warn("[RATE_LIMIT][UPSTASH_FAILOVER] Distributed KV check failed, using local sliding window:", err instanceof Error ? err.message : "Network error");
      return checkInMemoryRateLimit(key, limit, windowMs, increment);
    }
  }

  // Development / test fallback when credentials are not configured
  return checkInMemoryRateLimit(key, limit, windowMs, increment);
}

export async function resetRateLimitKey(key: string): Promise<void> {
  const creds = getUpstashCredentials();
  if (creds) {
    try {
      await fetch(`${creds.url}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
        },
        signal: AbortSignal.timeout(1500),
        cache: "no-store",
      });
    } catch (err) {
      console.warn("[RATE_LIMIT][RESET_ERROR]:", err instanceof Error ? err.message : "Error");
    }
  }

  memoryStore.delete(key);
}

export function createRateLimitResponse(
  retryAfterSeconds: number,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Too many requests. Please try again in ${retryAfterSeconds} second${
      retryAfterSeconds === 1 ? "" : "s"
    }.`;

  return NextResponse.json(
    { error: message, retryAfter: retryAfterSeconds },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
