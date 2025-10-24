"use client";

import Image from "next/image";

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
  const sizeClasses = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 }, 
    lg: { width: 180, height: 60 }
  };

  const dimensions = sizeClasses[size];

  // Determine logo source based on variant and background
  const getLogoSrc = () => {
    if (variant === "white" || variant === "monochrome") {
      return "/financbase-logo-white.png";
    }
    return "/financbase-logo.png";
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image 
        src={getLogoSrc()}
        alt="Financbase Logo"
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
        <span className="font-bold text-xl">Financbase</span>
      )}
    </div>
  );
}
