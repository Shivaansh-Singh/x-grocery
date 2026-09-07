import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import createCrypto from "node:crypto";
import https from "node:https";
import { createClient } from "@/lib/supabase/server";

interface SupabaseJwk {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  kid?: string;
  alg?: string;
  use?: string;
}

interface JwksResponse {
  keys: SupabaseJwk[];
}

export interface VerifiedJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
  iss?: string;
  aud?: string | string[];
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    full_name?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    (value === Role.CUSTOMER ||
      value === Role.STORE_ADMIN ||
      value === Role.DELIVERY_PARTNER)
  );
}

let jwksCache: SupabaseJwk[] | null = (globalThis as any).__rushd_jwks_cache || null;
let lastJwksFetch = (globalThis as any).__rushd_last_jwks_fetch || 0;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

export function setTestJwks(keys: SupabaseJwk[] | null): void {
  jwksCache = keys;
  lastJwksFetch = Date.now();
  (globalThis as any).__rushd_jwks_cache = keys;
  (globalThis as any).__rushd_last_jwks_fetch = lastJwksFetch;
}

async function fetchJwks(supabaseUrl: string): Promise<SupabaseJwk[]> {
  const now = Date.now();
  const activeCache = jwksCache || (globalThis as any).__rushd_jwks_cache;
  const activeLastFetch = lastJwksFetch || (globalThis as any).__rushd_last_jwks_fetch || 0;
  if (activeCache && now - activeLastFetch < JWKS_CACHE_TTL_MS) {
    return activeCache;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");
  const jwksUrl = `${cleanUrl}/auth/v1/.well-known/jwks.json`;

  return new Promise((resolve, reject) => {
    https
      .get(jwksUrl, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body) as JwksResponse;
            if (data && Array.isArray(data.keys) && data.keys.length > 0) {
              jwksCache = data.keys;
              lastJwksFetch = Date.now();
              resolve(jwksCache);
            } else {
              reject(new Error("Invalid JWKS structure returned from Supabase Auth"));
            }
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

export function extractAccessTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  const allCookies = request.cookies.getAll();
  const authCookies = allCookies
    .filter((c) => c.name.includes("auth-token") || c.name.includes("access_token"))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (authCookies.length > 0) {
    const combinedValue = authCookies.map((c) => c.value).join("");
    let parsed: any;
    try {
      parsed = JSON.parse(combinedValue);
    } catch {
      try {
        parsed = JSON.parse(Buffer.from(combinedValue, "base64").toString("utf-8"));
      } catch {
        parsed = null;
      }
    }

    if (parsed?.access_token && typeof parsed.access_token === "string") {
      return parsed.access_token;
    } else if (typeof parsed === "string" && parsed.includes(".")) {
      return parsed;
    } else if (combinedValue.includes(".")) {
      return combinedValue;
    }
  }

  return null;
}

export async function verifySupabaseAccessToken(token: string): Promise<VerifiedJwtPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;

    let header: { alg?: string; kid?: string };
    let payload: VerifiedJwtPayload;

    try {
      header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf-8"));
      payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    } catch {
      return null;
    }

    if (header.alg !== "ES256") {
      return null;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      return null;
    }

    const keys = await fetchJwks(supabaseUrl);
    const matchingKey = keys.find((k) => k.kid === header.kid || k.alg === "ES256");
    if (!matchingKey || !matchingKey.x || !matchingKey.y) {
      return null;
    }

    const publicKey = createCrypto.createPublicKey({
      key: {
        kty: matchingKey.kty,
        crv: matchingKey.crv,
        x: matchingKey.x,
        y: matchingKey.y,
      },
      format: "jwk",
    });

    const signedData = `${headerB64}.${payloadB64}`;
    const sigBuffer = Buffer.from(sigB64, "base64url");

    const isValid = createCrypto.verify(
      "SHA256",
      Buffer.from(signedData),
      { key: publicKey, dsaEncoding: "ieee-p1363" },
      sigBuffer
    );

    if (!isValid) {
      return null;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && nowSec >= payload.exp + 10) {
      return null;
    }

    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const expectedIss = `${cleanUrl}/auth/v1`;
    if (payload.iss && !payload.iss.startsWith(expectedIss) && payload.iss !== cleanUrl) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Local ES256 JWT verification error:", err);
    return null;
  }
}

// Fallback cryptographic verification via Supabase GoTrue API
async function verifyWithSupabaseGoTrue(token: string): Promise<{
  id: string;
  email: string;
  app_metadata?: { role?: string };
  user_metadata?: { full_name?: string; name?: string };
} | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes("placeholder")) {
      return null;
    }

    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.email && data?.id) {
        return {
          id: data.id,
          email: data.email,
          app_metadata: data.app_metadata,
          user_metadata: data.user_metadata,
        };
      }
    }
  } catch (err) {
    console.error("Supabase GoTrue token verification error:", err);
  }
  return null;
}

// Cryptographic verification of session cookies via @supabase/ssr
async function verifyWithSupabaseSsrSession(): Promise<{
  id: string;
  email: string;
  app_metadata?: { role?: string };
  user_metadata?: { full_name?: string; name?: string };
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user?.email && user?.id) {
      return {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata as any,
        user_metadata: user.user_metadata as any,
      };
    }
  } catch (err) {
    console.error("Supabase SSR session verification error:", err);
  }
  return null;
}

/**
 * Authoritatively resolves the requesting user strictly from cryptographically verified
 * Supabase Auth credentials (Bearer JWT or verified SSR session cookies).
 *
 * CRITICAL SECURITY INVARIANT:
 * Client-controlled headers (e.g. x-user-role, x-user-email) and client-controlled cookies
 * (e.g. rushd_user_role, rushd_user_email) MUST NEVER be trusted for authentication or role assignment.
 */
export async function resolveVerifiedUser(request: NextRequest): Promise<{
  id: string;
  email: string;
  role: Role;
  name?: string | null;
} | null> {
  try {
    let authIdentity: {
      id: string;
      email: string;
      app_metadata?: { role?: string };
      user_metadata?: { full_name?: string; name?: string };
    } | null = null;

    // 1. Check Bearer token from request header or auth token cookie
    const token = extractAccessTokenFromRequest(request);
    if (token) {
      const verifiedPayload = await verifySupabaseAccessToken(token);
      if (verifiedPayload?.email) {
        authIdentity = {
          id: verifiedPayload.sub,
          email: verifiedPayload.email,
          app_metadata: verifiedPayload.app_metadata,
          user_metadata: verifiedPayload.user_metadata,
        };
      } else {
        authIdentity = await verifyWithSupabaseGoTrue(token);
      }
    }

    // 2. If token is not present or didn't verify, verify Supabase SSR session
    if (!authIdentity) {
      authIdentity = await verifyWithSupabaseSsrSession();
    }

    // 3. If no legitimate cryptographic Supabase Auth identity was established, REJECT
    if (!authIdentity?.email) {
      return null;
    }

    const cleanEmail = authIdentity.email.toLowerCase().trim();
    const appMetadataRole = authIdentity.app_metadata?.role;

    // 4. Authoritative JWT Fast Path: app_metadata.role
    if (appMetadataRole !== undefined) {
      if (!isValidRole(appMetadataRole)) {
        return null;
      }

      if (appMetadataRole === Role.CUSTOMER) {
        return {
          id: authIdentity.id,
          email: cleanEmail,
          name:
            authIdentity.user_metadata?.full_name ||
            authIdentity.user_metadata?.name ||
            cleanEmail.split("@")[0],
          role: Role.CUSTOMER,
        };
      }

      if (appMetadataRole === Role.STORE_ADMIN) {
        return {
          id: authIdentity.id,
          email: cleanEmail,
          name:
            authIdentity.user_metadata?.full_name ||
            authIdentity.user_metadata?.name ||
            cleanEmail.split("@")[0] ||
            "Store Admin",
          role: Role.STORE_ADMIN,
        };
      }

      if (appMetadataRole === Role.DELIVERY_PARTNER) {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
          select: { id: true, email: true, name: true, role: true },
        });
        if (dbUser && dbUser.role === Role.DELIVERY_PARTNER) {
          return dbUser;
        }
        return null;
      }

      return null;
    }

    // 5. Database lookup: Authoritative PostgreSQL User role
    const dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, name: true, role: true },
    });

    if (dbUser) {
      return dbUser;
    }

    // Default to CUSTOMER if authenticated with Supabase Auth but no DB row yet
    return {
      id: authIdentity.id,
      email: cleanEmail,
      name:
        authIdentity.user_metadata?.full_name ||
        authIdentity.user_metadata?.name ||
        cleanEmail.split("@")[0],
      role: Role.CUSTOMER,
    };
  } catch (err) {
    console.error("Error in resolveVerifiedUser:", err);
    return null;
  }
}
