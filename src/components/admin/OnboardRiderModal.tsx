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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-3">
          <h3 className="font-bold text-base text-[#111315]">
            Onboard Delivery Partner
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ECEAE5] flex items-center justify-center text-[#666A70] font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#F5F3EE] border border-[#C63D3D] text-[#C63D3D] rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#111315] block mb-1">Rider Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              required
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#111315] block mb-1">Contact Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#111315] block mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikram@rushd.com"
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#D9D7D2] text-[#111315] font-bold hover:bg-[#ECEAE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#FF5A1F] text-white font-bold hover:bg-[#111315] transition-colors disabled:opacity-50"
            >
              {saving ? "Onboarding..." : "Onboard Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
