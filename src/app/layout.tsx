import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  title: "RushD — Everything you need. Delivered fast.",
  description: "Hyperlocal instant grocery delivery in 10 minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('rushd_theme_preference');
                var isDark = theme === 'dark' || (!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-white text-[#111111] font-sans selection:bg-[#DFFF00] selection:text-[#000000]">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <AppShell>{children}</AppShell>
                <FloatingCartBar />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
