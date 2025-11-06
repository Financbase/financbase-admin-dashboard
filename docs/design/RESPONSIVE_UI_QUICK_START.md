# Responsive UI Quick Start Guide

## 🚀 Quick Access

**Test Page**: `/test/responsive-ui` - See all new components in action!

## Immediate Next Steps

### 1. Run Image Optimization (Optional but Recommended)

```bash
# Install sharp (recommended) or ImageMagick
npm install sharp --save-dev

# Or use ImageMagick (macOS)
brew install imagemagick

# Run optimization
npm run optimize:images:public

# This will:
# - Convert PNG/JPG to WebP
# - Create mobile-optimized versions
# - Output to ./public/optimized/
```

### 2. Test the New Components

Navigate to: **[http://localhost:3000/test/responsive-ui](http://localhost:3000/test/responsive-ui)**

This page demonstrates:

- ✅ Color system (HSL + OKLCH)
- ✅ Layout patterns (Flexbox/Grid)
- ✅ Native dialog component
- ✅ Native details/summary
- ✅ Enhanced input fields
- ✅ Enhanced tooltips
- ✅ Editable content
- ✅ Responsive images
- ✅ Breakpoint information

### 3. Start Using in Your Components

#### Use HSL Colors

```tsx
// Primary color with HSL
<div className="bg-primary-hsl text-white">
  Primary HSL Color
</div>

// Neutral colors
<div className="bg-neutral-100 text-neutral-900">
  Neutral colors
</div>

// Semantic colors
<div className="bg-success-hsl text-white">
  Success
</div>
```

#### Use Layout Components

```tsx
import { LayoutContainer, SectionContainer } from '@/lib/styles/layout';

<LayoutContainer size="7xl" padding="md">
  <SectionContainer>
    <ContentWrapper>
      Your content
    </ContentWrapper>
  </SectionContainer>
</LayoutContainer>
```

#### Use Sticky Positioning

```tsx
import { StickyHeader } from '@/lib/styles/sticky';

<StickyHeader>
  <Navigation />
</StickyHeader>
```

#### Use Native Dialog

```tsx
import { NativeDialog } from '@/components/ui/native-dialog';

<NativeDialog open={isOpen} onOpenChange={setIsOpen}>
  <h2>Dialog Title</h2>
  <p>Dialog content</p>
</NativeDialog>
```

#### Use Responsive Images

```tsx
import { ResponsiveImage } from '@/components/ui/responsive-image';

<ResponsiveImage
  src="/image.jpg"
  webpSrc="/image.webp"
  mobileSrc="/image-mobile.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

## Quick Reference: Essential Responsive Patterns

### 1. flex-wrap: wrap

**Why:** Prevents items from squeezing on one line, essential for responsive layouts.

**Quick Reference:**

```tsx
// ✅ Always use flex-wrap when items should wrap
<div className="flex flex-wrap gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

**When to use:**

- Card layouts that should stack on mobile
- Button groups that should wrap
- Any flex container where items might overflow on small screens

**Learn more:** See `docs/design/responsive-design.md#flex-wrap-wrap`

---

### 2. The gap Property

**Why:** Modern, clean way to space items without manual margins. Works in both Flexbox and Grid.

**Quick Reference:**

```tsx
// ✅ Use gap for spacing
<div className="flex flex-wrap gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ✅ Responsive gap
<div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

**When to use:**

- Always use `gap` instead of manual margins in flex/grid containers
- Responsive spacing: `gap-2 md:gap-4 lg:gap-6`

**Learn more:** See `docs/design/responsive-design.md#the-gap-property`

---

### 3. flex: 1 1 auto Pattern

**Why:** Creates flexible items that grow and shrink naturally. The secret sauce for fluid layouts.

**Quick Reference:**

```tsx
// ✅ Equal-width flexible items
<div className="flex">
  <div className="flex-1">Grows to fill space</div>
  <div className="flex-1">Grows to fill space</div>
</div>

// ✅ Fixed sidebar + flexible content
<div className="flex">
  <aside className="w-64 flex-shrink-0">Fixed sidebar</aside>
  <main className="flex-1">Flexible content</main>
</div>
```

**Common patterns:**

- `flex-1` = `flex: 1 1 auto` (grow, shrink, auto basis)
- `flex-none` = `flex: 0 0 auto` (fixed size)
- `flex-shrink-0` = don't shrink below natural size

**Learn more:** See `docs/design/responsive-design.md#the-flex-shorthand-grow-shrink-basis`

---

### 4. Grid auto-fit with minmax()

**Why:** One-line CSS that creates fully responsive grids without media queries.

**Quick Reference:**

```tsx
// ✅ Auto-fit grid (CSS required)
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

// ✅ Alternative: Breakpoint-based grid (Tailwind)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

**When to use:**

- `auto-fit`: Variable number of items, content-driven sizing
- Breakpoints: Fixed number of columns, predictable layout

**Learn more:** See `docs/design/responsive-design.md#a-powerful-recipe-for-responsive-grids`

---

### 5. Planning Before You Code

**Why:** Saves time and prevents "sunk cost fallacy" - planning makes coding faster and more focused.

**Quick Checklist:**

- [ ] Sketch mobile layout (320px - 767px)
- [ ] Sketch tablet layout (768px - 1023px)
- [ ] Sketch desktop layout (1024px+)
- [ ] Identify which elements should wrap or stack
- [ ] Determine if you need Flexbox or Grid
- [ ] Plan breakpoints where layout changes

**Learn more:** See `docs/design/responsive-design.md#planning-before-you-code`

---

## Migration Guide

### Gradual Migration Strategy

1. **Start with new components** - Use new components in new features
2. **Update inputs** - Add inputmode to existing input fields
3. **Migrate layouts** - Update layouts to use new layout components
4. **Optimize images** - Run image optimization and update references
5. **Add sticky elements** - Use sticky positioning for headers/sidebars

### Color Migration

No breaking changes! HSL colors are additive:

- ✅ Existing OKLCH colors still work
- ✅ Use HSL when you need easy shade manipulation
- ✅ Both systems work together

## Component Examples

### Responsive Grid with Breakpoints

```tsx
// Breakpoint-based grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Responsive Flexbox with Wrapping

```tsx
// Flexbox with flex-wrap and gap
<div className="flex flex-wrap gap-4">
  {items.map(item => (
    <Card key={item.id} className="flex-1 min-w-[200px]">
      {item.content}
    </Card>
  ))}
</div>
```

### Auto-Fit Grid Pattern

```tsx
// Auto-fit grid (requires inline style or CSS module)
<div 
  className="grid gap-6"
  style={{
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  }}
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Enhanced Input

```tsx
<Input type="email" placeholder="Email" />
<Input type="tel" placeholder="Phone" />
<Input inputMode="numeric" placeholder="Number" />
```

### Native Details

```tsx
<Details summary="Click to expand">
  <p>Hidden content that expands</p>
</Details>
```

## Testing Checklist

- [ ] Test on mobile device (or browser dev tools)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Verify theme switching works
- [ ] Test native dialog functionality
- [ ] Test responsive images load correctly
- [ ] Verify input keyboard types on mobile
- [ ] Test sticky positioning
- [ ] Check breakpoint detection

## Documentation

- **Full Guide**: `docs/design/responsive-design.md`
- **Color System**: `docs/design/color-system.md`
- **Layout Patterns**: `docs/design/layout-patterns.md`
- **Implementation Summary**: `docs/design/IMPLEMENTATION_SUMMARY.md`

## Need Help?

- Check the test page: `/test/responsive-ui`
- Review documentation in `docs/design/`
- All components are TypeScript typed with JSDoc comments
