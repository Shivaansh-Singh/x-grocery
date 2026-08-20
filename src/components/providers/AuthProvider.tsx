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
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeUser: null,
  session: null,
  role: "CUSTOMER",
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
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
          const detectedRole = (currentSession.user.user_metadata?.role as Role) || "CUSTOMER";
          const userObj: ActiveUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            name: currentSession.user.user_metadata?.name || currentSession.user.email?.split("@")[0] || "User",
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
            setActiveUser(parsed);
            setRole(parsed.role);
            setRoleCookie(parsed.role, parsed.email);
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
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        const detectedRole = (currentSession.user.user_metadata?.role as Role) || "CUSTOMER";
        const userObj: ActiveUser = {
          id: currentSession.user.id,
          email: currentSession.user.email || "",
          name: currentSession.user.user_metadata?.name || currentSession.user.email?.split("@")[0] || "User",
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

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    try {
      // 1. Try Supabase Auth if credentials provided
      if (password && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const userRole = (data.user.user_metadata?.role as Role) || "CUSTOMER";
          const userObj: ActiveUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split("@")[0],
            role: userRole,
          };
          setActiveUser(userObj);
          setRole(userRole);
          setRoleCookie(userRole, email);
          if (typeof window !== "undefined") {
            localStorage.setItem("rushd_active_user", JSON.stringify(userObj));
          }
          redirectAfterLogin(userRole);
          return { success: true };
        }
      }

      // 2. Direct Role Resolution based on email domain / credentials
      let assignedRole: Role = "CUSTOMER";
      let name = email.split("@")[0];
      const cleanEmail = email.toLowerCase().trim();

      if (cleanEmail.includes("admin") || cleanEmail === "store@rushd.com") {
        assignedRole = "STORE_ADMIN";
        name = "Store Admin X";
      } else if (cleanEmail.includes("delivery") || cleanEmail.includes("rider")) {
        assignedRole = "DELIVERY_PARTNER";
        name = cleanEmail.includes("1") ? "Ramesh Kumar (Rider 1)" : cleanEmail.includes("2") ? "Suresh Singh (Rider 2)" : "Vikas Sharma (Rider 3)";
      }

      const generatedId = cleanEmail.includes("delivery1")
        ? "rider-1"
        : cleanEmail.includes("delivery2")
        ? "rider-2"
        : cleanEmail.includes("delivery3")
        ? "rider-3"
        : `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`;

      const userObj: ActiveUser = {
        id: generatedId,
        email: cleanEmail,
        name,
        role: assignedRole,
      };

      setActiveUser(userObj);
      setRole(assignedRole);
      setRoleCookie(assignedRole, cleanEmail);
      if (typeof window !== "undefined") {
        localStorage.setItem("rushd_active_user", JSON.stringify(userObj));
      }

      redirectAfterLogin(assignedRole);
      return { success: true };
    } catch (err) {
      console.error("SignIn error:", err);
      return { success: false, error: "Failed to sign in. Please check your details." };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const userObj: ActiveUser = {
        id: `cust-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
        email: cleanEmail,
        name,
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
    } catch (err) {
      console.error("SignUp error:", err);
      return { success: false, error: "Sign up failed." };
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = (userRole: Role) => {
    if (userRole === "STORE_ADMIN") {
      router.push("/admin");
    } else if (userRole === "DELIVERY_PARTNER") {
      router.push("/delivery");
    } else {
      router.push("/");
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
      }
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeUser, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
