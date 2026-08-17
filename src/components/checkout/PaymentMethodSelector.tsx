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
    <div className="bg-[#151B24] p-4 rounded-2xl border border-[#27313D] shadow-md space-y-3 text-white">
      <h3 className="font-extrabold text-xs text-[#FFFFFF] uppercase tracking-wider">
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
                  ? "bg-[#1C2430] border-[#FF5A00] shadow-sm"
                  : "bg-[#1C2430]/60 border-[#27313D] hover:border-[#0757D5]"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="w-4 h-4 text-[#FF5A00] focus:ring-[#FF5A00]"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#FFFFFF]">
                    {method.title}
                  </span>
                  <span className="text-[10px] font-bold text-[#19B978] px-2 py-0.5 rounded-md bg-[#19B978]/15 border border-[#19B978]/30">
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#A8B0BC] mt-1 leading-normal">
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
