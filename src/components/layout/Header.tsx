"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

export function Header() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/8 px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left: [RushD BRAND] */}
        <div className="flex items-center gap-2.5 min-w-0">
          <RushDLogo variant="full" size="md" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {role === "STORE_ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-[#2D6CFF] text-white hover:bg-[#2D6CFF]/90 transition-colors shadow-sm"
            >
              Admin Hub
            </Link>
          )}
          {role === "DELIVERY_PARTNER" && (
            <Link
              href="/delivery"
              className="text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-[#2D6CFF] text-white hover:bg-[#2D6CFF]/90 transition-colors shadow-sm"
            >
              Rider Portal
            </Link>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-bold text-[#8A90A3] hover:text-[#F5F6FA] transition-colors px-2.5 py-1"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-extrabold text-[#FF6B1A] hover:text-[#FF6B1A]/90 transition-colors px-4 py-1.5 rounded-xl border border-white/8 bg-[#141822] shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
