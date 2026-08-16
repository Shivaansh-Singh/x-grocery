"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OnboardRiderModal } from "@/components/admin/OnboardRiderModal";

interface RiderStaff {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
}

export default function DeliveryStaffPage() {
  const [riders, setRiders] = useState<RiderStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const fetchRiders = async () => {
    try {
      const res = await fetch("/api/admin/delivery-staff");
      const data = await res.json();
      if (data.riders) setRiders(data.riders);
    } catch (err) {
      console.error("Failed to fetch delivery staff:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadRiders() {
      try {
        const res = await fetch("/api/admin/delivery-staff");
        const data = await res.json();
        if (!ignore && data.riders) setRiders(data.riders);
      } catch (err) {
        console.error("Failed to load delivery staff:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadRiders();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-4 pt-1 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-2">
        <div>
          <h1 className="text-xl font-bold text-[#111315]">
            Delivery Staff Roster
          </h1>
          <p className="text-xs text-[#666A70]">
            RushD registered delivery partners & riders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D9D7D2] text-[#666A70] hover:text-[#111315]"
          >
            ← Admin Hub
          </Link>
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
          >
            + Onboard Rider
          </button>
        </div>
      </div>

      {/* Rider Staff List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#D9D7D2] text-center space-y-2">
          <h3 className="font-bold text-sm text-[#111315]">
            No delivery partners registered
          </h3>
          <p className="text-xs text-[#666A70] max-w-xs mx-auto">
            Onboard riders to assign orders for instant off-campus delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1646C7] text-white font-bold flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#111315]">
                    {rider.name}
                  </h4>
                  <span className="text-[11px] text-[#666A70] block">
                    {rider.phone || "No phone"} • {rider.email}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${rider.phone}`}
                className="px-3 py-1.5 bg-[#168A5B] text-white font-bold text-xs rounded-xl hover:bg-[#111315] transition-colors"
              >
                Call Rider
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Modal */}
      {isOnboardOpen && (
        <OnboardRiderModal
          onClose={() => setIsOnboardOpen(false)}
          onSuccess={fetchRiders}
        />
      )}
    </div>
  );
}
