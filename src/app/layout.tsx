import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/components/providers/CartProvider";
import { AppShell } from "@/components/layout/AppShell";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RushD - Your essentials. On the way.",
  description: "Hyperlocal instant grocery delivery for VIT Bhopal Off-Campus residents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F5F3EE] text-[#111315] font-sans selection:bg-[#FF5A1F] selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
              <FloatingCartBar />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
