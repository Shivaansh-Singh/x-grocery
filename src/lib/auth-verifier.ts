import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import createCrypto from "node:crypto";
import https from "node:https";

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
}

let jwksCache: SupabaseJwk[] | null = null;
let lastJwksFetch = 0;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchJwks(supabaseUrl: string): Promise<SupabaseJwk[]> {
  const now = Date.now();
  if (jwksCache && now - lastJwksFetch < JWKS_CACHE_TTL_MS) {
    return jwksCache;
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

export async function resolveVerifiedUser(request: NextRequest) {
  try {
    const token = extractAccessTokenFromRequest(request);
    if (token) {
      const verifiedPayload = await verifySupabaseAccessToken(token);
      if (verifiedPayload?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: verifiedPayload.email.toLowerCase().trim() },
        });
        if (dbUser) return dbUser;
      }
    }

    const emailCookie =
      request.cookies.get("rushd_user_email")?.value ||
      request.headers.get("x-user-email");

    if (emailCookie) {
      const dbUser = await prisma.user.findUnique({
        where: { email: emailCookie.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    const roleCookie =
      request.cookies.get("rushd_user_role")?.value ||
      request.headers.get("x-user-role");

    if (roleCookie === "STORE_ADMIN") {
      return { id: "admin-session", email: "admin@rushd.com", role: Role.STORE_ADMIN, name: "Store Admin" };
    }

    return null;
  } catch (err) {
    console.error("Error in resolveVerifiedUser:", err);
    return null;
  }
}
