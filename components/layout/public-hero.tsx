/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

interface PublicHeroProps {
  title: string;
  subtitle?: ReactNode;
  description?: string | ReactNode;
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  background?: "gradient" | "solid" | "pattern";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

export function PublicHero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  background = "gradient",
  size = "md",
  className,
  children,
}: PublicHeroProps) {
  const sizeClasses = {
    sm: "py-16",
    md: "py-20",
    lg: "py-32",
  };

  // Use inline styles with oklch() for proper Financbase brand colors
  const getBackgroundStyle = () => {
    if (background === "gradient" || background === "pattern") {
      return {
        background: "linear-gradient(to bottom right, oklch(var(--brand-primary)), oklch(var(--brand-primary-dark)), oklch(var(--brand-primary-dark)))",
      };
    }
    return {
      backgroundColor: "oklch(var(--brand-primary))",
    };
  };

  return (
    <section 
      className={cn(
        "relative",
        sizeClasses[size],
        className
      )}
      style={getBackgroundStyle()}
    >
      {background === "pattern" && (
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      )}
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center text-white">
          {subtitle && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 mb-6">
              {subtitle}
            </div>
          )}
          
          <h1 className={cn(
            "font-bold mb-6",
            size === "sm" ? "text-3xl md:text-4xl" : 
            size === "md" ? "text-4xl md:text-6xl" : 
            "text-5xl md:text-7xl"
          )}>
            {title}
          </h1>
          
          {description && (
            <p className={cn(
              "text-white/90 mb-8 max-w-3xl mx-auto",
              size === "sm" ? "text-lg" : "text-xl"
            )}>
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              {primaryAction && (
                <Link 
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 bg-white hover:bg-gray-100 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative z-30"
                  style={{
                    color: "oklch(var(--primary))",
                  }}
                >
                  {primaryAction.text}
                </Link>
              )}
              {secondaryAction && (
                <Link 
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 border-2 bg-transparent text-white hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative z-30 [&:hover]:text-[oklch(var(--primary))]"
                  style={{
                    borderColor: "white",
                    color: "white",
                  }}
                >
                  {secondaryAction.text}
                </Link>
              )}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </section>
  );
}
