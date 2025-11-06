# Layout Patterns Guide

## Overview

This guide documents common layout patterns and best practices for structuring page layouts.

## Box Model Structure

### Thinking in Boxes: The Foundation

Every element on a webpage is a rectangular box. Understanding this hierarchy is crucial for building responsive layouts. These boxes are organized in a parent-child relationship where parent boxes control the behavior of their children.

### Parent-Child Relationships

Follow this hierarchy for consistent layouts. Each level represents a parent-child relationship where the parent controls how its children are arranged:

```text
Page (Root Container)           ← Parent
  └── LayoutContainer           ← Child (becomes parent)
      └── SectionContainer       ← Child (becomes parent)
          └── ContentWrapper     ← Child (becomes parent)
              └── Component Elements ← Children
```

**Visual Hierarchy Explanation:**

- **Page (Root)**: The outermost container, typically the `<body>` or root `<div>`
- **LayoutContainer**: Controls maximum width and horizontal padding (parent to sections)
- **SectionContainer**: Controls vertical spacing between sections (parent to content areas)
- **ContentWrapper**: Contains the actual content (parent to components)
- **Component Elements**: Individual UI elements (cards, buttons, text, etc.)

When you apply Flexbox or Grid to a parent, you're controlling how all its immediate children are arranged. This is the core concept of responsive layout.

### Example Structure

```tsx
import {
  LayoutContainer,
  SectionContainer,
  ContentWrapper,
} from '@/lib/styles/layout';

function MyPage() {
  return (
    <LayoutContainer size="7xl" padding="md">
      <SectionContainer>
        <ContentWrapper>
          <h1>Page Title</h1>
          <p>Page content</p>
        </ContentWrapper>
      </SectionContainer>
    </LayoutContainer>
  );
}
```

## Flexbox Patterns

### Row Layouts

```tsx
// Horizontal layout with space between
<div className="flex flex-row items-center justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>

// Horizontal layout with gap (modern approach)
<div className="flex flex-row items-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Column Layouts

```tsx
// Vertical layout centered
<div className="flex flex-col items-center justify-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Vertical layout with full width
<div className="flex flex-col w-full gap-2">
  <div>Full width item</div>
  <div>Full width item</div>
</div>
```

### Using flex-wrap for Responsive Card Layouts

The `flex-wrap` property is essential for responsive layouts. Without it, flex items will try to squeeze onto one line, causing overflow on smaller screens.

```tsx
// Responsive card layout with wrapping
<div className="flex flex-wrap gap-4">
  <Card className="flex-1 min-w-[200px]">Card 1</Card>
  <Card className="flex-1 min-w-[200px]">Card 2</Card>
  <Card className="flex-1 min-w-[200px]">Card 3</Card>
</div>
```

```css
/* CSS equivalent */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 auto;
  min-width: 200px; /* Minimum width before wrapping */
}
```

**Why flex-wrap is crucial:**

- Without `flex-wrap`: Items squeeze horizontally, causing overflow on mobile
- With `flex-wrap`: Items wrap to the next line when space runs out
- Always use `flex-wrap` when you want items to wrap on smaller screens

### Using the gap Property (Modern Spacing)

The `gap` property is the modern way to create spacing between flex items. It replaces manual margins and provides cleaner, more maintainable code.

```tsx
// ✅ Modern approach: use gap
<div className="flex flex-wrap gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// ❌ Old approach: manual margins (not recommended)
<div className="flex flex-wrap">
  <div className="mr-4 mb-4">Item 1</div>
  <div className="mr-4 mb-4">Item 2</div>
  <div className="mr-4 mb-4">Item 3</div>
</div>
```

**Benefits of gap:**

- No need for negative margins or first/last child selectors
- Consistent spacing between all items
- Works in both Flexbox and Grid
- Responsive spacing with breakpoints: `gap-2 md:gap-4 lg:gap-6`

### Using flex: 1 1 auto Pattern

The `flex: 1 1 auto` pattern (or `flex-1` in Tailwind) creates flexible items that grow to fill available space and shrink when needed.

```tsx
// Equal-width flexible items
<div className="flex">
  <div className="flex-1">Item 1 - grows to fill space</div>
  <div className="flex-1">Item 2 - grows to fill space</div>
  <div className="flex-1">Item 3 - grows to fill space</div>
</div>

// Fixed sidebar with flexible content
<div className="flex">
  <aside className="w-64 flex-shrink-0">Fixed 256px sidebar</aside>
  <main className="flex-1">Main content (grows to fill remaining space)</main>
</div>

// Mixed: some fixed, some flexible
<div className="flex">
  <div className="flex-none w-32">Fixed 128px</div>
  <div className="flex-1">Flexible content</div>
  <div className="flex-none w-24">Fixed 96px</div>
</div>
```

```css
/* CSS equivalent of flex-1 */
.flex-item {
  flex: 1 1 auto;
  /* Same as: */
  /* flex-grow: 1;    - Can grow to fill space */
  /* flex-shrink: 1;  - Can shrink if needed */
  /* flex-basis: auto; - Start at natural size */
}
```

**Common flex patterns:**

| Pattern | Tailwind | CSS | Use Case |
|---------|----------|-----|----------|
| Equal width items | `flex-1` | `flex: 1 1 auto` | Cards in a row, equal columns |
| Fixed size | `flex-none` | `flex: 0 0 auto` | Buttons, icons, fixed sidebars |
| Don't shrink | `flex-shrink-0` | `flex-shrink: 0` | Maintain minimum size |
| Don't grow | `flex-grow-0` | `flex-grow: 0` | Stay at natural size |

### Flexible Items

```tsx
// Item that grows to fill space
<div className="flex">
  <div className="flex-none w-64">Fixed sidebar</div>
  <div className="flex-1">Main content (grows)</div>
</div>
```

### Responsive Flex Direction

```tsx
// Column on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Responsive flex with wrapping
<div className="flex flex-col md:flex-row flex-wrap gap-4">
  <div className="flex-1 min-w-[200px]">Item 1</div>
  <div className="flex-1 min-w-[200px]">Item 2</div>
  <div className="flex-1 min-w-[200px]">Item 3</div>
</div>
```

## Grid Patterns

### Responsive Grid with Breakpoints

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

### Auto-Fit Grid with minmax() Pattern

The `repeat(auto-fit, minmax())` pattern is incredibly powerful for responsive grids. It automatically creates as many columns as can fit, with a minimum width constraint.

```css
/* Auto-fit grid pattern */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Adjust minmax based on content */
.card-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.content-grid {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.feature-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

**How auto-fit works:**

- `repeat()`: Creates multiple columns using a pattern
- `auto-fit`: Creates as many columns as can fit in the available space
- `minmax(250px, 1fr)`: Each column is at least 250px wide, can grow to fill space
- If screen is too small for one 250px column, items stack vertically

**Using auto-fit in React/TypeScript:**

```tsx
// You'll need a style tag or CSS module for auto-fit
<div 
  className="grid gap-6"
  style={{
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  }}
>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

**When to use auto-fit vs breakpoints:**

| Approach | Use When |
|----------|----------|
| `auto-fit` | Variable number of items, content-driven sizing |
| Breakpoints | Fixed number of columns, predictable layout |

### Complex Grid Layout

```tsx
// Custom grid with specific areas
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main content</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
</div>

// Grid with auto-fit for variable content
<div 
  className="grid gap-4"
  style={{
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  }}
>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
  <Card>Card 4</Card>
</div>
```

### Grid with Gap Property

Always use `gap` instead of manual spacing in grids:

```tsx
// ✅ Modern approach: use gap
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// ❌ Old approach: manual margins (not recommended)
<div className="grid grid-cols-1 md:grid-cols-3">
  <Card className="mb-6 md:mb-0 md:mr-6">Card 1</Card>
  <Card className="mb-6 md:mb-0 md:mr-6">Card 2</Card>
  <Card className="mb-6">Card 3</Card>
</div>
```

## Sticky Positioning

### Sticky Header

```tsx
import { StickyHeader } from '@/lib/styles/sticky';

<StickyHeader>
  <nav className="flex items-center justify-between p-4">
    <Logo />
    <Navigation />
  </nav>
</StickyHeader>
```

### Sticky Sidebar

```tsx
import { StickySidebar } from '@/lib/styles/sticky';

<div className="flex">
  <StickySidebar>
    <aside>Sidebar content</aside>
  </StickySidebar>
  <main className="flex-1">Main content</main>
</div>
```

### Sticky Navigation

```tsx
import { StickyNav } from '@/lib/styles/sticky';

<StickyNav>
  <div className="flex items-center gap-4">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </div>
</StickyNav>
```

## Common Layout Patterns

### Two-Column Layout

```tsx
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64 flex-shrink-0">
    Sidebar
  </aside>
  <main className="flex-1">
    Main content
  </main>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Hero Section

```tsx
<section className="flex flex-col items-center justify-center min-h-[60vh] text-center">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
    Hero Title
  </h1>
  <p className="mt-4 text-lg md:text-xl max-w-2xl">
    Hero description
  </p>
</section>
```

### Dashboard Layout

```tsx
<div className="flex flex-col h-screen">
  <StickyHeader>
    <TopNavigation />
  </StickyHeader>
  <div className="flex flex-1 overflow-hidden">
    <StickySidebar>
      <Sidebar />
    </StickySidebar>
    <main className="flex-1 overflow-y-auto p-6">
      <DashboardContent />
    </main>
  </div>
</div>
```

## Responsive Patterns

### Mobile-First Approach

Always design for mobile first, then enhance:

```tsx
// Mobile: stacked, Desktop: side-by-side
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Mobile: full width, Desktop: max width
<div className="w-full md:max-w-2xl mx-auto">
  Content
</div>
```

### Hide/Show Patterns

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop content</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile content</div>
```

### Responsive Spacing

```tsx
// Smaller padding on mobile
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Smaller gap on mobile
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Items
</div>
```

## Flexbox vs Grid Decision Guide

Choosing between Flexbox and Grid is crucial for building efficient, maintainable layouts.

### Quick Decision Tree

1. **Do you need to control both rows AND columns?**
   - **Yes** → Use **Grid**
   - **No** → Continue to next question

2. **Do you want items to wrap naturally based on content?**
   - **Yes** → Use **Flexbox** with `flex-wrap`
   - **No** → Continue to next question

3. **Do you need a rigid, predictable structure?**
   - **Yes** → Use **Grid**
   - **No** → Use **Flexbox**

### Detailed Comparison

| Scenario | Use Flexbox | Use Grid |
|----------|-------------|----------|
| Navigation bar | ✅ Single row, flexible items | ❌ Overkill |
| Card layout (wrapping) | ✅ With flex-wrap and gap | ⚠️ Can work, but Flexbox is simpler |
| Dashboard layout | ❌ Too complex | ✅ Perfect for structured layout |
| Photo gallery | ❌ Alignment issues | ✅ Precise control over rows/columns |
| Form fields | ✅ Natural flow | ❌ Unnecessary |
| Sidebar + main content | ✅ Simple flex-1 | ⚠️ Can work with Grid |
| Equal-height columns | ⚠️ Requires workarounds | ✅ Native support |
| Responsive card grid | ✅ With flex-wrap | ✅ With auto-fit or breakpoints |

### Simple Rule of Thumb

> **"By default use Flexbox for everything until you specifically want a structured grid."**

### When to Use Each

**Use Flexbox when:**

- Arranging items in a single dimension (row OR column)
- Content should determine the layout (flexible, content-first)
- You want items to wrap naturally
- Building navigation bars, button groups, or simple card rows
- You need `flex: 1 1 auto` behavior

**Use Grid when:**

- You need precise control over both rows AND columns simultaneously
- You want a rigid, structured layout (structure-first)
- Building complex layouts like dashboards, photo galleries, or page layouts
- You need items to align in both directions precisely
- You want equal-height columns without workarounds

## Best Practices

1. **Consistent Spacing**: Use standardized spacing (4, 6, 8, 12, 16, 24) with `gap` property
2. **Container Widths**: Use LayoutContainer for consistent max-widths
3. **Flex vs Grid**: Use Flexbox for 1D layouts, Grid for 2D layouts (see decision guide above)
4. **Use flex-wrap**: Always add `flex-wrap` when items should wrap on smaller screens
5. **Use gap**: Prefer `gap` property over manual margins for spacing
6. **Use flex: 1 1 auto**: For flexible items that should grow and shrink
7. **Sticky Elements**: Use sticky positioning for headers, sidebars, navigation
8. **Responsive Testing**: Test on multiple screen sizes
9. **Performance**: Avoid layout shifts with proper sizing
10. **Plan First**: Sketch layouts for different screen sizes before coding

## Accessibility Considerations

1. **Semantic HTML**: Use proper HTML elements (header, nav, main, aside, footer)
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Focus States**: Provide visible focus indicators
4. **Screen Readers**: Use proper ARIA labels and landmarks
5. **Touch Targets**: Minimum 44x44px for interactive elements

## Examples

### Complete Page Layout

```tsx
import {
  LayoutContainer,
  SectionContainer,
  ContentWrapper,
  StickyHeader,
} from '@/lib/styles/layout';

export default function Page() {
  return (
    <>
      <StickyHeader>
        <Navigation />
      </StickyHeader>
      
      <LayoutContainer size="7xl" padding="md">
        <SectionContainer>
          <ContentWrapper>
            <h1>Page Title</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>Card 1</Card>
              <Card>Card 2</Card>
              <Card>Card 3</Card>
            </div>
          </ContentWrapper>
        </SectionContainer>
      </LayoutContainer>
    </>
  );
}
```
