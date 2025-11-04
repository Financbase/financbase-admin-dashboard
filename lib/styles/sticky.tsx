/**
 * Sticky Positioning Utilities
 * 
 * Provides utilities for sticky headers, sidebars, and navigation elements.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky positioning variants
 */
export const stickyVariants = {
  header: 'sticky top-0 z-50',
  sidebar: 'sticky top-0 z-40',
  footer: 'sticky bottom-0 z-50',
  nav: 'sticky top-0 z-30',
  toolbar: 'sticky top-0 z-20',
} as const;

/**
 * Sticky Header Component
 * For headers that stick to top while scrolling
 */
export function StickyHeader({
  className,
  children,
  offset = 0,
}: {
  className?: string;
  children: React.ReactNode;
  offset?: number;
}) {
  return (
    <header
      className={cn(
        stickyVariants.header,
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        className
      )}
      style={{ top: `${offset}px` }}
    >
      {children}
    </header>
  );
}

/**
 * Sticky Sidebar Component
 * For sidebars that stick while scrolling
 */
export function StickySidebar({
  className,
  children,
  offset = 0,
}: {
  className?: string;
  children: React.ReactNode;
  offset?: number;
}) {
  return (
    <aside
      className={cn(
        stickyVariants.sidebar,
        'h-screen overflow-y-auto',
        className
      )}
      style={{ top: `${offset}px` }}
    >
      {children}
    </aside>
  );
}

/**
 * Sticky Navigation Component
 * For navigation bars that stick to top
 */
export function StickyNav({
  className,
  children,
  offset = 0,
}: {
  className?: string;
  children: React.ReactNode;
  offset?: number;
}) {
  return (
    <nav
      className={cn(
        stickyVariants.nav,
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      style={{ top: `${offset}px` }}
    >
      {children}
    </nav>
  );
}

/**
 * Sticky Toolbar Component
 * For toolbars that stick below headers
 */
export function StickyToolbar({
  className,
  children,
  offset = 0,
}: {
  className?: string;
  children: React.ReactNode;
  offset?: number;
}) {
  return (
    <div
      className={cn(
        stickyVariants.toolbar,
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        className
      )}
      style={{ top: `${offset}px` }}
    >
      {children}
    </div>
  );
}

/**
 * Sticky Footer Component
 * For footers that stick to bottom
 */
export function StickyFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <footer
      className={cn(
        stickyVariants.footer,
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t',
        className
      )}
    >
      {children}
    </footer>
  );
}

