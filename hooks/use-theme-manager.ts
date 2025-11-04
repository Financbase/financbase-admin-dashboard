/**
 * React Hook for Theme Manager
 * 
 * Provides React hooks for accessing and managing theme state
 * with automatic synchronization with user preferences.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { themeManager } from '@/lib/services/theme-manager';
import type {
  ThemeMode,
  ResolvedTheme,
  ThemeState,
  ThemeVariable,
  ThemeColorFormat,
  ThemeColorValue,
} from '@/lib/types/theme';

/**
 * Hook return type
 */
export interface UseThemeManagerReturn {
  // Current theme state
  mode: ThemeMode;
  resolved: ResolvedTheme;
  state: ThemeState;
  
  // Theme status checks
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  
  // Theme actions
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  resetTheme: () => Promise<void>;
  
  // Color utilities
  getColor: (variable: ThemeVariable, format?: ThemeColorFormat) => string;
  getColorValue: (variable: ThemeVariable) => ThemeColorValue;
  getChartColor: (index: 1 | 2 | 3 | 4 | 5, opacity?: number) => string;
  
  // Variable management
  setVariable: (variable: ThemeVariable, value: string) => void;
  getAllVariables: () => Record<string, string>;
  
  // Loading state
  isLoading: boolean;
  isMounted: boolean;
  
  // Error state
  error: Error | null;
}

/**
 * Main hook for theme management
 * Integrates with next-themes and provides ThemeManager functionality
 */
export function useThemeManager(): UseThemeManagerReturn {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [state, setState] = useState<ThemeState>(() => themeManager.getState());
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const listenerRef = useRef<(() => void) | null>(null);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
    
      // Sync with next-themes
      const nextThemeMode = (nextTheme as ThemeMode) || 'light';
      const currentMode = themeManager.getMode();
      
      if (nextThemeMode !== currentMode && nextTheme) {
        themeManager.setTheme(nextThemeMode, false).catch((err) => {
          setError(err as Error);
        });
      }

    // Listen for theme changes
    listenerRef.current = themeManager.addListener((resolved, mode) => {
      setState(themeManager.getState());
      
      // Sync with next-themes
      if (setNextTheme && mode !== nextTheme) {
        setNextTheme(mode);
      }
    });

    // Load from preferences on mount
    themeManager.loadFromPreferences().catch((err) => {
      console.warn('Failed to load theme from preferences:', err);
    });

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [nextTheme, setNextTheme]);

  // Sync state when next-themes changes
  useEffect(() => {
    if (!isMounted) return;

    const nextThemeMode = (nextTheme as ThemeMode) || 'light';
    const currentMode = themeManager.getMode();
    
    if (nextThemeMode !== currentMode && setNextTheme) {
      themeManager.setTheme(nextThemeMode, false).catch((err) => {
        setError(err as Error);
      });
    }
  }, [nextTheme, isMounted, setNextTheme]);

  // Set theme with optimistic update
  const setTheme = useCallback(async (mode: ThemeMode) => {
    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      const resolved = mode === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      setState((prev) => ({
        ...prev,
        mode,
        resolved: resolved as ResolvedTheme,
        isSystem: mode === 'system',
      }));

      // Apply theme
      await themeManager.setTheme(mode);
      
      // Sync with next-themes
      if (setNextTheme) {
        setNextTheme(mode);
      }

      setState(themeManager.getState());
    } catch (err) {
      setError(err as Error);
      // Revert on error
      setState(themeManager.getState());
    } finally {
      setIsLoading(false);
    }
  }, [setNextTheme]);

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    const currentResolved = themeManager.getResolvedTheme();
    const newMode = currentResolved === 'light' ? 'dark' : 'light';
    await setTheme(newMode);
  }, [setTheme]);

  // Reset theme
  const resetTheme = useCallback(async () => {
    await setTheme('light');
  }, [setTheme]);

  // Get color utility
  const getColor = useCallback(
    (variable: ThemeVariable, format?: ThemeColorFormat) => {
      return themeManager.getColor(variable, format);
    },
    []
  );

  // Get color value utility
  const getColorValue = useCallback((variable: ThemeVariable) => {
    return themeManager.getColorValue(variable);
  }, []);

  // Get chart color utility
  const getChartColor = useCallback(
    (index: 1 | 2 | 3 | 4 | 5, opacity?: number) => {
      return themeManager.getChartColor(index, opacity);
    },
    []
  );

  // Set variable utility
  const setVariable = useCallback((variable: ThemeVariable, value: string) => {
    themeManager.setVariable(variable, value);
    setState(themeManager.getState());
  }, []);

  // Get all variables utility
  const getAllVariables = useCallback(() => {
    return themeManager.getAllVariables();
  }, []);

  const currentState = state;
  const resolved = resolvedTheme || currentState.resolved;

  return {
    mode: currentState.mode,
    resolved: resolved as ResolvedTheme,
    state: currentState,
    isDark: themeManager.isDark(),
    isLight: themeManager.isLight(),
    isSystem: themeManager.isSystem(),
    setTheme,
    toggleTheme,
    resetTheme,
    getColor,
    getColorValue,
    getChartColor,
    setVariable,
    getAllVariables,
    isLoading,
    isMounted,
    error,
  };
}

/**
 * Simplified hook that only returns theme state (no actions)
 * Useful for read-only components
 */
export function useThemeState(): Pick<UseThemeManagerReturn, 'mode' | 'resolved' | 'isDark' | 'isLight' | 'isSystem' | 'isMounted'> {
  const manager = useThemeManager();
  return {
    mode: manager.mode,
    resolved: manager.resolved,
    isDark: manager.isDark,
    isLight: manager.isLight,
    isSystem: manager.isSystem,
    isMounted: manager.isMounted,
  };
}

/**
 * Hook for getting theme colors
 * Optimized for components that only need color access
 */
export function useThemeColors() {
  const manager = useThemeManager();
  
  return {
    getColor: manager.getColor,
    getColorValue: manager.getColorValue,
    getChartColor: manager.getChartColor,
    getAllVariables: manager.getAllVariables,
    isDark: manager.isDark,
    isLight: manager.isLight,
  };
}

