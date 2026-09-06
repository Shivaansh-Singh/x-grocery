import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveVerifiedUser } from "@/lib/auth-verifier";
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_DOCUMENT_NAME,
  CONSENT_COOKIE_NAME,
} from "@/config/privacy.config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve matching DB user record
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: user.id }, { email: user.email }],
      },
      select: { id: true },
    });

    const targetUserId = dbUser?.id || user.id;

    const consent = await prisma.userConsent.findFirst({
      where: {
        userId: targetUserId,
        document: PRIVACY_POLICY_DOCUMENT_NAME,
        version: CURRENT_PRIVACY_POLICY_VERSION,
      },
      select: {
        acceptedAt: true,
        version: true,
      },
    });

    const response = NextResponse.json({
      accepted: Boolean(consent),
      version: CURRENT_PRIVACY_POLICY_VERSION,
      acceptedAt: consent?.acceptedAt || null,
    });

    // If already consented in DB, set/refresh consent cookie
    if (consent) {
      response.cookies.set(CONSENT_COOKIE_NAME, CURRENT_PRIVACY_POLICY_VERSION, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("GET /api/consent/status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consent status" },
      { status: 500 }
    );
  }
}
