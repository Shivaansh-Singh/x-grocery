"use client";

import { useState } from "react";

interface OnboardRiderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function OnboardRiderModal({
  onClose,
  onSuccess,
}: OnboardRiderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const riderEmail = email.trim() || `rider-${Date.now()}@rushd.com`;

    try {
      const res = await fetch("/api/admin/delivery-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: riderEmail,
          phone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to onboard delivery staff partner");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to onboard delivery staff. Check phone and name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#111111] p-6 max-w-md w-full shadow-2xl space-y-4 text-[#111111]">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h3 className="font-extrabold text-base text-[#111111]">
            Onboard Delivery Partner
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-white border border-[#D92D3A] text-[#D92D3A] rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#111111] block mb-1">Rider Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              required
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div>
            <label className="font-bold text-[#111111] block mb-1">Contact Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div>
            <label className="font-bold text-[#111111] block mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikram@rushd.com"
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-[#E5E5E5] text-[#666666] font-bold hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black border border-[#111111] transition-colors disabled:opacity-50"
            >
              {saving ? "Onboarding..." : "Onboard Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
