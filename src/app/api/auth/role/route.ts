import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  extractAccessTokenFromRequest,
  verifySupabaseAccessToken,
  VerifiedJwtPayload,
} from "@/lib/auth-verifier";

function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    (value === Role.CUSTOMER ||
      value === Role.STORE_ADMIN ||
      value === Role.DELIVERY_PARTNER)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    // 1. Authoritative JWT Fast Path
    const token = extractAccessTokenFromRequest(request);
    if (token) {
      const verifiedPayload = (await verifySupabaseAccessToken(token)) as
        | (VerifiedJwtPayload & {
          app_metadata?: { role?: string };
          user_metadata?: { full_name?: string; name?: string };
        })
        | null;

      if (verifiedPayload?.email) {
        const verifiedEmail = verifiedPayload.email.toLowerCase().trim();

        if (verifiedEmail !== email) {
          return NextResponse.json(
            { error: "Forbidden: Token identity does not match requested email" },
            { status: 403 }
          );
        }

        const appMetadataRole = verifiedPayload.app_metadata?.role;

        // CRITICAL INVARIANT: If app_metadata.role is present, NEVER fall through to generic Prisma lookup
        if (appMetadataRole !== undefined) {
          if (!isValidRole(appMetadataRole)) {
            return NextResponse.json(
              { error: "Unauthorized: Invalid or unrecognized role claim" },
              { status: 401 }
            );
          }

          if (appMetadataRole === Role.CUSTOMER) {
            return NextResponse.json({
              user: {
                id: verifiedPayload.sub,
                email: verifiedEmail,
                name:
                  verifiedPayload.user_metadata?.full_name ||
                  verifiedPayload.user_metadata?.name ||
                  email.split("@")[0],
                role: Role.CUSTOMER,
              },
            });
          }

          if (appMetadataRole === Role.STORE_ADMIN) {
            return NextResponse.json({
              user: {
                id: verifiedPayload.sub,
                email: verifiedEmail,
                name:
                  verifiedPayload.user_metadata?.full_name ||
                  verifiedPayload.user_metadata?.name ||
                  email.split("@")[0] ||
                  "Store Admin",
                role: Role.STORE_ADMIN,
              },
            });
          }

          if (appMetadataRole === Role.DELIVERY_PARTNER) {
            const dbUser = await prisma.user.findUnique({
              where: { email: verifiedEmail },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            });

            if (!dbUser || dbUser.role !== Role.DELIVERY_PARTNER) {
              return NextResponse.json(
                { error: "Unauthorized: Delivery partner record not found or role mismatch" },
                { status: 401 }
              );
            }

            return NextResponse.json({
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || email.split("@")[0],
                role: Role.DELIVERY_PARTNER,
              },
            });
          }

          return NextResponse.json(
            { error: "Unauthorized: Role authorization failed" },
            { status: 401 }
          );
        }
      }
    }

    // 2. Generic Legacy Fallback: Only reachable when app_metadata.role === undefined
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (dbUser) {
      return NextResponse.json({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || dbUser.email.split("@")[0],
          role: dbUser.role,
        },
      });
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("GET /api/auth/role error:", error);
    return NextResponse.json({ error: "Failed to resolve user role" }, { status: 500 });
  }
}