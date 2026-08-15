"use client";

import { useState } from "react";

export interface AddressDetails {
  buildingColony: string;
  flatRoomNo: string;
  landmark: string;
  phone: string;
}

interface OffCampusAddressFormProps {
  initialAddress?: AddressDetails;
  onChange: (address: AddressDetails) => void;
}

export function OffCampusAddressForm({
  initialAddress,
  onChange,
}: OffCampusAddressFormProps) {
  const [hub, setHub] = useState(initialAddress?.buildingColony || "Royal City Flats");
  const [flatRoomNo, setFlatRoomNo] = useState(initialAddress?.flatRoomNo || "");
  const [landmark, setLandmark] = useState(initialAddress?.landmark || "");
  const [phone, setPhone] = useState(initialAddress?.phone || "+91 ");

  const hubs = [
    { label: "Royal City", value: "Royal City Flats, Block B" },
    { label: "Kotri Kalan", value: "Kotri Kalan Main Market Area" },
    { label: "Main Gate Road", value: "Near VIT Bhopal Main Gate Area" },
    { label: "Ashta Road", value: "Ashta Highway Residential Area" },
  ];

  const updateAddress = (
    newHub: string,
    newFlat: string,
    newLandmark: string,
    newPhone: string
  ) => {
    onChange({
      buildingColony: newHub,
      flatRoomNo: newFlat,
      landmark: newLandmark,
      phone: newPhone,
    });
  };

  const handleSelectHub = (selectedHubValue: string) => {
    setHub(selectedHubValue);
    updateAddress(selectedHubValue, flatRoomNo, landmark, phone);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      {/* Service Scope Warning Banner */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <span>⚠️</span>
          <span>VIT Bhopal Off-Campus Delivery Scope</span>
        </div>
        <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
          Store X delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan, Royal City & nearby areas. Inside-campus hostel delivery is <strong>NOT supported in Phase 1</strong>.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Off-Campus Delivery Address
        </h3>

        {/* Quick Hub Presets */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500">Quick Select Off-Campus Hub</label>
          <div className="grid grid-cols-2 gap-2">
            {hubs.map((h) => {
              const isSelected = hub === h.value;
              return (
                <button
                  type="button"
                  key={h.label}
                  onClick={() => handleSelectHub(h.value)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                  }`}
                >
                  <span className="block text-[11px]">{h.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Building / Colony */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500">Building / Colony Name</label>
          <input
            type="text"
            value={hub}
            onChange={(e) => {
              setHub(e.target.value);
              updateAddress(e.target.value, flatRoomNo, landmark, phone);
            }}
            placeholder="e.g. Royal City Flats, Block B"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Flat / Room No */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500">Flat / Room No *</label>
          <input
            type="text"
            value={flatRoomNo}
            onChange={(e) => {
              setFlatRoomNo(e.target.value);
              updateAddress(hub, e.target.value, landmark, phone);
            }}
            placeholder="e.g. Flat 204, Room 12"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Landmark */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500">Landmark (Optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => {
              setLandmark(e.target.value);
              updateAddress(hub, flatRoomNo, e.target.value, phone);
            }}
            placeholder="e.g. Near Shiv Temple / Main Gate Road"
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500">Contact Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              updateAddress(hub, flatRoomNo, landmark, e.target.value);
            }}
            placeholder="+91 99999 88888"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
