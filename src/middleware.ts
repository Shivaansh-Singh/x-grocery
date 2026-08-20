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

  // 2. Check Supabase Auth user if available
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
  // ROUTE PROTECTION RULES
  // -------------------------------------------------------------

  // A. Protect /admin and /admin/*
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (userRole === "DELIVERY_PARTNER") {
      return NextResponse.redirect(new URL("/delivery", request.url));
    }

    if (userRole === "CUSTOMER" || userRole !== "STORE_ADMIN") {
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(url);
    }
  }

  // B. Protect /delivery and /delivery/*
  if (pathname.startsWith("/delivery")) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (userRole === "STORE_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (userRole === "CUSTOMER" || userRole !== "DELIVERY_PARTNER") {
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_delivery_access");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
  ],
};
