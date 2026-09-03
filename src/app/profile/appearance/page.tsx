"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

function AppearanceContent() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes = [
    {
      id: "system",
      title: "System Default",
      subtitle: "Automatically match your device appearance settings",
      icon: "⚙️",
      previewBg: "bg-linear-to-r from-white to-[#111111]",
    },
    {
      id: "light",
      title: "Light Mode",
      subtitle: "Crisp white background with high-contrast text",
      icon: "☀️",
      previewBg: "bg-white border border-[#E5E5E5]",
    },
    {
      id: "dark",
      title: "Dark Mode",
      subtitle: "Deep black background engineered for low-light environments",
      icon: "🌙",
      previewBg: "bg-[#000000] border border-[#262626]",
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pt-2 pb-12 text-[#111111] dark:text-[#F5F5F5]">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] flex items-center justify-center font-bold text-sm transition-colors border border-[#E5E5E5] dark:border-[#333333]"
          aria-label="Back to Account"
        >
          ←
        </Link>
        <div>
          <h1 className="text-lg font-extrabold text-[#111111] dark:text-[#F5F5F5] tracking-tight">
            Appearance &amp; Theme
          </h1>
          <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium">
            Customize RushD visual appearance for day and night shopping
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id as typeof theme)}
              className={`w-full text-left p-4 rounded-lg bg-white dark:bg-[#141414] border transition-all flex items-center justify-between cursor-pointer group shadow-xs ${
                isSelected
                  ? "border-[#111111] dark:border-[#DFFF00] ring-2 ring-[#DFFF00]"
                  : "border-[#E5E5E5] dark:border-[#262626] hover:border-[#111111] dark:hover:border-[#444444] hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-2xl p-2 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                  {t.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5]">
                      {t.title}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded bg-[#DFFF00] text-[#000000] border border-[#111111]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5 font-medium leading-normal">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[#111111] dark:border-[#DFFF00] bg-[#111111] dark:bg-[#DFFF00] text-[#DFFF00] dark:text-[#000000]"
                      : "border-[#CCCCCC] dark:border-[#444444] bg-white dark:bg-[#1E1E1E]"
                  }`}
                >
                  {isSelected && <span className="text-[10px] font-black">✓</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-[#F5F5F5] dark:bg-[#141414] rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium space-y-1">
        <p className="font-bold text-[#111111] dark:text-[#F5F5F5]">⚡ Live Theme Status</p>
        <p>
          Currently applying: <strong className="text-[#111111] dark:text-[#DFFF00] capitalize">{resolvedTheme} theme</strong>. Changes take effect instantly across all pages.
        </p>
      </div>
    </div>
  );
}

export default function AppearancePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto space-y-4 pt-6 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
          <div className="h-48 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
        </div>
      }
    >
      <AppearanceContent />
    </Suspense>
  );
}
