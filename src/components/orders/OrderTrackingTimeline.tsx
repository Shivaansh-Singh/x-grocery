"use client";

import type { OrderRecord } from "./OrderCard";

interface OrderTrackingTimelineProps {
  status: OrderRecord["status"];
  notes?: string | null;
}

interface Step {
  key: OrderRecord["status"];
  title: string;
  subtitle: string;
}

export function getCleanRejectionReason(notes?: string | null): string | null {
  if (!notes || !notes.trim()) return null;
  const clean = notes.replace(/^Rejected by (Admin|Store):\s*/i, "").trim();
  return clean.length > 0 ? clean : null;
}

export function OrderTrackingTimeline({ status, notes }: OrderTrackingTimelineProps) {
  const steps: Step[] = [
    {
      key: "PENDING",
      title: "Order Placed",
      subtitle: "Received by RushD partner store",
    },
    {
      key: "ACCEPTED",
      title: "Order Accepted",
      subtitle: "Store confirmed your order",
    },
    {
      key: "PREPARING",
      title: "Packing Items",
      subtitle: "Packing your fresh groceries",
    },
    {
      key: "ASSIGNED",
      title: "Rider Assigned",
      subtitle: "RushD rider assigned to order",
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      subtitle: "Heading to your doorstep",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      subtitle: "Order delivered to your location",
    },
  ];

  const statusOrder: OrderRecord["status"][] = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === "CANCELLED" || status === "REJECTED";

  if (isCancelled) {
    const rejectionReason = getCleanRejectionReason(notes);

    return (
      <div className="bg-white p-4 rounded-lg border border-[#D92D3A] text-center space-y-2.5 text-[#111111]">
        <h3 className="font-extrabold text-sm text-[#D92D3A]">
          Order Cancelled / Rejected
        </h3>
        {rejectionReason ? (
          <div className="pt-1 space-y-1">
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
              Reason for rejection
            </span>
            <p className="text-xs text-[#111111] font-bold bg-[#F5F5F5] border border-[#E5E5E5] p-2.5 rounded-md max-w-sm mx-auto leading-relaxed">
              &quot;{rejectionReason}&quot;
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#666666] font-medium">
            This order was cancelled or could not be fulfilled.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-[#E5E5E5] space-y-4 text-[#111111]">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Delivery Progress
        </h3>
        <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#DFFF00] text-[#000000] border border-[#111111]">
          Target: 10 Mins ⚡
        </span>
      </div>

      <div className="relative pl-3 space-y-5">
        {steps.map((step, index) => {
          const isDone = currentIndex > index || (status === "DELIVERED" && index <= currentIndex);
          const isCurrent = currentIndex === index && status !== "DELIVERED";
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Connector Vertical Line */}
              {!isLast && (
                <div
                  className={`absolute left-[13px] top-6 bottom--5 w-0.5 transition-colors duration-200 ${
                    isDone || isCurrent ? "bg-[#111111]" : "bg-[#E5E5E5]"
                  }`}
                />
              )}

              {/* Node Bullet Icon */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-150 border ${
                  isCurrent
                    ? "bg-[#DFFF00] text-[#000000] border-[#111111] ring-4 ring-[#DFFF00]/30 scale-105"
                    : isDone
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </div>

              {/* Step Info */}
              <div className="flex-1 pt-0.5">
                <h4
                  className={`text-xs font-black transition-colors ${
                    isCurrent
                      ? "text-[#111111]"
                      : isDone
                      ? "text-[#111111]"
                      : "text-[#666666]"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-[#666666] mt-0.5 leading-snug font-medium">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
