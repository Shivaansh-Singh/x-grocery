"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

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
      : null
  );

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "signin") {
        const res = await signIn(email, password, redirectParam);
        if (!res.success) {
          setErrorMessage(res.error || "Invalid credentials. Please try again.");
        }
      } else {
        const res = await signUp(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Sign up failed.");
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    signIn(demoEmail, "password123", redirectParam);
  };

  return (
    <div className="space-y-6 pt-6 pb-8 max-w-md mx-auto text-[#F5F6FA]">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl font-black text-[#F5F6FA] tracking-tight">
          Welcome to RushD
        </h1>
        <p className="text-xs text-[#8A90A3] font-medium">
          Instant 10-Minute Grocery Delivery
        </p>
      </div>

      {/* Redirect Info Banner */}
      {redirectParam && (
        <div className="bg-[#2D6CFF]/15 border border-[#2D6CFF]/30 p-3 rounded-2xl text-xs text-[#F5F6FA] flex items-center gap-2">
          <span>🔒</span>
          <span>Please sign in to access <strong>{redirectParam}</strong></span>
        </div>
      )}

      {/* Quick Role Selection Hub */}
      <div className="glass-card p-4 rounded-[22px] space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white">
            Quick Role Access
          </span>
          <span className="text-[10px] text-[#8A90A3] font-bold">Select Demo Profile</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickLogin("student@vitbhopal.ac.in")}
            className="p-2.5 bg-[#1A1F2C] hover:bg-white/10 rounded-xl text-center border border-white/8 transition-all group"
          >
            <span className="text-base block mb-0.5">🛒</span>
            <span className="font-extrabold text-[11px] block text-[#F5F6FA] group-hover:text-[#FF6B1A]">
              Customer
            </span>
            <span className="text-[9px] text-[#8A90A3] block">VIT Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("admin@x-grocery.com")}
            className="p-2.5 bg-[#1A1F2C] hover:bg-white/10 rounded-xl text-center border border-white/8 transition-all group"
          >
            <span className="text-base block mb-0.5">⚡</span>
            <span className="font-extrabold text-[11px] block text-[#F5F6FA] group-hover:text-[#FF6B1A]">
              Admin
            </span>
            <span className="text-[9px] text-[#8A90A3] block">Shop Owner</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("delivery1@x-grocery.com")}
            className="p-2.5 bg-[#1A1F2C] hover:bg-white/10 rounded-xl text-center border border-white/8 transition-all group"
          >
            <span className="text-base block mb-0.5">🛵</span>
            <span className="font-extrabold text-[11px] block text-[#F5F6FA] group-hover:text-[#2D6CFF]">
              Rider
            </span>
            <span className="text-[9px] text-[#8A90A3] block">Ramesh Kumar</span>
          </button>
        </div>
      </div>

      {/* Auth Toggle Tabs */}
      <div className="flex rounded-2xl bg-[#141822] p-1 border border-white/8">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
            mode === "signin"
              ? "bg-[#2D6CFF] text-white shadow-sm"
              : "text-[#8A90A3] hover:text-[#F5F6FA]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
            mode === "signup"
              ? "bg-[#2D6CFF] text-white shadow-sm"
              : "text-[#8A90A3] hover:text-[#F5F6FA]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Login / Sign-up Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[24px] shadow-xl space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs rounded-xl bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30 font-medium">
            {errorMessage}
          </div>
        )}

        {mode === "signup" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8A90A3]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8A90A3]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@vitbhopal.ac.in / admin@x-grocery.com"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8A90A3]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] hover:opacity-90 text-white rounded-xl text-xs font-extrabold shadow-md transition-all disabled:opacity-50 mt-2"
        >
          {loading
            ? mode === "signin"
              ? "Signing In..."
              : "Creating Account..."
            : mode === "signin"
            ? "Sign In to RushD ⚡"
            : "Register Account 🚀"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-xs text-[#8A90A3] hover:text-[#F5F6FA] font-semibold">
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
        <div className="max-w-md mx-auto space-y-4 pt-8 animate-pulse">
          <div className="h-20 glass-card rounded-2xl" />
          <div className="h-64 glass-card rounded-2xl" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
