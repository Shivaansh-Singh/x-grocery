"use client";

import { useState } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { createClient } from "@/lib/supabase/client";

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
    <div className="space-y-6 pt-4 pb-8 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <div className="inline-block p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 text-2xl font-bold">
          ⚡
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign In to {appConfig.displayName}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Off-Campus VIT Bhopal Grocery Delivery Portal
        </p>
      </div>

      {/* Quick Access for Seeded Accounts */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-3xl space-y-3 shadow-md border border-purple-800">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-700 text-purple-200">
          Seeded Test Portals
        </span>
        <h2 className="text-sm font-bold leading-snug">
          Instant Passwordless Portal Access
        </h2>
        <p className="text-[11px] text-purple-200 leading-normal">
          In local development mode, access seeded portals directly:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/delivery"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-center border border-white/20 transition-all"
          >
            <span className="text-base block mb-0.5">🛵</span>
            <span className="font-bold text-xs block text-white">Rider Portal</span>
            <span className="text-[10px] text-purple-300 block">Ramesh / Suresh</span>
          </Link>
          <Link
            href="/admin"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-center border border-white/20 transition-all"
          >
            <span className="text-base block mb-0.5">📊</span>
            <span className="font-bold text-xs block text-white">Admin Hub</span>
            <span className="text-[10px] text-purple-300 block">Store Owner X</span>
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSignIn} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        {message && (
          <div className="p-3 text-xs rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            {message}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="delivery1@x-grocery.com / admin@x-grocery.com"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium">
          ← Back to Customer Home
        </Link>
      </div>
    </div>
  );
}
