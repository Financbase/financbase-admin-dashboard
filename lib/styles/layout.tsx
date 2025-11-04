/**
 * Layout Utilities and Patterns
 * 
 * Provides standardized layout patterns following the box model paradigm.
 * Defines clear parent-child relationships for major layout sections.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Container sizes
 */
export const containerSizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
} as const;

/**
 * Container padding variants
 */
export const containerPadding = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
} as const;

/**
 * Container gap variants
 */
export const containerGap = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
} as const;

/**
 * Layout Container Props
 */
export interface LayoutContainerProps {
  size?: keyof typeof containerSizes;
  padding?: keyof typeof containerPadding;
  gap?: keyof typeof containerGap;
  className?: string;
  children: React.ReactNode;
}

/**
 * Standard Layout Container
 * Provides consistent container styling with box model structure
 */
export function LayoutContainer({
  size = '7xl',
  padding = 'md',
  gap,
  className,
  children,
}: LayoutContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto',
        containerSizes[size],
        containerPadding[padding],
        gap && containerGap[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Section Container
 * For major page sections
 */
export function SectionContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('w-full py-8 md:py-12 lg:py-16', className)}>
      {children}
    </section>
  );
}

/**
 * Content Wrapper
 * For main content areas
 */
export function ContentWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

/**
 * Flex Container Utilities
 */
export const flexUtilities = {
  row: 'flex flex-row',
  column: 'flex flex-col',
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  center: 'items-center justify-center',
  start: 'items-start justify-start',
  end: 'items-end justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
  grow: 'flex-grow',
  shrink: 'flex-shrink',
  none: 'flex-none',
} as const;

/**
 * Grid Container Utilities
 */
export const gridUtilities = {
  container: 'grid',
  cols1: 'grid-cols-1',
  cols2: 'grid-cols-2',
  cols3: 'grid-cols-3',
  cols4: 'grid-cols-4',
  colsAuto: 'grid-cols-auto',
  responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

/**
 * Box Model Structure Documentation
 * 
 * Parent-Child Relationships:
 * 
 * Page (Root)
 *   └── Layout Container
 *       └── Section Container
 *           └── Content Wrapper
 *               └── Component Elements
 * 
 * Example Structure:
 * 
 * <LayoutContainer size="7xl" padding="md">
 *   <SectionContainer>
 *     <ContentWrapper>
 *       <YourComponent />
 *     </ContentWrapper>
 *   </SectionContainer>
 * </LayoutContainer>
 */

