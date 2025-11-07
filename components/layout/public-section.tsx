/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PageAnimationWrapper } from "@/components/layout/public-page-animations";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { forwardRef, useRef } from "react";

interface PublicSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  background?: "default" | "muted" | "accent";
  padding?: "sm" | "md" | "lg";
  id?: string;
}

export const PublicSection = forwardRef<HTMLElement, PublicSectionProps>(({
  children,
  title,
  description,
  className,
  containerClassName,
  background = "default",
  padding = "md",
  id,
}, ref) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef || ref, { once: true, margin: "-100px" });
  
  const paddingClasses = {
    sm: "py-12",
    md: "py-20",
    lg: "py-32",
  };

  const backgroundClasses = {
    default: "bg-background",
    muted: "bg-muted/30",
    accent: "bg-primary/5",
  };

  return (
    <motion.section 
      ref={sectionRef || ref}
      id={id}
      className={cn(
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
    >
      <div className={cn(
        "max-w-6xl mx-auto px-6",
        containerClassName
      )}>
        {(title || description) && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </motion.section>
  );
});

PublicSection.displayName = "PublicSection";

export interface PublicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PublicCard({ children, className, hover = true }: PublicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
    >
      <Card className={cn(
        "p-6 hover:shadow-lg transition-all duration-300 bg-card border",
        className
      )}>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PublicGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
  /**
   * Use auto-fit pattern for responsive grids.
   * When true, uses `repeat(auto-fit, minmax(minWidth, 1fr))` pattern.
   * minWidth defaults to 250px, but can be customized via className.
   */
  autoFit?: boolean;
  /**
   * Minimum width for auto-fit pattern (in pixels).
   * Only used when autoFit is true. Defaults to 250px.
   */
  minWidth?: number;
}

export function PublicGrid({ 
  children, 
  columns = 3, 
  gap = "md", 
  className,
  autoFit = false,
  minWidth = 250,
}: PublicGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  // Auto-fit pattern for responsive grids
  if (autoFit) {
    return (
      <div 
        className={cn(
          "grid",
          gapClasses[gap],
          className
        )}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        }}
      >
        {children}
      </div>
    );
  }

  // Breakpoint-based grid (default)
  return (
    <div className={cn(
      "grid",
      gridClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
