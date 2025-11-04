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

Navigate to: **http://localhost:3000/test/responsive-ui**

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

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

