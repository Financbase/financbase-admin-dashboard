/**
 * Native Details/Summary Component
 * 
 * Wrapper around native HTML5 <details> and <summary> elements
 * with enhanced styling and optional animation support.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DetailsProps extends React.HTMLAttributes<HTMLDetailsElement> {
  /**
   * Summary text or element
   */
  summary: React.ReactNode;
  /**
   * Whether details is open by default
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Enable smooth animation
   */
  animated?: boolean;
  /**
   * Additional className for details element
   */
  detailsClassName?: string;
  /**
   * Additional className for summary element
   */
  summaryClassName?: string;
  /**
   * Additional className for content wrapper
   */
  contentClassName?: string;
}

/**
 * Native Details Component
 */
export const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(
  (
    {
      summary,
      defaultOpen,
      open: controlledOpen,
      onOpenChange,
      animated = true,
      detailsClassName,
      summaryClassName,
      contentClassName,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const handleToggle = React.useCallback(
      (e: React.SyntheticEvent<HTMLDetailsElement>) => {
        const newOpen = e.currentTarget.open;
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange]
    );

    return (
      <details
        ref={ref}
        open={isControlled ? controlledOpen : undefined}
        defaultOpen={defaultOpen}
        onToggle={handleToggle}
        className={cn(
          'group',
          animated && 'transition-all duration-200',
          detailsClassName,
          className
        )}
        {...props}
      >
        <summary
          className={cn(
            'cursor-pointer list-none select-none',
            'flex items-center justify-between',
            'font-medium',
            'py-2 px-4',
            'rounded-md',
            'hover:bg-accent/50',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            '[&::-webkit-details-marker]:hidden',
            summaryClassName
          )}
        >
          <span>{summary}</span>
          <span
            className={cn(
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          >
            ▼
          </span>
        </summary>
        <div
          className={cn(
            'overflow-hidden',
            animated && 'transition-all duration-200',
            isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
            contentClassName
          )}
        >
          <div className="py-2 px-4">{children}</div>
        </div>
      </details>
    );
  }
);

Details.displayName = 'Details';

/**
 * Details Group Component
 * Multiple details in a group (accordion-style)
 */
export interface DetailsGroupProps {
  children: React.ReactNode;
  /**
   * Allow multiple items open at once
   */
  multiple?: boolean;
  /**
   * Default open items (by index)
   */
  defaultOpen?: number[];
  className?: string;
}

export function DetailsGroup({
  children,
  multiple = false,
  defaultOpen = [],
  className,
}: DetailsGroupProps) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(
    new Set(defaultOpen)
  );

  const handleToggle = React.useCallback(
    (index: number, isOpen: boolean) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (isOpen) {
          if (multiple) {
            next.add(index);
          } else {
            // Close all others if not multiple
            return new Set([index]);
          }
        } else {
          next.delete(index);
        }
        return next;
      });
    },
    [multiple]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Details) {
          return React.cloneElement(child as React.ReactElement<DetailsProps>, {
            open: openItems.has(index),
            onOpenChange: (open) => handleToggle(index, open),
          });
        }
        return child;
      })}
    </div>
  );
}

