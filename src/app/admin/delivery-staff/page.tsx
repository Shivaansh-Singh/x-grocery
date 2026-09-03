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
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
        <div>
          <h1 className="text-xl font-extrabold text-[#111111]">
            Delivery Staff Roster
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            RushD registered delivery partners & riders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-bold px-3 py-1.5 rounded border border-[#E5E5E5] text-[#666666] hover:text-[#111111]"
          >
            ← Admin Hub
          </Link>
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="px-3.5 py-1.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors border border-[#111111]"
          >
            + Onboard Rider
          </button>
        </div>
      </div>

      {/* Rider Staff List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] text-center space-y-2">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No delivery partners registered
          </h3>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            Onboard riders to assign orders for instant off-campus delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] flex items-center justify-between gap-3 hover:border-[#111111] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#111111] text-[#DFFF00] border border-[#111111] font-black flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#111111]">
                    {rider.name}
                  </h4>
                  <span className="text-[11px] text-[#666666] block font-medium">
                    {rider.phone || "No phone"} • {rider.email}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${rider.phone}`}
                className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white font-black text-xs rounded transition-colors"
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
