/**
 * Theme Context
 * 
 * Provides theme context throughout the application tree.
 * Enhances next-themes ThemeProvider with ThemeManager functionality.
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { useThemeManager, type UseThemeManagerReturn } from '@/hooks/use-theme-manager';

/**
 * Theme context type
 */
interface ThemeContextValue extends UseThemeManagerReturn {
  // Additional context-specific properties can be added here
}

/**
 * Create theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme context provider props
 */
interface ThemeContextProviderProps {
  children: ReactNode;
  /**
   * Attribute name for theme class (default: 'class')
   */
  attribute?: string;
  /**
   * Default theme (default: 'light')
   */
  defaultTheme?: 'light' | 'dark' | 'system';
  /**
   * Enable system theme detection (default: false)
   */
  enableSystem?: boolean;
  /**
   * Storage key for theme persistence (default: 'financbase-theme')
   */
  storageKey?: string;
  /**
   * Disable transition on theme change (default: true)
   */
  disableTransitionOnChange?: boolean;
}

/**
 * Internal provider component that uses the hook
 */
function ThemeContextProviderInternal({ children }: { children: ReactNode }) {
  const themeManager = useThemeManager();

  // Sync ThemeManager with next-themes
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();

  useEffect(() => {
    // Sync ThemeManager state with next-themes
    if (nextTheme && nextTheme !== themeManager.mode) {
      themeManager.setTheme(nextTheme as any).catch((err) => {
        console.warn('Failed to sync theme:', err);
      });
    }
  }, [nextTheme, themeManager]);

  return (
    <ThemeContext.Provider value={themeManager}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Theme context provider
 * Wraps next-themes ThemeProvider and adds ThemeManager context
 */
export function ThemeContextProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = false,
  storageKey = 'financbase-theme',
  disableTransitionOnChange = true,
}: ThemeContextProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
      suppressHydrationWarning
    >
      <ThemeContextProviderInternal>{children}</ThemeContextProviderInternal>
    </NextThemesProvider>
  );
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeContextProvider
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  
  return context;
}

/**
 * HOC to provide theme context to a component
 */
export function withThemeContext<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WithThemeContext = (props: P) => {
    const themeContext = useThemeContext();
    return <Component {...props} themeContext={themeContext} />;
  };

  WithThemeContext.displayName = `withThemeContext(${Component.displayName || Component.name || 'Component'})`;

  return WithThemeContext;
}

