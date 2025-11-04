# Frontend Architecture

## Overview

The Financbase Admin Dashboard frontend is built with Next.js 15.4.7 using the App Router architecture, React 18.3.1 with Server Components, and a comprehensive component library built on shadcn/ui and Radix UI primitives.

## Core Technologies

### Framework Stack

- **Next.js**: 15.4.7 with App Router
- **React**: 18.3.1 (Server Components + Client Components)
- **TypeScript**: 5.9.3 (strict mode enabled)
- **Node.js**: >=18.0.0

### Key Dependencies

```json
{
  "next": "15.4.7",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@tanstack/react-query": "^5.90.5",
  "@clerk/nextjs": "^6.34.1",
  "drizzle-orm": "0.36.4",
  "tailwindcss": "^3.4.18",
  "zod": "^3.25.76",
  "react-hook-form": "^7.65.0"
}
```

## Application Structure

### Directory Organization

```
app/
├── (dashboard)/          # Protected dashboard routes
│   ├── dashboard/        # Main dashboard
│   ├── invoices/         # Invoice management
│   ├── expenses/         # Expense tracking
│   ├── clients/         # Client management
│   ├── transactions/    # Transaction views
│   └── ...
├── (public)/            # Public routes
│   ├── home/           # Landing page
│   ├── blog/           # Blog pages
│   ├── docs/           # Documentation
│   └── ...
├── api/                 # API route handlers
├── auth/               # Authentication pages
├── layout.tsx          # Root layout
├── providers.tsx       # Global providers
└── client-layout.tsx  # Client-side layout wrapper

components/
├── ui/                 # shadcn/ui components
├── core/               # Core dashboard components
├── forms/              # Form components
├── financial/          # Financial feature components
├── collaboration/      # Real-time collaboration
└── ...

hooks/                  # Custom React hooks
lib/                    # Utilities and services
contexts/               # React contexts
types/                  # TypeScript type definitions
```

## App Router Architecture

### Route Groups

The application uses Next.js route groups to organize routes:

- **`(dashboard)`**: All authenticated dashboard routes
- **`(public)`**: Public-facing pages and documentation

### Root Layout

```12:29:app/layout.tsx
export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <html lang="en" className={inter.variable} suppressHydrationWarning>
   <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="fonts.gstatic.com" crossOrigin="anonymous" />
   </head>
   <body className={`${inter.className} font-sans`}>
    <ClientLayout>
     {children}
    </ClientLayout>
   </body>
  </html>
 )
}
```

### Client Layout Wrapper

```12:22:app/client-layout.tsx
export function ClientLayout({ children }: ClientLayoutProps) {
 return (
  <Providers>
   <MobileAppShell>
    {children}
   </MobileAppShell>
   <Toaster />
   <SonnerToaster />
  </Providers>
 );
}
```

## State Management

### TanStack Query (React Query)

Primary data fetching and server state management:

```19:34:app/providers.tsx
const queryClient = new QueryClient({
 defaultOptions: {
  queries: {
   retry: 3,
   retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
   staleTime: 5 * 60 * 1000, // 5 minutes
   gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
   refetchOnWindowFocus: false,
   refetchOnReconnect: true,
  },
  mutations: {
   retry: 1,
   retryDelay: 1000,
  },
 },
});
```

**Key Features:**

- Automatic caching with 5-minute stale time
- Exponential backoff retry strategy
- Optimistic updates for mutations
- Background refetching on reconnect
- DevTools integration in development

### Usage Example

```55:75:app/(dashboard)/transactions/page.tsx
 const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
  queryKey: ['transactions', searchQuery],
  queryFn: async () => {
   const params = new URLSearchParams();
   if (searchQuery) params.append('search', searchQuery);
   
   const response = await fetch(`/api/transactions?${params.toString()}`);
   if (!response.ok) throw new Error('Failed to fetch transactions');
   return response.json();
  },
 });

 // Fetch transaction stats
 const { data: statsData, isLoading: statsLoading } = useQuery({
  queryKey: ['transaction-stats'],
  queryFn: async () => {
   const response = await fetch('/api/transactions/stats');
   if (!response.ok) throw new Error('Failed to fetch transaction stats');
   return response.json();
  },
 });
```

### Context-Based State

For global UI state:

```17:33:contexts/dashboard-context.tsx
export function DashboardProvider({ children }: { children: React.ReactNode }) {
 // Set default date range to current month
 const now = new Date();
 const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
 
 const [dateRange, setDateRange] = React.useState<DateRange>({
  from: startOfMonth,
  to: endOfMonth
 });

 return (
  <DashboardContext.Provider value={{ dateRange, setDateRange }}>
   {children}
  </DashboardContext.Provider>
 );
}
```

## Component Architecture

### Component Hierarchy

```
RootLayout
└── ClientLayout
    └── Providers
        ├── ClerkProvider (Authentication)
        ├── QueryClientProvider (Data fetching)
        ├── ThemeProvider (Dark mode)
        └── DashboardProvider (Global state)
            └── MobileAppShell
                └── Page Components
```

### Server vs Client Components

**Server Components** (default):

- Used for data fetching at request time
- No JavaScript sent to client
- Access to server-only APIs (database, file system)

**Client Components** (`"use client"`):

- Interactive components with hooks
- Browser APIs (localStorage, window)
- Event handlers and state

### Component Library

Built on **shadcn/ui** with Radix UI primitives:

```1:17:components.json
{
 "$schema": "https://ui.shadcn.com/schema.json",
 "style": "default",
 "rsc": true,
 "tsx": true,
 "tailwind": {
  "config": "tailwind.config.js",
  "css": "app/globals.css",
  "baseColor": "slate",
  "cssVariables": true,
  "prefix": ""
 },
 "aliases": {
  "components": "@/components",
  "utils": "@/lib/utils"
 }
}
```

**Key UI Components:**

- Form controls (Input, Select, Checkbox, Radio)
- Data display (Table, Card, Badge, Avatar)
- Overlays (Dialog, Popover, Dropdown Menu, Tooltip)
- Feedback (Toast, Alert Dialog, Progress)
- Navigation (Tabs, Accordion, Navigation Menu)

## Styling System

### Tailwind CSS Configuration

```1:77:tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
 darkMode: ["class"],
 content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
 ],
 prefix: "",
 theme: {
  container: {
   center: true,
   padding: "2rem",
   screens: {
    "2xl": "1400px",
   },
  },
  extend: {
   colors: {
    border: "oklch(var(--border))",
    input: "oklch(var(--input))",
    ring: "oklch(var(--ring))",
    background: "oklch(var(--background))",
    foreground: "oklch(var(--foreground))",
    primary: {
     DEFAULT: "oklch(var(--primary))",
     foreground: "oklch(var(--primary-foreground))",
    },
    // ... more color tokens
   },
   borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
   },
   keyframes: {
    "accordion-down": {
     from: { height: "0" },
     to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
     from: { height: "var(--radix-accordion-content-height)" },
     to: { height: "0" },
    },
   },
   animation: {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
   },
  },
 },
 plugins: [require("tailwindcss-animate")],
}
```

### Design System Features

- **OKLCH Color Space**: Modern color system with better perceptual uniformity
- **CSS Variables**: Themeable through CSS custom properties
- **Dark Mode**: Class-based dark mode support
- **Responsive Design**: Mobile-first breakpoint system
- **Custom Animations**: Tailwind animate plugin integration

## Form Handling

### React Hook Form + Zod

Form validation and state management:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  amount: z.number().positive('Amount must be positive'),
});

type FormData = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      amount: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

**Benefits:**

- Type-safe form validation
- Minimal re-renders
- Error handling built-in
- Integration with shadcn/ui form components

## Custom Hooks

### Available Hooks

The application includes 27+ custom hooks for common patterns:

- **Data Fetching**: `use-dashboard-queries.ts`, `use-dashboard-data-optimized.ts`
- **Authentication**: `use-authenticated-fetch.ts`, `use-admin-status.ts`
- **UI Utilities**: `use-toast.ts`, `use-debounce.ts`, `use-window-size.ts`
- **Form Management**: `use-form-submission.ts`, `useFormValidation.ts`
- **Feature Flags**: `use-feature-flag.ts`
- **Business Logic**: `use-real-estate-role.ts`, `use-marketing-analytics.ts`

### Hook Pattern Example

```typescript
// hooks/use-dashboard-queries.ts
export function useDashboardQueries() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: fetchDashboardOverview,
    staleTime: 5 * 60 * 1000,
  });

  return { overview, isLoading };
}
```

## Performance Optimizations

### Code Splitting

- Automatic route-based code splitting via Next.js App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Image Optimization

```29:58:next.config.mjs
 // Image optimization
 images: {
  formats: ['image/webp', 'image/avif'],
  remotePatterns: [
   {
    protocol: 'https',
    hostname: 'cdn.financbase.com',
   },
   {
    protocol: 'https',
    hostname: 'images.unsplash.com',
   },
   // ... more patterns
  ],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  loader: 'default',
  minimumCacheTTL: 60,
 },
```

### Server Components

Leveraging React Server Components for:

- Reduced JavaScript bundle size
- Faster initial page load
- Direct database access without API calls
- SEO-friendly content rendering

### Caching Strategy

- **TanStack Query**: Client-side data caching (5min stale time)
- **Next.js**: Automatic static page caching
- **CDN**: Vercel Edge Network for static assets

## Type Safety

### TypeScript Configuration

```1:42:tsconfig.json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next"
  ]
}
```

**Key Settings:**

- `strict: true` - Full type checking enabled
- Path aliases (`@/*`) for clean imports
- Next.js TypeScript plugin for App Router support

## Provider Stack

### Global Providers

```36:58:app/providers.tsx
export function Providers({ children }: ProvidersProps) {
 return (
  <ClerkProvider>
   <QueryClientProvider client={queryClient}>
    <ThemeProvider
     attribute="class"
     defaultTheme="light"
     enableSystem={false}
     disableTransitionOnChange
     storageKey="financbase-theme"
     suppressHydrationWarning
    >
     <DashboardProvider>
      {children}
     </DashboardProvider>
    </ThemeProvider>
    {process.env.NODE_ENV === 'development' && (
     <ReactQueryDevtoolsDevelopment initialIsOpen={false} />
    )}
   </QueryClientProvider>
  </ClerkProvider>
 );
}
```

**Provider Hierarchy:**

1. **ClerkProvider**: Authentication and user management
2. **QueryClientProvider**: Data fetching and caching
3. **ThemeProvider**: Dark mode and theme management
4. **DashboardProvider**: Global dashboard state

## Development Tools

### React Query DevTools

Available in development mode for:

- Query cache inspection
- Request/response logging
- Cache manipulation for testing

### ESLint & Prettier

- ESLint 8.57.1 with Next.js config
- Prettier 3.6.2 for code formatting
- Husky pre-commit hooks
- Lint-staged for staged file linting

## Best Practices

### Component Organization

1. **Colocation**: Keep related components, hooks, and utilities together
2. **Barrel Exports**: Use `index.ts` for clean imports
3. **Type Safety**: Explicit types for all props and state
4. **Server First**: Default to Server Components, use Client Components when needed

### Data Fetching

1. **TanStack Query**: Prefer over `useEffect` + `useState` for server data
2. **Query Keys**: Consistent, hierarchical key structure
3. **Error Handling**: Graceful error states with user feedback
4. **Loading States**: Skeleton loaders for better UX

### Performance

1. **Code Splitting**: Dynamic imports for route-based splitting
2. **Image Optimization**: Always use Next.js Image component
3. **Bundle Analysis**: Regular bundle size monitoring
4. **Server Components**: Maximize Server Component usage

## Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Database Architecture](./DATABASE_ARCHITECTURE.md)
- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
