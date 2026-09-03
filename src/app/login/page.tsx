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

  const confirmedParam = searchParams.get("confirmed");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "unauthorized_admin_access"
      ? "Unauthorized: Admin access required for that page."
      : errorParam === "unauthorized_delivery_access"
      ? "Unauthorized: Rider access required for that page."
      : errorParam === "oauth_failed"
      ? "Authentication was not completed. Please try again."
      : errorParam === "confirmation_failed"
      ? "Email confirmation link is invalid or has expired. Please try signing in or registering again."
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(
    confirmedParam === "true"
      ? "Email confirmed successfully! You can now sign in with your credentials."
      : null
  );

  const { signIn, signInWithGoogle, signUp, activeUser, signOut } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        router.push(`/reset-password${hash}`);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === "signin") {
        const res = await signIn(email, password, redirectParam);
        if (!res.success) {
          setErrorMessage(res.error || "Invalid credentials. Please try again.");
        }
      } else {
        const res = await signUp(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Sign up failed. Please check your details.");
        } else if (res.message) {
          setSuccessMessage(res.message);
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
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

      {/* Auth Toggle Tabs */}
      <div className="flex rounded-lg bg-[#F5F5F5] p-1 border border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 rounded text-xs font-black transition-colors ${
            mode === "signin"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] hover:text-[#111111]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 rounded text-xs font-black transition-colors ${
            mode === "signup"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] hover:text-[#111111]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Login / Sign-up Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 rounded-lg border border-[#E5E5E5] space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs rounded bg-white text-[#D92D3A] border border-[#D92D3A] font-bold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs rounded bg-white text-[#008000] border border-[#008000] font-bold">
            {successMessage}
          </div>
        )}

        {mode === "signup" && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#666666]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#666666]">Password</label>
            {mode === "signin" && (
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#666666] hover:text-[#111111] hover:underline"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 mt-2 border border-[#111111] cursor-pointer"
        >
          {loading
            ? mode === "signin"
              ? "Signing In..."
              : "Creating Account..."
            : mode === "signin"
            ? "Sign In to RushD ⚡"
            : "Register Account 🚀"}
        </button>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E5E5E5]"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-[#666666] uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-[#E5E5E5]"></div>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full py-3 bg-white hover:bg-gray-50 text-[#111111] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111] flex items-center justify-center text-center cursor-pointer"
        >
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>
      </form>

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
