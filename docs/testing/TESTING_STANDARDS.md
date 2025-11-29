# Testing Standards, Patterns, and Templates

**Last Updated:** January 2025  
**Status:** Active Standards  
**Coverage Goal:** 80%+ for critical paths, 60%+ for business logic

## Table of Contents

1. [Overview](#overview)
2. [Testing Principles](#testing-principles)
3. [Test Structure & Organization](#test-structure--organization)
4. [Service Testing Patterns](#service-testing-patterns)
5. [Component Testing Patterns](#component-testing-patterns)
6. [API Route Testing Patterns](#api-route-testing-patterns)
7. [Mocking Standards](#mocking-standards)
8. [Test Templates](#test-templates)
9. [Coverage Requirements](#coverage-requirements)
10. [Best Practices](#best-practices)

---

## Overview

This document establishes the testing standards, patterns, and templates for the Financbase Admin Dashboard. These standards ensure consistency, maintainability, and quality across all test files.

### Testing Framework

- **Test Runner:** Vitest
- **Coverage Provider:** v8
- **Component Testing:** @testing-library/react
- **E2E Testing:** Playwright (separate documentation)

### Key Metrics

- **Current Coverage:** 4.52% (baseline established)
- **Target Coverage:** 80%+ for critical paths
- **Test Pass Rate:** 100% (704 tests passed, 1 skipped)

---

## Testing Principles

### 1. Quality Over Quantity

Prioritize testing critical business logic and user-facing features over blanket coverage.

### 2. Test Isolation

Each test should be independent and not rely on other tests. Use proper setup and teardown.

### 3. Clear Test Names

Test names should clearly describe what is being tested and the expected outcome.

```typescript
// ❌ Bad
it('works', () => { ... })

// ✅ Good
it('should process payment successfully when valid payment method is provided', () => { ... })
```

### 4. Arrange-Act-Assert Pattern

Structure tests with clear sections:

```typescript
it('should calculate invoice total correctly', () => {
  // Arrange
  const invoice = { subtotal: 100, tax: 10, discount: 5 }
  
  // Act
  const total = calculateInvoiceTotal(invoice)
  
  // Assert
  expect(total).toBe(105)
})
```

### 5. Test One Thing

Each test should verify a single behavior or outcome.

---

## Test Structure & Organization

### Directory Structure

```
__tests__/
├── lib/
│   ├── services/              # Service unit tests
│   │   ├── payment-service.test.ts
│   │   ├── invoice-service.test.ts
│   │   └── ...
│   └── utils/                 # Utility function tests
│       ├── error-parser.test.ts
│       └── ...
├── components/               # Component tests
│   ├── invoices/
│   │   └── invoice-form.test.ts
│   └── ...
├── api/                      # API route tests
│   ├── payments-api.test.ts
│   └── ...
└── hooks/                    # Custom hook tests
    ├── use-form-submission.test.ts
    └── ...
```

### File Naming Convention

- Test files should mirror the source file structure
- Use `.test.ts` or `.test.tsx` extension
- Match the source filename: `payment-service.ts` → `payment-service.test.ts`

---

## Service Testing Patterns

### Standard Service Test Structure

```typescript
/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ServiceName } from '@/lib/services/service-name'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/lib/services/notification-service', () => ({
  NotificationService: {
    create: vi.fn(),
  },
}))

describe('ServiceName', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mock database
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: '123' }]),
    }
  })

  describe('createEntity', () => {
    it('should create entity successfully with valid input', async () => {
      // Arrange
      const input = { name: 'Test', userId: 'user-123' }
      
      // Act
      const result = await createEntity(input)
      
      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe('123')
    })

    it('should throw error when required fields are missing', async () => {
      // Arrange
      const input = { name: '' }
      
      // Act & Assert
      await expect(createEntity(input)).rejects.toThrow()
    })
  })

  describe('getEntity', () => {
    it('should return entity when found', async () => {
      // Test implementation
    })

    it('should return null when entity not found', async () => {
      // Test implementation
    })
  })
})
```

### Service Test Checklist

- [ ] Test successful operations
- [ ] Test error cases (validation, not found, unauthorized)
- [ ] Test edge cases (empty data, null values, boundary conditions)
- [ ] Test database interactions (queries, inserts, updates, deletes)
- [ ] Test side effects (notifications, logging, external API calls)
- [ ] Mock all external dependencies
- [ ] Use proper TypeScript types

---

## Component Testing Patterns

### Standard Component Test Structure

```typescript
/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ComponentName } from '@/components/path/component-name'

// Mock Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock hooks
vi.mock('@/hooks/use-form-submission', () => ({
  useFormSubmission: () => ({
    submit: vi.fn(),
    isSubmitting: false,
    errors: {},
  }),
}))

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render component with required props', () => {
    render(<ComponentName prop1="value1" />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const handleClick = vi.fn()
    render(<ComponentName onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalled()
    })
  })

  it('should display loading state', () => {
    render(<ComponentName isLoading={true} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error state', () => {
    render(<ComponentName error="Error message" />)
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })
})
```

### Component Test Checklist

- [ ] Test rendering with required props
- [ ] Test rendering with optional props
- [ ] Test user interactions (clicks, form submissions, input changes)
- [ ] Test loading states
- [ ] Test error states
- [ ] Test empty states
- [ ] Test accessibility (ARIA labels, roles)
- [ ] Mock external dependencies (hooks, API calls, router)
- [ ] Test conditional rendering
- [ ] Test event handlers

---

## API Route Testing Patterns

### Standard API Route Test Structure

```typescript
/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/resource/route'

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// Mock service
vi.mock('@/lib/services/resource-service', () => ({
  ResourceService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}))

describe('GET /api/resource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return resources when authenticated', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
    vi.mocked(ResourceService.getAll).mockResolvedValue([{ id: '1' }])
    
    const request = new NextRequest('http://localhost/api/resource')
    
    // Act
    const response = await GET(request)
    const data = await response.json()
    
    // Assert
    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(1)
  })

  it('should return 401 when unauthenticated', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue(null)
    const request = new NextRequest('http://localhost/api/resource')
    
    // Act
    const response = await GET(request)
    
    // Assert
    expect(response.status).toBe(401)
  })

  it('should handle validation errors', async () => {
    // Test implementation
  })
})
```

### API Route Test Checklist

- [ ] Test successful requests (200, 201)
- [ ] Test authentication (401 when unauthenticated)
- [ ] Test authorization (403 when unauthorized)
- [ ] Test validation errors (400)
- [ ] Test not found errors (404)
- [ ] Test server errors (500)
- [ ] Test query parameters
- [ ] Test request body parsing
- [ ] Test response format
- [ ] Mock all external dependencies

---

## Mocking Standards

### Database Mocking

```typescript
// Standard Drizzle ORM mock pattern
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: '123' }]),
}

vi.mock('@/lib/db', () => ({
  db: mockDb,
}))
```

### Clerk Authentication Mocking

```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

// In test
vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any)
```

### Next.js Router Mocking

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}))
```

### React Query Mocking

```typescript
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: mockData,
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
  })),
}))
```

### Service Class Mocking

```typescript
// For class-based services
vi.mock('@/lib/services/service-name', () => ({
  ServiceName: {
    methodName: vi.fn(),
  },
}))
```

---

## Test Templates

### Service Test Template

See [Service Testing Patterns](#service-testing-patterns) for full template.

### Component Test Template

See [Component Testing Patterns](#component-testing-patterns) for full template.

### API Route Test Template

See [API Route Testing Patterns](#api-route-testing-patterns) for full template.

### Hook Test Template

```typescript
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHookName } from '@/hooks/hook-name'

describe('useHookName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useHookName())
    
    expect(result.current.value).toBe(defaultValue)
  })

  it('should update state when action is called', async () => {
    const { result } = renderHook(() => useHookName())
    
    act(() => {
      result.current.updateValue('new value')
    })
    
    await waitFor(() => {
      expect(result.current.value).toBe('new value')
    })
  })
})
```

---

## Coverage Requirements

### Minimum Coverage Thresholds

- **Critical Paths (Security, Payments, Auth):** 80%+
- **Business Logic (Services):** 70%+
- **UI Components:** 60%+
- **Utilities:** 80%+
- **API Routes:** 75%+

### Coverage Exclusions

The following are excluded from coverage requirements:

- Configuration files
- Type definitions
- Test files
- Migration files
- Build output

### Coverage Goals by Phase

- **Phase 1 (Critical Paths):** 5-6% overall coverage
- **Phase 2 (Core Business Logic):** 8-10% overall coverage
- **Phase 3 (User-Facing Components):** 12-15% overall coverage
- **Phase 4+ (Incremental Improvement):** 15%+ overall coverage

---

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### 2. Mock Management

- Mock at the module level, not the function level
- Clear mocks in `beforeEach` hooks
- Use `vi.mocked()` for type-safe mocking

### 3. Async Testing

- Always use `await` for async operations
- Use `waitFor` for DOM updates
- Use `act` for state updates in hooks

### 4. Error Testing

- Test both success and error paths
- Test edge cases and boundary conditions
- Test validation errors

### 5. Test Data

- Use factories for test data creation
- Keep test data minimal and focused
- Use realistic but not production data

### 6. Test Maintenance

- Update tests when code changes
- Remove obsolete tests
- Refactor tests for clarity

### 7. Performance

- Keep tests fast (< 100ms per test)
- Use mocks instead of real services when possible
- Avoid unnecessary async operations

### 8. Documentation

- Add comments for complex test logic
- Document test data requirements
- Explain test scenarios in test names

---

## Common Patterns

### Testing Form Submissions

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = vi.fn()
  render(<Form onSubmit={onSubmit} />)
  
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } })
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
  
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Test' })
  })
})
```

### Testing API Calls

```typescript
it('should fetch and display data', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: [{ id: '1' }] }),
  } as Response)
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### Testing Error States

```typescript
it('should display error message when API call fails', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Test Coverage Action Plan](../test-coverage-action-plan.md)
- [Testing Strategy](./TESTING_STRATEGY.md)

---

## Changelog

- **2025-01-XX:** Initial testing standards document created
- **2025-01-XX:** Added service, component, and API route patterns
- **2025-01-XX:** Added mocking standards and templates
