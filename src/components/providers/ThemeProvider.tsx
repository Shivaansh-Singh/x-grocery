"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rushd_theme_preference") as ThemePreference | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Compute resolved theme and update DOM class/attribute
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolvedTheme = () => {
      let resolved: ResolvedTheme = "light";
      if (theme === "dark") {
        resolved = "dark";
      } else if (theme === "light") {
        resolved = "light";
      } else {
        // System preference
        resolved = mediaQuery.matches ? "dark" : "light";
      }

      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (resolved === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
    };

    updateResolvedTheme();

    // Listen for OS system theme changes
    const listener = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("rushd_theme_preference", newTheme);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
