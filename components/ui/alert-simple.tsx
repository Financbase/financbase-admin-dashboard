/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Alert as AlertComponent, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AlertSimpleProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
  className?: string;
}

export function AlertSimple({ variant = "default", children, className }: AlertSimpleProps) {
  return (
    <AlertComponent variant={variant} className={cn(className)}>
      {children}
    </AlertComponent>
  );
}

export const Alert = AlertSimple;
export { AlertDescription, AlertTitle };

