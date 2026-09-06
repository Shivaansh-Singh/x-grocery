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
    <div className="relative w-full min-h-screen flex flex-col justify-between items-center bg-[#070707] text-white selection:bg-[#DFFF00] selection:text-[#000000] overflow-hidden">
      {/* Cinematic Ambient Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#161616_0%,#080808_55%,#040404_100%)] pointer-events-none z-0" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[280px] h-[90px] bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.04] to-blue-500/[0.08] blur-[70px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-[#DFFF00]/[0.05] blur-[130px] rounded-full pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* FLOATING PRODUCT PHOTOGRAPHY (EDGE COMPOSITION - NO CARDS / NO BORDERS)   */}
      {/* ========================================================================= */}

      {/* Top Left: Crisp Green Lettuce Leaf */}
      <div className="absolute top-0 -left-2 sm:left-0 md:left-4 w-28 sm:w-36 md:w-44 h-auto pointer-events-none select-none z-10">
        <Image
          src="/images/splash/splash-lettuce.png"
          alt=""
          width={125}
          height={155}
          priority
          unoptimized
          className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* Upper Left: Fresh Red Tomato with Stem */}
      <div className="absolute top-[14%] -left-3 sm:left-2 md:left-8 w-20 sm:w-26 md:w-32 h-auto pointer-events-none select-none z-10 drop-shadow-[0_14px_28px_rgba(0,0,0,0.9)]">
        <Image
          src="/images/splash/splash-tomato.png"
          alt=""
          width={105}
          height={90}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Mid Left: Ripe Bananas Bunch */}
      <div className="absolute top-[23%] -left-4 sm:left-0 md:left-6 w-24 sm:w-30 md:w-38 h-auto pointer-events-none select-none z-10 drop-shadow-[0_18px_36px_rgba(0,0,0,0.9)]">
        <Image
          src="/images/splash/splash-bananas.png"
          alt=""
          width={115}
          height={180}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Lower Left: Tata Sampann Moong Dal Packet */}
      <div className="absolute top-[42%] sm:top-[43%] -left-4 sm:left-0 md:left-6 w-28 sm:w-36 md:w-44 h-auto pointer-events-none select-none z-10 -rotate-3 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]">
        <Image
          src="/images/splash/splash-moong-dal.png"
          alt=""
          width={175}
          height={155}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Top Right: "GOOD FOOD FASTER" Badge */}
      <div className="absolute top-5 sm:top-7 right-3 sm:right-6 md:right-10 w-16 sm:w-20 md:w-24 h-auto pointer-events-none select-none z-20 rotate-12 drop-shadow-[0_4px_16px_rgba(223,255,0,0.3)]">
        <Image
          src="/images/splash/splash-good-food.png"
          alt=""
          width={78}
          height={72}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Upper Right: Amul Taaza Milk with Splash */}
      <div className="absolute top-[10%] -right-3 sm:right-0 md:right-4 w-24 sm:w-32 md:w-40 h-auto pointer-events-none select-none z-10 drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]">
        <Image
          src="/images/splash/splash-milk.png"
          alt=""
          width={99}
          height={235}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Mid Right: Lay's Potato Chips Bag */}
      <div className="absolute top-[32%] -right-3 sm:right-0 md:right-6 w-24 sm:w-30 md:w-38 h-auto pointer-events-none select-none z-10 rotate-3 drop-shadow-[0_18px_36px_rgba(0,0,0,0.9)]">
        <Image
          src="/images/splash/splash-lays.png"
          alt=""
          width={101}
          height={190}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Lower Right: Crisp Green Capsicum / Bell Pepper */}
      <div className="absolute top-[48%] sm:top-[47%] -right-2 sm:right-1 md:right-6 w-24 sm:w-30 md:w-36 h-auto pointer-events-none select-none z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]">
        <Image
          src="/images/splash/splash-capsicum.png"
          alt=""
          width={116}
          height={95}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Bottom Right: Red Pepper in Cinematic Depth-of-Field Foreground */}
      <div className="absolute bottom-[8%] -right-6 sm:-right-2 md:right-4 w-28 sm:w-36 md:w-44 h-auto pointer-events-none select-none z-10 opacity-80 blur-[0.6px]">
        <Image
          src="/images/splash/splash-red-pepper.png"
          alt=""
          width={120}
          height={195}
          priority
          unoptimized
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. RUSHD BRANDING HEADER                                                  */}
      {/* ========================================================================= */}
      <header className="w-full max-w-sm flex flex-col items-center justify-center pt-8 sm:pt-10 z-20 select-none px-4">
        <RushDLogo variant="full" size="md" themeMode="dark" href={undefined} />
        <p className="mt-2 text-[9px] sm:text-[10px] font-black tracking-[0.26em] text-[#888888] uppercase">
          Groceries in 10 minutes
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER EDITORIAL HERO + CTA SECTION                                    */}
      {/* ========================================================================= */}
      <main className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-4 py-2 z-20 my-auto">
        {/* Main Headline */}
        <div className="text-center">
          <h1 className="text-[44px] sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.04] text-white">
            Groceries
            <span className="block mt-1">
              in{" "}
              <span className="relative inline-block text-[#DFFF00] drop-shadow-[0_0_26px_rgba(223,255,0,0.4)]">
                10 minutes
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-48 sm:w-56 pointer-events-none select-none">
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

          {/* Supporting Text */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] text-[#888888] uppercase leading-relaxed">
              Fresh essentials.
            </p>
            <p className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] text-[#888888] uppercase leading-relaxed mt-0.5">
              At your doorstep.
            </p>
          </div>
        </div>

        {/* Existing Active Session Banner (If User Is Already Logged In) */}
        {activeUser && (
          <div className="w-full bg-[#141414]/90 border border-white/10 p-3.5 rounded-2xl text-xs flex items-center justify-between mt-5 shadow-2xl backdrop-blur-md">
            <div className="space-y-0.5 text-left">
              <p className="text-[9px] text-[#888888] uppercase font-bold tracking-wider">Signed in as</p>
              <p className="font-extrabold text-white text-xs">
                {activeUser.name} <span className="text-[#DFFF00] font-black">({activeUser.role})</span>
              </p>
              <p className="text-[10px] text-[#888888] font-medium truncate max-w-[180px]">{activeUser.email}</p>
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
          <div className="w-full bg-white/[0.06] border border-white/[0.1] p-3 rounded-xl text-xs text-white/90 flex items-center justify-center gap-2 mt-4 backdrop-blur-md">
            <span>🔒</span>
            <span>Sign in to access <strong className="text-[#DFFF00]">{redirectParam}</strong></span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full p-3.5 text-xs rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-center mt-4">
            {errorMessage}
          </div>
        )}

        {/* Primary Google Authentication CTA */}
        <div className="w-full mt-7 sm:mt-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-14 sm:h-[58px] bg-white hover:bg-[#F2F2F2] active:scale-[0.99] text-[#111111] rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-150 shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_14px_36px_rgba(255,255,255,0.12)] flex items-center justify-between px-5 sm:px-6 cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google 4-Color G Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="font-extrabold text-[#111111] text-sm sm:text-base">
                  Continue with Google
                </span>

                {/* Right Directional Arrow */}
                <svg
                  className="w-5 h-5 text-[#111111] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Secondary Action: Create Account */}
          <div className="text-center pt-3.5">
            <p className="text-xs text-[#888888] font-medium">
              New to RushD?
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="mt-0.5 font-black text-sm text-[#DFFF00] hover:text-[#E8FF33] transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. SUBTLE VALUE PROPOSITION FOOTER                                       */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-sm mx-auto z-20 pb-5 sm:pb-7 px-4">
        <div className="flex items-center justify-between text-center pt-2">
          {/* Column 1: 10 MIN DELIVERY */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-5 h-5 text-white/90 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-[9px] font-black tracking-[0.16em] text-white/90 uppercase leading-tight">10 Min</span>
            <span className="text-[8px] font-bold tracking-[0.16em] text-[#777777] uppercase leading-tight mt-0.5">Delivery</span>
          </div>

          <div className="w-[1px] h-7 bg-white/[0.12]" />

          {/* Column 2: TRUSTED STORES */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-5 h-5 text-white/90 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] font-black tracking-[0.16em] text-white/90 uppercase leading-tight">Trusted</span>
            <span className="text-[8px] font-bold tracking-[0.16em] text-[#777777] uppercase leading-tight mt-0.5">Stores</span>
          </div>

          <div className="w-[1px] h-7 bg-white/[0.12]" />

          {/* Column 3: FRESH EVERYDAY */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg className="w-5 h-5 text-white/90 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9c0-6 9-10 9-10s9 4 9 10a9 9 0 01-9 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
            </svg>
            <span className="text-[9px] font-black tracking-[0.16em] text-white/90 uppercase leading-tight">Fresh</span>
            <span className="text-[8px] font-bold tracking-[0.16em] text-[#777777] uppercase leading-tight mt-0.5">Everyday</span>
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
        <div className="w-full min-h-screen bg-[#070707] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#DFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
