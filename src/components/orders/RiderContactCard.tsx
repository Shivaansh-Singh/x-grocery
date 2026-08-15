"use client";

interface RiderContactCardProps {
  riderName?: string | null;
  riderPhone?: string | null;
}

export function RiderContactCard({
  riderName = "Ramesh Kumar",
  riderPhone = "+91 98123 45678",
}: RiderContactCardProps) {
  const displayRiderName = riderName || "Ramesh Kumar (Store X Rider)";
  const displayRiderPhone = riderPhone || "+91 98123 45678";

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-4 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200">
          Dedicated Delivery Staff
        </span>
        <span className="text-xs text-blue-200">Store X Partner</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-700/60 border border-blue-500/40 flex items-center justify-center text-2xl font-bold">
            🛵
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{displayRiderName}</h4>
            <p className="text-[11px] text-blue-200 mt-0.5">Off-Campus Delivery Rider</p>
          </div>
        </div>

        <a
          href={`tel:${displayRiderPhone}`}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>📞</span>
          <span>Call Rider</span>
        </a>
      </div>
    </div>
  );
}
