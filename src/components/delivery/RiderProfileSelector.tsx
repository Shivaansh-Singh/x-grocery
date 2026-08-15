"use client";

import { useEffect, useState } from "react";

export interface DeliveryRiderStaff {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
}

interface RiderProfileSelectorProps {
  selectedRiderId: string;
  onSelectRider: (rider: DeliveryRiderStaff) => void;
}

export function RiderProfileSelector({
  selectedRiderId,
  onSelectRider,
}: RiderProfileSelectorProps) {
  const [riders, setRiders] = useState<DeliveryRiderStaff[]>([]);

  useEffect(() => {
    let ignore = false;
    async function loadRiders() {
      try {
        const res = await fetch("/api/admin/delivery-staff");
        const data = await res.json();
        if (!ignore && data.riders && Array.isArray(data.riders)) {
          setRiders(data.riders);
          if (!selectedRiderId && data.riders.length > 0) {
            onSelectRider(data.riders[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load delivery staff riders:", err);
      }
    }
    loadRiders();
    return () => {
      ignore = true;
    };
  }, []);

  const activeRider = riders.find((r) => r.id === selectedRiderId) || riders[0];

  return (
    <div className="bg-zinc-900 text-white p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 font-bold flex items-center justify-center text-lg shrink-0">
          🛵
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block">
            Active Rider Profile
          </span>
          <h3 className="font-bold text-xs text-white truncate">
            {activeRider ? activeRider.name : "Select Rider..."}
          </h3>
        </div>
      </div>

      <select
        value={selectedRiderId}
        onChange={(e) => {
          const target = riders.find((r) => r.id === e.target.value);
          if (target) onSelectRider(target);
        }}
        className="px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">Switch Rider...</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
