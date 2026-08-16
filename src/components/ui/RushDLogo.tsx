"use client";

import Link from "next/link";

interface RushDLogoProps {
  variant?: "full" | "symbol";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function RushDLogo({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
}: RushDLogoProps) {
  const iconHeights = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Stylized R Symbol with Orange + Cobalt speed slash */}
      <svg
        className={`${iconHeights[size]} w-auto aspect-square`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark Navy / Cobalt Background Shield */}
        <rect width="40" height="40" rx="10" fill="#111315" />
        {/* Cobalt diagonal velocity slice */}
        <path d="M6 34L26 6H34L14 34H6Z" fill="#1646C7" opacity="0.6" />
        {/* Stylized R Letterform */}
        <path
          d="M11 10H22C25.3137 10 28 12.6863 28 16C28 19.3137 25.3137 22 22 22H16V30H11V10Z"
          fill="#FFFFFF"
        />
        {/* Lightning Negative Speed Notch */}
        <path
          d="M17 14L22 14C23.1046 14 24 14.8954 24 16C24 17.1046 23.1046 18 22 18H17V14Z"
          fill="#111315"
        />
        {/* RushD Orange Dynamic Leg Slash */}
        <path
          d="M20.5 20.5L29 30H23L15.5 20.5H20.5Z"
          fill="#FF5A1F"
        />
      </svg>

      {/* Wordmark: RushD */}
      {variant === "full" && (
        <span
          className={`font-black tracking-tight font-sans ${textSizes[size]} leading-none`}
        >
          <span className="text-[#111315]">Rush</span>
          <span className="text-[#FF5A1F]">D</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
