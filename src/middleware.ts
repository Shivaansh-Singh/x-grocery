import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  // In local dev/placeholder mode without active Supabase Auth server, bypass middleware blocking
  if (isPlaceholderSupabase) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /admin routes (Store Admin role required)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = user.user_metadata?.role || "CUSTOMER";
    if (userRole !== "STORE_ADMIN") {
      const url = new URL("/", request.url);
      url.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(url);
    }
  }

  // Protect /delivery routes (Delivery Partner role required)
  if (pathname.startsWith("/delivery")) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = user.user_metadata?.role || "CUSTOMER";
    if (userRole !== "DELIVERY_PARTNER" && userRole !== "STORE_ADMIN") {
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
    "/cart/checkout",
    "/orders/:path*",
  ],
};
