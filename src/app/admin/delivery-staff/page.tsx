"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OnboardRiderModal } from "@/components/admin/OnboardRiderModal";
import { RemoveRiderModal, type RiderStaff } from "@/components/admin/RemoveRiderModal";

export default function DeliveryStaffPage() {
  const [riders, setRiders] = useState<RiderStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [riderToRemove, setRiderToRemove] = useState<RiderStaff | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const handleRiderRemoved = (removedRiderId: string, riderName: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== removedRiderId));
    setRiderToRemove(null);
    showToast("Delivery partner \"" + riderName + "\" removed successfully.");
    fetchRiders();
  };

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-[#DFFF00] text-[#000000] border border-[#111111] rounded-lg text-xs font-black shadow-sm animate-in fade-in flex items-center justify-between">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#000000] font-black text-sm hover:opacity-75 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

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
            className="px-3.5 py-1.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors border border-[#111111] cursor-pointer"
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
              data-testid={"rider-card-" + rider.id}
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#111111] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-[#111111] text-[#DFFF00] border border-[#111111] font-black flex items-center justify-center text-sm shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-[#111111] truncate">
                    {rider.name}
                  </h4>
                  <span className="text-[11px] text-[#666666] block font-medium truncate">
                    {rider.phone || "No phone"} • {rider.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={"tel:" + (rider.phone || "")}
                  className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white font-black text-xs rounded transition-colors"
                >
                  Call Rider
                </a>
                <button
                  type="button"
                  onClick={() => setRiderToRemove(rider)}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-[#DC2626] font-bold text-xs rounded border border-[#DC2626]/30 hover:border-[#DC2626] transition-colors cursor-pointer"
                >
                  Remove Rider
                </button>
              </div>
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

      {/* Remove Rider Modal */}
      {riderToRemove && (
        <RemoveRiderModal
          rider={riderToRemove}
          onClose={() => setRiderToRemove(null)}
          onSuccess={handleRiderRemoved}
        />
      )}
    </div>
  );
}
