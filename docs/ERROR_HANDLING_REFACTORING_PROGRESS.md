# Error Handling Refactoring Progress

**Last Updated**: 2025-01-XX  
**Status**: Infrastructure Complete, Refactoring In Progress

## Summary

This document tracks the progress of standardizing error handling across all API routes to use the centralized `ApiErrorHandler`.

## Completed Work ✅

### Phase 1: Environment Variable Validation
- ✅ Created `lib/env.ts` with Zod-based validation
- ✅ Integrated validation into `instrumentation.ts` for startup validation
- ✅ Provides type-safe access to environment variables

### Phase 2: Console Statement Replacement
- ✅ Replaced console statements in critical files:
  - `lib/middleware/ai-decision-logger.ts`
  - `lib/monitoring/tracing.ts`
  - `lib/services/email-service.ts`
  - `lib/services/workflow-engine.ts`
  - `lib/services/business/financbase-gpt-service.ts`
  - `lib/services/white-label-service.ts`
  - `lib/services/business/folder-sharing.service.ts`
  - `instrumentation.ts`

### Phase 3: Error Handling Standardization

#### Infrastructure
- ✅ Updated `lib/api/with-rls.ts` to use `ApiErrorHandler` consistently
- ✅ Created `scripts/refactor-api-error-handling.ts` audit script
- ✅ Created ESLint rule (`eslint-plugin-api-error-handler.js`) to prevent regression
- ✅ Updated test template with error response validation
- ✅ Created `__tests__/api/error-response-helpers.ts` utility functions

#### Refactored Routes (Examples)
- ✅ `app/api/docs/route.ts`
- ✅ `app/api/direct-file/[...path]/route.ts`
- ✅ `app/api/direct-file/state-api/[...path]/route.ts`
- ✅ `app/api/accounts/stats/route.ts`
- ✅ `app/api/webhooks/clerk/route.ts`
- ✅ `app/api/bills/attention/route.ts`
- ✅ `app/api/clients/stats/route.ts`
- ✅ `app/api/campaigns/stats/route.ts`
- ✅ `app/api/campaigns/performance/route.ts`

## Audit Results

**Total API Routes**: 407

- ✅ **Using ApiErrorHandler**: 332 routes (81.6%)
- 🔧 **Category B (Manual Status Codes)**: 74 routes (18.2%) - **Needs Refactoring**
- ⚠️ **No Error Handling**: 1 route (0.2%) - `app/api/uploadthing/route.ts` (uses uploadthing's internal error handling)

## Remaining Work

### Category B Routes (74 routes)
Routes with manual status code responses that need to be refactored to use `ApiErrorHandler` methods.

**Common Patterns to Replace:**
- `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` → `ApiErrorHandler.unauthorized()`
- `NextResponse.json({ error: 'Bad Request' }, { status: 400 })` → `ApiErrorHandler.badRequest()`
- `NextResponse.json({ error: 'Not Found' }, { status: 404 })` → `ApiErrorHandler.notFound()`
- `NextResponse.json({ error: 'Server Error' }, { status: 500 })` → `ApiErrorHandler.handle(error)`

**Example Refactoring:**
```typescript
// Before
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
catch (error) {
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}

// After
import { ApiErrorHandler } from '@/lib/api-error-handler';

if (!userId) {
  return ApiErrorHandler.unauthorized();
}
catch (error) {
  return ApiErrorHandler.handle(error);
}
```

### Category C Routes (Zod Validation)
Routes that manually handle `ZodError` should use `ApiErrorHandler.validationError()`.

### Category D Routes (Complex Error Handling)
Routes with custom error logic may need manual review and careful refactoring.

## Tools Available

### 1. Audit Script
```bash
npx tsx scripts/refactor-api-error-handling.ts
```
Generates `api-error-handling-audit.json` with detailed categorization.

### 2. ESLint Rule
The custom ESLint rule (`eslint-plugin-api-error-handler.js`) will warn when:
- API routes use manual error responses instead of `ApiErrorHandler`
- API routes are missing `ApiErrorHandler` import

### 3. Test Helpers
Use `__tests__/api/error-response-helpers.ts` to validate error response formats:
```typescript
import { validateUnauthorizedResponse, validateErrorResponse } from '@/__tests__/api/error-response-helpers';

// In your test
const response = await GET(request);
await validateUnauthorizedResponse(response);
```

## Next Steps

1. **Systematically refactor Category B routes** (74 routes)
   - Start with routes that have simple patterns (401, 500)
   - Use find-and-replace patterns where possible
   - Test each refactored route

2. **Refactor Category C routes** (Zod validation)
   - Replace manual ZodError handling with `ApiErrorHandler.validationError()`

3. **Review Category D routes** (complex error handling)
   - Manual review required
   - Ensure business logic is preserved

4. **Run integration tests**
   - Verify all refactored routes work correctly
   - Ensure error responses are consistent

## Success Criteria

- ✅ All required env vars validated on startup
- ✅ Zero `console.*` statements in production code (except tests)
- 🔄 100% of API routes use `ApiErrorHandler` (currently 81.6%)
- ✅ Consistent error response format across all routes
- ✅ ESLint rule preventing regression
- ✅ Test helpers for error response validation

## Notes

- The `uploadthing/route.ts` file is excluded as it uses uploadthing's internal error handling
- Some routes may have legitimate reasons for custom error handling (e.g., webhooks, proxies)
- All refactored routes should be tested to ensure functionality is preserved

