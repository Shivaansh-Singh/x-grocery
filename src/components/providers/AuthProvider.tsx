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
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
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

    try {
      // 1. Authoritative Role Resolution via Database API
      const dbAuthoritative = await fetchAuthoritativeRole(cleanEmail);

      // 2. Try Supabase Auth if credentials provided
      if (password && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
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

          console.log("AUTH SUCCESS (Supabase):", { userObj, targetRedirect });
          redirectAfterLogin(userRole, targetRedirect);
          return { success: true };
        }
      }

      // 3. Fallback direct authentication for seed accounts & dev mode
      let fallbackRole: Role = "CUSTOMER";
      let fallbackName = cleanEmail.split("@")[0];
      let fallbackId = `user-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`;

      if (cleanEmail.includes("admin") || cleanEmail === "store@rushd.com") {
        fallbackRole = "STORE_ADMIN";
        fallbackName = "Store Admin X";
      } else if (cleanEmail.includes("delivery") || cleanEmail.includes("rider")) {
        fallbackRole = "DELIVERY_PARTNER";
        fallbackName = cleanEmail.includes("1") ? "Ramesh Kumar (Rider 1)" : cleanEmail.includes("2") ? "Suresh Singh (Rider 2)" : "Vikas Sharma (Rider 3)";
        fallbackId = cleanEmail.includes("delivery1") ? "rider-1" : cleanEmail.includes("delivery2") ? "rider-2" : "rider-3";
      }

      const finalRole: Role = dbAuthoritative?.role || fallbackRole;
      const finalName = dbAuthoritative?.name || fallbackName;
      const finalId = dbAuthoritative?.id || fallbackId;

      const userObj: ActiveUser = {
        id: finalId,
        email: cleanEmail,
        name: finalName,
        role: finalRole,
      };

      setActiveUser(userObj);
      setRole(finalRole);
      setRoleCookie(finalRole, cleanEmail);
      if (typeof window !== "undefined") {
        localStorage.setItem("rushd_active_user", JSON.stringify(userObj));
      }

      console.log("AUTH SUCCESS (Local DB):", { userObj, targetRedirect });
      redirectAfterLogin(finalRole, targetRedirect);
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

  const redirectAfterLogin = (userRole: Role, targetRedirect?: string | null) => {
    console.log("REDIRECTING AFTER LOGIN:", { userRole, targetRedirect });
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
