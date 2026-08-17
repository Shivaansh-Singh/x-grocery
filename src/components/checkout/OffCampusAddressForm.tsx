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
    <div className="bg-[#141822] p-4 rounded-2xl border border-white/8 shadow-md space-y-4 text-[#F5F6FA]">
      {/* Service Scope Warning Banner */}
      <div className="p-3.5 bg-[#1A1F2C] border border-white/8 rounded-xl text-[#8A90A3] text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-extrabold text-[#FF6B1A]">
          <span>⚡ Off-Campus Delivery Scope</span>
        </div>
        <p className="text-[11px] text-[#8A90A3] leading-relaxed">
          RushD delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan, Royal City & nearby areas. Inside-campus hostel delivery is not supported.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
          Off-Campus Delivery Address
        </h3>

        {/* Quick Hub Presets */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8A90A3]">Quick Select Off-Campus Hub</label>
          <div className="grid grid-cols-2 gap-2">
            {hubs.map((h) => {
              const isSelected = hub === h.value;
              return (
                <button
                  type="button"
                  key={h.label}
                  onClick={() => handleSelectHub(h.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                    isSelected
                      ? "bg-[#2D6CFF] text-white border-[#2D6CFF] shadow-xs"
                      : "bg-[#1A1F2C] border-white/8 text-[#8A90A3] hover:text-[#F5F6FA] hover:border-[#2D6CFF]"
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
          <label className="text-[11px] font-semibold text-[#8A90A3]">Building / Colony Name</label>
          <input
            type="text"
            value={hub}
            onChange={(e) => {
              setHub(e.target.value);
              updateAddress(e.target.value, flatRoomNo, landmark, phone);
            }}
            placeholder="e.g. Royal City Flats, Block B"
            required
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/8 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>

        {/* Flat / Room No */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8A90A3]">Flat / Room No *</label>
          <input
            type="text"
            value={flatRoomNo}
            onChange={(e) => {
              setFlatRoomNo(e.target.value);
              updateAddress(hub, e.target.value, landmark, phone);
            }}
            placeholder="e.g. Flat 204, Room 12"
            required
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/8 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>

        {/* Landmark */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8A90A3]">Landmark (Optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => {
              setLandmark(e.target.value);
              updateAddress(hub, flatRoomNo, e.target.value, phone);
            }}
            placeholder="e.g. Near Shiv Temple / Main Gate Road"
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/8 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8A90A3]">Contact Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              updateAddress(hub, flatRoomNo, landmark, e.target.value);
            }}
            placeholder="+91 99999 88888"
            required
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/8 bg-[#1A1F2C] text-[#F5F6FA] placeholder-[#8A90A3] focus:outline-none focus:border-[#2D6CFF]"
          />
        </div>
      </div>
    </div>
  );
}
