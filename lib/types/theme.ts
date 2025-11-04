/**
 * Theme Management Type Definitions
 * Centralized types for theme system integration with globals.css
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme (after system detection)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Theme CSS variable names from globals.css
 */
export type ThemeVariable =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'sidebar'
  | 'sidebar-foreground'
  | 'sidebar-primary'
  | 'sidebar-primary-foreground'
  | 'sidebar-accent'
  | 'sidebar-accent-foreground'
  | 'sidebar-border'
  | 'sidebar-ring'
  | 'brand-primary'
  | 'brand-primary-light'
  | 'brand-primary-dark'
  | 'brand-secondary'
  | 'brand-accent';

/**
 * Theme color format options
 */
export type ThemeColorFormat = 'oklch' | 'rgb' | 'hex';

/**
 * Theme color value in different formats
 */
export interface ThemeColorValue {
  oklch: string;
  rgb: string;
  hex: string;
}

/**
 * Theme change event listener
 */
export type ThemeChangeListener = (theme: ResolvedTheme, mode: ThemeMode) => void;

/**
 * ThemeManager configuration
 */
export interface ThemeManagerConfig {
  /**
   * Storage key for local theme persistence
   * @default 'financbase-theme'
   */
  storageKey?: string;
  
  /**
   * Whether to sync with user preferences API
   * @default true
   */
  syncWithPreferences?: boolean;
  
  /**
   * Debounce delay for API sync (ms)
   * @default 1000
   */
  syncDebounceMs?: number;
  
  /**
   * Whether to enable system theme detection
   * @default false
   */
  enableSystem?: boolean;
}

/**
 * Theme state
 */
export interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  isSystem: boolean;
}

/**
 * CSS variable map from globals.css
 */
export interface ThemeVariables {
  [key: string]: string;
}

