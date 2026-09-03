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
      title: "Cash on Delivery (COD)",
      subtitle: "Pay cash to RushD delivery rider upon order arrival",
      badge: "No Upfront Payment Required",
    },
    {
      id: "UPI_ON_DELIVERY" as PaymentChoice,
      title: "Pay via UPI on Delivery",
      subtitle: "Scan QR Code at doorstep via GPay, PhonePe, Paytm, or BHIM",
      badge: "Instant Doorstep QR Scan",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3 text-[#111111]">
      <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
        Payment Method
      </h3>

      <div className="space-y-2.5">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? "bg-[#F5F5F5] border-[#111111]"
                  : "bg-white border-[#E5E5E5] hover:border-[#111111]"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="w-4 h-4 accent-[#111111]"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#111111]">
                    {method.title}
                  </span>
                  <span className="text-[10px] font-black text-[#000000] px-2 py-0.5 rounded bg-[#DFFF00] border border-[#111111]">
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] mt-1 leading-normal font-medium">
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
