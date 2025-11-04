# Responsive Design Guide

## Overview

This guide documents the responsive design system and breakpoints used throughout the application.

## Breakpoint System

### Standard Breakpoints

The application uses a mobile-first approach with the following breakpoints:

| Breakpoint | Size | Description |
|-----------|------|-------------|
| `xs` | 0px | Extra small devices (phones in portrait) |
| `sm` | 640px | Small devices (phones in landscape) |
| `md` | 768px | Medium devices (tablets) |
| `lg` | 1024px | Large devices (desktops) |
| `xl` | 1280px | Extra large devices (large desktops) |
| `2xl` | 1536px | 2X Extra large devices (very large desktops) |

### Usage in Tailwind CSS

```tsx
// Mobile-first responsive classes
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  Mobile only content
</div>
```

### Usage in JavaScript/TypeScript

```typescript
import { getCurrentBreakpoint, isMobile, isDesktop } from '@/lib/styles/breakpoints';

// Get current breakpoint
const breakpoint = getCurrentBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Check device type
if (isMobile()) {
  // Mobile-specific code
}

if (isDesktop()) {
  // Desktop-specific code
}
```

## Layout Patterns

### Box Model Structure

Follow this hierarchy for consistent layouts:

```
Page (Root)
  └── LayoutContainer
      └── SectionContainer
          └── ContentWrapper
              └── Component Elements
```

### Layout Components

```tsx
import { LayoutContainer, SectionContainer, ContentWrapper } from '@/lib/styles/layout';

<LayoutContainer size="7xl" padding="md">
  <SectionContainer>
    <ContentWrapper>
      <YourComponent />
    </ContentWrapper>
  </SectionContainer>
</LayoutContainer>
```

### Container Sizes

- `xs` - max-w-xs (20rem)
- `sm` - max-w-sm (24rem)
- `md` - max-w-md (28rem)
- `lg` - max-w-lg (32rem)
- `xl` - max-w-xl (36rem)
- `2xl` - max-w-2xl (42rem)
- `3xl` - max-w-3xl (48rem)
- `4xl` - max-w-4xl (56rem)
- `5xl` - max-w-5xl (64rem)
- `6xl` - max-w-6xl (72rem)
- `7xl` - max-w-7xl (80rem)
- `full` - max-w-full (100%)

## Flexbox Patterns

### Common Flex Patterns

```tsx
// Row layout with space between
<div className="flex flex-row items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Column layout with center alignment
<div className="flex flex-col items-center justify-center">
  <div>Content</div>
</div>

// Flexible item that grows
<div className="flex-1">
  Takes remaining space
</div>
```

### Flex Utilities

```tsx
import { flexUtilities } from '@/lib/styles/layout';

// Use predefined utilities
<div className={flexUtilities.row + ' ' + flexUtilities.between}>
  Content
</div>
```

## Grid Patterns

### Responsive Grid

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Grid with MinMax

```css
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

## Sticky Positioning

### Sticky Header

```tsx
import { StickyHeader } from '@/lib/styles/sticky';

<StickyHeader>
  <nav>Navigation content</nav>
</StickyHeader>
```

### Sticky Sidebar

```tsx
import { StickySidebar } from '@/lib/styles/sticky';

<StickySidebar>
  <aside>Sidebar content</aside>
</StickySidebar>
```

## Responsive Images

### Using ResponsiveImage Component

```tsx
import { ResponsiveImage } from '@/components/ui/responsive-image';

<ResponsiveImage
  src="/image.jpg"
  mobileSrc="/image-mobile.jpg"
  webpSrc="/image.webp"
  webpMobileSrc="/image-mobile.webp"
  alt="Description"
  width={800}
  height={600}
/>
```

## Media Queries

### CSS Media Queries

```css
/* Mobile-first */
.component {
  /* Mobile styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet and up */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop and up */
  }
}
```

### JavaScript Media Queries

```typescript
import { matchesBreakpoint, mediaQueries } from '@/lib/styles/breakpoints';

if (matchesBreakpoint('md')) {
  // Tablet or larger
}

// Use in useEffect
useEffect(() => {
  const mediaQuery = window.matchMedia(mediaQueries.md);
  const handleChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      // Breakpoint matched
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Progressive Enhancement**: Add features for larger screens, don't remove for smaller
3. **Touch Targets**: Ensure interactive elements are at least 44x44px on mobile
4. **Readable Text**: Maintain readable line lengths (50-75 characters)
5. **Performance**: Use responsive images and lazy loading
6. **Testing**: Test on actual devices, not just browser dev tools

## Common Patterns

### Responsive Navigation

```tsx
// Desktop: horizontal nav
// Mobile: hamburger menu
<nav className="hidden md:flex">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<button className="md:hidden">
  <MenuIcon />
</button>
```

### Responsive Cards

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

### Responsive Typography

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

