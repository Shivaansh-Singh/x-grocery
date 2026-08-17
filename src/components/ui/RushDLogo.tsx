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
  variant = "full",
  size = "md",
  href = "/",
  className = "",
}: RushDLogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7",
    md: "h-9.5 w-9.5",
    lg: "h-12 w-12",
  };

  const wordmarkHeights = {
    sm: "h-5",
    md: "h-6.5",
    lg: "h-8",
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Supplied R Icon Emblem Image Asset */}
      <Image
        src="/brand/rushd-icon.png"
        alt="RushD Icon"
        width={160}
        height={160}
        priority
        unoptimized
        className={`${iconDimensions[size]} object-contain rounded-xl shrink-0`}
      />

      {/* Supplied RushD Wordmark Image Asset */}
      {variant === "full" && (
        <Image
          src="/brand/rushd-wordmark.png"
          alt="RushD"
          width={220}
          height={50}
          priority
          unoptimized
          className={`${wordmarkHeights[size]} w-auto object-contain shrink-0`}
        />
      )}
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
