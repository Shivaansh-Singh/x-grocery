"use client";

import type { OrderRecord } from "./OrderCard";

interface OrderTrackingTimelineProps {
  status: OrderRecord["status"];
}

interface Step {
  key: OrderRecord["status"];
  title: string;
  subtitle: string;
  icon: string;
}

export function OrderTrackingTimeline({ status }: OrderTrackingTimelineProps) {
  const steps: Step[] = [
    {
      key: "PENDING",
      title: "Order Placed",
      subtitle: "Sent to Store Owner X for review",
      icon: "📝",
    },
    {
      key: "ACCEPTED",
      title: "Order Accepted",
      subtitle: "Store X confirmed your order",
      icon: "✅",
    },
    {
      key: "PREPARING",
      title: "Packing Items",
      subtitle: "Store X team is packing your groceries",
      icon: "📦",
    },
    {
      key: "ASSIGNED",
      title: "Rider Assigned",
      subtitle: "Dedicated Store X rider assigned",
      icon: "👤",
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      subtitle: "Heading to your off-campus flat / room",
      icon: "🛵",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      subtitle: "Order delivered to your doorstep",
      icon: "🎉",
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
      <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-3xl border border-rose-200 dark:border-rose-900 text-center space-y-2">
        <span className="text-3xl block">❌</span>
        <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300">
          Order Cancelled / Rejected
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-400">
          This order was cancelled or could not be fulfilled by Store X.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Delivery Progress
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Target: 10-15 Mins
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
                  className={`absolute left-[15px] top-7 bottom--5 w-0.5 transition-colors duration-500 ${
                    isDone ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              )}

              {/* Node Bullet Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950 animate-pulse scale-110"
                    : isDone
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </div>

              {/* Step Info */}
              <div className="flex-1 pt-0.5">
                <h4
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : isDone
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
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
