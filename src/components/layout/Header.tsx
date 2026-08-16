"use client";

import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";

export function Header() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#D9D7D2] px-4 py-2.5 shadow-2xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <RushDLogo size="md" />
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#666A70] mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#168A5B]"></span>
            <span>{appConfig.serviceArea}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === "STORE_ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#111315] text-white hover:bg-[#1646C7] transition-colors"
            >
              Admin Hub
            </Link>
          )}
          {role === "DELIVERY_PARTNER" && (
            <Link
              href="/delivery"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#1646C7] text-white hover:bg-[#111315] transition-colors"
            >
              Rider Portal
            </Link>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-medium text-[#666A70] hover:text-[#111315] transition-colors px-2 py-1"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-[#FF5A1F] hover:text-[#111315] transition-colors px-2.5 py-1.5 rounded-lg border border-[#D9D7D2] bg-[#F5F3EE]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
