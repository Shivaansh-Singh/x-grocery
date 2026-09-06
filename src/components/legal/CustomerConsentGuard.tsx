import React from "react";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_DOCUMENT_NAME,
} from "@/config/privacy.config";

export async function CustomerConsentGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // 1. Exempt public routes, auth flows, admin, and delivery partner routes
  const isExempt =
    !pathname ||
    pathname === "/login" ||
    pathname === "/privacy-policy" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery");

  if (isExempt) {
    return <>{children}</>;
  }

  // 2. Identify the authenticated user
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("rushd_user_role")?.value;
  const emailCookie = cookieStore.get("rushd_user_email")?.value;

  let verifiedEmail = emailCookie || null;
  let verifiedUserId: string | null = null;
  let userRole = roleCookie || null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  ) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        verifiedEmail = authUser.email || verifiedEmail;
        verifiedUserId = authUser.id;
        if (authUser.user_metadata?.role) {
          userRole = authUser.user_metadata.role;
        }
      }
    } catch {
      // Fall through to cookie verification
    }
  }

  // Admin and Delivery Partner users are exempt from customer privacy policy consent gate
  if (userRole === "STORE_ADMIN" || userRole === "DELIVERY_PARTNER") {
    return <>{children}</>;
  }

  if (!userRole && verifiedEmail) {
    if (verifiedEmail.includes("admin") || verifiedEmail === "store@rushd.com") {
      return <>{children}</>;
    } else if (verifiedEmail.includes("delivery") || verifiedEmail.includes("rider")) {
      return <>{children}</>;
    }
  }

  // Unauthenticated users are handled by middleware / auth provider
  if (!verifiedEmail && !verifiedUserId) {
    return <>{children}</>;
  }

  // 3. Resolve user in PostgreSQL
  const cleanEmail = verifiedEmail?.toLowerCase().trim();
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(verifiedUserId ? [{ id: verifiedUserId }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ],
    },
    select: { id: true, role: true },
  });

  if (!dbUser) {
    if (pathname === "/consent") {
      return <>{children}</>;
    }
    redirect("/consent" + (pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : ""));
  }

  if (dbUser.role === "STORE_ADMIN" || dbUser.role === "DELIVERY_PARTNER") {
    return <>{children}</>;
  }

  // 4. Authoritative PostgreSQL Check: UserConsent
  const consent = await prisma.userConsent.findFirst({
    where: {
      userId: dbUser.id,
      document: PRIVACY_POLICY_DOCUMENT_NAME,
      version: CURRENT_PRIVACY_POLICY_VERSION,
    },
    select: { id: true },
  });

  const hasValidDbConsent = Boolean(consent);

  // 5. Authoritative Route Enforcement
  if (pathname === "/consent") {
    // If the customer has already accepted in PostgreSQL, redirect them away from /consent to "/"
    if (hasValidDbConsent) {
      redirect("/");
    }
    return <>{children}</>;
  }

  // For all customer routes: if NO valid consent in PostgreSQL, redirect to /consent
  if (!hasValidDbConsent) {
    const targetRedirect = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
    redirect(`/consent${targetRedirect}`);
  }

  return <>{children}</>;
}
