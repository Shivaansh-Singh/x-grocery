"use client";

import Link from "next/link";
import Image from "next/image";

interface RushDLogoProps {
  variant?: "full" | "symbol";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  themeMode?: "auto" | "light" | "dark";
}

export function RushDLogo({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
  themeMode = "auto",
}: RushDLogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const wordmarkHeights = {
    sm: "h-5",
    md: "h-6.5",
    lg: "h-8",
  };

  const logoElements = (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* Supplied R Icon Emblem Image Asset */}
      <Image
        src="/brand/rushd-icon.png"
        alt="RushD Icon"
        width={971}
        height={644}
        priority
        unoptimized
        className={`${iconDimensions[size]} object-contain shrink-0`}
      />

      {/* RushD Wordmark with genuine transparent light (Black Rush + Orange D) and dark (White Rush + Orange D) treatment */}
      {variant === "full" && (
        <>
          {/* Light background: Black Rush + Orange D */}
          {(themeMode === "auto" || themeMode === "light") && (
            <Image
              src="/brand/rushd-wordmark.png"
              alt="RushD"
              width={871}
              height={172}
              priority
              unoptimized
              className={`${wordmarkHeights[size]} w-auto object-contain shrink-0 ${
                themeMode === "auto" ? "rushd-wordmark-light" : "block"
              }`}
            />
          )}

          {/* Dark background: White Rush + Orange D */}
          {(themeMode === "auto" || themeMode === "dark") && (
            <Image
              src="/brand/rushd-wordmark-dark.png"
              alt="RushD"
              width={871}
              height={172}
              priority
              unoptimized
              className={`${wordmarkHeights[size]} w-auto object-contain shrink-0 ${
                themeMode === "auto" ? "rushd-wordmark-dark" : "block"
              }`}
            />
          )}
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-90 transition-opacity shrink-0">
        {logoElements}
      </Link>
    );
  }

  return logoElements;
}
