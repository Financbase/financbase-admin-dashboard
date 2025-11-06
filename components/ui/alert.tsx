/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-6 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-2 font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// GradientAlert component
export interface GradientAlertProps {
  title: string;
  description?: string;
  variant?: "information" | "success" | "warning" | "error";
  onClose?: () => void;
  className?: string;
}

const gradientVariants = {
  information: "from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-700 dark:text-blue-300",
  success: "from-green-500/20 to-green-600/20 border-green-500/50 text-green-700 dark:text-green-300",
  warning: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300",
  error: "from-red-500/20 to-red-600/20 border-red-500/50 text-red-700 dark:text-red-300",
};

const GradientAlert = React.forwardRef<HTMLDivElement, GradientAlertProps>(
  ({ title, description, variant = "information", onClose, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border bg-gradient-to-r p-4",
          gradientVariants[variant],
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h5 className="font-medium leading-none tracking-tight mb-1">{title}</h5>
            {description && (
              <div className="text-sm mt-1">{description}</div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
GradientAlert.displayName = "GradientAlert";

export { Alert, AlertTitle, AlertDescription, GradientAlert }
