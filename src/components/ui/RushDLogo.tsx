"use client";

import Link from "next/link";
import Image from "next/image";

interface RushDLogoProps {
  variant?: "full" | "symbol";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function RushDLogo({
  size = "md",
  href = "/",
  className = "",
}: RushDLogoProps) {
  const logoHeights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
  };

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <Image
        src="/brand/rushd-logo.png"
        alt="RushD"
        width={320}
        height={100}
        priority
        className={`${logoHeights[size]} w-auto object-contain`}
      />
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
