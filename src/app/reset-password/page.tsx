"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RushDLogo } from "@/components/ui/RushDLogo";

function parseHashParams(hash: string): Record<string, string> {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean) return {};
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(clean);
  searchParams.forEach((val, key) => {
    params[key] = val;
  });
  return params;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "expired_link" || errorParam === "invalid_or_expired_link"
      ? "This password reset link is invalid or has expired. Please request a new one."
      : null
  );
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function establishRecoverySession() {
      try {
        // 1. Check if Supabase client already has an active session
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession && isMounted) {
          setHasRecoverySession(true);
          setVerifying(false);
          return;
        }

        // 2. Parse URL Hash Fragment on Client (#access_token=...&refresh_token=...&type=recovery)
        if (typeof window !== "undefined") {
          const hash = window.location.hash;
          if (hash) {
            const hashParams = parseHashParams(hash);

            // Check for errors in hash (e.g. error_code=otp_expired or error=access_denied)
            if (hashParams.error || hashParams.error_code) {
              if (isMounted) {
                setError(
                  hashParams.error_description?.replace(/\+/g, " ") ||
                    "This password reset link is invalid or has expired. Please request a new one."
                );
                setHasRecoverySession(false);
                setVerifying(false);
              }
              return;
            }

            const accessToken = hashParams.access_token;
            const refreshToken = hashParams.refresh_token || "";
            const authType = hashParams.type;

            if (accessToken && (authType === "recovery" || !authType || authType === "signup")) {
              // Explicitly establish the recovery session with Supabase
              const { data, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!setSessionError && data.session && isMounted) {
                // Clear sensitive tokens from browser address bar
                try {
                  window.history.replaceState(
                    null,
                    "",
                    window.location.pathname + window.location.search
                  );
                } catch {
                  // ignore
                }
                setHasRecoverySession(true);
                setVerifying(false);
                return;
              } else if (setSessionError && isMounted) {
                setError("This password reset link is invalid or has expired. Please request a new one.");
                setHasRecoverySession(false);
                setVerifying(false);
                return;
              }
            }
          }

          // 3. Check for query parameters (PKCE code or token_hash)
          const searchParams = new URLSearchParams(window.location.search);
          const tokenHash = searchParams.get("token_hash");
          const code = searchParams.get("code");
          const typeParam = searchParams.get("type");

          if (tokenHash) {
            const { error: otpError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: (typeParam as any) || "recovery",
            });
            if (!otpError && isMounted) {
              setHasRecoverySession(true);
              setVerifying(false);
              return;
            }
          }

          if (code) {
            const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!codeError && isMounted) {
              setHasRecoverySession(true);
              setVerifying(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error establishing recovery session:", err);
      }

      // If finished checking and no session was established
      if (isMounted) {
        setVerifying(false);
      }
    }

    establishRecoverySession();

    // Listen for auth state change events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true);
        setVerifying(false);
      }
    });

    // Fallback timer: if after 2s still verifying, conclude
    const timer = setTimeout(() => {
      if (isMounted) {
        setVerifying(false);
      }
    }, 2000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
      ) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          throw updateError;
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password. Reset link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 pb-8 max-w-md mx-auto text-[#111111]">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <RushDLogo size="lg" className="mx-auto" />
        <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs text-[#666666] font-medium">
          Create a secure new password for your RushD account
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] space-y-4 shadow-xs">
        {verifying ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#666666]">
              Verifying recovery link...
            </p>
          </div>
        ) : success ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl border border-emerald-200">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-sm text-[#111111]">
                Password Updated Successfully
              </h2>
              <p className="text-xs text-[#666666] font-medium leading-relaxed">
                Your password has been changed. You can now sign in with your new credentials.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors border border-[#111111] text-center"
            >
              Sign In Now
            </Link>
          </div>
        ) : !hasRecoverySession ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 bg-rose-50 text-[#D92D3A] rounded-full flex items-center justify-center mx-auto text-xl border border-rose-200 font-bold">
              !
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-sm text-[#111111]">
                Invalid or Expired Link
              </h2>
              <p className="text-xs text-[#666666] font-medium leading-relaxed">
                {error ||
                  "This password reset link has expired or has already been used. Please request a new link."}
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="inline-block w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors border border-[#111111] text-center"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded bg-white text-[#D92D3A] border border-[#D92D3A] font-bold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666666]">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666666]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111]"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link href="/login" className="text-xs text-[#666666] hover:text-[#111111] font-bold">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto space-y-4 pt-8 animate-pulse">
          <div className="h-20 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
