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
  const logoDimensions = {
    sm: "h-7 w-7",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const content = (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <Image
        src="/brand/rushd-logo.png"
        alt="RushD"
        width={160}
        height={160}
        priority
        unoptimized
        className={`${logoDimensions[size]} object-contain rounded-xl shrink-0`}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
