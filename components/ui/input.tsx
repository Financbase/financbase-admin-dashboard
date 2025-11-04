/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input mode for mobile keyboard optimization
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  /**
   * Automatically set inputMode based on type
   */
  autoInputMode?: boolean;
}

/**
 * Get appropriate inputmode based on input type
 */
function getInputModeFromType(type: string | undefined): string | undefined {
  if (!type) return undefined;
  
  const typeToInputMode: Record<string, string> = {
    email: 'email',
    tel: 'tel',
    url: 'url',
    number: 'numeric',
    search: 'search',
  };
  
  return typeToInputMode[type];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, autoInputMode = true, ...props }, ref) => {
    // Auto-determine inputMode if not provided and autoInputMode is enabled
    const finalInputMode = inputMode || (autoInputMode ? getInputModeFromType(type) : undefined);
    
    return (
      <input
        type={type}
        inputMode={finalInputMode as React.InputHTMLAttributes<HTMLInputElement>['inputMode']}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
