# ADR-0004: Centralized Error Handling with ApiErrorHandler

**Status**: Accepted  
**Date**: 2024-01-XX  
**Deciders**: Development Team  
**Tags**: architecture, error-handling, api, consistency

## Context

The Financbase Admin Dashboard has 200+ API routes that handle various operations. During codebase analysis, we discovered:

- **90% of routes (182/202)** use manual error handling with inconsistent formats
- **Only 10% of routes (20/202)** use the existing `ApiErrorHandler` utility
- Multiple error response formats across routes
- Security concerns: Some routes may expose sensitive error details
- Difficult debugging: Inconsistent error logging and tracking

This inconsistency makes it difficult to:
- Debug issues across the application
- Maintain consistent error responses for API clients
- Ensure security best practices (not exposing sensitive information)
- Implement centralized error logging and monitoring

## Decision

We will **standardize all API routes to use `ApiErrorHandler` from `lib/api-error-handler.ts`** for consistent error handling across the entire application.

All API route handlers should:
1. Wrap logic in try-catch blocks
2. Use `ApiErrorHandler.handle(error)` for error responses
3. Use specific error handlers (e.g., `ApiErrorHandler.validationError()`, `ApiErrorHandler.unauthorized()`) when appropriate
4. Include request IDs for error tracking

## Rationale

Centralized error handling provides:

1. **Consistency**: All API responses follow the same error format
2. **Security**: Environment-aware error details (only in development)
3. **Maintainability**: Single source of truth for error handling logic
4. **Debugging**: Request IDs enable tracing errors across systems
5. **Monitoring**: Easier to aggregate and analyze error patterns
6. **Developer Experience**: Simple API for common error scenarios

The existing `ApiErrorHandler` already implements these patterns, so we're standardizing on the existing solution rather than creating a new one.

## Alternatives Considered

### Alternative 1: Keep Current Manual Error Handling
- **Pros**: No refactoring needed
- **Cons**: Inconsistent error formats, security risks, difficult maintenance
- **Why not chosen**: Does not solve the problem

### Alternative 2: Create New Error Handling Library
- **Pros**: Could design from scratch
- **Cons**: Unnecessary duplication, `ApiErrorHandler` already exists and works well
- **Why not chosen**: Existing solution is sufficient

### Alternative 3: Use Next.js Error Boundaries
- **Pros**: Framework-native solution
- **Cons**: Error boundaries are for React components, not API routes
- **Why not chosen**: Not applicable to API routes

## Consequences

### Positive
- **Consistency**: All API errors follow the same format
- **Security**: Sensitive error details only in development mode
- **Maintainability**: Single place to update error handling logic
- **Debugging**: Request IDs enable better error tracking
- **Monitoring**: Easier to aggregate errors for analysis
- **Developer Experience**: Simple, consistent API for error handling

### Negative
- **Refactoring effort**: 182 routes need to be updated
- **Migration risk**: Need to ensure all error paths are covered
- **Testing**: Must verify all routes handle errors correctly after refactoring
- **Time investment**: Estimated 1-2 weeks for complete migration

**Mitigation**:
- Gradual migration: Update routes incrementally
- Comprehensive testing: Add tests for error scenarios
- Code review: Ensure all routes are updated correctly

## Implementation Notes

### Migration Strategy

1. **Phase 1: Audit** (Completed)
   - Document all routes not using `ApiErrorHandler`
   - Identify error handling patterns

2. **Phase 2: High-Priority Routes** (In Progress)
   - Update critical routes (auth, payments, financial data)
   - Add comprehensive error tests

3. **Phase 3: Standard Routes**
   - Update remaining API routes
   - Verify error handling in all scenarios

4. **Phase 4: Validation**
   - Run full test suite
   - Manual testing of error scenarios
   - Code review

### Error Handler Usage Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
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

### Specific Error Handlers

```typescript
// Validation errors
if (error instanceof ZodError) {
  return ApiErrorHandler.validationError(error);
}

// Authentication errors
if (!userId) {
  return ApiErrorHandler.unauthorized('Authentication required');
}

// Not found errors
if (!resource) {
  return ApiErrorHandler.notFound('Resource not found');
}
```

## References

- [Error Audit Report](../../ERROR_AUDIT_REPORT.md)
- [ApiErrorHandler Implementation](../../lib/api-error-handler.ts)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
