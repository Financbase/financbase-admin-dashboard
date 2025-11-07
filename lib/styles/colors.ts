/**
 * HSL Color System and Utilities
 * 
 * Provides HSL color definitions alongside OKLCH for easier manipulation.
 * HSL format allows intuitive shade generation by adjusting lightness values.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


/**
 * HSL Color Definition
 */
export interface HSLColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

/**
 * Color Palette Interface
 */
export interface ColorPalette {
  base: HSLColor;
  light: HSLColor;
  dark: HSLColor;
  lighter: HSLColor;
  darker: HSLColor;
}

/**
 * Convert HSL to CSS string
 */
export function hslToString(hsl: HSLColor, alpha?: number): string {
  if (alpha !== undefined) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`;
  }
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Generate shade variations by adjusting lightness
 */
export function generateShade(base: HSLColor, lightnessDelta: number): HSLColor {
  return {
    h: base.h,
    s: base.s,
    l: Math.max(0, Math.min(100, base.l + lightnessDelta)),
  };
}

/**
 * Generate color palette from base color
 */
export function generatePalette(base: HSLColor): ColorPalette {
  return {
    base,
    light: generateShade(base, 10),
    dark: generateShade(base, -10),
    lighter: generateShade(base, 20),
    darker: generateShade(base, -20),
  };
}

/**
 * Primary Color Palette
 * Based on Financbase brand: Blue (hue 231.6)
 * Base: rgb(43, 57, 143) / hsl(231.6 54% 36%) / oklch(0.388 0.1423 231.6)
 */
export const primaryColors: ColorPalette = {
  base: { h: 231.6, s: 54, l: 36 }, // Primary brand color
  light: { h: 231.6, s: 54, l: 46 },
  dark: { h: 231.6, s: 54, l: 26 },
  lighter: { h: 231.6, s: 54, l: 56 },
  darker: { h: 231.6, s: 54, l: 20 },
};

/**
 * Secondary Color Palette
 * Complementary green tones
 */
export const secondaryColors: ColorPalette = {
  base: { h: 149, s: 50, l: 55 },
  light: { h: 149, s: 50, l: 65 },
  dark: { h: 149, s: 50, l: 45 },
  lighter: { h: 149, s: 45, l: 75 },
  darker: { h: 149, s: 55, l: 35 },
};

/**
 * Tertiary Color Palette
 * Accent colors (yellow/orange)
 */
export const tertiaryColors: ColorPalette = {
  base: { h: 45, s: 80, l: 60 },
  light: { h: 45, s: 80, l: 70 },
  dark: { h: 45, s: 80, l: 50 },
  lighter: { h: 45, s: 75, l: 80 },
  darker: { h: 45, s: 85, l: 40 },
};

/**
 * Accent Color Palette
 * Highlight colors - Using Financbase Blue
 */
export const accentColors: ColorPalette = {
  base: { h: 231.6, s: 60, l: 50 },
  light: { h: 231.6, s: 60, l: 60 },
  dark: { h: 231.6, s: 60, l: 40 },
  lighter: { h: 231.6, s: 55, l: 70 },
  darker: { h: 231.6, s: 65, l: 30 },
};

/**
 * Neutral Color Palette
 * Grays for backgrounds, text, borders
 */
export const neutralColors = {
  white: { h: 0, s: 0, l: 100 },
  black: { h: 0, s: 0, l: 0 },
  gray50: { h: 0, s: 0, l: 98 },
  gray100: { h: 0, s: 0, l: 95 },
  gray200: { h: 0, s: 0, l: 90 },
  gray300: { h: 0, s: 0, l: 80 },
  gray400: { h: 0, s: 0, l: 65 },
  gray500: { h: 0, s: 0, l: 50 },
  gray600: { h: 0, s: 0, l: 40 },
  gray700: { h: 0, s: 0, l: 30 },
  gray800: { h: 0, s: 0, l: 20 },
  gray900: { h: 0, s: 0, l: 10 },
} as const;

/**
 * Semantic Color Mappings
 */
export const semanticColors = {
  success: { h: 142, s: 70, l: 45 },
  warning: { h: 38, s: 92, l: 50 },
  error: { h: 0, s: 84, l: 60 },
  info: { h: 217, s: 91, l: 60 },
} as const;

/**
 * Get hover state color (lighter for dark backgrounds, darker for light)
 */
export function getHoverColor(base: HSLColor, isDark: boolean = false): HSLColor {
  return isDark
    ? generateShade(base, 10) // Lighter on dark backgrounds
    : generateShade(base, -5); // Darker on light backgrounds
}

/**
 * Get active state color (darker than hover)
 */
export function getActiveColor(base: HSLColor, isDark: boolean = false): HSLColor {
  return isDark
    ? generateShade(base, 5) // Slightly lighter on dark backgrounds
    : generateShade(base, -10); // Darker on light backgrounds
}

/**
 * Get disabled state color (desaturated)
 */
export function getDisabledColor(base: HSLColor): HSLColor {
  return {
    h: base.h,
    s: Math.max(0, base.s - 50), // Reduce saturation
    l: base.l > 50 ? base.l - 20 : base.l + 20, // Move toward middle
  };
}

/**
 * Create raised element color (lighter for elevation effect)
 */
export function getRaisedColor(base: HSLColor, elevation: 1 | 2 | 3 = 1): HSLColor {
  const lightnessDelta = elevation * 5;
  return generateShade(base, lightnessDelta);
}

/**
 * Generate color for dark mode
 * Adjusts saturation and lightness for better contrast
 */
export function getDarkModeColor(base: HSLColor): HSLColor {
  return {
    h: base.h,
    s: Math.max(0, base.s - 10), // Slightly reduce saturation
    l: base.l > 50 ? 100 - base.l : 50 + (50 - base.l), // Invert lightness
  };
}

/**
 * All color definitions as CSS variables ready
 */
export const colorDefinitions = {
  primary: primaryColors,
  secondary: secondaryColors,
  tertiary: tertiaryColors,
  accent: accentColors,
  neutral: neutralColors,
  semantic: semanticColors,
} as const;

