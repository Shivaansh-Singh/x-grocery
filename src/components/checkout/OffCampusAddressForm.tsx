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
    { label: "Main Gate Road", value: "Near Main Gate Area" },
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
    <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-4 text-[#111111]">
      {/* Service Scope Warning Banner */}
      <div className="p-3.5 bg-[#000000] border border-[#111111] rounded-lg text-white text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-black text-[#DFFF00]">
          <span>⚡ Off-Campus Delivery Scope</span>
        </div>
        <p className="text-[11px] text-[#A3A3A3] leading-relaxed font-medium">
          RushD delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan, Royal City & nearby areas. Inside-campus hostel delivery is not supported.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Off-Campus Delivery Address
        </h3>

        {/* Quick Hub Presets */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#666666]">Quick Select Off-Campus Hub</label>
          <div className="grid grid-cols-2 gap-2">
            {hubs.map((h) => {
              const isSelected = hub === h.value;
              return (
                <button
                  type="button"
                  key={h.label}
                  onClick={() => handleSelectHub(h.value)}
                  className={`p-2.5 rounded text-xs font-black text-left border transition-colors ${
                    isSelected
                      ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
                      : "bg-white border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:border-[#111111]"
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
          <label className="text-[11px] font-bold text-[#666666]">Building / Colony Name</label>
          <input
            type="text"
            value={hub}
            onChange={(e) => {
              setHub(e.target.value);
              updateAddress(e.target.value, flatRoomNo, landmark, phone);
            }}
            placeholder="e.g. Royal City Flats, Block B"
            required
            className="w-full px-3 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>

        {/* Flat / Room No */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#666666]">Flat / Room No *</label>
          <input
            type="text"
            value={flatRoomNo}
            onChange={(e) => {
              setFlatRoomNo(e.target.value);
              updateAddress(hub, e.target.value, landmark, phone);
            }}
            placeholder="e.g. Flat 204, Room 12"
            required
            className="w-full px-3 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>

        {/* Landmark */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#666666]">Landmark (Optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => {
              setLandmark(e.target.value);
              updateAddress(hub, flatRoomNo, e.target.value, phone);
            }}
            placeholder="e.g. Near Shiv Temple / Main Gate Road"
            className="w-full px-3 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#666666]">Contact Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              updateAddress(hub, flatRoomNo, landmark, e.target.value);
            }}
            placeholder="+91 99999 88888"
            required
            className="w-full px-3 py-2.5 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
        </div>
      </div>
    </div>
  );
}
