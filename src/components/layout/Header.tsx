"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

export function Header() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#D9D7D2] px-4 py-3 shadow-2xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: [R ICON] [RUSHD WORDMARK] */}
        <div className="flex items-center gap-2.5 min-w-0">
          <RushDLogo variant="full" size="md" />
        </div>

        {/* Right: Sign In / Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {role === "STORE_ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#111315] text-white hover:bg-[#FF5A1F] transition-colors"
            >
              Admin Hub
            </Link>
          )}
          {role === "DELIVERY_PARTNER" && (
            <Link
              href="/delivery"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#111315] text-white hover:bg-[#FF5A1F] transition-colors"
            >
              Rider Portal
            </Link>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-bold text-[#666A70] hover:text-[#111315] transition-colors px-2 py-1"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-[#FF5A1F] hover:text-[#111315] transition-colors px-3.5 py-1.5 rounded-xl border border-[#D9D7D2] bg-[#F5F3EE]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
