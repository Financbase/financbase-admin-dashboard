# Test Fixes Guide - Next.js 16 & React 19 Compatibility

## Overview
This guide documents the fixes applied for Next.js 16 and React 19 compatibility, as well as improvements to test infrastructure.

## Changes Made

### 1. Created Test Utilities (`__tests__/utils/nextjs16-test-helpers.ts`)

Reusable utilities for Next.js 16 compatible tests:

- **`mockWithRLS(mockUserId)`**: Standard mock for `withRLS` wrapper
- **`mockClerkAuth(mockUserId)`**: Standard mock for Clerk authentication
- **`StandardApiResponse<T>`**: Type definition for consistent API responses
- **`createSuccessResponse()`**: Helper to create standard success responses
- **`createErrorResponse()`**: Helper to create standard error responses

### 2. Created Standard API Response Utility (`lib/api/standard-response.ts`)

Provides consistent response formatting across all API routes:

```typescript
import { createSuccessResponse, createErrorResponse } from '@/lib/api/standard-response';

// Success response
return createSuccessResponse(data, 200, { requestId, pagination });

// Error response (prefer ApiErrorHandler for errors)
return createErrorResponse('ERROR_CODE', 'Message', 400, requestId);
```

### 3. Created Missing Email Service (`lib/services/email-service.ts`)

The email service was referenced in tests but didn't exist. Created with:

- `sendEmail(options)`: Send emails using Resend
- `sendTemplateEmail(templateId, to, data)`: Placeholder for template emails

### 4. Fixed Test Mocks

#### withRLS Mock Pattern
**Before:**
```typescript
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: (fn: any) => async (userId: string) => {
    return await fn(userId);
  },
}));
```

**After:**
```typescript
import { mockWithRLS } from '@/__tests__/utils/nextjs16-test-helpers';
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: mockWithRLS('user-123'),
}));
```

#### Clerk Auth Mock Pattern
**Before:**
```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'user-123' }),
}));
```

**After:**
```typescript
import { mockClerkAuth } from '@/__tests__/utils/nextjs16-test-helpers';
vi.mock('@clerk/nextjs/server', () => mockClerkAuth('user-123'));
```

## API Response Format Standardization

### Current State
API routes have inconsistent response formats:
- Some return `{ success: true, data: ... }`
- Some return data directly
- Some return custom formats

### Target Format
All API routes should use the standard format:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
  requestId?: string;
}
```

### Migration Steps

1. **For new routes**: Use `createSuccessResponse()` from `standard-response.ts`
2. **For existing routes**: Gradually migrate to standard format
3. **For errors**: Use `ApiErrorHandler` which already follows the standard format

## Test Fixes Applied

### Fixed Tests
- ✅ `app/api/tax/obligations/route.test.ts` - Updated mocks for Next.js 16
- ✅ `__tests__/app/api/workflows/route.test.ts` - Fixed response expectations

### Remaining Issues

#### Pre-existing Test Issues (Separate PR)
- Missing service modules (some may need creation)
- Incorrect mock implementations for services
- API response format mismatches
- Missing service method implementations

#### Next.js 16 Compatibility (In Progress)
- More routes using `withRLS` need test updates
- Auth mocks need standardization
- Response handling verification

## Best Practices

### 1. Use Test Utilities
Always use the test utilities from `nextjs16-test-helpers.ts`:

```typescript
import { mockWithRLS, mockClerkAuth } from '@/__tests__/utils/nextjs16-test-helpers';

const mockUserId = 'user-123';
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: mockWithRLS(mockUserId),
}));
vi.mock('@clerk/nextjs/server', () => mockClerkAuth(mockUserId));
```

### 2. Standardize API Responses
Use the standard response format for consistency:

```typescript
import { createSuccessResponse } from '@/lib/api/standard-response';

return createSuccessResponse(data, 200, { requestId });
```

### 3. Error Handling
Use `ApiErrorHandler` for errors (already follows standard format):

```typescript
import { ApiErrorHandler } from '@/lib/api-error-handler';

return ApiErrorHandler.badRequest('Invalid input');
```

### 4. Test Expectations
Update test expectations to match actual route responses:

```typescript
// If route returns standard format
expect(data.success).toBe(true);
expect(data.data).toBeDefined();

// If route returns data directly
expect(Array.isArray(data)).toBe(true);
```

## Next Steps

1. **Continue fixing Next.js 16 compatibility**
   - Update remaining routes using `withRLS`
   - Standardize auth mocks across all tests

2. **Standardize API response formats**
   - Migrate routes to use `standard-response.ts`
   - Update tests to match new formats

3. **Fix pre-existing test issues**
   - Create missing service modules
   - Fix mock implementations
   - Update service method mocks

4. **Documentation**
   - Update API documentation with standard response format
   - Create migration guide for existing routes

---

**Last Updated**: November 8, 2025
**Related Documents**:
- `docs/TEST_FAILURES_ANALYSIS.md` - Detailed failure analysis
- `docs/DEPENDENCY_UPDATE_GUIDE.md` - Dependency update guide

