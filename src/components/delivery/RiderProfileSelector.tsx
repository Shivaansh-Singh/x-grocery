"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RIDERS, getLocalRiders } from "@/lib/orderSync";

export interface DeliveryRiderStaff {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  status?: string;
}

interface RiderProfileSelectorProps {
  selectedRiderId: string;
  onSelectRider: (rider: DeliveryRiderStaff) => void;
}

export function RiderProfileSelector({
  selectedRiderId,
  onSelectRider,
}: RiderProfileSelectorProps) {
  const [riders, setRiders] = useState<DeliveryRiderStaff[]>(DEFAULT_RIDERS);

  useEffect(() => {
    let ignore = false;
    async function loadRiders() {
      try {
        const res = await fetch("/api/admin/delivery-staff");
        const data = await res.json();
        if (!ignore && data.riders && Array.isArray(data.riders) && data.riders.length > 0) {
          // Deduplicate by ID and email
          const unique = data.riders.filter(
            (r: DeliveryRiderStaff, index: number, self: DeliveryRiderStaff[]) =>
              index === self.findIndex((x) => x.id === r.id || (x.email && x.email === r.email))
          );
          setRiders(unique);
          if (!selectedRiderId && unique.length > 0) {
            onSelectRider(unique[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load delivery staff riders from API, using fallback roster:", err);
        const fallback = getLocalRiders();
        setRiders(fallback);
        if (!selectedRiderId && fallback.length > 0) {
          onSelectRider(fallback[0]);
        }
      }
    }
    loadRiders();
    return () => {
      ignore = true;
    };
  }, [onSelectRider, selectedRiderId]);

  const activeRider = riders.find((r) => r.id === selectedRiderId) || riders[0] || DEFAULT_RIDERS[0];

  return (
    <div className="bg-white text-[#111111] p-3.5 rounded-lg border border-[#111111] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded bg-[#111111] text-[#DFFF00] border border-[#111111] font-black flex items-center justify-center text-sm shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#666666] uppercase font-black tracking-wider block">
            Active Assigned Rider
          </span>
          <h3 className="font-extrabold text-xs text-[#111111] truncate">
            {activeRider ? activeRider.name : "Ramesh Kumar (Rider 1)"}
          </h3>
        </div>
      </div>

      <select
        value={selectedRiderId || (activeRider ? activeRider.id : "")}
        onChange={(e) => {
          const target = riders.find((r) => r.id === e.target.value);
          if (target) onSelectRider(target);
        }}
        className="px-3 py-1.5 rounded border border-[#111111] bg-white text-xs font-black text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00] cursor-pointer"
      >
        {riders.map((r) => (
          <option key={r.id} value={r.id} className="bg-white text-[#111111]">
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
