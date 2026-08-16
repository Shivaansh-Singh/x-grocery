"use client";

import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#111315] flex flex-col antialiased">
      <Header />
      <main className="flex-1 max-w-md mx-auto w-full pb-20 px-4 pt-3">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
