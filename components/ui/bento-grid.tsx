/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const BentoGrid = ({
  children,
  className,
  columns = 12, // Default to 12-column grid for more flexibility
}: {
  children: ReactNode;
  className?: string;
  columns?: 3 | 4 | 6 | 12; // Support different grid layouts
}) => {
  const gridColsClass = {
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    12: "grid-cols-12", // 12-column grid - use explicit 12 columns
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid w-full auto-rows-[minmax(22rem,auto)] gap-4",
        gridColsClass,
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
}) => (
  <Link
    href={href}
    key={name}
    className={cn(
      "group relative col-span-1 md:col-span-2 lg:col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-card border border-border shadow-card",
      // dark styles
      "transform-gpu dark:bg-card dark:border-border",
      "transition-all duration-300 hover:shadow-elevated",
      className,
    )}
  >
    {/* Background layer */}
    <div className="absolute inset-0 z-0">{background}</div>
    
    {/* Content layer */}
    <div className="relative z-10 flex min-h-full flex-col justify-between p-6">
      <div className="flex transform-gpu flex-col gap-1 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-foreground transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground">
          {name}
        </h3>
        <p className="max-w-lg text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* CTA Button - appears on hover */}
      <div
        className={cn(
          "flex w-full translate-y-10 transform-gpu flex-row items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button variant="ghost" size="sm" className="pointer-events-none">
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
    
    {/* Hover overlay */}
    <div className="pointer-events-none absolute inset-0 z-[5] transform-gpu transition-all duration-300 group-hover:bg-primary/[.03] group-hover:dark:bg-primary/5" />
  </Link>
);

export const BentoGridItem = ({
  children,
  className,
  title,
  description,
  header,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  header?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col overflow-hidden rounded-xl h-full",
        // light styles
        "bg-card border border-border shadow-card",
        // dark styles
        "transform-gpu dark:bg-card dark:border-border",
        "transition-all duration-300 hover:shadow-elevated",
        className,
      )}
    >
      {(title || description || header) && (
        <div className="mb-4 px-6 pt-6 flex-shrink-0">
          {header}
          {title && <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
        </div>
      )}
      <div className="flex-1 px-6 pb-6 min-w-0 w-full min-h-0 overflow-hidden">
        <div className="w-full h-full overflow-x-auto overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
