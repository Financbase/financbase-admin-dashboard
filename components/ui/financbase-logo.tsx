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

interface FinancbaseLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "monochrome";
}

export function FinancbaseLogo({ 
  size = "md", 
  className, 
  showText = false, 
  variant = "default" 
}: FinancbaseLogoProps) {
  const { branding, getLogo, getCompanyName } = useBrandingContext();
  
  const sizeClasses = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 }, 
    lg: { width: 180, height: 60 }
  };

  const dimensions = sizeClasses[size];

  // Determine logo source based on variant and branding
  const getLogoSrc = () => {
    // Use branded logo if available
    if (variant === "white" || variant === "monochrome") {
      return getLogo(true) || "/financbase-logo-white.png";
    }
    return getLogo(false) || "/financbase-logo.png";
  };

  const companyName = getCompanyName();
  const isBranded = !branding.hideFinancbaseBranding && branding.logo;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image 
        src={getLogoSrc()}
        alt={`${companyName} Logo`}
        width={dimensions.width}
        height={dimensions.height}
        className={`object-contain ${
          variant === "white" || variant === "monochrome" 
            ? "brightness-0 invert" 
            : ""
        }`}
        priority
      />
      {showText && (
        <span className="font-bold text-xl">{companyName}</span>
      )}
    </div>
  );
}
