import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Check cookies for role and email
  const roleCookie = request.cookies.get("rushd_user_role")?.value;
  const emailCookie = request.cookies.get("rushd_user_email")?.value;

  let userRole = roleCookie || null;
  let userEmail = emailCookie || null;

  // 2. Check Supabase Auth user if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
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
      userRole = user.user_metadata?.role || userRole || "CUSTOMER";
      userEmail = user.email || userEmail;
    }
  }

  const isAuthenticated = Boolean(userRole || userEmail);

  // -------------------------------------------------------------
  // LOGIN PAGE LOGIC
  // -------------------------------------------------------------
  if (pathname === "/login") {
    if (isAuthenticated) {
      if (userRole === "STORE_ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (userRole === "DELIVERY_PARTNER") {
        return NextResponse.redirect(new URL("/delivery", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
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
    // Admin trying to access /delivery or customer root /
    if (pathname.startsWith("/delivery") || pathname === "/" || pathname.startsWith("/cart") || pathname.startsWith("/categories")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // B. DELIVERY_PARTNER Rules
  if (userRole === "DELIVERY_PARTNER") {
    // Rider trying to access /admin or customer root /
    if (pathname.startsWith("/admin") || pathname === "/" || pathname.startsWith("/cart") || pathname.startsWith("/categories")) {
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
    "/((?!_next/static|_next/image|favicon.ico|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
