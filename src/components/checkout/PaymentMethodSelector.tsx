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
    <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-3">
      <h3 className="font-bold text-xs text-[#111315] uppercase tracking-wider">
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
                  ? "bg-[#F5F3EE] border-[#FF5A1F] shadow-2xs"
                  : "bg-[#FFFFFF] border-[#D9D7D2] hover:border-[#111315]"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="w-4 h-4 text-[#FF5A1F] focus:ring-[#FF5A1F]"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#111315]">
                    {method.title}
                  </span>
                  <span className="text-[10px] font-semibold text-[#168A5B] px-2 py-0.5 rounded-md bg-[#ECEAE5]">
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#666A70] mt-1 leading-normal">
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
