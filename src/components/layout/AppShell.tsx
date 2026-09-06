"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col antialiased selection:bg-[#DFFF00] selection:text-[#000000] overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col antialiased">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full pb-24 px-4 sm:px-6 pt-4 space-y-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
