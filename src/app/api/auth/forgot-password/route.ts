import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getClientIp,
  normalizeIdentifier,
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeIdentifier(rawEmail);

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 2. Global IP Rate Limiting (max 10 requests / 15 minutes per IP to block sweep attacks)
    const globalIpKey = `rl:auth:forgot:ip:${clientIp}`;
    const globalLimit = await checkRateLimit({
      key: globalIpKey,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!globalLimit.allowed) {
      return createRateLimitResponse(
        globalLimit.retryAfterSeconds,
        "Too many password reset requests from this network. Please try again later."
      );
    }

    // 3. Per-Account + IP Layered Rate Limiting (max 3 requests / 15 minutes per email+IP)
    const accountKey = `rl:auth:forgot:${email}:${clientIp}`;
    const accountLimit = await checkRateLimit({
      key: accountKey,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!accountLimit.allowed) {
      return createRateLimitResponse(
        accountLimit.retryAfterSeconds,
        "Too many password reset attempts for this email. Please try again later."
      );
    }

    const origin = request.nextUrl.origin || "http://localhost:3000";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: class {} as any },
      });
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
    }

    // Return generic success message to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset link. Please try again." },
      { status: 500 }
    );
  }
}
