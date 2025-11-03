# ADR-0001: Use Next.js App Router

**Status**: Accepted  
**Date**: 2024-01-XX  
**Deciders**: Development Team  
**Tags**: architecture, framework, routing

## Context

The Financbase Admin Dashboard is a modern financial management platform requiring:

- Server-side rendering for SEO and performance
- API routes for backend functionality
- Real-time updates and collaboration features
- Type-safe routing
- Optimal developer experience
- Production-grade performance

We evaluated Next.js (with both App Router and Pages Router), Remix, and SvelteKit as potential frameworks.

## Decision

We will use **Next.js 15 with the App Router** as our primary framework because it provides:

1. **Unified routing**: File-based routing with layouts and server components
2. **Performance**: Built-in optimizations (code splitting, image optimization, etc.)
3. **Full-stack capabilities**: API routes in the same codebase
4. **TypeScript support**: Excellent TypeScript integration
5. **Ecosystem**: Large community and extensive documentation
6. **Vercel integration**: Seamless deployment and hosting

## Rationale

The App Router (introduced in Next.js 13) provides significant advantages over the Pages Router:

- **React Server Components**: Better performance through server-side rendering
- **Nested layouts**: More flexible page structure
- **Streaming**: Progressive page loading for better UX
- **Loading states**: Built-in loading.tsx and error.tsx patterns
- **Route groups**: Better organization of routes without affecting URLs
- **Parallel routes**: Advanced routing patterns for complex UIs

Compared to alternatives:
- **Remix**: Excellent but smaller ecosystem
- **SvelteKit**: Great performance but team expertise in React

## Alternatives Considered

### Alternative 1: Next.js Pages Router
- **Pros**: Stable, mature, well-documented, team familiarity
- **Cons**: Less flexible layouts, no server components, older patterns
- **Why not chosen**: App Router is the future of Next.js, provides better DX and performance

### Alternative 2: Remix
- **Pros**: Excellent data loading patterns, great DX
- **Cons**: Smaller ecosystem, less team familiarity
- **Why not chosen**: Team expertise in Next.js, larger ecosystem

### Alternative 3: SvelteKit
- **Pros**: Excellent performance, modern framework
- **Cons**: Different language (Svelte vs React), team would need training
- **Why not chosen**: Team expertise in React ecosystem

## Consequences

### Positive
- **Fast development**: File-based routing is intuitive
- **Performance**: Server components and streaming improve load times
- **SEO**: Server-side rendering improves search engine visibility
- **Developer experience**: Excellent tooling and TypeScript support
- **Scalability**: Easy to scale with Vercel or other platforms

### Negative
- **Learning curve**: App Router has different patterns than Pages Router
- **Ecosystem**: Some libraries may not support App Router yet (mitigated by migration path)
- **Migration**: If needed to migrate from Pages Router, requires refactoring (N/A - new project)

### Neutral
- App Router is still relatively new (introduced in Next.js 13), but stable in Next.js 15

## Implementation Notes

- Use App Router structure: `app/` directory instead of `pages/`
- Leverage React Server Components where possible
- Use Client Components (`'use client'`) only when needed (interactivity, hooks)
- Implement layouts for shared UI across routes
- Use route groups for organization without affecting URLs
- Follow Next.js 15 best practices and conventions

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
