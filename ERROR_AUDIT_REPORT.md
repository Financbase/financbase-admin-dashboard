# API Error Handling Audit Report

**Date:** Generated during systematic audit  
**Scope:** All API routes in `app/api/**/*.ts`  
**Total Routes Analyzed:** 202 files

---

## Executive Summary

This audit identified significant inconsistencies in error handling across the API routes. While the codebase includes a standardized `ApiErrorHandler` utility (`lib/api-error-handler.ts`), **only 20 out of 202 routes (9.9%)** currently use it. The remaining **182 routes (90.1%)** implement manual error handling with inconsistent formats.

### Key Statistics

- **Total API Routes:** 202
- **Routes using ApiErrorHandler:** 20 (9.9%)
- **Routes with manual error handling:** 182 (90.1%)
- **Routes with 400/500 status codes:** 174 files (452 occurrences)
- **Routes with try-catch blocks:** 191 files (94.6%)
- **Routes handling ZodError manually:** 29 files (14.4%)
- **Routes using Response instead of NextResponse:** 1 file
- **Routes conditionally exposing error details:** 16 files

### Critical Issues

1. **Inconsistent Error Response Formats** - Multiple formats exist across routes
2. **Missing Standardization** - 90% of routes don't use the centralized error handler
3. **Security Concerns** - Some routes may expose sensitive error details
4. **Missing Error Handling** - Some routes lack proper try-catch blocks
5. **Inconsistent Validation Error Handling** - Mixed approaches to ZodError handling

---

## Error Handling Infrastructure

### Standard Implementation (`lib/api-error-handler.ts`)

The codebase includes a well-designed `ApiErrorHandler` class with the following features:

- Standardized error response format: `{ error: { code, message, timestamp, requestId?, ... } }`
- Methods for common scenarios:
  - `validationError()` - Returns 400 for Zod validation errors
  - `serverError()` - Returns 500 for internal errors
  - `badRequest()` - Returns 400 for bad requests
  - `databaseError()` - Returns 500 for database errors
  - `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `rateLimitExceeded()`
- `handle()` - Generic error handler that routes errors appropriately
- Utility functions: `withErrorHandling()`, `validateRequestBody()`, `generateRequestId()`
- Environment-aware error details (only in development)

### Current Usage

**Routes Using ApiErrorHandler Correctly (20 files):**

- `app/api/real-estate/**` (10 routes - all use ApiErrorHandler)
- `app/api/dashboard/ai-insights/route.ts`
- `app/api/invoices/route.ts` (uses withRLS wrapper)
- `app/api/clients/route.ts`
- `app/api/expenses/route.ts`
- `app/api/platform/hub/**` (5 routes)

---

## Categorization of Routes

### Category A: Using ApiErrorHandler Correctly ✅

**Count:** 20 routes (9.9%)

These routes properly import and use `ApiErrorHandler`, providing consistent error responses.

**Examples:**

- `app/api/clients/route.ts` - Uses `ApiErrorHandler.handle()` and `ApiErrorHandler.unauthorized()`
- `app/api/dashboard/ai-insights/route.ts` - Wraps handler in try-catch with `ApiErrorHandler.handle()`
- `app/api/real-estate/properties/route.ts` - Uses `ApiErrorHandler` with request IDs

**Pattern:**

```typescript
try {
  // ... route logic
} catch (error) {
  return ApiErrorHandler.handle(error);
}
```

---

### Category B: Manual Error Handling with Consistent Format ✅

**Count:** ~50 routes (24.8%)

These routes implement manual error handling but maintain a consistent error response format similar to ApiErrorHandler.

**Examples:**

- `app/api/marketing/automation/route.ts` - Consistent format with error codes
- `app/api/leads/route.ts` - Handles ZodError properly with consistent format
- `app/api/webhooks/route.ts` - Uses consistent error format

**Pattern:**

```typescript
catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Validation error', details: error.issues, code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  return NextResponse.json({ error: '...', code: '...' }, { status: 500 });
}
```

**Issues:**

- Missing timestamp in error responses
- Missing request ID tracking
- Inconsistent error code values
- Manual environment detection for error details

---

### Category C: Manual Error Handling with Inconsistent Format ⚠️

**Count:** ~132 routes (65.3%)

These routes use manual error handling with varying response formats, making API integration difficult.

**Examples:**

- `app/api/marketplace/revenue/route.ts` - Simple `{ error: '...' }` format
- `app/api/workflows/route.ts` - Basic error format without codes
- `app/api/webhooks/clerk/route.ts` - Inconsistent error structure

**Pattern Variations Found:**

1. **Simple format:**

```typescript
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

2. **With code:**

```typescript
return NextResponse.json({ error: '...', code: 'DATABASE_ERROR' }, { status: 500 });
```

3. **With details (development only):**

```typescript
return NextResponse.json({ 
  error: '...', 
  details: process.env.NODE_ENV === 'development' ? error.message : undefined 
}, { status: 500 });
```

4. **Complex nested structure:**

```typescript
return NextResponse.json({ 
  success: false,
  error: '...',
  message: '...',
  details: '...'
}, { status: 500 });
```

**Issues:**

- No standardized error structure
- Missing timestamps
- Missing request IDs
- Inconsistent error codes
- Some expose full error messages in production

---

### Category D: Missing or Incomplete Error Handling ❌

**Count:** ~11 routes (5.4%)

These routes have critical error handling gaps.

**Examples:**

- `app/api/invoices/route.ts` - Uses `withRLS` wrapper (which has error handling), but JSON parsing errors return 500 instead of 400
- `app/api/ai/financbase-gpt/route.ts` - Uses `Response` instead of `NextResponse`, exposes error.message in production

**Specific Issues:**

1. **JSON parsing errors return 500 instead of 400:**

```typescript
// withRLS wrapper DOES catch errors, but treats JSON parse errors as 500
// BAD: JSON parsing error becomes 500
return withRLS(async (userId) => {
  const body = await req.json(); // Throws SyntaxError if invalid JSON
  // ... process
});
// withRLS catch block returns ApiErrorHandler.handle() which returns 500 for SyntaxError

// GOOD: Should detect JSON parse errors specifically and return 400
// Note: This would require updating withRLS or handling JSON parsing separately
try {
  const body = await req.json();
} catch (error) {
  if (error instanceof SyntaxError || error.message.includes('JSON')) {
    return ApiErrorHandler.badRequest('Invalid JSON in request body');
  }
  throw error;
}
```

2. **Using Response instead of NextResponse:**

```typescript
// app/api/ai/financbase-gpt/route.ts
return new Response('Unauthorized', { status: 401 }); // Inconsistent with other routes
```

3. **Missing error handling for async operations:**
Some routes perform database operations or external API calls without comprehensive error handling.

---

## Specific 400 Error Issues

### Issue 1: Missing Validation Before Processing

**Severity:** High  
**Affected Routes:** ~30 routes

Some routes process data without validating it first, potentially causing 500 errors when validation should return 400.

**Example Problem:**

```typescript
// app/api/marketplace/revenue/route.ts
const body = await request.json();
const { developerId, period } = body; // No validation

if (!developerId || !period) {
  return NextResponse.json({ error: 'Developer ID and period required' }, { status: 400 });
}
// ... continues processing
```

**Better approach:**

```typescript
const validatedData = developerPayoutSchema.parse(body);
// Zod will throw ZodError if invalid, which should be caught and return 400
```

### Issue 2: Using 500 Instead of 400 for Validation Errors

**Severity:** Medium  
**Affected Routes:** ~15 routes

Some routes catch ZodError but still return 500 status codes, or catch validation errors in general catch blocks that return 500.

**Example:**

```typescript
// Some routes don't specifically check for ZodError before general error handler
catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: '...' }, { status: 500 }); // Should be 400 for ZodError
}
```

### Issue 3: Inconsistent 400 Response Formats

**Severity:** Low  
**Affected Routes:** ~120 routes

400 errors use various formats:

- `{ error: '...' }`
- `{ error: '...', code: 'VALIDATION_ERROR' }`
- `{ error: { code: '...', message: '...', details: [...] } }`

---

## Specific 500 Error Issues

### Issue 1: Exposing Error Details in Production

**Severity:** High (Security Risk)  
**Affected Routes:** ~8 routes

Some routes expose detailed error information including stack traces or database error messages in production.

**Problematic Examples:**

```typescript
// app/api/marketplace/revenue/route.ts
return NextResponse.json({ 
  error: error instanceof Error ? error.message : 'Internal server error' 
}, { status: 500 });
// This exposes error messages that may contain sensitive information
```

**Correct approach:**

```typescript
return ApiErrorHandler.serverError(
  'Failed to process request',
  process.env.NODE_ENV === 'development' ? error.stack : undefined
);
```

### Issue 2: Missing Error Logging

**Severity:** Medium  
**Affected Routes:** ~40 routes

Some routes return 500 errors but don't log the error details, making debugging difficult.

**Example:**

```typescript
catch (error) {
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  // No console.error() - error details lost
}
```

### Issue 3: Missing try-catch Blocks

**Severity:** High  
**Affected Routes:** ~11 routes

Some routes lack comprehensive try-catch blocks, especially around:

- JSON parsing (`await request.json()`)
- Database operations
- External API calls

**Critical Routes:**

- `app/api/invoices/route.ts` - JSON parsing not wrapped in try-catch
- Several routes using `withRLS` wrapper without additional error handling

### Issue 4: Generic Error Messages

**Severity:** Low  
**Affected Routes:** ~90 routes

Many routes return generic "Internal server error" messages without distinguishing between different error types (database errors, validation errors, external service errors, etc.).

---

## Detailed Findings by Route Category

### High-Priority Routes (Most Used)

#### `/api/leads` Routes

**Files:**

- `app/api/leads/route.ts`
- `app/api/leads/[id]/route.ts`
- `app/api/leads/activities/route.ts`
- `app/api/leads/pipeline/route.ts`
- `app/api/leads/stats/route.ts`

**Status:** Category B (Manual, but consistent)

**Issues:**

- Manual ZodError handling (could use `ApiErrorHandler.validationError()`)
- Consistent error format but missing timestamps and request IDs
- Proper environment-based error detail exposure

**Recommendation:** Migrate to `ApiErrorHandler`

---

#### `/api/workflows` Routes

**Files:**

- `app/api/workflows/route.ts`
- `app/api/workflows/[id]/route.ts`
- `app/api/workflows/[id]/execute/route.ts`
- `app/api/workflows/[id]/executions/route.ts`
- `app/api/workflows/templates/route.ts`

**Status:** Category C (Manual, inconsistent)

**Issues:**

- Simple `{ error: '...' }` format
- Missing error codes
- Missing timestamps
- Generic error messages

**Recommendation:** High priority - migrate to `ApiErrorHandler`

---

#### `/api/marketplace` Routes

**Files:**

- `app/api/marketplace/plugins/route.ts`
- `app/api/marketplace/revenue/route.ts`
- `app/api/marketplace/stats/route.ts`
- `app/api/marketplace/plugins/[id]/*` (multiple)

**Status:** Category C (Manual, inconsistent)

**Issues:**

- Inconsistent error formats across routes
- Some routes expose error messages in production
- Missing proper validation error handling

**Recommendation:** High priority - standardize error handling

---

#### `/api/integrations` Routes

**Files:**

- `app/api/integrations/route.ts`
- `app/api/integrations/connections/route.ts`
- `app/api/integrations/connections/[id]/*` (multiple)
- `app/api/integrations/oauth/**` (multiple)

**Status:** Mixed (Category B and C)

**Issues:**

- Some routes have good error handling, others are inconsistent
- Database connection errors handled inconsistently
- Missing request IDs

**Recommendation:** Medium priority - standardize across all integration routes

---

### Real Estate Routes (Reference Implementation)

**Status:** Category A ✅ (Using ApiErrorHandler correctly)

**Files:** All 10 real-estate routes use `ApiErrorHandler` with request IDs.

**Best Practices Observed:**

- Consistent error format
- Request ID generation
- Proper ZodError handling
- Environment-aware error details

**Recommendation:** Use as reference for migrating other routes

---

## Recommendations

### Priority 1: Critical Issues (Fix Immediately)

1. **Fix routes exposing error details in production**
   - `app/api/marketplace/revenue/route.ts`
   - `app/api/ai/financbase-gpt/route.ts`
   - `app/api/workflows/[id]/execute/route.ts` (partial exposure)

2. **Improve JSON parsing error handling**
   - Routes should return 400 for JSON parsing errors (SyntaxError), not 500
   - `app/api/invoices/route.ts` - withRLS catches JSON errors but returns 500
   - Routes using `withRLS` that parse JSON - should detect JSON parse errors specifically
   - Any route with `await request.json()` - should distinguish JSON errors from other errors

3. **Standardize Response type**
   - `app/api/ai/financbase-gpt/route.ts` - Use `NextResponse` instead of `Response`

---

### Priority 2: High Priority (Fix This Sprint)

1. **Migrate high-traffic routes to ApiErrorHandler**
   - `/api/workflows/**` (5 routes)
   - `/api/marketplace/**` (10+ routes)
   - `/api/integrations/**` (15+ routes)
   - `/api/webhooks/**` (10+ routes)

2. **Standardize validation error handling**
   - Ensure all ZodError instances return 400 status
   - Use `ApiErrorHandler.validationError()` consistently

3. **Add error logging**
   - Add `console.error()` in all catch blocks for debugging
   - Consider structured logging (request IDs, error types)

---

### Priority 3: Medium Priority (Fix This Month)

1. **Migrate remaining routes to ApiErrorHandler**
   - Create migration plan for 180+ routes
   - Batch by feature area for easier testing

2. **Add request ID tracking**
   - Generate request IDs in all routes
   - Include in error responses for traceability

3. **Improve error categorization**
   - Distinguish between database errors, validation errors, external service errors
   - Use appropriate error codes consistently

---

### Priority 4: Low Priority (Technical Debt)

1. **Create error handling guidelines**
   - Document best practices
   - Add to code review checklist

2. **Add automated tests for error scenarios**
   - Test 400 responses for invalid input
   - Test 500 responses for internal errors
   - Verify error response formats

3. **Consider error monitoring integration**
   - Add Sentry or similar for error tracking
   - Include request IDs in error reports

---

## Migration Guide

### Step 1: Import ApiErrorHandler

```typescript
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
```

### Step 2: Generate Request ID (Optional but Recommended)

```typescript
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  // ... use requestId in error handlers
}
```

### Step 3: Wrap Route Logic in Try-Catch

```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    // ... route logic
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
```

### Step 4: Handle Validation Errors

```typescript
// Option 1: Use validateRequestBody utility
import { validateRequestBody } from '@/lib/api-error-handler';

const validatedData = validateRequestBody(body, createSchema);

// Option 2: Manual handling (if needed)
try {
  const validatedData = schema.parse(body);
} catch (error) {
  if (error instanceof ZodError) {
    return ApiErrorHandler.validationError(error, requestId);
  }
  throw error; // Let ApiErrorHandler.handle() catch it
}
```

### Step 5: Use Specific Error Methods When Appropriate

```typescript
// For database errors
catch (error) {
  if (isDatabaseError(error)) {
    return ApiErrorHandler.databaseError(error, requestId);
  }
  return ApiErrorHandler.handle(error, requestId);
}

// For specific business logic errors
if (!resource) {
  return ApiErrorHandler.notFound('Resource not found');
}
```

---

## Code Examples

### Before (Manual Error Handling)

```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    // ... create resource
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### After (Using ApiErrorHandler)

```typescript
import { ApiErrorHandler, generateRequestId, validateRequestBody } from '@/lib/api-error-handler';
import { createResourceSchema } from '@/lib/validation-schemas';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized('Authentication required', requestId);
    }

    const body = await request.json();
    const validatedData = validateRequestBody(body, createResourceSchema);

    // ... create resource with validatedData
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
```

### Benefits of Migration

1. **Consistent Error Format** - All errors follow the same structure
2. **Automatic ZodError Handling** - Validation errors automatically return 400
3. **Request ID Tracking** - Better debugging and traceability
4. **Environment-Aware** - Error details only in development
5. **Type Safety** - TypeScript support for error codes
6. **Less Boilerplate** - Reduced code duplication

---

## Testing Recommendations

### Unit Tests for Error Handling

```typescript
describe('POST /api/resource', () => {
  it('should return 400 for invalid input', async () => {
    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
  });

  it('should return 500 for internal errors', async () => {
    // Mock database error
    const response = await POST(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.error.message).not.toContain('sensitive');
  });
});
```

### Integration Tests

- Test all error paths return expected status codes
- Verify error response format consistency
- Test request ID generation and inclusion
- Verify environment-based error detail exposure

---

## Conclusion

The audit reveals a critical need for error handling standardization. While the infrastructure exists (`ApiErrorHandler`), it's underutilized. Migrating routes to use `ApiErrorHandler` will:

1. Improve API consistency and developer experience
2. Enhance security by preventing information leakage
3. Simplify debugging with request ID tracking
4. Reduce code duplication and maintenance burden
5. Make error handling more maintainable

**Recommended Action Plan:**

1. Fix critical security issues (Priority 1) - 1-2 days
2. Migrate high-traffic routes (Priority 2) - 1 week
3. Migrate remaining routes (Priority 3) - 2-3 weeks
4. Establish guidelines and testing (Priority 4) - Ongoing

**Estimated Total Effort:** 3-4 weeks for complete migration

---

## Appendix: Route Categorization

### Category A Routes (20)

- All `app/api/real-estate/**` routes (10)
- `app/api/dashboard/ai-insights/route.ts`
- `app/api/invoices/route.ts`
- `app/api/clients/route.ts`
- `app/api/expenses/route.ts`
- `app/api/platform/hub/**` routes (5)

### Category B Routes (~50)

- `app/api/leads/**` routes
- `app/api/marketing/automation/route.ts`
- `app/api/webhooks/route.ts`
- Various routes with consistent manual error handling

### Category C Routes (~132)

- `app/api/workflows/**` routes
- `app/api/marketplace/**` routes
- `app/api/integrations/**` routes (partial)
- Most other routes with inconsistent error handling

### Category D Routes (~11)

- `app/api/invoices/route.ts` (POST method - JSON parsing errors return 500 instead of 400)
- `app/api/ai/financbase-gpt/route.ts` (uses Response, exposes error.message in production)
- Routes with missing comprehensive error handling or incorrect status codes for specific error types

---

**Report Generated:** Comprehensive audit of 202 API routes  
**Next Review:** After Priority 1 and 2 fixes completed
