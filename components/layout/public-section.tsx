import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PublicSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  background?: "default" | "muted" | "accent";
  padding?: "sm" | "md" | "lg";
}

export function PublicSection({
  children,
  title,
  description,
  className,
  containerClassName,
  background = "default",
  padding = "md",
}: PublicSectionProps) {
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
    <section className={cn(
      paddingClasses[padding],
      backgroundClasses[background],
      className
    )}>
      <div className={cn(
        "max-w-6xl mx-auto px-6",
        containerClassName
      )}>
        {(title || description) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

interface PublicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PublicCard({ children, className, hover = true }: PublicCardProps) {
  return (
    <Card className={cn(
      "p-6 hover:shadow-lg transition-all duration-300 bg-card border",
      hover && "hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}

interface PublicGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function PublicGrid({ 
  children, 
  columns = 3, 
  gap = "md", 
  className 
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
