/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import Image from "next/image";
import { useBrandingContext } from "@/contexts/branding-context";

interface BrandedLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  dark?: boolean;
  alt?: string;
}

/**
 * BrandedLogo component that uses white label branding
 * Falls back to Financbase branding if no custom branding is configured
 */
export function BrandedLogo({ 
  size = "md", 
  className, 
  showText = false,
  dark = false,
  alt
}: BrandedLogoProps) {
  const { branding, getLogo, getCompanyName } = useBrandingContext();
  
  const sizeClasses = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 }, 
    lg: { width: 180, height: 60 }
  };

  const dimensions = sizeClasses[size];
  const logoUrl = getLogo(dark);
  const companyName = getCompanyName();
  const displayAlt = alt || `${companyName} Logo`;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image 
        src={logoUrl}
        alt={displayAlt}
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-bold text-xl">{companyName}</span>
      )}
    </div>
  );
}

