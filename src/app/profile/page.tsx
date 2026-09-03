"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export type { SavedAddress } from "@/app/profile/addresses/page";

function CustomerAccountHubContent() {
  const { user, activeUser, signOut } = useAuth();
  const { theme } = useTheme();
  const userId = activeUser?.id || user?.id || "guest-user-session";
  const userEmail = activeUser?.email || user?.email || "";
  const userName = activeUser?.name || "Customer";

  const [phone, setPhone] = useState<string>("");
  const [addressCount, setAddressCount] = useState<number | null>(null);

  // Fetch address count and profile details for secondary indicators
  useEffect(() => {
    let ignore = false;

    async function loadAccountData() {
      if (!userId && !userEmail) return;

      try {
        const query = userId ? `userId=${encodeURIComponent(userId)}` : `email=${encodeURIComponent(userEmail)}`;
        const [profileRes, addrRes] = await Promise.all([
          fetch(`/api/profile?${query}`),
          userId ? fetch(`/api/addresses?userId=${encodeURIComponent(userId)}`) : Promise.resolve(null),
        ]);

        if (!ignore && profileRes && profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user?.phone) {
            setPhone(profileData.user.phone);
          }
        }

        if (!ignore && addrRes && addrRes.ok) {
          const addrData = await addrRes.json();
          if (Array.isArray(addrData.addresses)) {
            setAddressCount(addrData.addresses.length);
          }
        }
      } catch (err) {
        console.error("Error loading account hub summary:", err);
      }
    }

    loadAccountData();
    return () => {
      ignore = true;
    };
  }, [userId, userEmail]);

  // Initial letter for avatar
  const avatarInitial = (userName || userEmail || "U").charAt(0).toUpperCase();

  const themeDisplay =
    theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";

  return (
    <div className="w-full max-w-lg mx-auto space-y-5 pt-2 pb-12 text-[#111111] dark:text-[#F5F5F5]">
      {/* Compact Account Header */}
      <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[#111111] dark:bg-[#222222] text-[#DFFF00] flex items-center justify-center font-black text-lg shrink-0 border border-[#111111] dark:border-[#333333]">
            {avatarInitial}
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base text-[#111111] dark:text-[#F5F5F5] tracking-tight truncate">
              {userName}
            </h1>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] font-medium truncate mt-0.5">
              {userEmail || "Registered Customer"}
            </p>
            {phone && (
              <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium mt-0.5">
                📞 {phone}
              </p>
            )}
          </div>
        </div>

        <Link
          href="/profile/personal-details"
          className="px-3 py-1.5 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] text-xs font-bold transition-colors border border-[#E5E5E5] dark:border-[#333333] shrink-0"
        >
          Edit
        </Link>
      </div>

      {/* Section 1: ACCOUNT */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Account
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs divide-y divide-[#F0F0F0] dark:divide-[#222222] transition-colors">
          <Link
            href="/profile/personal-details"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                👤
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Profile &amp; Personal Details
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  Name, phone number &amp; email
                </span>
              </div>
            </div>
            <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm pl-2">
              ›
            </span>
          </Link>

          <Link
            href="/profile/addresses"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                📍
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Saved Addresses
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  {addressCount !== null
                    ? `${addressCount} saved address${addressCount === 1 ? "" : "es"}`
                    : "Manage delivery locations"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              {addressCount !== null && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#F5F5F5] dark:bg-[#222222] text-[#111111] dark:text-[#F5F5F5] border border-[#E5E5E5] dark:border-[#333333]">
                  {addressCount}
                </span>
              )}
              <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm">
                ›
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Section 2: ORDERS & DELIVERY */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Orders &amp; Delivery
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs divide-y divide-[#F0F0F0] dark:divide-[#222222] transition-colors">
          <Link
            href="/orders"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                📦
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  My Orders
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  View order history &amp; live tracking
                </span>
              </div>
            </div>
            <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm pl-2">
              ›
            </span>
          </Link>
        </div>
      </div>

      {/* Section 3: SUPPORT */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Support
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs divide-y divide-[#F0F0F0] dark:divide-[#222222] transition-colors">
          <Link
            href="/profile/support"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                📞
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Contact Us
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  Customer care &amp; helpline (+91 9244302120)
                </span>
              </div>
            </div>
            <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm pl-2">
              ›
            </span>
          </Link>

          <Link
            href="/profile/support?tab=feedback"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                💬
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Complaints &amp; Feedback
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  Report missing items or request grocery products
                </span>
              </div>
            </div>
            <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm pl-2">
              ›
            </span>
          </Link>
        </div>
      </div>

      {/* Section 4: PREFERENCES */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Preferences
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs divide-y divide-[#F0F0F0] dark:divide-[#222222] transition-colors">
          <Link
            href="/profile/appearance"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                🌙
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Appearance
                </span>
                <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">
                  Theme mode: {themeDisplay}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#DFFF00] text-[#000000] border border-[#111111]">
                {themeDisplay}
              </span>
              <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm">
                ›
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Section 5: LEGAL & POLICIES */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Legal &amp; Policies
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs divide-y divide-[#F0F0F0] dark:divide-[#222222] transition-colors">
          <Link
            href="/terms"
            className="flex items-center justify-between p-3.5 hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-[#E5E5E5]/50 dark:border-[#333333]">
                ⚖️
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] block">
                  Terms &amp; Conditions
                </span>
                <span className="text-[10px] text-[#666666] block">

                </span>
              </div>
            </div>
            <span className="text-[#999999] dark:text-[#666666] group-hover:text-[#111111] dark:group-hover:text-white transition-colors font-bold text-sm pl-2">
              ›
            </span>
          </Link>
        </div>
      </div>

      {/* Section 6: ACCOUNT / LOG OUT */}
      <div className="space-y-1.5 pt-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] px-1">
          Session
        </h2>
        <div className="bg-white dark:bg-[#141414] rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-xs transition-colors">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-colors group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[#D92D3A] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform border border-rose-200/30 dark:border-rose-900/30">
                🚪
              </span>
              <div>
                <span className="font-extrabold text-xs text-[#D92D3A] block">
                  Log Out
                </span>
                <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] block">
                  Sign out of your RushD customer account
                </span>
              </div>
            </div>
            <span className="text-[#D92D3A] font-bold text-sm pr-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto space-y-4 pt-4 animate-pulse">
          <div className="h-20 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl" />
          <div className="h-32 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl" />
          <div className="h-32 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl" />
        </div>
      }
    >
      <CustomerAccountHubContent />
    </Suspense>
  );
}
