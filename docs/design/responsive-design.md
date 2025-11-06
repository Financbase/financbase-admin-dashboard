# Responsive Design Guide

## Overview

This guide documents the responsive design system and breakpoints used throughout the application. By the end of this guide, you'll be able to build responsive websites that work on a 4K monitor, a tiny smartphone, and everything in between.

## The Foundation: Thinking in Boxes

### Rule #1: Everything is a Box

The first and most fundamental rule of creating any web layout is to **think inside the box**. Every single element you see on a webpage—a paragraph of text, an image, a button—is contained within a rectangular box. Mastering layout begins with seeing the web this way.

### The Parent-Child Relationship

These boxes are organized in a hierarchy. Imagine a "top-down family tree" where a main parent box can contain several child boxes. Those child boxes can, in turn, become parents to their own children. This is the core concept you'll manipulate.

When you use Flexbox or Grid, you are applying rules to the parent box to control how all its children behave. Master this, and you've mastered layout.

### Basic Box Behaviors: The display Property

Every box you create has a default behavior. You'll control this with the CSS `display` property. Here are the four foundational values you need to know:

| Property | Behavior |
|----------|----------|
| `display: block` | Starts on a new line and takes up the full width available. |
| `display: inline` | Sits on the same line and only takes up as much width as its content needs. |
| `display: inline-block` | Sits on the same line like inline, but you can control its width and height like block. |
| `display: none` | Completely removes the box from the layout. |

These basic properties set the stage, but modern responsive design relies on two powerful evolutions of display: **Flexbox** and **Grid**.

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

Flexbox is your go-to tool for arranging items in a single dimension—either a row or a column. When you apply `display: flex` to a parent element (the "flex container"), its immediate children automatically become "flex items." Think of Flexbox as the "cool parent where the children have more freedom as they get to choose their room size and location." It's perfect for creating flexible, content-aware layouts.

### Key Flexbox Properties for Responsive Layouts

To get 90% of the way there with Flexbox, you only need to master three key concepts:

#### 1. flex-wrap: wrap

By default, flex items will try to squeeze onto one line. Without `flex-wrap`, your beautiful row of cards will brutally squash themselves into an unreadable mess on a phone screen. This property is the simple command that tells them it's okay to wrap onto the next line when they run out of space—an absolute necessity for responsive design.

```tsx
// Without flex-wrap: items squeeze on one line (bad for mobile)
<div className="flex">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

// With flex-wrap: items wrap to next line when needed (responsive)
<div className="flex flex-wrap">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

```css
/* CSS equivalent */
.flex-container {
  display: flex;
  flex-wrap: wrap;
}
```

#### 2. The gap Property

The `gap` property is the modern, simple way to create space between flex items. You apply one `gap` property to the parent container, and it creates clean, consistent spacing between all its children.

```tsx
// Modern approach: use gap
<div className="flex flex-wrap gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

```css
/* CSS equivalent */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* Creates spacing between all items */
}
```

**Why use `gap` instead of margins?**
- `gap` only creates space between items, not around the container
- No need to fight with negative margins or first/last child selectors
- Works consistently in both Flexbox and Grid
- Cleaner, more maintainable code

#### 3. The flex Shorthand (grow, shrink, basis)

The `flex` property is a shorthand that controls how flex items grow and shrink. It combines three properties into one:

- **flex-grow**: Does the item grow to fill available empty space? (e.g., `1` for yes, `0` for no)
- **flex-shrink**: Does the item shrink if there isn't enough space? (e.g., `1` for yes, `0` for no)
- **flex-basis**: What is the item's ideal starting size before growing or shrinking? (e.g., `auto`, a percentage like `30%`, or a fixed value like `200px`)

Think of it this way: `flex: 1 1 auto;` is the most common and powerful combination. It tells the items: "Start at your natural size (auto), but if there's extra space, grow to fill it (1), and if space gets tight, it's okay to shrink (1)." This is the secret sauce for truly fluid layouts.

```tsx
// Flexible items that grow and shrink
<div className="flex">
  <div className="flex-1">Item 1 - grows to fill space</div>
  <div className="flex-1">Item 2 - grows to fill space</div>
</div>
```

```css
/* CSS equivalent */
.flex-item {
  flex: 1 1 auto;
  /* Same as: */
  /* flex-grow: 1; */
  /* flex-shrink: 1; */
  /* flex-basis: auto; */
}
```

**Common flex patterns:**

```tsx
// Equal-width items
<div className="flex">
  <div className="flex-1">Equal width</div>
  <div className="flex-1">Equal width</div>
</div>

// Fixed sidebar with flexible content
<div className="flex">
  <aside className="w-64 flex-shrink-0">Fixed 256px</aside>
  <main className="flex-1">Grows to fill remaining space</main>
</div>

// Don't grow, don't shrink
<div className="flex">
  <div className="flex-none">Fixed size</div>
  <div className="flex-1">Flexible</div>
</div>
```

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

// Responsive flex direction with wrapping
<div className="flex flex-col md:flex-row flex-wrap gap-4">
  <div className="flex-1">Item 1</div>
  <div className="flex-1">Item 2</div>
  <div className="flex-1">Item 3</div>
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

Grid is the power tool for creating structured, two-dimensional layouts. It gives you precise control over both rows and columns simultaneously. When you apply `display: grid` to a parent element, it becomes a "grid container." In the Grid house, children "are more disciplined and obey their parents." It is your best friend for layouts where you need a strict, predictable structure.

### Understanding the `fr` Unit

The core power of Grid is defining your entire column structure on the parent container using the `grid-template-columns` property. A key unit here is the `fr` unit, which stands for "fraction." It tells the browser how to distribute the available space.

```css
/* Three equal columns */
grid-template-columns: 1fr 1fr 1fr;

/* Two columns: first takes 2 parts, second takes 1 part */
grid-template-columns: 2fr 1fr;

/* Mixed units: fixed width + flexible */
grid-template-columns: 300px 1fr;
```

### A Powerful Recipe for Responsive Grids

Grid offers an incredibly powerful, one-line recipe for creating a fully responsive grid of items:

```css
grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
```

This single line of CSS achieves a complex responsive behavior that once required multiple, clunky Media Queries, making your code cleaner and more maintainable. Let's break down what each part does:

- **`repeat()`**: Tells the browser to create multiple columns using a repeating pattern.
- **`auto-fit`**: Instructs the browser to create as many columns as can fit into the available space.
- **`minmax(400px, 1fr)`**: This is the magic. Each column must be at least 400px wide. If there's extra space left over, the columns can grow to fill it (`1fr`). If the screen becomes too small for even one 400px column, the items will automatically wrap and stack into a single column.

```tsx
// Using Tailwind (you'll need custom CSS for auto-fit)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

```css
/* CSS with auto-fit pattern */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Adjust minmax based on your content */
.card-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.content-grid {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
```

### Responsive Grid with Breakpoints

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Grid with MinMax (Auto-Fit Pattern)

```css
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### Flexbox vs Grid: Choosing the Right Tool

**Use Flexbox when:**
- You need to arrange items in a **single dimension** (row OR column)
- Content should determine the layout (flexible, content-first)
- You want items to wrap naturally based on content size
- Building navigation bars, button groups, or card rows

**Use Grid when:**
- You need **precise control over both rows AND columns** simultaneously
- You want a rigid, structured layout (structure-first)
- Building complex layouts like dashboards, photo galleries, or page layouts
- You need items to align in both directions precisely

**Simple Rule of Thumb:**
> "By default use Flexbox for everything until you specifically want a structured grid."

**Side-by-Side Comparison:**

| Flexbox | Grid |
|---------|------|
| Aligning items in a single row or column | Creating complex, two-dimensional layouts like a full page structure |
| Distributing space along one axis (e.g., a navigation bar) | When you need items to align in both rows and columns precisely |
| When you want content to determine the layout | When you need a rigid, grid-like structure (e.g., a photo gallery or dashboard) |

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

A media query is a CSS rule that lets you apply different styles based on a specific condition, most commonly the screen's width. This is how you achieve complex responsive behaviors, like completely changing a layout for tablets, increasing font size on desktops, or hiding an element on mobile phones.

### CSS Media Queries

Always use a **mobile-first approach**: start with mobile styles as the default, then enhance for larger screens.

```css
/* Mobile-first */
.component {
  /* Mobile styles (default) */
  padding: 1rem;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .component {
    /* Tablet and up */
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop and up */
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Practical Media Query Examples

```css
/* Hide search bar on mobile */
.search-bar {
  display: none;
}

@media (min-width: 768px) {
  .search-bar {
    display: block;
  }
}
```

```tsx
// Using Tailwind classes
<div className="hidden md:block">
  Desktop only content
</div>

<div className="block md:hidden">
  Mobile only content
</div>
```

### Common Media Query Patterns

```css
/* Change layout direction */
.container {
  flex-direction: column;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* Adjust spacing */
.card {
  padding: 1rem;
  gap: 0.5rem;
}

@media (min-width: 1024px) {
  .card {
    padding: 2rem;
    gap: 1rem;
  }
}

/* Show/hide elements */
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: block;
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

## Planning Before You Code

The final and perhaps most crucial lesson is: **Plan Before You Code**. Before you write a single line of HTML or CSS, take a moment to plan. Create a rough sketch—on paper or in a simple design tool—of how your layout should look on different screen sizes like mobile, tablet, and desktop. Ask yourself:

- How many columns should there be on a large screen?
- How should those columns stack on a small screen?
- Should any elements be hidden or rearranged on mobile?
- Will items wrap naturally, or do they need a rigid grid structure?

This simple step is not a waste of time. It saves you from the "sunk cost fallacy," where you settle for a "good enough" solution because you've already invested too much time coding. A quick plan makes the actual coding process faster, more focused, and far less frustrating.

### Planning Checklist

- [ ] Sketch mobile layout (320px - 767px)
- [ ] Sketch tablet layout (768px - 1023px)
- [ ] Sketch desktop layout (1024px+)
- [ ] Identify which elements should wrap or stack
- [ ] Determine if you need Flexbox or Grid
- [ ] Plan breakpoints where layout changes
- [ ] Consider touch targets for mobile (min 44x44px)

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Progressive Enhancement**: Add features for larger screens, don't remove for smaller
3. **Touch Targets**: Ensure interactive elements are at least 44x44px on mobile
4. **Readable Text**: Maintain readable line lengths (50-75 characters)
5. **Performance**: Use responsive images and lazy loading
6. **Testing**: Test on actual devices, not just browser dev tools
7. **Use flex-wrap**: Always add `flex-wrap: wrap` when items should wrap on smaller screens
8. **Use gap**: Prefer `gap` property over manual margins for spacing between flex/grid items
9. **Plan First**: Sketch your layout for different screen sizes before coding

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

