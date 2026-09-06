"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";

function ConsentFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const [isChecked, setIsChecked] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkConsentStatus() {
      try {
        const res = await fetch("/api/consent/status");
        if (res.ok) {
          const data = await res.json();
          if (data.accepted && isMounted) {
            window.location.href = redirectTarget;
            return;
          }
        }
      } catch (err) {
        console.error("Error checking consent status:", err);
      } finally {
        if (isMounted) {
          setIsCheckingStatus(false);
        }
      }
    }

    checkConsentStatus();
    return () => {
      isMounted = false;
    };
  }, [redirectTarget]);

  const handleAccept = async () => {
    if (!isChecked || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/consent/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to record your consent. Please try again.");
      }

      // Use full page reload navigation to ensure browser immediately updates SSR cookies
      window.location.href = redirectTarget;
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 border-2 border-[#111111] dark:border-white border-t-[#DFFF00] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">
          Checking consent status...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4 sm:space-y-5 text-[#111111] dark:text-[#F5F5F5]">
      {/* Title & Metadata Header */}
      <div className="space-y-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight">
            Privacy Policy Agreement
          </h1>
          <p className="text-xs text-[#666666] dark:text-[#A3A3A3] font-medium">
            RushD Hyperlocal Grocery Delivery Service
          </p>
        </div>

        <p className="text-xs text-[#555555] dark:text-[#BBBBBB] leading-relaxed pt-1">
          Please review RushD&apos;s complete Privacy Policy below. Explicit acceptance is required to access the customer application and place grocery delivery orders.
        </p>
      </div>

      {/* Scrollable Privacy Policy Content Reader */}
      <div className="space-y-1">
        <div className="h-[38vh] sm:h-[46vh] overflow-y-auto rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] p-4 sm:p-5 shadow-inner focus:outline-hidden">
          <PrivacyPolicyContent />
        </div>
        <p className="text-[10px] text-[#888888] dark:text-[#666666] text-right font-medium pr-1">
          Scroll inside to read all 12 sections.
        </p>
      </div>

      {/* Confirmation & Action Box */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#111111] dark:border-[#333333] p-4 sm:p-5 space-y-4 shadow-xs">
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            id="privacy-consent-checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-2 border-[#111111] dark:border-[#CCCCCC] accent-[#111111] cursor-pointer focus:ring-2 focus:ring-[#DFFF00]"
          />
          <div className="space-y-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-[#111111] dark:text-white group-hover:text-black transition-colors">
              I have read and agree to the Privacy Policy.
            </span>
            <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] leading-normal">
              By ticking this box, you confirm that you have reviewed the policy and agree to the collection and handling of your data strictly for order fulfillment.
            </p>
          </div>
        </label>

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded text-red-700 dark:text-red-400 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleAccept}
            disabled={!isChecked || isSubmitting}
            className={`w-full py-3 px-4 rounded-md font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border ${
              !isChecked || isSubmitting
                ? "bg-[#EAEAEA] dark:bg-[#262626] text-[#888888] dark:text-[#666666] cursor-not-allowed border-[#CCCCCC] dark:border-[#444444]"
                : "bg-[#111111] text-white hover:bg-black hover:shadow-md active:scale-[0.99] border-[#111111] cursor-pointer shadow-xs"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-[#DFFF00] rounded-full animate-spin" />
                <span>Recording Agreement...</span>
              </>
            ) : (
              <span>Accept &amp; Continue</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-[#DFFF00] rounded-full animate-spin" />
        </div>
      }
    >
      <ConsentFlow />
    </Suspense>
  );
}