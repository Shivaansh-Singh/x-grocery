"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type Role = "CUSTOMER" | "STORE_ADMIN" | "DELIVERY_PARTNER";

export interface ActiveUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  activeUser: ActiveUser | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  signIn: (email: string, password?: string, targetRedirect?: string | null) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (targetRedirect?: string | null) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeUser: null,
  session: null,
  role: "CUSTOMER",
  loading: true,
  signIn: async () => ({ success: false }),
  signInWithGoogle: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  // Helper to persist role cookie for SSR Middleware
  const setRoleCookie = (roleValue: Role, emailValue: string) => {
    document.cookie = `rushd_user_role=${roleValue}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `rushd_user_email=${emailValue}; path=/; max-age=2592000; SameSite=Lax`;
  };

  const clearRoleCookie = () => {
    document.cookie = "rushd_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "rushd_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  // Helper to fetch authoritative role from Database API
  const fetchAuthoritativeRole = async (email: string): Promise<{ id: string; name: string; role: Role } | null> => {
    try {
      const res = await fetch(`/api/auth/role?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          return {
            id: data.user.id,
            name: data.user.name,
            role: data.user.role as Role,
          };
        }
      }
    } catch (err) {
      console.error("Error fetching authoritative role:", err);
    }
    return null;
  };

  useEffect(() => {
    async function loadAuthSession() {
      try {
        // 1. Check Supabase Auth session first
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const email = currentSession.user.email || "";

          // Fetch authoritative role from DB API
          const dbAuthoritative = await fetchAuthoritativeRole(email);
          const detectedRole: Role =
            dbAuthoritative?.role || (currentSession.user.user_metadata?.role as Role) || "CUSTOMER";

          const userObj: ActiveUser = {
            id: dbAuthoritative?.id || currentSession.user.id,
            email,
            name: dbAuthoritative?.name || currentSession.user.user_metadata?.name || email.split("@")[0] || "User",
            role: detectedRole,
          };

          setActiveUser(userObj);
          setRole(detectedRole);
          setRoleCookie(detectedRole, userObj.email);
          setLoading(false);
          return;
        }

        // 2. Check local persistent session
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("rushd_active_user");
          if (storedUser) {
            const parsed: ActiveUser = JSON.parse(storedUser);
            // Verify role against DB
            const dbAuthoritative = await fetchAuthoritativeRole(parsed.email);
            const verifiedRole = dbAuthoritative?.role || parsed.role;
            const updatedUserObj: ActiveUser = {
              ...parsed,
              id: dbAuthoritative?.id || parsed.id,
              role: verifiedRole,
            };

            setActiveUser(updatedUserObj);
            setRole(verifiedRole);
            setRoleCookie(verifiedRole, updatedUserObj.email);
            localStorage.setItem("rushd_active_user", JSON.stringify(updatedUserObj));
          }
        }
      } catch (err) {
        console.error("Error initializing auth context:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === "PASSWORD_RECOVERY") {
        if (typeof window !== "undefined" && window.location.pathname !== "/reset-password") {
          router.push("/reset-password");
        }
        return;
      }

      if (currentSession?.user) {
        const email = currentSession.user.email || "";
        const dbAuthoritative = await fetchAuthoritativeRole(email);
        const detectedRole: Role =
          dbAuthoritative?.role || (currentSession.user.user_metadata?.role as Role) || "CUSTOMER";

        const userObj: ActiveUser = {
          id: dbAuthoritative?.id || currentSession.user.id,
          email,
          name: dbAuthoritative?.name || currentSession.user.user_metadata?.name || email.split("@")[0] || "User",
          role: detectedRole,
        };

        setActiveUser(userObj);
        setRole(detectedRole);
        setRoleCookie(detectedRole, userObj.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password?: string, targetRedirect?: string | null) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      setLoading(false);
      return { success: false, error: "Please enter your email address." };
    }

    if (!password || !password.trim()) {
      setLoading(false);
      return { success: false, error: "Please enter your password." };
    }

    try {
      // Authenticate strictly with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || "Invalid email or password. Please try again.",
        };
      }

      // Authoritative Role Resolution via Database API
      const dbAuthoritative = await fetchAuthoritativeRole(cleanEmail);
      const userRole: Role =
        dbAuthoritative?.role || (data.user.user_metadata?.role as Role) || "CUSTOMER";

      const userObj: ActiveUser = {
        id: dbAuthoritative?.id || data.user.id,
        email: data.user.email || cleanEmail,
        name: dbAuthoritative?.name || data.user.user_metadata?.name || cleanEmail.split("@")[0],
        role: userRole,
      };

      setActiveUser(userObj);
      setRole(userRole);
      setRoleCookie(userRole, cleanEmail);
      if (typeof window !== "undefined") {
        localStorage.setItem("rushd_active_user", JSON.stringify(userObj));
      }


      redirectAfterLogin(userRole, targetRedirect);
      return { success: true };
    } catch (err) {
      console.error("SignIn error:", err);
      return { success: false, error: "Failed to sign in. Please check your network connection." };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password?: string) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setLoading(false);
      return { success: false, error: "Please enter your full name." };
    }

    if (!cleanEmail) {
      setLoading(false);
      return { success: false, error: "Please enter your email address." };
    }

    if (!password || password.length < 6) {
      setLoading(false);
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            name: cleanName,
            full_name: cleanName,
            role: "CUSTOMER",
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists") ||
          error.message.toLowerCase().includes("user already")
        ) {
          return {
            success: false,
            error: "An account with this email already exists. Please sign in instead.",
          };
        }
        return { success: false, error: error.message };
      }

      // Check if user already exists with identity enumeration protection enabled
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      if (data.session && data.user) {
        const userObj: ActiveUser = {
          id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          role: "CUSTOMER",
        };

        setActiveUser(userObj);
        setRole("CUSTOMER");
        setRoleCookie("CUSTOMER", cleanEmail);
        if (typeof window !== "undefined") {
          localStorage.setItem("rushd_active_user", JSON.stringify(userObj));
        }

        router.push("/");
        return { success: true };
      }

      // If Supabase requires email verification
      return {
        success: true,
        message: "Account registered successfully! Please check your email to confirm your account before signing in.",
      };
    } catch (err) {
      console.error("SignUp error:", err);
      return { success: false, error: "Sign up failed. Please check your network connection and try again." };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (targetRedirect?: string | null) => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const callbackUrl = `${origin}/auth/callback${targetRedirect ? `?redirect=${encodeURIComponent(targetRedirect)}` : ""}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
          },
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("provider is not enabled") ||
            error.message.toLowerCase().includes("unsupported provider") ||
            error.message.toLowerCase().includes("validation_failed")
          ) {
            return {
              success: false,
              error: "Google Sign-In is not currently enabled in the Supabase project configuration.",
            };
          }
          throw error;
        }
        return { success: true };
      } else {
        return { success: false, error: "Google Sign-In is not available. Please sign in with email and password." };
      }
    } catch (err) {
      console.error("Google signIn error:", err);
      return { success: false, error: err instanceof Error ? err.message : "Failed to sign in with Google." };
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = (userRole: Role, targetRedirect?: string | null) => {

    if (userRole === "STORE_ADMIN") {
      if (targetRedirect && targetRedirect.startsWith("/admin")) {
        router.push(targetRedirect);
      } else {
        router.push("/admin");
      }
    } else if (userRole === "DELIVERY_PARTNER") {
      if (targetRedirect && targetRedirect.startsWith("/delivery")) {
        router.push(targetRedirect);
      } else {
        router.push("/delivery");
      }
    } else {
      if (targetRedirect && !targetRedirect.startsWith("/admin") && !targetRedirect.startsWith("/delivery") && !targetRedirect.startsWith("/login")) {
        router.push(targetRedirect);
      } else {
        router.push("/");
      }
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setActiveUser(null);
      setUser(null);
      setSession(null);
      setRole("CUSTOMER");
      clearRoleCookie();
      if (typeof window !== "undefined") {
        localStorage.removeItem("rushd_active_user");
        // Use full location reload/navigation to cleanly terminate all component timers and background requests
        window.location.href = "/login";
      } else {
        setLoading(false);
        router.push("/login");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeUser, session, role, loading, signIn, signInWithGoogle, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
