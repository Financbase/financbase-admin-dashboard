# Architecture Documentation

This directory contains comprehensive technical architecture documentation for the Financbase Admin Dashboard. Each document provides deep technical details about specific architectural areas.

## 🚀 Quick Start

**New to the architecture?** Start with the **[Technical Deep Dive](./TECHNICAL_DEEP_DIVE.md)** - a consolidated document covering all major architectural areas with code references and implementation details.

## Quick Navigation

### 📖 Consolidated Document

0. **[Technical Deep Dive](./TECHNICAL_DEEP_DIVE.md)** ⭐ **START HERE**
   - Comprehensive overview of all architectural areas
   - Code references with file paths and line numbers
   - Key metrics and statistics
   - Quick reference for the entire system
   - Perfect for onboarding new developers

### Core Architecture Documents

1. **[Frontend Architecture](./FRONTEND_ARCHITECTURE.md)**
   - Next.js 15 App Router structure
   - React Server Components
   - State management (TanStack Query, Zustand)
   - Component architecture
   - Styling system (Tailwind CSS, shadcn/ui)

2. **[Backend Architecture](./BACKEND_ARCHITECTURE.md)**
   - Next.js Route Handlers
   - API versioning system
   - Middleware implementation
   - Error handling patterns
   - Service layer architecture

3. **[Database Architecture](./DATABASE_ARCHITECTURE.md)**
   - PostgreSQL with Neon Serverless
   - Drizzle ORM patterns
   - Row Level Security (RLS) - 221 secured tables
   - Migration management
   - Query optimization strategies

4. **[Security Architecture](./SECURITY_ARCHITECTURE.md)**
   - Clerk authentication integration
   - Row Level Security policies
   - API security (rate limiting, validation)
   - HTTP security headers
   - Vulnerability management

### Feature-Specific Architecture

5. **[Real-time Collaboration](./REALTIME_COLLABORATION.md)**
   - PartyKit WebSocket server
   - Room-based architecture
   - Message types and routing
   - State synchronization patterns
   - Collaboration features

6. **[AI/ML Integration](./AI_ML_INTEGRATION.md)**
   - Multi-provider AI orchestration
   - BYOK (Bring Your Own Key) system
   - Transaction categorization (97%+ accuracy)
   - Provider routing and cost optimization
   - Usage tracking and analytics

### Operations & Quality

7. **[Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)**
   - Frontend optimizations (code splitting, image optimization)
   - Backend query optimization
   - Caching strategies
   - Bundle size optimization
   - Monitoring and metrics

8. **[Testing Infrastructure](./TESTING_INFRASTRUCTURE.md)**
   - Jest unit tests (80% coverage requirement)
   - Playwright E2E tests
   - K6 load testing
   - Test organization and best practices
   - CI/CD integration

9. **[Deployment & DevOps](./DEPLOYMENT_DEVOPS.md)**
   - Vercel deployment configuration
   - CI/CD pipeline
   - Database migration strategy
   - Monitoring and observability
   - Backup and recovery procedures

## Architecture Overview

### Technology Stack

**Frontend:**
- Next.js 15.4.7 with App Router
- React 18.3.1 (Server Components)
- TypeScript 5.9.3
- TanStack Query v5.90.5
- Tailwind CSS 3.4.18
- shadcn/ui components

**Backend:**
- Next.js API Routes
- Drizzle ORM 0.36.4
- Clerk Authentication v6.34.1
- PartyKit (WebSocket)

**Database:**
- PostgreSQL (Neon Serverless)
- Row Level Security (221 tables secured)
- Drizzle Kit migrations

**Infrastructure:**
- Vercel (hosting & CDN)
- Sentry (error tracking)
- GitHub Actions (CI/CD)

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                  │
│  Next.js 15 App Router │ React Server Components │ RSC     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Middleware Layer                          │
│  Clerk Auth │ API Versioning │ Rate Limiting │ RLS Context  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Route Handlers)               │
│  RESTful APIs │ WebSocket (Partykit) │ Error Handling      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  Business Logic │ AI Orchestration │ Data Processing       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  PostgreSQL (Neon) │ Drizzle ORM │ RLS Policies (221)     │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Next.js App Router
- **Rationale**: Modern React Server Components, improved performance, better SEO
- **Benefits**: Reduced JavaScript bundle size, faster initial page loads, better caching

### 2. Row Level Security (RLS)
- **Rationale**: Database-level data isolation, multi-tenant security
- **Implementation**: 221 tables with RLS policies, automatic user context filtering
- **Benefits**: Secure by default, reduced application-level security bugs

### 3. Multi-Provider AI System
- **Rationale**: Flexibility, cost optimization, provider redundancy
- **Implementation**: BYOK system with encrypted key storage
- **Benefits**: User control over costs, provider selection, automatic failover

### 4. API Versioning
- **Rationale**: Backward compatibility, gradual migration path
- **Implementation**: URL-based versioning (`/api/v1/`, `/api/v2/`)
- **Benefits**: Non-breaking changes, deprecation warnings, migration flexibility

### 5. PartyKit for Real-time
- **Rationale**: Serverless WebSocket, no infrastructure management
- **Benefits**: Scalable, cost-effective, built-in room management

## Design Principles

### 1. Security First
- Authentication required for all protected routes
- Row Level Security at database level
- Input validation and sanitization
- Comprehensive security headers
- Regular security audits

### 2. Performance
- Server Components for reduced bundle size
- Image optimization and lazy loading
- Query optimization and caching
- Code splitting and tree shaking

### 3. Type Safety
- TypeScript strict mode enabled
- Type-safe database queries (Drizzle ORM)
- Zod validation schemas
- Comprehensive type definitions

### 4. Developer Experience
- Clear code organization
- Comprehensive documentation
- Testing infrastructure (80% coverage)
- Error handling patterns
- Development tools (React Query DevTools)

### 5. Scalability
- Stateless application design
- Database connection pooling
- CDN for static assets
- Horizontal scaling support

## Getting Started

### For Developers

1. **New to the codebase?** Start with [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) and [Backend Architecture](./BACKEND_ARCHITECTURE.md)
2. **Working on database?** Read [Database Architecture](./DATABASE_ARCHITECTURE.md) and [Security Architecture](./SECURITY_ARCHITECTURE.md)
3. **Adding features?** Check relevant feature-specific documents (Real-time, AI/ML)
4. **Deploying?** Review [Deployment & DevOps](./DEPLOYMENT_DEVOPS.md)

### For Architects

1. Review all architecture documents for complete understanding
2. Check [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md) for scaling considerations
3. Review [Testing Infrastructure](./TESTING_INFRASTRUCTURE.md) for quality standards
4. See [Security Architecture](./SECURITY_ARCHITECTURE.md) for security requirements

## Related Documentation

### Configuration
- [Environment Variables](../configuration/ENVIRONMENT_VARIABLES.md)
- [Clerk Configuration](../configuration/CLERK_CONFIGURATION.md)
- [BYOK Multi-Provider Setup](../configuration/BYOK_MULTI_PROVIDER_README.md)

### API Documentation
- [API Overview](../api/API.md)
- [API Versioning](../api/API_VERSIONING.md)
- [Webhooks](../api/webhooks.md)

### Database
- [Database Security Guidelines](../database/security-guidelines.md)
- [RLS Integration Guide](../rls-integration-guide.md)
- [Database Quick Reference](../database/quick-reference.md)

### Deployment
- [Production Deployment Guide](../deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Schema Migration Guide](../deployment/SCHEMA_MIGRATION_GUIDE.md)
- [Deployment Readiness Checklist](../deployment/DEPLOYMENT_READINESS_CHECKLIST.md)

## Contributing

When adding new features or making architectural changes:

1. **Update relevant architecture documents** if patterns change
2. **Follow existing patterns** documented in these guides
3. **Maintain security standards** outlined in Security Architecture
4. **Keep performance in mind** - see Performance Optimization
5. **Add tests** as per Testing Infrastructure requirements
6. **Update this README** if adding new architecture documents

## Document Maintenance

Architecture documents should be updated when:
- Major technology stack changes occur
- New architectural patterns are introduced
- Security requirements change
- Performance optimizations are implemented
- Deployment processes are modified

---

**Last Updated**: December 2024  
**Architecture Version**: 2.0
