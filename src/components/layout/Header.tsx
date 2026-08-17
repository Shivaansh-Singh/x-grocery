"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

export function Header() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#111720] border-b border-[#27313D] px-4 py-3 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: [R ICON] [RUSHD WORDMARK] */}
        <div className="flex items-center gap-2.5 min-w-0">
          <RushDLogo variant="full" size="md" />
        </div>

        {/* Right: Sign In / Admin / Rider Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {role === "STORE_ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#0757D5] text-white hover:bg-[#063B91] transition-colors shadow-sm"
            >
              Admin Hub
            </Link>
          )}
          {role === "DELIVERY_PARTNER" && (
            <Link
              href="/delivery"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#0757D5] text-white hover:bg-[#063B91] transition-colors shadow-sm"
            >
              Rider Portal
            </Link>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-bold text-[#A8B0BC] hover:text-[#FFFFFF] transition-colors px-2 py-1"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-[#FF5A00] hover:text-[#FF6A1A] transition-colors px-3.5 py-1.5 rounded-xl border border-[#27313D] bg-[#151B24] shadow-2xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
