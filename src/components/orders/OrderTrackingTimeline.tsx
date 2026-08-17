"use client";

import type { OrderRecord } from "./OrderCard";

interface OrderTrackingTimelineProps {
  status: OrderRecord["status"];
}

interface Step {
  key: OrderRecord["status"];
  title: string;
  subtitle: string;
}

export function OrderTrackingTimeline({ status }: OrderTrackingTimelineProps) {
  const steps: Step[] = [
    {
      key: "PENDING",
      title: "Order Placed",
      subtitle: "Received by Store X team",
    },
    {
      key: "ACCEPTED",
      title: "Order Accepted",
      subtitle: "Store X confirmed your order",
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
      subtitle: "Heading to your off-campus doorstep",
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
    return (
      <div className="bg-[#141822] p-4 rounded-2xl border border-[#FF4D4D] text-center space-y-2">
        <h3 className="font-bold text-sm text-[#FF4D4D]">
          Order Cancelled / Rejected
        </h3>
        <p className="text-xs text-[#8A90A3]">
          This order was cancelled or could not be fulfilled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#141822] p-5 rounded-2xl border border-white/8 shadow-md space-y-4 text-[#F5F6FA]">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
          Delivery Progress
        </h3>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#1A1F2C] text-[#FF6B1A] border border-white/8">
          Target: 15 Mins ⚡
        </span>
      </div>

      <div className="relative pl-3 space-y-5">
        {steps.map((step, index) => {
          const isDone = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Connector Vertical Line */}
              {!isLast && (
                <div
                  className={`absolute left-[13px] top-6 bottom--5 w-0.5 transition-colors duration-300 ${
                    isDone
                      ? "bg-gradient-to-b from-[#FF6B1A] to-[#2D6CFF] shadow-[0_0_8px_rgba(45,108,255,0.4)]"
                      : "bg-white/8"
                  }`}
                />
              )}

              {/* Node Bullet Icon */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCurrent
                    ? "bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white shadow-[0_0_12px_rgba(255,107,26,0.4)] ring-4 ring-[#FF6B1A]/20 scale-105"
                    : isDone
                    ? "bg-[#3DD68C] text-white"
                    : "bg-[#1A1F2C] text-[#8A90A3] border border-white/8"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </div>

              {/* Step Info */}
              <div className="flex-1 pt-0.5">
                <h4
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? "text-[#FF6B1A]"
                      : isDone
                      ? "text-[#F5F6FA]"
                      : "text-[#8A90A3]"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-[#8A90A3] mt-0.5 leading-snug">
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
