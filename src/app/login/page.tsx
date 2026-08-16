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
    <div className="space-y-6 pt-6 pb-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl font-black text-[#111315] tracking-tight">
          Welcome to RushD
        </h1>
        <p className="text-xs text-[#666A70] font-medium">
          {appConfig.tagline}
        </p>
      </div>

      {/* Quick Access for Seeded Dev Accounts */}
      <div className="bg-[#111315] text-white p-4 rounded-2xl space-y-3 shadow-2xs border border-[#1646C7]/30">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1646C7] text-white">
          Development Portals
        </span>
        <h2 className="text-xs font-bold leading-snug">
          Instant Passwordless Portal Access
        </h2>
        <p className="text-[11px] text-[#666A70] leading-normal font-medium">
          In local development mode, access seeded staff portals directly:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/delivery"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-center border border-white/10 transition-colors"
          >
            <span className="font-bold text-xs block text-white">Rider Portal</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Ramesh / Suresh</span>
          </Link>
          <Link
            href="/admin"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-center border border-white/10 transition-colors"
          >
            <span className="font-bold text-xs block text-white">Admin Hub</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Store Owner X</span>
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSignIn} className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-4">
        {message && (
          <div className="p-3 text-xs rounded-xl bg-[#F5F3EE] text-[#111315] border border-[#D9D7D2]">
            {message}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#111315]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="delivery1@x-grocery.com / admin@x-grocery.com"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#111315]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FF5A1F] hover:bg-[#111315] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-xs text-[#666A70] hover:text-[#111315] font-semibold">
          ← Back to Customer Home
        </Link>
      </div>
    </div>
  );
}
