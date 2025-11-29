# Next.js 16 Test Migration Guide

## Overview
This guide provides step-by-step instructions for migrating tests to be compatible with Next.js 16, based on the fixes applied to `app/api/tax/obligations/route.test.ts`.

## Successfully Fixed Example

The `app/api/tax/obligations/route.test.ts` file has been fully migrated and all 5 tests are passing. Use this as a reference.

## Key Changes Required

### 1. Service Class Mocking

**Problem**: Vitest 4.0+ requires proper class constructors in mocks.

**Before (Broken)**:
```typescript
vi.mock('@/lib/services/business/tax-service');
// In beforeEach:
mockTaxService = { getObligations: vi.fn() };
(TaxService as any).mockImplementation(() => mockTaxService);
```

**After (Fixed)**:
```typescript
const mockGetObligations = vi.fn();
const mockCreateObligation = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
  TaxService: class {
    getObligations = mockGetObligations;
    createObligation = mockCreateObligation;
  },
}));
```

### 2. withRLS Mock Pattern

**Standard Pattern**:
```typescript
const mockUserId = 'user-123';

vi.mock('@/lib/api/with-rls', () => ({
  withRLS: async (fn: any) => {
    return await fn(mockUserId);
  },
}));
```

### 3. Clerk Auth Mock Pattern

**Standard Pattern**:
```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: mockUserId }),
  currentUser: vi.fn().mockResolvedValue({
    id: mockUserId,
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
}));
```

### 4. Validation Schema Mocking

**For Zod Schemas**:
```typescript
vi.mock('@/lib/validation-schemas', async () => {
  const actual = await vi.importActual<typeof import('@/lib/validation-schemas')>('@/lib/validation-schemas');
  const { z } = await import('zod');
  return {
    ...actual,
    createTaxObligationSchema: {
      parse: vi.fn((data: any) => {
        // Validate required fields
        if (!data.name || !data.type || !data.amount || !data.dueDate || !data.year) {
          const error = new z.ZodError([
            {
              code: 'custom',
              path: ['name'],
              message: 'Validation failed',
            },
          ]);
          throw error;
        }
        return data;
      }),
    },
  };
});
```

## Routes Needing Migration

The following routes use `withRLS` and may need test updates:

1. ✅ `app/api/tax/obligations/route.ts` - **FIXED**
2. `app/api/tax/export/route.ts`
3. `app/api/tax/direct-file/exports/route.ts`
4. `app/api/tax/direct-file/exports/[id]/route.ts`
5. `app/api/tax/documents/route.ts`
6. `app/api/tax/deductions/route.ts`
7. `app/api/tax/summary/route.ts`
8. `app/api/tax/documents/[id]/route.ts`
9. `app/api/tax/deductions/[id]/route.ts`
10. `app/api/tax/obligations/[id]/payment/route.ts`
11. `app/api/tax/obligations/[id]/route.ts`
12. `app/api/invoices/route.ts`
13. `app/api/blog/stats/route.ts`
14. `app/api/blog/route.ts`
15. `app/api/blog/categories/route.ts`
16. `app/api/blog/[id]/route.ts`
17. `app/api/blog/[id]/publish/route.ts`

## Step-by-Step Migration Process

### Step 1: Identify Service Classes
```typescript
// Find what service classes the route uses
import { SomeService } from '@/lib/services/...';
const service = new SomeService();
```

### Step 2: Create Mock Functions
```typescript
// Create mock functions for each service method
const mockMethod1 = vi.fn();
const mockMethod2 = vi.fn();
```

### Step 3: Create Service Class Mock
```typescript
vi.mock('@/lib/services/some-service', () => ({
  SomeService: class {
    method1 = mockMethod1;
    method2 = mockMethod2;
  },
}));
```

### Step 4: Add Standard Mocks
```typescript
// Add withRLS mock
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: async (fn: any) => {
    return await fn('user-123');
  },
}));

// Add Clerk auth mock
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
  currentUser: vi.fn().mockResolvedValue({
    id: 'user-123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
}));
```

### Step 5: Update Test Code
```typescript
// Remove old mock service references
// OLD: mockService.method1.mockResolvedValue(...)
// NEW: mockMethod1.mockResolvedValue(...)

// Update expectations
// OLD: expect(mockService.method1).toHaveBeenCalledWith(...)
// NEW: expect(mockMethod1).toHaveBeenCalledWith(...)
```

### Step 6: Handle Validation (if needed)
```typescript
// If route uses validation schemas, add mock
vi.mock('@/lib/validation-schemas', async () => {
  // ... (see pattern above)
});
```

## Common Issues and Solutions

### Issue: "mockService is not a constructor"
**Solution**: Use class-based mock pattern (see Step 3)

### Issue: "vi.fn() mock did not use 'function' or 'class'"
**Solution**: Ensure the mock returns a proper class, not just a function

### Issue: Tests return 500 instead of expected status
**Solution**: Check that mock methods are properly set up and return values

### Issue: Validation errors return 500 instead of 400
**Solution**: Ensure validation mock throws `ZodError`, not generic `Error`

## Testing Your Migration

After migrating a test file:

```bash
# Run the specific test file
pnpm test path/to/route.test.ts

# Check for any remaining failures
pnpm test path/to/route.test.ts --reporter=verbose
```

## Best Practices

1. **Use consistent mock patterns** - Follow the patterns established in the tax obligations test
2. **Clear mocks in beforeEach** - Always call `vi.clearAllMocks()` in `beforeEach`
3. **Use descriptive mock names** - `mockGetObligations` is clearer than `mockMethod1`
4. **Test error cases** - Ensure validation errors return proper status codes
5. **Verify method calls** - Check that service methods are called with correct parameters

## Utilities Available

Use the utilities in `__tests__/utils/`:

- `nextjs16-test-helpers.ts` - Helper functions for Next.js 16 tests
- `test-mock-patterns.ts` - Reusable mock patterns

## Progress Tracking

- ✅ `app/api/tax/obligations/route.test.ts` - Complete (5/5 tests passing)
- ⏳ 17 more routes to migrate

---

**Last Updated**: November 8, 2025
**Reference**: `app/api/tax/obligations/route.test.ts` (fully working example)

