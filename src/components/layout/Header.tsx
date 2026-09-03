"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

export function Header() {
  const { user, activeUser, role, signOut } = useAuth();
  const isAuthenticated = Boolean(user || activeUser);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#111111] px-4 py-3">
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
              className="text-xs font-extrabold px-3 py-1.5 rounded bg-[#111111] text-white hover:bg-black transition-colors"
            >
              Admin Hub
            </Link>
          )}
          {role === "DELIVERY_PARTNER" && (
            <Link
              href="/delivery"
              className="text-xs font-extrabold px-3 py-1.5 rounded bg-[#111111] text-white hover:bg-black transition-colors"
            >
              Rider Portal
            </Link>
          )}

          {!isAuthenticated && (
            <Link
              href="/login"
              className="text-xs font-extrabold text-[#111111] bg-[#DFFF00] hover:bg-[#C8E600] transition-colors px-3.5 py-1.5 rounded border border-[#111111]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
