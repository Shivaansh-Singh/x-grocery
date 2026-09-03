import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const errorParam = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") || requestUrl.searchParams.get("redirect") || "/";
  const origin = requestUrl.origin;

  const isRecovery = type === "recovery" || next === "/reset-password" || next.startsWith("/reset-password");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  // -------------------------------------------------------------
  // 1. PASSWORD RECOVERY FLOW (SEPARATED FROM OAUTH)
  // -------------------------------------------------------------
  if (isRecovery) {
    if (errorParam) {
      return NextResponse.redirect(new URL("/reset-password?error=expired_link", origin));
    }

    let response = NextResponse.redirect(new URL("/reset-password", origin));

    if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      // A. Token Hash verification flow
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type as any) || "recovery",
        });

        if (error) {
          return NextResponse.redirect(new URL("/reset-password?error=invalid_or_expired_link", origin));
        }
        return response;
      }

      // B. PKCE / Code exchange flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          return NextResponse.redirect(new URL("/reset-password?error=invalid_or_expired_link", origin));
        }
        return response;
      }
    }

    // C. Implicit / Fragment flow (or dev mode):
    // Redirect to /reset-password so the browser client receives the URL hash fragment (#access_token=...)
    return response;
  }

  // -------------------------------------------------------------
  // 2. EMAIL SIGNUP / CONFIRMATION TOKEN HASH FLOW
  // -------------------------------------------------------------
  if (tokenHash) {
    if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Note: set on request or response
            });
          },
        },
      });

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: (type as any) || "signup",
      });

      if (error || !data.user) {
        return NextResponse.redirect(new URL("/login?error=confirmation_failed", origin));
      }

      const userEmail = data.user.email?.toLowerCase().trim() || "";
      if (userEmail) {
        let dbUser = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              id: data.user.id,
              email: userEmail,
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                userEmail.split("@")[0],
              role: "CUSTOMER",
            },
          });
        }

        const userRole = dbUser.role || "CUSTOMER";
        const successResponse = NextResponse.redirect(new URL("/login?confirmed=true", origin));
        successResponse.cookies.set("rushd_user_role", userRole, {
          path: "/",
          maxAge: 2592000,
          sameSite: "lax",
        });
        successResponse.cookies.set("rushd_user_email", userEmail, {
          path: "/",
          maxAge: 2592000,
          sameSite: "lax",
        });
        return successResponse;
      }
    }
    return NextResponse.redirect(new URL("/login?confirmed=true", origin));
  }

  // -------------------------------------------------------------
  // 3. GOOGLE OAUTH / AUTH CODE / PKCE FLOW
  // -------------------------------------------------------------
  if (code) {
    let response = NextResponse.redirect(new URL("/", origin));

    if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.user || !data.user.email) {
        console.error("OAuth exchangeCodeForSession error:", error);
        return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
      }

      const userEmail = data.user.email.toLowerCase().trim();

      // Authoritative Role Check from DB
      let dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!dbUser) {
        // Strict: Google OAuth users are always CUSTOMER by default
        dbUser = await prisma.user.create({
          data: {
            id: data.user.id,
            email: userEmail,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              userEmail.split("@")[0],
            role: "CUSTOMER",
          },
        });
      }

      const userRole = dbUser.role || "CUSTOMER";

      // Set authoritative application role cookies on the exact response being returned
      response.cookies.set("rushd_user_role", userRole, {
        path: "/",
        maxAge: 2592000,
        sameSite: "lax",
      });
      response.cookies.set("rushd_user_email", userEmail, {
        path: "/",
        maxAge: 2592000,
        sameSite: "lax",
      });

      // Determine destination without creating a new response object (preserves all Set-Cookie headers)
      let destination = "/";
      if (userRole === "STORE_ADMIN") {
        destination = next && next.startsWith("/admin") ? next : "/admin";
      } else if (userRole === "DELIVERY_PARTNER") {
        destination = next && next.startsWith("/delivery") ? next : "/delivery";
      } else {
        destination =
          next && !next.startsWith("/admin") && !next.startsWith("/delivery") && !next.startsWith("/login")
            ? next
            : "/";
      }

      response.headers.set("Location", new URL(destination, origin).toString());
      return response;
    }
  }

  // Only failed OAuth / confirmation callbacks reach here
  return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
}
