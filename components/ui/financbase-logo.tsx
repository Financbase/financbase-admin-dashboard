"use client";

import Image from "next/image";

interface FinancbaseLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function FinancbaseLogo({ size = "md", className, showText = false }: FinancbaseLogoProps) {
  const sizeClasses = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 }, 
    lg: { width: 180, height: 60 }
  };

  const dimensions = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image 
        src="/financbase-logo.png"
        alt="Financbase Logo"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-bold text-xl">Financbase</span>
      )}
    </div>
  );
}
