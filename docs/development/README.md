# 🛠️ Financbase Development Guide

## Overview

This guide provides comprehensive information for developers working on the Financbase Admin Dashboard, including setup, development workflows, testing, and contribution guidelines.

## 🚀 Development Setup

### Prerequisites

- **Node.js 20.x** or later
- **npm** or **yarn** package manager
- **Git** for version control
- **PostgreSQL** database (local or Neon)
- **OpenAI API key** for AI features
- **Clerk account** for authentication

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/financbase-admin-dashboard.git
   cd financbase-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate database schema
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Optional: Open database studio
   npm run db:studio
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Development Workflow

### Code Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── freelancer/     # Freelancer module components
│   └── real-estate/    # Real estate module components
├── lib/                # Utility libraries and services
│   ├── ai/            # AI service integrations
│   ├── db/            # Database utilities
│   ├── auth/          # Authentication helpers
│   └── utils/         # General utilities
├── app/               # Next.js App Router
│   ├── (dashboard)/   # Protected routes
│   ├── api/           # API endpoints
│   └── layout.tsx     # Root layout
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

### Development Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate database schema
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking
npm run format          # Format code with Prettier

# Testing
npm test                # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run with coverage report
npm run e2e             # Run end-to-end tests
npm run e2e:ui          # Run E2E tests with UI

# Development Tools
npm run analyze         # Bundle analyzer
npm run clean           # Clean build artifacts
```

### Environment Variables

Create a `.env.local` file for development:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/financbase

# AI Services
OPENAI_API_KEY=sk-your_openai_key

# Email (Resend)
RESEND_API_KEY=re_your_resend_key

# Search (Algolia)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key

# Error Tracking (Sentry)
SENTRY_DSN=https://your_sentry_dsn
```

## 🔧 Development Tools

### Code Quality

#### ESLint & Prettier

- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Code formatting for consistency
- **Husky**: Pre-commit hooks for code quality

```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Format code
npm run format
```

#### TypeScript

- **Strict TypeScript**: Full type safety across the application
- **Path Mapping**: `@/` alias for clean imports
- **Type Checking**: Run `npm run type-check` before commits

### Database Development

#### Drizzle ORM

- **Schema-First**: Define database schema in TypeScript
- **Migrations**: Automatic migration generation
- **Type Safety**: Full type safety for database operations

```typescript
// Example schema definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Generated types are automatically available
type User = typeof users.$inferSelect;
```

#### Database Operations

```bash
# Generate new migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:push

# Check migration status
npm run db:check

# Open Drizzle Studio for schema visualization
npm run db:studio
```

### Testing

#### Unit Testing (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:coverage

# Run specific test file
npm test component.test.tsx
```

#### E2E Testing (Playwright)

```bash
# Run E2E tests
npm run e2e

# Run with UI for debugging
npm run e2e:ui

# Run headed (visible browser)
npm run e2e:headed
```

#### Test Structure

```
/__tests__/                 # Unit tests
  ├── components/          # Component tests
  ├── lib/                # Service tests
  └── api/                # API tests

/e2e/                      # End-to-end tests
  └── dashboard.spec.ts    # User journey tests
```

### API Development

#### API Routes Structure

```
app/api/
├── ai/                    # AI service endpoints
│   ├── financial-analysis/
│   └── categorize/
├── email/                 # Email service endpoints
│   └── send-invoice/
├── search/               # Search endpoints
├── uploadthing/          # File upload endpoints
└── health/              # Health check endpoint
```

#### Creating New API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your API logic here
    const data = { message: 'Hello World' };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Component Development

#### Component Structure

```typescript
// components/example-component.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAction?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
```

#### Using shadcn/ui Components

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ExampleForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Form</CardTitle>
        <CardDescription>A simple form example</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button className="mt-4">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## 🧪 Testing Guide

### Writing Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockAction = vi.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);

    const button = screen.getByRole('button');
    button.click();

    expect(mockAction).toHaveBeenCalled();
  });
});
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to dashboard', async ({ page }) => {
  await page.goto('/');

  // Mock authentication
  await page.route('**/api/auth/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.click('text=Dashboard');
  await expect(page.locator('h1')).toContainText('Financial Dashboard');
});
```

## 🔄 Git Workflow

### Branch Naming Convention

```
feature/        # New features
bugfix/         # Bug fixes
hotfix/         # Critical fixes
refactor/       # Code refactoring
docs/          # Documentation updates
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes**
   - Write tests first (TDD approach)
   - Implement feature
   - Update documentation

3. **Run Tests**
   ```bash
   npm run test:run
   npm run type-check
   npm run lint
   ```

4. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Add screenshots for UI changes

5. **Code Review**
   - Address review comments
   - Update tests if needed
   - Get approval from maintainers

6. **Merge**
   - Squash and merge for clean history
   - Delete feature branch

## 🚀 Deployment Workflow

### Development Deployment

```bash
# Start local development
npm run dev

# With Docker
docker-compose up
```

### Staging Deployment

```bash
# Deploy to staging
./deploy.sh staging

# Or via CI/CD
# Automatic on push to develop branch
```

### Production Deployment

```bash
# Deploy to production
./deploy.sh production

# Or via CI/CD
# Automatic on push to main branch with passing tests
```

## 🔧 Debugging

### Common Issues

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Database Issues

```bash
# Check database connection
npx drizzle-kit check

# Reset database (development only)
npm run db:reset
```

#### Runtime Errors

```bash
# Check application logs
npm run dev 2>&1 | tee dev.log

# Debug with verbose logging
DEBUG=* npm run dev
```

### Development Tools

#### Bundle Analyzer

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

#### Database Studio

```bash
# Visualize database schema
npm run db:studio
```

#### Performance Profiling

```bash
# Profile application performance
npm run dev -- --turbo
```

## 📚 Learning Resources

### Next.js Documentation
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Deployment](https://nextjs.org/docs/deployment)

### React & TypeScript
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Database & APIs
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL Docs](https://postgresql.org/docs/)
- [OpenAI API](https://platform.openai.com/docs)

### Development Tools
- [Vitest](https://vitest.dev) - Testing framework
- [Playwright](https://playwright.dev) - E2E testing
- [ESLint](https://eslint.org) - Code linting
- [Prettier](https://prettier.io) - Code formatting

## 🤝 Contributing

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Set up** development environment
4. **Create** a feature branch
5. **Make** your changes
6. **Test** thoroughly
7. **Submit** a pull request

### Contribution Guidelines

- **Code Style**: Follow existing patterns and conventions
- **Tests**: Add tests for new features and bug fixes
- **Documentation**: Update docs for API and feature changes
- **Performance**: Consider performance impact of changes
- **Security**: Follow security best practices

### Code Review Process

- **Automated Checks**: CI/CD runs tests and linting
- **Manual Review**: Maintainers review code quality
- **Approval**: Requires approval before merging
- **Merge**: Squash and merge for clean history

## 📞 Getting Help

### Resources
- **Documentation**: This development guide and API docs
- **Issues**: [GitHub Issues](https://github.com/your-org/financbase-admin-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/financbase-admin-dashboard/discussions)

### Community
- **Slack**: Join our developer community
- **Discord**: Real-time chat for quick questions
- **Forum**: Long-form discussions and knowledge sharing

### Professional Support
- **Email**: dev@financbase.com
- **Priority Support**: For enterprise customers
- **Consulting**: Custom development and integration services

---

*Happy coding! 🚀*
