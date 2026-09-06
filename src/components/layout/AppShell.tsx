"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeUser } = useAuth();
  const { itemCount } = useCart();
  const isAuthenticated = Boolean(user || activeUser);

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col antialiased selection:bg-[#DFFF00] selection:text-[#000000] overflow-x-hidden">
        {children}
      </div>
    );
  }

  // Check if FloatingCartBar is active
  const hasFloatingCart =
    isAuthenticated &&
    itemCount > 0 &&
    !pathname.startsWith("/cart") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/delivery") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/consent") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/reset-password");

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col antialiased">
      <Header />
      <main
        className={`flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4 space-y-5 ${
          hasFloatingCart ? "pb-40" : pathname.startsWith("/consent") ? "pb-8" : "pb-24"
        }`}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
