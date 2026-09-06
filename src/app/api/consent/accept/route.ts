import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveVerifiedUser } from "@/lib/auth-verifier";
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_DOCUMENT_NAME,
  CONSENT_COOKIE_NAME,
} from "@/config/privacy.config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve or upsert the DB User record to guarantee foreign key integrity
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: user.id }, { email: user.email }],
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          role: user.role || "CUSTOMER",
        },
      });
    }

    // Upsert the consent record for CURRENT_PRIVACY_POLICY_VERSION
    const consent = await prisma.userConsent.upsert({
      where: {
        userId_document_version: {
          userId: dbUser.id,
          document: PRIVACY_POLICY_DOCUMENT_NAME,
          version: CURRENT_PRIVACY_POLICY_VERSION,
        },
      },
      update: {
        acceptedAt: new Date(),
      },
      create: {
        userId: dbUser.id,
        document: PRIVACY_POLICY_DOCUMENT_NAME,
        version: CURRENT_PRIVACY_POLICY_VERSION,
        acceptedAt: new Date(),
      },
    });

    const response = NextResponse.json({
      success: true,
      document: consent.document,
      version: consent.version,
      acceptedAt: consent.acceptedAt,
    });

    // Set authoritative consent cookie (1 year expiry)
    response.cookies.set(CONSENT_COOKIE_NAME, CURRENT_PRIVACY_POLICY_VERSION, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("POST /api/consent/accept error:", error);
    return NextResponse.json(
      { error: "Failed to record privacy policy consent" },
      { status: 500 }
    );
  }
}
