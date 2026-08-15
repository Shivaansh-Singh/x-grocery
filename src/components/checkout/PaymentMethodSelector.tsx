"use client";

export type PaymentChoice = "COD" | "UPI_ON_DELIVERY";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentChoice;
  onChange: (method: PaymentChoice) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onChange,
}: PaymentMethodSelectorProps) {
  const methods = [
    {
      id: "COD" as PaymentChoice,
      icon: "💵",
      title: "Cash on Delivery (COD)",
      subtitle: "Pay cash to Store X delivery staff upon order arrival",
      badge: "No Upfront Payment Required",
    },
    {
      id: "UPI_ON_DELIVERY" as PaymentChoice,
      icon: "📲",
      title: "Pay via UPI on Delivery",
      subtitle: "Scan QR Code at doorstep via GPay, PhonePe, Paytm, or BHIM",
      badge: "Instant Doorstep QR Scan",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
      <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
        Payment Method
      </h3>

      <div className="space-y-2.5">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs"
                  : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    <span className="text-base">{method.icon}</span>
                    <span>{method.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60">
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                  {method.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
