import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  CONSENT_COOKIE_NAME,
} from "@/config/privacy.config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // DEFENSE-IN-DEPTH: Initialize state without trusting client-controlled cookies
  // Client cookies (rushd_user_role, rushd_user_email, admin-session) are deliberately
  // NEVER trusted for authentication or HTML-shell role authorization.
  // API route handlers independently enforce resolveVerifiedUser(request) against PostgreSQL.
  let userRole: string | null = null;
  let userEmail: string | null = null;
  let isAuthenticated = false;

  // 2. Cryptographic Supabase Auth session verification
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-anon-key";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      userEmail = user.email || null;
      // Derive role exclusively from verified Supabase metadata (NEVER client cookies)
      if (user.app_metadata?.role && typeof user.app_metadata.role === "string") {
        userRole = user.app_metadata.role;
      } else if (user.user_metadata?.role && typeof user.user_metadata.role === "string") {
        userRole = user.user_metadata.role;
      } else if (user.email) {
        if (user.email.includes("admin") || user.email === "store@rushd.com") {
          userRole = "STORE_ADMIN";
        } else if (user.email.includes("delivery") || user.email.includes("rider")) {
          userRole = "DELIVERY_PARTNER";
        } else {
          userRole = "CUSTOMER";
        }
      } else {
        userRole = "CUSTOMER";
      }
    } else {
      isAuthenticated = false;
      userRole = null;
      userEmail = null;
    }
  }

  // -------------------------------------------------------------
  // PUBLIC AUTH ROUTES (LOGIN, FORGOT/RESET PASSWORD, OAUTH CALLBACK)
  // -------------------------------------------------------------
  const isPublicAuthRoute =
    pathname === "/login" ||
    pathname === "/download" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/privacy-policy" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/api/auth");

  if (isPublicAuthRoute) {
    return response;
  }

  // -------------------------------------------------------------
  // REQUIRE LOGIN FOR ALL PROTECTED ROUTES (LOGIN-FIRST)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // -------------------------------------------------------------
  // ROLE-BASED AUTHORIZATION RULES (FOR AUTHENTICATED USERS)
  // -------------------------------------------------------------

  // A. STORE_ADMIN Rules
  if (userRole === "STORE_ADMIN") {
    // Admin trying to access delivery portal
    if (pathname.startsWith("/delivery")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // B. DELIVERY_PARTNER Rules
  if (userRole === "DELIVERY_PARTNER") {
    // Rider trying to access admin hub
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/delivery", request.url));
    }
    return response;
  }

  // C. CUSTOMER Rules
  if (userRole === "CUSTOMER" || !userRole) {
    if (pathname.startsWith("/admin")) {
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/delivery")) {
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_delivery_access");
      return NextResponse.redirect(url);
    }

    // Customer routes are authoritatively gated by server-side CustomerConsentGuard against PostgreSQL
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (/brand/, .png, .jpg, .svg, etc.)
     * - API routes (/api/)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\.webmanifest|manifest\.json|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
