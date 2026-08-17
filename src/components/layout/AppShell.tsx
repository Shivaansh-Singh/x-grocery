"use client";

import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#FFFFFF] flex flex-col antialiased">
      <Header />
      <main className="flex-1 max-w-md mx-auto w-full pb-24 px-4 pt-3.5 space-y-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
