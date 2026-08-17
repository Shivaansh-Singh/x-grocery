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
    <div className="bg-[#141822] p-4 rounded-2xl border border-white/8 shadow-md space-y-3 text-[#F5F6FA]">
      <h3 className="font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
        Payment Method
      </h3>

      <div className="space-y-2.5">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? "bg-[#1A1F2C] border-[#FF6B1A] shadow-sm"
                  : "bg-[#1A1F2C]/60 border-white/8 hover:border-[#2D6CFF]"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="w-4 h-4 text-[#FF6B1A] focus:ring-[#FF6B1A]"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#F5F6FA]">
                    {method.title}
                  </span>
                  <span className="text-[10px] font-bold text-[#3DD68C] px-2 py-0.5 rounded-md bg-[#3DD68C]/15 border border-[#3DD68C]/30">
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#8A90A3] mt-1 leading-normal">
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
