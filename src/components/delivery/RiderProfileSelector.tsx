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
    <div className="bg-[#141822] text-[#F5F6FA] p-3.5 rounded-2xl border border-white/8 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white font-bold flex items-center justify-center text-sm shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#8A90A3] uppercase font-bold tracking-wider block">
            Active Rider Profile
          </span>
          <h3 className="font-extrabold text-xs text-[#F5F6FA] truncate">
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
        className="px-3 py-1.5 rounded-xl border border-white/8 bg-[#1A1F2C] text-xs font-bold text-[#F5F6FA] focus:outline-none focus:border-[#2D6CFF] cursor-pointer"
      >
        <option value="">Switch Rider...</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id} className="bg-[#141822] text-[#F5F6FA]">
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
