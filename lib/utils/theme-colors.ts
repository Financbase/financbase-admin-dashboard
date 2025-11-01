/**
 * Theme color utilities for converting CSS theme variables to RGB/hex format
 * for use with chart libraries that require explicit color values.
 */

/**
 * Converts OKLCH color values to RGB format.
 * OKLCH values are stored as space-separated: "L C H"
 * 
 * @param oklchValue - OKLCH color string in format "L C H"
 * @returns RGB color string in format "rgb(r, g, b)"
 */
function oklchToRgb(oklchValue: string): string {
  const parts = oklchValue.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error(`Invalid OKLCH format: ${oklchValue}`);
  }

  const [L, C, H] = parts.map(Number);

  // Convert OKLCH to linear RGB
  // OKLCH -> OKLab -> Linear RGB -> sRGB
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);

  // OKLab to linear RGB matrix
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;

  // Linear RGB values
  const rLinear = +1.227013851103521 * l - 0.557799980651822 * m + 0.281256148966468 * s;
  const gLinear = -0.040580178423281 * l + 1.112256869616830 * m - 0.071676678665601 * s;
  const bLinear = -0.076381284505707 * l - 0.421481978418013 * m + 1.586163220440795 * s;

  // Apply gamma correction (sRGB)
  const gamma = (c: number) => {
    const abs = Math.abs(c);
    if (abs > 0.0031308) {
      return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }
    return 12.92 * c;
  };

  const r = Math.round(gamma(rLinear) * 255);
  const g = Math.round(gamma(gLinear) * 255);
  const b = Math.round(gamma(bLinear) * 255);

  // Clamp values to valid RGB range
  const clamp = (n: number) => Math.max(0, Math.min(255, n));

  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

/**
 * Gets a CSS variable value using getComputedStyle for accurate color conversion.
 * Falls back to direct CSS variable access for SSR or when DOM is unavailable.
 * 
 * @param cssVar - CSS variable name (e.g., "--chart-1")
 * @returns RGB color string or CSS variable value
 */
function getCssVariableRgb(cssVar: string): string {
  if (typeof window === 'undefined') {
    // SSR fallback - return CSS variable reference that will be resolved client-side
    // This won't work for chart libraries, so we'll need to use OKLCH conversion
    return cssVar;
  }

  try {
    const computedStyle = getComputedStyle(document.documentElement);
    const value = computedStyle.getPropertyValue(cssVar).trim();
    
    if (!value) {
      throw new Error(`CSS variable ${cssVar} not found`);
    }

    // Check if it's already in RGB format
    if (value.startsWith('rgb')) {
      return value;
    }

    // Check if it's OKLCH format (space-separated numbers)
    if (/^\d+\.?\d*\s+\d+\.?\d*\s+\d+\.?\d*$/.test(value)) {
      return oklchToRgb(value);
    }

    // If it's already hex or other format, try to use computed style on a temp element
    const tempEl = document.createElement('div');
    tempEl.style.color = `oklch(${value})`;
    tempEl.style.position = 'fixed';
    tempEl.style.visibility = 'hidden';
    document.body.appendChild(tempEl);
    
    const rgb = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    return rgb;
  } catch (error) {
    console.warn(`Failed to get CSS variable ${cssVar}:`, error);
    // Fallback to OKLCH conversion if value is available
    return cssVar;
  }
}

/**
 * Gets a theme chart color converted to RGB format.
 * Reads actual values from globals.css CSS variables, respecting light/dark mode.
 * 
 * @param index - Chart color index (1-5)
 * @param opacity - Optional opacity (0-1)
 * @returns RGB or RGBA color string
 */
export function getChartColor(index: 1 | 2 | 3 | 4 | 5, opacity?: number): string {
  const cssVar = `--chart-${index}`;
  
  if (typeof window === 'undefined') {
    // SSR: Use OKLCH values from globals.css light theme as fallback
    // These are the actual values defined in :root
    const lightThemeOklch: Record<number, string> = {
      1: '0.3880 0.1423 271.1300', // From :root --chart-1
      2: '0.6270 0.1940 149.2140', // From :root --chart-2
      3: '0.8790 0.1690 91.6050', // From :root --chart-3
      4: '0.5510 0.0270 264.3640', // From :root --chart-4
      5: '0.5770 0.2450 27.3250', // From :root --chart-5
    };
    
    const oklch = lightThemeOklch[index];
    if (!oklch) {
      throw new Error(`Invalid chart color index: ${index}`);
    }
    
    // Convert OKLCH from globals.css to RGB
    const rgb = oklchToRgb(oklch);
    
    if (opacity !== undefined) {
      return rgb.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    
    return rgb;
  }

  // Client-side: Use getComputedStyle to read actual CSS variable value
  // This automatically respects dark mode (.dark class) from globals.css
  try {
    // Create a temporary element to compute the color value
    // CSS uses: oklch(var(--chart-1)) so we need to construct that
    const tempEl = document.createElement('div');
    tempEl.style.color = `oklch(var(${cssVar}))`;
    tempEl.style.position = 'fixed';
    tempEl.style.visibility = 'hidden';
    tempEl.style.pointerEvents = 'none';
    document.body.appendChild(tempEl);
    
    // Get the computed RGB color (browser converts OKLCH to RGB)
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    // Validate we got a valid RGB color
    if (!computedColor || computedColor === 'transparent' || computedColor === 'rgba(0, 0, 0, 0)') {
      throw new Error(`Invalid computed color for ${cssVar}`);
    }
    
    if (opacity !== undefined) {
      // Convert rgb() to rgba() with specified opacity
      if (computedColor.startsWith('rgba(')) {
        // Already rgba, replace the opacity
        return computedColor.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
      } else if (computedColor.startsWith('rgb(')) {
        return computedColor.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
      }
      return computedColor;
    }
    
    return computedColor;
  } catch (error) {
    console.warn(`Failed to get chart color ${cssVar} from globals.css:`, error);
    
    // Fallback: Read CSS variable value directly and convert OKLCH
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();
      
      if (value) {
        const rgb = oklchToRgb(value);
        if (opacity !== undefined) {
          return rgb.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
        }
        return rgb;
      }
    } catch (fallbackError) {
      console.warn(`Fallback OKLCH conversion also failed:`, fallbackError);
    }
    
    // Ultimate fallback to hardcoded values matching globals.css light theme
    const fallback = CHART_COLORS_FALLBACK[index] || CHART_COLORS_FALLBACK[1];
    if (opacity !== undefined) {
      return fallback.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    return fallback;
  }
}

/**
 * Gets any theme color converted to RGB format.
 * 
 * @param cssVar - CSS variable name (e.g., "--primary", "--destructive")
 * @param opacity - Optional opacity (0-1)
 * @returns RGB or RGBA color string
 */
export function getThemeRgb(cssVar: string, opacity?: number): string {
  if (typeof window === 'undefined') {
    // SSR fallback - return placeholder that indicates it needs client-side resolution
    return cssVar;
  }

  try {
    const tempEl = document.createElement('div');
    tempEl.style.color = `oklch(var(${cssVar}))`;
    tempEl.style.position = 'fixed';
    tempEl.style.visibility = 'hidden';
    document.body.appendChild(tempEl);
    
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    if (opacity !== undefined) {
      return computedColor.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    
    return computedColor;
  } catch (error) {
    console.warn(`Failed to get theme color ${cssVar}:`, error);
    return cssVar;
  }
}

/**
 * Gets theme color for destructive/success states.
 * 
 * @param type - Color type: 'destructive' or 'success'
 * @param opacity - Optional opacity (0-1)
 * @returns RGB or RGBA color string
 */
export function getSemanticColor(type: 'destructive' | 'success', opacity?: number): string {
  const cssVar = type === 'destructive' ? '--destructive' : '--chart-2'; // Using chart-2 as success (green)
  return getThemeRgb(cssVar, opacity);
}

/**
 * Fallback chart colors for SSR.
 * These are converted from the OKLCH values in globals.css :root --chart-* variables.
 * Light theme values from app/globals.css:
 * --chart-1: 0.3880 0.1423 271.1300
 * --chart-2: 0.6270 0.1940 149.2140
 * --chart-3: 0.8790 0.1690 91.6050
 * --chart-4: 0.5510 0.0270 264.3640
 * --chart-5: 0.5770 0.2450 27.3250
 */
export const CHART_COLORS_FALLBACK: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: oklchToRgb('0.3880 0.1423 271.1300'), // From :root --chart-1
  2: oklchToRgb('0.6270 0.1940 149.2140'), // From :root --chart-2
  3: oklchToRgb('0.8790 0.1690 91.6050'), // From :root --chart-3
  4: oklchToRgb('0.5510 0.0270 264.3640'), // From :root --chart-4
  5: oklchToRgb('0.5770 0.2450 27.3250'), // From :root --chart-5
};

/**
 * Gets chart color with opacity, optimized for client-side usage.
 * 
 * @param index - Chart color index (1-5)
 * @param opacity - Opacity (0-1)
 * @returns RGBA color string
 */
export function getChartColorWithOpacity(index: 1 | 2 | 3 | 4 | 5, opacity: number): string {
  return getChartColor(index, opacity);
}

/**
 * Converts RGB color string to hex format.
 * 
 * @param rgb - RGB color string (e.g., "rgb(123, 45, 67)" or "rgba(123, 45, 67, 0.5)")
 * @returns Hex color string (e.g., "#7b2d43")
 */
export function rgbToHex(rgb: string): string {
  // Extract RGB values
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return '#000000'; // Fallback
  }
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  // Convert to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Gets theme color in hex format (for use with Clerk and other libraries requiring hex).
 * 
 * @param cssVar - CSS variable name (e.g., "--primary", "--background")
 * @returns Hex color string
 */
export function getThemeHex(cssVar: string): string {
  const rgb = getThemeRgb(cssVar);
  return rgbToHex(rgb);
}

