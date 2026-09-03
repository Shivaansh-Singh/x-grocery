"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { validateIndianMobileNumber } from "@/lib/validation";

function PersonalDetailsContent() {
  const { user, activeUser } = useAuth();
  const userId = activeUser?.id || user?.id || "guest-user-session";
  const userEmail = activeUser?.email || user?.email || "";

  const [name, setName] = useState(activeUser?.name || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      if (!userId && !userEmail) {
        setLoading(false);
        return;
      }
      try {
        const query = userId ? `userId=${encodeURIComponent(userId)}` : `email=${encodeURIComponent(userEmail)}`;
        const res = await fetch(`/api/profile?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.user) {
            if (data.user.name) setName(data.user.name);
            if (data.user.phone) setPhone(data.user.phone);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, [userId, userEmail]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone && !validateIndianMobileNumber(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: userEmail,
          name: cleanName,
          phone: cleanPhone || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile details.");
      }

      setSuccess("Profile details saved successfully.");
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("rushd_active_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "rushd_active_user",
            JSON.stringify({ ...parsed, name: cleanName, phone: cleanPhone })
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pt-2 pb-10 text-[#111111] dark:text-[#F5F5F5]">
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
            Profile &amp; Personal Details
          </h1>
          <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium">
            Manage your name, phone number and account email
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-[#F5F5F5] dark:bg-[#222222] w-24 rounded" />
          <div className="h-10 bg-[#F5F5F5] dark:bg-[#222222] rounded" />
          <div className="h-4 bg-[#F5F5F5] dark:bg-[#222222] w-32 rounded" />
          <div className="h-10 bg-[#F5F5F5] dark:bg-[#222222] rounded" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-lg border border-[#E5E5E5] dark:border-[#262626] space-y-4 shadow-xs">
          {error && (
            <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#D92D3A] border border-[#D92D3A] font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#168A55] border border-[#168A55] font-bold">
              ✓ {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] placeholder-[#666666] dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">Phone Number (10 Digits)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] placeholder-[#666666] dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
            <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">Used for delivery updates and rider communication</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">Email Address (Read Only)</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-3.5 py-2.5 text-xs rounded border border-[#E5E5E5] dark:border-[#333333] bg-[#F5F5F5] dark:bg-[#222222] text-[#666666] dark:text-[#A3A3A3] cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111] cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PersonalDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto space-y-4 pt-6 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <PersonalDetailsContent />
    </Suspense>
  );
}
