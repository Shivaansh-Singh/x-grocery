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
      <div className="bg-[#151B24] p-4 rounded-2xl border border-[#FF4D4D] text-center space-y-2">
        <h3 className="font-bold text-sm text-[#FF4D4D]">
          Order Cancelled / Rejected
        </h3>
        <p className="text-xs text-[#A8B0BC]">
          This order was cancelled or could not be fulfilled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#151B24] p-5 rounded-2xl border border-[#27313D] shadow-md space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-xs text-[#FFFFFF] uppercase tracking-wider">
          Delivery Progress
        </h3>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#1C2430] text-[#FF5A00] border border-[#27313D]">
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
                    isDone ? "bg-[#19B978]" : "bg-[#27313D]"
                  }`}
                />
              )}

              {/* Node Bullet Icon */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCurrent
                    ? "bg-[#FF5A00] text-white shadow-sm ring-4 ring-[#FF5A00]/20 scale-105"
                    : isDone
                    ? "bg-[#19B978] text-white"
                    : "bg-[#1C2430] text-[#737D8B] border border-[#27313D]"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </div>

              {/* Step Info */}
              <div className="flex-1 pt-0.5">
                <h4
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? "text-[#FF5A00]"
                      : isDone
                      ? "text-[#FFFFFF]"
                      : "text-[#737D8B]"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-[#A8B0BC] mt-0.5 leading-snug">
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
