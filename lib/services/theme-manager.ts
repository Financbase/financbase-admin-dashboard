/**
 * Centralized Theme Manager Service
 * 
 * Provides a single source of truth for theme management, integrating with:
 * - globals.css CSS variables
 * - next-themes ThemeProvider
 * - User preferences API
 * - Local storage persistence
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import type {
  ThemeMode,
  ResolvedTheme,
  ThemeVariable,
  ThemeColorFormat,
  ThemeColorValue,
  ThemeChangeListener,
  ThemeManagerConfig,
  ThemeState,
} from '@/lib/types/theme';
import {
  getThemeRgb,
  getChartColor,
  getThemeHex,
  rgbToHex,
} from '@/lib/utils/theme-colors';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ThemeManagerConfig> = {
  storageKey: 'financbase-theme',
  syncWithPreferences: true,
  syncDebounceMs: 1000,
  enableSystem: false,
};

/**
 * ThemeManager - Singleton service for centralized theme management
 */
class ThemeManager {
  private static instance: ThemeManager;
  private config: Required<ThemeManagerConfig>;
  private listeners: Set<ThemeChangeListener> = new Set();
  private syncTimeout: NodeJS.Timeout | null = null;
  private currentState: ThemeState = {
    mode: 'light',
    resolved: 'light',
    isSystem: false,
  };

  private constructor(config?: ThemeManagerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: ThemeManagerConfig): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager(config);
    }
    return ThemeManager.instance;
  }

  /**
   * Initialize theme manager
   */
  private initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Load theme from localStorage
    const storedTheme = this.loadFromStorage();
    if (storedTheme) {
      this.currentState = {
        mode: storedTheme,
        resolved: storedTheme === 'system' ? this.detectSystemTheme() : storedTheme,
        isSystem: storedTheme === 'system',
      };
    }

    // Listen for system theme changes
    if (this.config.enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentState.mode === 'system') {
          this.updateResolvedTheme();
        }
      });
    }

    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.config.storageKey && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        this.setTheme(newMode, false); // Don't save, already saved by other tab
      }
    });
  }

  /**
   * Get current theme state
   */
  public getState(): ThemeState {
    return { ...this.currentState };
  }

  /**
   * Get current theme mode
   */
  public getMode(): ThemeMode {
    return this.currentState.mode;
  }

  /**
   * Get resolved theme (light/dark, accounting for system)
   */
  public getResolvedTheme(): ResolvedTheme {
    return this.currentState.resolved;
  }

  /**
   * Set theme mode
   * @param mode - Theme mode to set
   * @param saveToStorage - Whether to save to localStorage (default: true)
   */
  public async setTheme(mode: ThemeMode, saveToStorage: boolean = true): Promise<void> {
    const resolved = mode === 'system' ? this.detectSystemTheme() : mode;

    this.currentState = {
      mode,
      resolved,
      isSystem: mode === 'system',
    };

    // Apply to DOM
    this.applyThemeToDOM(resolved);

    // Save to localStorage
    if (saveToStorage && typeof window !== 'undefined') {
      localStorage.setItem(this.config.storageKey, mode);
    }

    // Sync with user preferences API
    if (this.config.syncWithPreferences) {
      this.debouncedSync(mode);
    }

    // Notify listeners
    this.notifyListeners(resolved, mode);
  }

  /**
   * Toggle between light and dark themes
   */
  public async toggleTheme(): Promise<void> {
    const newMode = this.currentState.resolved === 'light' ? 'dark' : 'light';
    await this.setTheme(newMode);
  }

  /**
   * Apply theme to DOM
   */
  private applyThemeToDOM(theme: ResolvedTheme): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }

  /**
   * Detect system theme preference
   * Public method for external use
   */
  public detectSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Update resolved theme based on system preference
   */
  private updateResolvedTheme(): void {
    if (this.currentState.mode === 'system') {
      const resolved = this.detectSystemTheme();
      if (resolved !== this.currentState.resolved) {
        this.currentState.resolved = resolved;
        this.applyThemeToDOM(resolved);
        this.notifyListeners(resolved, this.currentState.mode);
      }
    }
  }

  /**
   * Load theme from localStorage
   */
  private loadFromStorage(): ThemeMode | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as ThemeMode;
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }

    return null;
  }

  /**
   * Debounced sync with user preferences API
   */
  private debouncedSync(mode: ThemeMode): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.syncWithPreferences(mode);
    }, this.config.syncDebounceMs);
  }

  /**
   * Sync theme with user preferences API
   */
  private async syncWithPreferences(mode: ThemeMode): Promise<void> {
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: mode }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync theme: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to sync theme with user preferences:', error);
      // Don't throw - theme change should still work locally
    }
  }

  /**
   * Load theme from user preferences API
   */
  public async loadFromPreferences(): Promise<ThemeMode | null> {
    try {
      const response = await fetch('/api/settings/preferences');
      
      if (!response.ok) {
        throw new Error(`Failed to load preferences: ${response.statusText}`);
      }

      const data = await response.json();
      const theme = data.preferences?.theme;

      if (theme && (theme === 'light' || theme === 'dark' || theme === 'system')) {
        await this.setTheme(theme as ThemeMode);
        return theme as ThemeMode;
      }
    } catch (error) {
      console.warn('Failed to load theme from preferences:', error);
    }

    return null;
  }

  /**
   * Get theme color value
   * @param variable - CSS variable name (without -- prefix)
   * @param format - Desired output format
   * @returns Color value in specified format
   */
  public getColor(variable: ThemeVariable, format: ThemeColorFormat = 'rgb'): string {
    const cssVar = `--${variable}`;

    switch (format) {
      case 'oklch':
        return this.getOklchValue(cssVar);
      case 'hex':
        return getThemeHex(cssVar);
      case 'rgb':
      default:
        return getThemeRgb(cssVar);
    }
  }

  /**
   * Get theme color in all formats
   */
  public getColorValue(variable: ThemeVariable): ThemeColorValue {
    return {
      oklch: this.getOklchValue(`--${variable}`),
      rgb: getThemeRgb(`--${variable}`),
      hex: getThemeHex(`--${variable}`),
    };
  }

  /**
   * Get OKLCH value directly from CSS variable
   */
  private getOklchValue(cssVar: string): string {
    if (typeof window === 'undefined') {
      return '';
    }

    try {
      const computedStyle = getComputedStyle(document.documentElement);
      const value = computedStyle.getPropertyValue(cssVar).trim();
      return value || '';
    } catch (error) {
      console.warn(`Failed to get OKLCH value for ${cssVar}:`, error);
      return '';
    }
  }

  /**
   * Get chart color
   * @param index - Chart color index (1-5)
   * @param opacity - Optional opacity (0-1)
   * @returns RGB or RGBA color string
   */
  public getChartColor(index: 1 | 2 | 3 | 4 | 5, opacity?: number): string {
    return getChartColor(index, opacity);
  }

  /**
   * Set CSS variable value (for runtime theme customization)
   * @param variable - CSS variable name (without -- prefix)
   * @param value - OKLCH value
   */
  public setVariable(variable: ThemeVariable, value: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    const cssVar = `--${variable}`;
    document.documentElement.style.setProperty(cssVar, value);

    // Notify listeners of variable change
    this.notifyListeners(this.currentState.resolved, this.currentState.mode);
  }

  /**
   * Get all theme variables
   */
  public getAllVariables(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }

    const variables: Record<string, string> = {};
    const computedStyle = getComputedStyle(document.documentElement);

    // Get all CSS variables from globals.css
    const themeVars: ThemeVariable[] = [
      'background', 'foreground', 'card', 'card-foreground',
      'popover', 'popover-foreground', 'primary', 'primary-foreground',
      'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
      'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
      'border', 'input', 'ring', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
      'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
      'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
      'brand-primary', 'brand-primary-light', 'brand-primary-dark', 'brand-secondary', 'brand-accent',
    ];

    themeVars.forEach((varName) => {
      const cssVar = `--${varName}`;
      const value = computedStyle.getPropertyValue(cssVar).trim();
      if (value) {
        variables[varName] = value;
      }
    });

    return variables;
  }

  /**
   * Add theme change listener
   */
  public addListener(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove theme change listener
   */
  public removeListener(listener: ThemeChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(resolved: ResolvedTheme, mode: ThemeMode): void {
    this.listeners.forEach((listener) => {
      try {
        listener(resolved, mode);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Check if current theme is dark
   */
  public isDark(): boolean {
    return this.currentState.resolved === 'dark';
  }

  /**
   * Check if current theme is light
   */
  public isLight(): boolean {
    return this.currentState.resolved === 'light';
  }

  /**
   * Check if using system theme
   */
  public isSystem(): boolean {
    return this.currentState.isSystem;
  }

  /**
   * Reset to default theme
   */
  public async reset(): Promise<void> {
    await this.setTheme('light');
  }

  /**
   * Destroy instance (for testing)
   */
  public destroy(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.listeners.clear();
    ThemeManager.instance = null as any;
  }
}

// Export singleton instance getter
export const themeManager = ThemeManager.getInstance();

// Export class for custom instances if needed
export { ThemeManager };

