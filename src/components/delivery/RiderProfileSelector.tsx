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
    <div className="bg-[#111315] text-white p-3 rounded-2xl border border-[#1646C7]/30 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#1646C7] text-white font-bold flex items-center justify-center text-sm shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#666A70] uppercase font-bold tracking-wider block">
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
        className="px-2.5 py-1.5 rounded-xl border border-[#D9D7D2]/20 bg-[#1646C7] text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
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
