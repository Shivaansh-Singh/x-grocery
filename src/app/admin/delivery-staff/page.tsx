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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Delivery Staff Roster
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store X registered delivery partners & riders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            ← Admin Hub
          </Link>
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            + Onboard Rider
          </button>
        </div>
      </div>

      {/* Rider Staff List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
          <span className="text-3xl block">🛵</span>
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            No delivery partners registered
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Onboard riders to assign orders for instant off-campus delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-lg">
                  🛵
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {rider.name}
                  </h4>
                  <span className="text-[11px] text-zinc-500 block">
                    {rider.phone || "No phone"} • {rider.email}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${rider.phone}`}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-200 transition-colors flex items-center gap-1"
              >
                <span>📞 Call</span>
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
