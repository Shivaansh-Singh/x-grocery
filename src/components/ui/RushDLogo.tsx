"use client";

import Link from "next/link";
import Image from "next/image";

interface RushDLogoProps {
  variant?: "full" | "symbol";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  withContainer?: boolean;
}

export function RushDLogo({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
  withContainer = true,
}: RushDLogoProps) {
  const iconDimensions = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const wordmarkHeights = {
    sm: "h-4.5",
    md: "h-6",
    lg: "h-7.5",
  };

  const logoElements = (
    <>
      {/* Supplied R Icon Emblem Image Asset */}
      <Image
        src="/brand/rushd-icon.png"
        alt="RushD Icon"
        width={160}
        height={160}
        priority
        unoptimized
        className={`${iconDimensions[size]} object-contain rounded-lg shrink-0`}
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
    </>
  );

  const containerClasses = withContainer
    ? `inline-flex items-center gap-2 bg-[#FFFFFF] px-2.5 py-1 rounded-xl shadow-xs border border-white/20 select-none shrink-0 ${className}`
    : `inline-flex items-center gap-2 select-none shrink-0 ${className}`;

  const content = <div className={containerClasses}>{logoElements}</div>;

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-95 transition-opacity shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
