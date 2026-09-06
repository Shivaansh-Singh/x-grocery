"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
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
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8 space-y-5 text-[#111111]">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
          Welcome to RushD
        </h1>
        <p className="text-xs text-[#666666] font-medium">
          Instant 10-Minute Grocery Delivery
        </p>
      </div>

      {/* Active Session Card */}
      {activeUser && (
        <div className="bg-white border border-[#E5E5E5] p-3.5 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] text-[#666666] uppercase font-bold tracking-wider">Currently Logged In</p>
            <p className="font-extrabold text-[#111111] text-xs">
              {activeUser.name} <span className="text-[#000000] font-black">({activeUser.role})</span>
            </p>
            <p className="text-[10px] text-[#666666] font-medium truncate max-w-[180px]">{activeUser.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs font-bold text-[#D92D3A] hover:bg-[#F5F5F5] transition-colors bg-white px-3 py-1.5 rounded border border-[#E5E5E5] shrink-0"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Redirect Info Banner */}
      {redirectParam && (
        <div className="bg-[#000000] border border-[#111111] p-3 rounded-lg text-xs text-white flex items-center gap-2">
          <span>🔒</span>
          <span>Please sign in to access <strong className="text-[#DFFF00]">{redirectParam}</strong></span>
        </div>
      )}

      {/* Sign In Section / Tab */}
      <div className="flex rounded-lg bg-[#F5F5F5] p-1 border border-[#E5E5E5]">
        <div className="flex-1 py-2.5 text-center rounded text-xs font-black bg-[#DFFF00] text-[#000000] border border-[#111111]">
          Sign In
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#E5E5E5] space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs rounded bg-white text-[#D92D3A] border border-[#D92D3A] font-bold">
            {errorMessage}
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#111111] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111] flex items-center justify-center gap-2.5 text-center cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        {/* Secondary option: New to RushD? Create Account */}
        <div className="text-center pt-1">
          <p className="text-xs text-[#666666]">
            New to RushD?{" "}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="font-bold text-[#111111] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-[#666666] hover:text-[#111111] font-bold">
          ← Back to Customer Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto space-y-4 pt-8 px-4 animate-pulse">
          <div className="h-20 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
