"use client";

interface RiderContactCardProps {
  riderName?: string | null;
  riderPhone?: string | null;
}

export function RiderContactCard({
  riderName = "Ramesh Kumar",
  riderPhone = "+91 98123 45678",
}: RiderContactCardProps) {
  const displayRiderName = riderName || "Ramesh Kumar (RushD Rider)";
  const displayRiderPhone = riderPhone || "+91 98123 45678";

  return (
    <div className="bg-white text-[#111111] p-4 rounded-lg border border-[#E5E5E5] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded bg-[#DFFF00] text-[#000000] border border-[#111111]">
          Dedicated RushD Rider
        </span>
        <span className="text-xs text-[#666666] font-bold">RushD Partner</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#111111] text-[#DFFF00] flex items-center justify-center font-black shrink-0 border border-[#111111]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm leading-tight text-[#111111]">{displayRiderName}</h4>
            <p className="text-[11px] text-[#666666] mt-0.5 font-medium">Off-Campus Delivery Partner</p>
          </div>
        </div>

        <a
          href={`tel:${displayRiderPhone}`}
          className="px-3.5 py-2 bg-[#111111] hover:bg-black text-white rounded text-xs font-black transition-colors flex items-center gap-1.5 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1.11 1.11 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Call Rider</span>
        </a>
      </div>
    </div>
  );
}
