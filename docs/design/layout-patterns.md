# Layout Patterns Guide

## Overview

This guide documents common layout patterns and best practices for structuring page layouts.

## Box Model Structure

### Parent-Child Relationships

Follow this hierarchy for consistent layouts:

```
Page (Root Container)
  └── LayoutContainer (Max width, padding)
      └── SectionContainer (Section spacing)
          └── ContentWrapper (Content area)
              └── Component Elements
```

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

// Horizontal layout with gap
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
```

## Grid Patterns

### Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

### Auto-Fit Grid

```css
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### Complex Grid Layout

```tsx
// Custom grid with specific areas
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main content</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
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

## Best Practices

1. **Consistent Spacing**: Use standardized spacing (4, 6, 8, 12, 16, 24)
2. **Container Widths**: Use LayoutContainer for consistent max-widths
3. **Flex vs Grid**: Use Flexbox for 1D layouts, Grid for 2D layouts
4. **Sticky Elements**: Use sticky positioning for headers, sidebars, navigation
5. **Responsive Testing**: Test on multiple screen sizes
6. **Performance**: Avoid layout shifts with proper sizing

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

