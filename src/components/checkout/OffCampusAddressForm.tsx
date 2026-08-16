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
    <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-4">
      {/* Service Scope Warning Banner */}
      <div className="p-3 bg-[#F5F3EE] border border-[#D9D7D2] rounded-xl text-[#111315] text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[#FF5A1F]">
          <span>VIT Bhopal Off-Campus Delivery Scope</span>
        </div>
        <p className="text-[11px] text-[#666A70] leading-relaxed">
          RushD delivers strictly to off-campus flats, rooms & PGs in Kotri Kalan, Royal City & nearby areas. Inside-campus hostel delivery is not supported.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-xs text-[#111315] uppercase tracking-wider">
          Off-Campus Delivery Address
        </h3>

        {/* Quick Hub Presets */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#666A70]">Quick Select Off-Campus Hub</label>
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
                      ? "bg-[#111315] text-white border-[#111315]"
                      : "bg-[#F5F3EE] border-[#D9D7D2] text-[#111315] hover:border-[#111315]"
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
          <label className="text-[11px] font-semibold text-[#666A70]">Building / Colony Name</label>
          <input
            type="text"
            value={hub}
            onChange={(e) => {
              setHub(e.target.value);
              updateAddress(e.target.value, flatRoomNo, landmark, phone);
            }}
            placeholder="e.g. Royal City Flats, Block B"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        {/* Flat / Room No */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#666A70]">Flat / Room No *</label>
          <input
            type="text"
            value={flatRoomNo}
            onChange={(e) => {
              setFlatRoomNo(e.target.value);
              updateAddress(hub, e.target.value, landmark, phone);
            }}
            placeholder="e.g. Flat 204, Room 12"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        {/* Landmark */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#666A70]">Landmark (Optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => {
              setLandmark(e.target.value);
              updateAddress(hub, flatRoomNo, e.target.value, phone);
            }}
            placeholder="e.g. Near Shiv Temple / Main Gate Road"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#666A70]">Contact Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              updateAddress(hub, flatRoomNo, landmark, e.target.value);
            }}
            placeholder="+91 99999 88888"
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>
      </div>
    </div>
  );
}
