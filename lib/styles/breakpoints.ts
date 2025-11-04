/**
 * Standardized Breakpoint System
 * 
 * Defines consistent breakpoints for responsive design across the application.
 * Matches Tailwind CSS breakpoints for consistency.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { useState, useEffect } from 'react';

/**
 * Breakpoint definitions in pixels
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Breakpoint type
 */
export type Breakpoint = keyof typeof breakpoints;

/**
 * Media query strings for use in CSS
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
} as const;

/**
 * Max-width media queries (for mobile-first)
 */
export const maxMediaQueries = {
  xs: `(max-width: ${breakpoints.sm - 1}px)`,
  sm: `(max-width: ${breakpoints.md - 1}px)`,
  md: `(max-width: ${breakpoints.lg - 1}px)`,
  lg: `(max-width: ${breakpoints.xl - 1}px)`,
  xl: `(max-width: ${breakpoints['2xl'] - 1}px)`,
} as const;

/**
 * Range media queries (between breakpoints)
 */
export function mediaQueryRange(min: Breakpoint, max: Breakpoint): string {
  const minWidth = breakpoints[min];
  const maxWidth = breakpoints[max] - 1;
  return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
}

/**
 * Check if current viewport matches breakpoint (client-side only)
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(mediaQueries[breakpoint]).matches;
}

/**
 * Get current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Check if viewport is mobile
 */
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < breakpoints.md;
}

/**
 * Check if viewport is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints.md && width < breakpoints.lg;
}

/**
 * Check if viewport is desktop
 */
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= breakpoints.lg;
}

/**
 * Tailwind breakpoint configuration (for reference)
 */
export const tailwindBreakpoints = {
  screens: {
    sm: `${breakpoints.sm}px`,
    md: `${breakpoints.md}px`,
    lg: `${breakpoints.lg}px`,
    xl: `${breakpoints.xl}px`,
    '2xl': `${breakpoints['2xl']}px`,
  },
};

/**
 * CSS custom properties for breakpoints
 */
export const cssBreakpointVars = `
  --breakpoint-xs: ${breakpoints.xs}px;
  --breakpoint-sm: ${breakpoints.sm}px;
  --breakpoint-md: ${breakpoints.md}px;
  --breakpoint-lg: ${breakpoints.lg}px;
  --breakpoint-xl: ${breakpoints.xl}px;
  --breakpoint-2xl: ${breakpoints['2xl']}px;
`;

/**
 * React hook for responsive breakpoint detection
 * 
 * @example
 * ```tsx
 * const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
 * ```
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getCurrentBreakpoint());
  const [isMobileState, setIsMobileState] = useState(() => isMobile());
  const [isTabletState, setIsTabletState] = useState(() => isTablet());
  const [isDesktopState, setIsDesktopState] = useState(() => isDesktop());

  useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getCurrentBreakpoint());
      setIsMobileState(isMobile());
      setIsTabletState(isTablet());
      setIsDesktopState(isDesktop());
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: isMobileState,
    isTablet: isTabletState,
    isDesktop: isDesktopState,
  };
}

