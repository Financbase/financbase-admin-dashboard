import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

interface PublicHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
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

  const backgroundClasses = {
    gradient: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800",
    solid: "bg-primary",
    pattern: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden",
  };

  return (
    <section className={cn(
      "relative",
      backgroundClasses[background],
      sizeClasses[size],
      className
    )}>
      {background === "pattern" && (
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      )}
      
      <div className="max-w-6xl mx-auto px-6 relative">
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
              "text-blue-100 mb-8 max-w-3xl mx-auto",
              size === "sm" ? "text-lg" : "text-xl"
            )}>
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.text}
                  </Link>
                </Button>
              )}
              {secondaryAction && (
                <Button
                  asChild
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href={secondaryAction.href}>
                    {secondaryAction.text}
                  </Link>
                </Button>
              )}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </section>
  );
}
