"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "unauthorized_admin_access"
      ? "Unauthorized: Admin access required for that page."
      : errorParam === "unauthorized_delivery_access"
      ? "Unauthorized: Rider access required for that page."
      : errorParam === "oauth_failed"
      ? "Authentication was not completed. Please try again."
      : null
  );

  const { signInWithGoogle, activeUser, signOut } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Guarantee document background is strictly pure black (#000000)
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        router.push(`/reset-password${hash}`);
      }
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle(redirectParam);
      if (!res.success) {
        setErrorMessage(res.error || "Google authentication failed. Please try again.");
      }
    } catch {
      setErrorMessage("Failed to initiate Google sign in.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between items-center bg-[#000000] text-white selection:bg-[#FF5A1F] selection:text-white overflow-x-hidden px-4">
      {/* Top Flex Spacer: Keeps central hero composition balanced with luxury breathing room */}
      <div className="w-full flex-1 min-h-[24px] sm:min-h-[40px] md:min-h-[56px]" />

      {/* ========================================================================= */}
      {/* CENTRAL HERO COMPOSITION (BRAND-FIRST: PROMINENT LOGO + HEADLINE + CTA)   */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[340px] sm:max-w-[460px] md:max-w-[600px] lg:max-w-[680px] mx-auto flex flex-col items-center justify-center z-10 py-2 sm:py-4">
        {/* 1. HERO RUSHD BRAND MARK (PROMINENT, BOLD, 100% TRANSPARENT CANVAS) */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10 select-none bg-transparent border-0 shadow-none">
          <RushDLogo variant="full" size="hero" themeMode="dark" href="" />
        </div>

        {/* 2. MAIN HEADLINE */}
        <div className="text-center">
          <h1 className="text-[38px] min-[390px]:text-[44px] sm:text-[54px] md:text-[66px] lg:text-[74px] font-black tracking-tight leading-[1.04] text-white select-none">
            Delivered
            <span className="block mt-1 sm:mt-1.5 md:mt-2">
              in{" "}
              <span className="relative inline-block text-[#FF5A1F]">
                minutes
                <span className="absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3.5 lg:-bottom-4 left-1/2 -translate-x-1/2 w-36 sm:w-44 md:w-56 lg:w-64 pointer-events-none select-none">
                  <Image
                    src="/images/splash/splash-brush.png"
                    alt=""
                    width={236}
                    height={20}
                    priority
                    unoptimized
                    className="w-full h-auto object-contain"
                  />
                </span>
              </span>
            </span>
          </h1>

          {/* 3. SUPPORTING EDITORIAL SUBTITLE */}
          <div className="mt-5 sm:mt-6 md:mt-8 text-center">
            <p className="text-[10px] min-[390px]:text-[11px] sm:text-[12px] md:text-[13px] font-bold tracking-[0.22em] sm:tracking-[0.26em] md:tracking-[0.3em] text-white/70 uppercase leading-relaxed">
              YOUR EVERYDAY ESSENTIALS. DELIVERED FAST.
            </p>
          </div>
        </div>

        {/* Active Session Banner (If User Is Already Logged In) */}
        {activeUser && (
          <div className="w-full max-w-[310px] min-[390px]:max-w-[330px] sm:max-w-[380px] md:max-w-[420px] bg-[#111111] border border-white/10 p-3.5 rounded-2xl text-xs flex items-center justify-between mt-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-0.5 text-left">
              <p className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Signed in as</p>
              <p className="font-extrabold text-white text-xs">
                {activeUser.name} <span className="text-[#FF5A1F] font-black">({activeUser.role})</span>
              </p>
              <p className="text-[10px] text-white/60 font-medium truncate max-w-[180px]">{activeUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors px-3 py-1.5 rounded-lg border border-rose-500/20 shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Redirect Notice Banner */}
        {redirectParam && (
          <div className="w-full max-w-[310px] min-[390px]:max-w-[330px] sm:max-w-[380px] md:max-w-[420px] bg-white/[0.06] border border-white/[0.1] p-3 rounded-xl text-xs text-white/90 flex items-center justify-center mt-5 backdrop-blur-md">
            <span>Everything you need. One tap away.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-[310px] min-[390px]:max-w-[330px] sm:max-w-[380px] md:max-w-[420px] p-3.5 text-xs rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-center mt-5">
            {errorMessage}
          </div>
        )}

        {/* 4. PRIMARY GOOGLE AUTHENTICATION CTA */}
        <div className="w-full max-w-[310px] min-[390px]:max-w-[330px] sm:max-w-[380px] md:max-w-[420px] mx-auto mt-7 sm:mt-9 md:mt-11">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-13 sm:h-14 md:h-[58px] bg-[#111111] hover:bg-[#181818] active:scale-[0.99] text-white border border-white/[0.14] hover:border-white/[0.24] rounded-2xl font-bold text-sm sm:text-base md:text-[17px] transition-all duration-150 shadow-[0_12px_32px_rgba(0,0,0,0.8)] flex items-center justify-between px-5 sm:px-6 md:px-7 cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-2.5 text-white/90">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google 4-Color G Icon */}
                <svg className="w-5 h-5 md:w-5.5 md:h-5.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>

                {/* Central Button Label */}
                <span className="font-bold text-white text-sm sm:text-base md:text-[17px] tracking-tight">
                  Continue with Google
                </span>

                {/* Right Directional Arrow */}
                <svg
                  className="w-5 h-5 md:w-5.5 md:h-5.5 text-white/70 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Secondary Action: Create Account */}
          <div className="text-center pt-3.5 sm:pt-4 md:pt-4.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <span className="text-white/50 font-medium">
              New to RushD?
            </span>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="text-white hover:text-[#FF5A1F] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Create Account</span>
              <span className="text-[#FF5A1F]">→</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Flex Spacer: Balances vertical rhythm */}
      <div className="w-full flex-1 min-h-[24px] sm:min-h-[40px] md:min-h-[56px]" />

      {/* ========================================================================= */}
      {/* 5. QUIET VALUE PROPOSITION FOOTER / TRUST MARKERS                         */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto z-10 pb-6 sm:pb-8 md:pb-10 px-4">
        <div className="flex items-center justify-between text-center pt-2">
          {/* Column 1: INSTANT DELIVERY */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.16em] sm:tracking-[0.2em] text-[#F5F5F5] uppercase leading-tight">Instant</span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-[#C4C4C4] uppercase leading-tight mt-0.5">Delivery</span>
          </div>

          <div className="w-[1px] h-6 sm:h-7 bg-white/[0.15]" />

          {/* Column 2: TRUSTED STORES */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.16em] sm:tracking-[0.2em] text-[#F5F5F5] uppercase leading-tight">Trusted</span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-[#C4C4C4] uppercase leading-tight mt-0.5">Stores</span>
          </div>

          <div className="w-[1px] h-6 sm:h-7 bg-white/[0.15]" />

          {/* Column 3: FRESH ITEMS */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9c0-6 9-10 9-10s9 4 9 10a9 9 0 01-9 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
            </svg>
            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.16em] sm:tracking-[0.2em] text-[#F5F5F5] uppercase leading-tight">Fresh</span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-[#C4C4C4] uppercase leading-tight mt-0.5">Items</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#000000] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
