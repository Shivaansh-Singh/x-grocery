"use client";

import { useState } from "react";
import Link from "next/link";
import { RushDLogo } from "@/components/ui/RushDLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request password reset.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 pb-8 max-w-md mx-auto text-[#111111]">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs text-[#666666] font-medium">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] space-y-4 shadow-xs">
        {success ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl border border-emerald-200">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-sm text-[#111111]">
                Check Your Email
              </h2>
              <p className="text-xs text-[#666666] font-medium leading-relaxed">
                If an account exists for <strong className="text-[#111111]">{email}</strong>, we have sent a link to reset your password.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors border border-[#111111] text-center"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded bg-white text-[#D92D3A] border border-[#D92D3A] font-bold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666666]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111]"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link href="/login" className="text-xs text-[#666666] hover:text-[#111111] font-bold">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}
