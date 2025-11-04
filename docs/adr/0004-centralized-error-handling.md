# ADR-0004: Centralized Error Handling

**Status**: Accepted  
**Date**: 2024-12-XX  
**Decision**: Use ApiErrorHandler for consistent error responses across all API routes

## Context

Prior to this decision, error handling across API routes was inconsistent. Different routes returned different error formats, making it difficult for:

- Frontend developers to handle errors consistently
- API consumers to understand error responses
- Debugging and monitoring systems to track errors
- Maintaining error handling logic (scattered across many files)

## Decision

We will implement a centralized error handling system using the `ApiErrorHandler` class that:

1. Provides consistent error response formats across all API endpoints
2. Handles different error types (validation, authentication, authorization, server errors)
3. Includes request IDs for tracing errors
4. Supports both development (with stack traces) and production (sanitized) error responses
5. Integrates with Zod validation errors
6. Provides helper methods for common HTTP status codes (400, 401, 403, 404, 500)

## Implementation

### ApiErrorHandler Class

The `ApiErrorHandler` is a static class located at `lib/api-error-handler.ts` that provides:

- `handle(error, requestId?)` - Main error handler that routes to appropriate error type
- `unauthorized(message?)` - 401 Unauthorized responses
- `forbidden(message?)` - 403 Forbidden responses
- `notFound(message?)` - 404 Not Found responses
- `validationError(error, requestId?)` - 400 Bad Request for Zod validation errors
- `serverError(message, stack?, requestId?)` - 500 Internal Server Error

### Error Response Format

All error responses follow this consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "unique-request-id"
  }
}
```

### Usage Pattern

All API route handlers should follow this pattern:

```typescript
export async function GET(request: Request) {
  const requestId = generateRequestId();
  try {
    // Route handler logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
```

## Consequences

### Positive

- **Consistency**: All API errors follow the same format
- **Maintainability**: Error handling logic is centralized
- **Debugging**: Request IDs make it easier to trace errors
- **Type Safety**: TypeScript ensures error handlers are used correctly
- **Developer Experience**: Clear, predictable error responses

### Negative

- **Initial Migration**: Existing routes need to be updated to use the new handler
- **Learning Curve**: Developers need to learn the new error handling patterns
- **Potential Over-Engineering**: Some simple routes might not need full error handling

## Implementation Status

- ✅ ApiErrorHandler class implemented
- ✅ Integrated with all API route handlers
- ✅ Request ID generation implemented
- ✅ Zod validation error integration
- ✅ Error logging and monitoring integration

## Related Documentation

- [Backend Architecture](../architecture/BACKEND_ARCHITECTURE.md) - Error handling patterns
- [API Documentation](../api/README.md) - API error response formats
- [Error Handling Refactoring Plan](../ERROR_HANDLING_REFACTORING_PLAN.md) - Migration details

## References

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [REST API Error Handling Best Practices](https://www.baeldung.com/rest-api-error-handling-best-practices)
