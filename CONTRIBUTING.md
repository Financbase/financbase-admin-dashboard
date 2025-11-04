# Contributing to Financbase Admin Dashboard

This document provides guidelines and instructions for internal team members contributing to the Financbase Admin Dashboard. This is proprietary commercial software developed and maintained by the Financbase team.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to maintaining a professional and collaborative development environment. All team members are expected to:

- Be respectful and professional in all interactions
- Provide constructive feedback and code reviews
- Communicate clearly and proactively
- Collaborate effectively with team members
- Maintain confidentiality of proprietary code and business information

### Our Standards

- Using professional and respectful language
- Being open to feedback and code review suggestions
- Focusing on code quality and business requirements
- Maintaining high standards for security and performance
- Respecting intellectual property and confidentiality

## Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher (20.0.0+ recommended)
- **npm/pnpm**: 8.0.0 or higher
- **PostgreSQL**: 14.0 or higher (or Neon account)
- **Git**: Latest version

### 📚 Understanding the Architecture

**Before you start coding**, we highly recommend reading the architecture documentation:

- **[Technical Deep Dive](../docs/architecture/TECHNICAL_DEEP_DIVE.md)** ⭐ - **START HERE** - Comprehensive overview of the entire system architecture with code references
- **[Architecture Documentation](../docs/architecture/README.md)** - Complete suite of focused architecture documents

This will help you understand:

- Frontend architecture (Next.js 15 App Router, React Server Components)
- Backend patterns (API routes, middleware, versioning)
- Database structure (Drizzle ORM, RLS policies)
- Security implementation (authentication, authorization)
- Real-time features (Partykit WebSocket)
- AI/ML integration (multi-provider system)

### Initial Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-org/financbase-admin-dashboard.git
   cd financbase-admin-dashboard
   ```

   **Note**: This is a private repository. Ensure you have proper access credentials.

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set Up Environment Variables**

   ```bash
   cp .env.example .env.local
   # Fill in required variables (see docs/configuration/ENVIRONMENT_VARIABLES.md)
   ```

4. **Set Up Database**

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **Verify Setup**
   - Visit `http://localhost:3000`
   - Run tests: `npm test`
   - Check linting: `npm run lint`

## Development Workflow

### Branch Strategy

We use the following branching model:

- **main**: Production-ready code (protected)
- **develop**: Integration branch for features
- **feature/***: New features
- **bugfix/***: Bug fixes
- **hotfix/***: Critical production fixes

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name
```

### Branch Naming Convention

- **Features**: `feature/description-of-feature`
- **Bug Fixes**: `bugfix/description-of-bug`
- **Hotfixes**: `hotfix/description-of-fix`
- **Documentation**: `docs/description-of-docs`
- **Refactoring**: `refactor/description-of-refactor`

## Code Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Use enums for constants
- Export types/interfaces explicitly

**Good:**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

export async function getUser(id: string): Promise<User> {
  // implementation
}
```

**Bad:**

```typescript
export async function getUser(id: any): Promise<any> {
  // implementation
}
```

### Code Style

- Follow ESLint configuration (run `npm run lint`)
- Use Prettier for formatting (run `npm run format`)
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings (configurable)

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **API Routes**: kebab-case (`user-profile/route.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Component
export function MyComponent({ title, onSubmit }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState<string>('');

  // 5. Handlers
  const handleClick = () => {
    // logic
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Submit</Button>
    </div>
  );
}
```

### API Route Standards

- Use `ApiErrorHandler` for all error handling
- Validate inputs with Zod schemas
- Return consistent response formats
- Include proper HTTP status codes
- Document endpoints with JSDoc

**Example:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiErrorHandler } from '@/lib/api-error-handler';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    
    // Implementation
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
```

### Database Guidelines

- Use Drizzle ORM for all database operations
- Use parameterized queries (never string concatenation)
- Include proper error handling
- Use transactions for multi-step operations
- Add indexes for frequently queried columns

**Good:**

```typescript
const result = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
```

**Bad:**

```typescript
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

## Testing Requirements

### Test Coverage

- **Minimum coverage**: 80% for new code
- **Critical paths**: 100% coverage
- **API routes**: All endpoints must have tests

### Writing Tests

1. **Unit Tests** (Jest)

   ```typescript
   describe('formatCurrency', () => {
     it('should format USD correctly', () => {
       expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
     });
   });
   ```

2. **Integration Tests**

   ```typescript
   describe('POST /api/users', () => {
     it('should create a new user', async () => {
       const response = await fetch('/api/users', {
         method: 'POST',
         body: JSON.stringify({ email: 'test@example.com' }),
       });
       expect(response.status).toBe(201);
     });
   });
   ```

3. **E2E Tests** (Playwright)

   ```typescript
   test('user can sign in', async ({ page }) => {
     await page.goto('/sign-in');
     await page.fill('[name="email"]', 'test@example.com');
     await page.click('button[type="submit"]');
     await expect(page).toHaveURL('/dashboard');
   });
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Type checking passes (`npm run type-check`)
4. ✅ Code is formatted (`npm run format`)
5. ✅ No console errors or warnings
6. ✅ Documentation is updated (if needed)
7. ✅ Changelog is updated (for user-facing changes)

### PR Title Format

Use conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**

- `feat: add user profile editing`
- `fix: resolve invoice calculation error`
- `docs: update API documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependencies updated (if applicable)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: At least one maintainer reviews the PR
3. **Feedback**: Address review comments
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge to develop/main

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat(auth): add multi-factor authentication

Add support for TOTP-based MFA using otplib.
Includes UI components and API endpoints.

Closes #123
```

```
fix(invoices): correct tax calculation for international clients

Fixed bug where tax was not calculated correctly for
EU-based clients. Now uses proper VAT calculation.

Fixes #456
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Include examples for utility functions
- Document API endpoints with request/response examples

**Example:**

```typescript
/**
 * Formats a currency amount according to locale
 * 
 * @param amount - The amount to format (in cents)
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param locale - BCP 47 locale string (default: 'en-US')
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1000, 'USD') // '$10.00'
 * formatCurrency(1000, 'EUR', 'de-DE') // '10,00 €'
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  // implementation
}
```

### Documentation Updates

- Update README.md if adding new features
- Update API documentation in `docs/api/`
- Add migration guides in `docs/deployment/`
- Update CHANGELOG.md for user-facing changes

## Getting Help

- **Documentation**: Check `docs/` directory
- **Internal Issues**: Search existing issues or create new one in the private repository
- **Team Communication**: Use internal team channels (Slack, Teams, etc.)
- **Technical Support**: Contact the development team lead
- **Business Questions**: Contact product management

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Testing Library Documentation](https://testing-library.com/)

---

Thank you for contributing to Financbase Admin Dashboard! 🎉
