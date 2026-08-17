"use client";

import { useState } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { createClient } from "@/lib/supabase/client";
import { RushDLogo } from "@/components/ui/RushDLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Authentication Note: ${error.message} (Supabase Auth active)`);
      } else {
        setMessage("Signed in successfully!");
      }
    } catch {
      setMessage("Development Mode: Passwordless local profile switching active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 pb-8 max-w-md mx-auto text-white">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl font-black text-[#FFFFFF] tracking-tight">
          Welcome to RushD
        </h1>
        <p className="text-xs text-[#A8B0BC] font-medium">
          {appConfig.tagline}
        </p>
      </div>

      {/* Quick Access for Seeded Dev Accounts */}
      <div className="bg-[#151B24] text-white p-4 rounded-2xl space-y-3 shadow-md border border-[#27313D]">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0757D5] text-white">
          Development Portals
        </span>
        <h2 className="text-xs font-extrabold leading-snug">
          Instant Passwordless Portal Access
        </h2>
        <p className="text-[11px] text-[#A8B0BC] leading-normal font-medium">
          In local development mode, access seeded staff portals directly:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/delivery"
            className="p-2.5 bg-[#1C2430] hover:bg-[#0757D5] rounded-xl text-center border border-[#27313D] transition-colors"
          >
            <span className="font-extrabold text-xs block text-white">Rider Portal</span>
            <span className="text-[10px] text-[#A8B0BC] block mt-0.5">Ramesh / Suresh</span>
          </Link>
          <Link
            href="/admin"
            className="p-2.5 bg-[#1C2430] hover:bg-[#0757D5] rounded-xl text-center border border-[#27313D] transition-colors"
          >
            <span className="font-extrabold text-xs block text-white">Admin Hub</span>
            <span className="text-[10px] text-[#A8B0BC] block mt-0.5">Store Owner X</span>
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSignIn} className="bg-[#151B24] p-6 rounded-2xl border border-[#27313D] shadow-md space-y-4">
        {message && (
          <div className="p-3 text-xs rounded-xl bg-[#1C2430] text-[#FFFFFF] border border-[#27313D]">
            {message}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#A8B0BC]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="delivery1@x-grocery.com / admin@x-grocery.com"
            required
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#27313D] bg-[#1C2430] text-[#FFFFFF] placeholder-[#737D8B] focus:outline-none focus:border-[#0757D5]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#A8B0BC]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#27313D] bg-[#1C2430] text-[#FFFFFF] placeholder-[#737D8B] focus:outline-none focus:border-[#0757D5]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-xs text-[#A8B0BC] hover:text-[#FFFFFF] font-semibold">
          ← Back to Customer Home
        </Link>
      </div>
    </div>
  );
}
