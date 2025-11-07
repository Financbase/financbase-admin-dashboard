# Color System Guide

## Overview

The application uses a dual color system: **OKLCH** (for superior color gamut) and **HSL** (for easier manipulation). Both systems are available and work together.

## Color Formats

### OKLCH (Primary System)

OKLCH provides a wider color gamut and perceptually uniform colors. This is the primary system used in the application.

```css
/* OKLCH format: L C H (Lightness Chroma Hue) */
color: oklch(var(--primary));
```

### HSL (Manipulation System)

HSL provides intuitive color manipulation by adjusting lightness values. Use this when you need to create shades or variations.

```css
/* HSL format: H S% L% (Hue Saturation Lightness) */
color: hsl(var(--color-primary-hsl));
```

## Color Palette

### Primary Colors

- **Base**: `hsl(231.6 54% 36%)` / `rgb(43, 57, 143)` / `oklch(0.388 0.1423 231.6)` - Main brand color (Financbase Blue)
- **Light**: `hsl(231.6 54% 46%)` - Lighter variant
- **Dark**: `hsl(231.6 54% 26%)` - Darker variant
- **Lighter**: `hsl(231.6 54% 56%)` - Very light variant
- **Darker**: `hsl(231.6 54% 20%)` - Very dark variant

### Secondary Colors

- **Base**: `hsl(149 50% 55%)` - Complementary green
- **Light**: `hsl(149 50% 65%)`
- **Dark**: `hsl(149 50% 45%)`

### Accent Colors

- **Base**: `hsl(231.6 60% 50%)` - Highlight color (Financbase Blue)
- **Light**: `hsl(231.6 60% 60%)`
- **Dark**: `hsl(231.6 60% 40%)`

### Neutral Colors

Available in shades from 50 (lightest) to 900 (darkest):

- `neutral-50`: `hsl(0 0% 98%)`
- `neutral-100`: `hsl(0 0% 95%)`
- `neutral-200`: `hsl(0 0% 90%)`
- `neutral-300`: `hsl(0 0% 80%)`
- `neutral-400`: `hsl(0 0% 65%)`
- `neutral-500`: `hsl(0 0% 50%)`
- `neutral-600`: `hsl(0 0% 40%)`
- `neutral-700`: `hsl(0 0% 30%)`
- `neutral-800`: `hsl(0 0% 20%)`
- `neutral-900`: `hsl(0 0% 10%)`

### Semantic Colors

- **Success**: `hsl(142 70% 45%)` - Green
- **Warning**: `hsl(38 92% 50%)` - Yellow/Orange
- **Error**: `hsl(0 84% 60%)` - Red
- **Info**: `hsl(217 91% 60%)` - Blue

## Usage in Tailwind

### OKLCH Colors (Primary)

```tsx
// Primary color
<div className="bg-primary text-primary-foreground">
  Primary content
</div>

// Secondary color
<div className="bg-secondary text-secondary-foreground">
  Secondary content
</div>
```

### HSL Colors (Manipulation)

```tsx
// Primary HSL variants
<div className="bg-primary-hsl">Base</div>
<div className="bg-primary-hsl-light">Light</div>
<div className="bg-primary-hsl-dark">Dark</div>

// Neutral colors
<div className="bg-neutral-100">Light gray</div>
<div className="bg-neutral-800">Dark gray</div>

// Semantic colors
<div className="text-success-hsl">Success text</div>
<div className="bg-error-hsl">Error background</div>
```

## Color Utilities (TypeScript)

```typescript
import {
  primaryColors,
  generateShade,
  getHoverColor,
  getActiveColor,
  hslToString,
} from '@/lib/styles/colors';

// Get hover color
const hoverColor = getHoverColor(primaryColors.base, isDark);

// Get active color
const activeColor = getActiveColor(primaryColors.base, isDark);

// Generate shade
const lighter = generateShade(primaryColors.base, 10);

// Convert to CSS string
const cssColor = hslToString(primaryColors.base); // "hsl(271, 60%, 50%)"
```

## Dark Mode

Colors automatically adapt in dark mode:

```css
/* Light mode */
:root {
  --color-primary-hsl: 271 60% 50%;
}

/* Dark mode */
.dark {
  --color-primary-hsl: 271 50% 60%;
}
```

## Color Hierarchy

### Depth and Elevation

Use "raised" colors for elevated elements:

```tsx
// Raised element (feels closer to user)
<div className="bg-raised-1">Level 1</div>
<div className="bg-raised-2">Level 2</div>
<div className="bg-raised-3">Level 3</div>
```

### Shadow System

Shadows combine light and dark shadows for depth:

```css
/* Combined shadow */
box-shadow: 
  0px 1px 9px 1.5px hsl(0 0% 0% / 0.11), /* Dark shadow */
  0px 1px 2px 0.5px hsl(0 0% 0% / 0.11); /* Light shadow */
```

## Best Practices

1. **Use OKLCH for primary colors** - Better color gamut
2. **Use HSL for manipulation** - Easier to create shades
3. **Maintain contrast** - Ensure text is readable on backgrounds
4. **Use semantic colors** - Success, warning, error, info
5. **Test in both modes** - Light and dark themes
6. **Accessibility** - Maintain WCAG AA contrast ratios

## Creating Color Variations

### Adjusting Lightness

```typescript
import { generateShade } from '@/lib/styles/colors';

const base = { h: 271, s: 60, l: 50 };
const lighter = generateShade(base, 10); // +10 lightness
const darker = generateShade(base, -10); // -10 lightness
```

### Hover States

```typescript
import { getHoverColor } from '@/lib/styles/colors';

const hover = getHoverColor(primaryColors.base, isDark);
// Light mode: darker
// Dark mode: lighter
```

### Active States

```typescript
import { getActiveColor } from '@/lib/styles/colors';

const active = getActiveColor(primaryColors.base, isDark);
// More pronounced than hover
```

## CSS Variables

All colors are available as CSS variables:

```css
/* OKLCH */
--primary: 0.3880 0.1423 271.1300;

/* HSL */
--color-primary-hsl: 271 60% 50%;
--color-primary-hsl-light: 271 60% 60%;
--color-primary-hsl-dark: 271 60% 40%;
```

## Examples

### Button with Hover

```tsx
<button className="bg-primary-hsl hover:bg-primary-hsl-light active:bg-primary-hsl-dark">
  Click me
</button>
```

### Card with Elevation

```tsx
<div className="bg-raised-1 shadow-lg">
  Elevated card
</div>
```

### Semantic Badge

```tsx
<div className="bg-success-hsl text-white">
  Success message
</div>
```

