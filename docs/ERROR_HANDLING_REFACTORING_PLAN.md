# Error Handling Standardization - Refactoring Plan

**Status**: In Progress  
**Created**: 2024-01-XX  
**Priority**: High (P1)  
**Estimated Effort**: 1-2 weeks

## Executive Summary

This document outlines the plan to standardize error handling across all 202 API routes in the Financbase Admin Dashboard. Currently, only 20 routes (10%) use the centralized `ApiErrorHandler`, while 182 routes (90%) implement manual error handling with inconsistent formats.

## Current State

### Statistics
- **Total API Routes**: 202
- **Routes using ApiErrorHandler**: 20 (9.9%)
- **Routes with manual error handling**: 182 (90.1%)
- **Routes with inconsistent error formats**: ~150 (estimated)

### Current Patterns

#### Pattern 1: Using ApiErrorHandler (✅ Correct)
```typescript
// app/api/clients/route.ts
import { ApiErrorHandler } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }
    // ... logic
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
```

#### Pattern 2: Manual Error Handling (❌ Needs Refactoring)
```typescript
// app/api/accounts/route.ts
export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
```

#### Pattern 3: Inconsistent Format (❌ Needs Refactoring)
```typescript
// app/api/invoices/route.ts
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Refactoring Strategy

### Phase 1: Preparation (Day 1)

#### 1.1 Audit and Categorize
- [ ] Create list of all 202 API routes
- [ ] Categorize routes by error handling pattern
- [ ] Identify routes with complex error handling
- [ ] Document special cases (webhooks, file uploads, etc.)

#### 1.2 Create Test Suite
- [ ] Write tests for error scenarios for each route category
- [ ] Test validation errors (400)
- [ ] Test authentication errors (401)
- [ ] Test authorization errors (403)
- [ ] Test not found errors (404)
- [ ] Test server errors (500)

#### 1.3 Set Up Monitoring
- [ ] Add logging for error handling patterns
- [ ] Track error response formats
- [ ] Monitor for inconsistencies

### Phase 2: Core Routes (Days 2-4)

#### 2.1 High-Priority Routes
Refactor critical routes first:
- [ ] Authentication routes (`/api/auth/*`)
- [ ] Payment processing (`/api/payments/*`, `/api/invoices/*`)
- [ ] Financial data (`/api/transactions/*`, `/api/accounts/*`)
- [ ] User data (`/api/users/*`, `/api/clients/*`)

**Target**: 40-50 routes

#### 2.2 Standard CRUD Routes
- [ ] Accounts (`/api/accounts/*`)
- [ ] Transactions (`/api/transactions/*`)
- [ ] Invoices (`/api/invoices/*`)
- [ ] Expenses (`/api/expenses/*`)
- [ ] Projects (`/api/projects/*`)
- [ ] Time entries (`/api/time-entries/*`)

**Target**: 60-80 routes

### Phase 3: Feature Routes (Days 5-7)

#### 3.1 Business Logic Routes
- [ ] Workflows (`/api/workflows/*`)
- [ ] Webhooks (`/api/webhooks/*`)
- [ ] Integrations (`/api/integrations/*`)
- [ ] Marketplace (`/api/marketplace/*`)
- [ ] Analytics (`/api/analytics/*`)

**Target**: 40-50 routes

#### 3.2 Supporting Routes
- [ ] Dashboard (`/api/dashboard/*`)
- [ ] Settings (`/api/settings/*`)
- [ ] Notifications (`/api/notifications/*`)
- [ ] AI features (`/api/ai/*`)
- [ ] Real estate (`/api/real-estate/*`)

**Target**: 30-40 routes

### Phase 4: Special Cases (Days 8-10)

#### 4.1 Webhook Routes
- [ ] Clerk webhook (`/api/webhooks/clerk`)
- [ ] Stripe webhook (if applicable)
- [ ] Custom webhooks

#### 4.2 File Upload Routes
- [ ] UploadThing routes
- [ ] Document processing routes

#### 4.3 Public Routes
- [ ] Health check (`/api/health`)
- [ ] Public API endpoints

**Target**: 10-20 routes

### Phase 5: Validation and Cleanup (Days 11-14)

#### 5.1 Testing
- [ ] Run full test suite
- [ ] Manual testing of error scenarios
- [ ] Verify error response formats
- [ ] Check error logging

#### 5.2 Code Review
- [ ] Review all refactored routes
- [ ] Verify consistent error handling
- [ ] Check for edge cases

#### 5.3 Documentation
- [ ] Update API documentation
- [ ] Document error codes
- [ ] Update runbooks
- [ ] Update ADR-0004

## Refactoring Template

### Before (Manual Error Handling)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // ... business logic

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### After (Using ApiErrorHandler)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { z } from 'zod';

const querySchema = z.object({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      id: searchParams.get('id'),
    });

    // ... business logic

    return NextResponse.json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
```

## Error Handling Checklist

For each route, ensure:

- [ ] Authentication checks use `ApiErrorHandler.unauthorized()`
- [ ] Authorization checks use `ApiErrorHandler.forbidden()`
- [ ] Validation errors use `ApiErrorHandler.validationError()` or `ApiErrorHandler.handle(ZodError)`
- [ ] Not found errors use `ApiErrorHandler.notFound()`
- [ ] Database errors use `ApiErrorHandler.databaseError()`
- [ ] All other errors use `ApiErrorHandler.handle(error)`
- [ ] Request IDs are generated and included (optional but recommended)
- [ ] Error logging is consistent
- [ ] Error responses follow standard format

## Error Response Format

All errors must follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

### Error Codes

- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `BAD_REQUEST` (400): Malformed request
- `CONFLICT` (409): Resource conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `DATABASE_ERROR` (500): Database operation failed
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Testing Strategy

### Unit Tests
```typescript
describe('GET /api/accounts', () => {
  it('should return 401 when not authenticated', async () => {
    const response = await fetch('/api/accounts');
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return validation error for invalid input', async () => {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Integration Tests
- Test error scenarios end-to-end
- Verify error response format
- Check error logging

## Success Metrics

- [ ] **100% routes** using `ApiErrorHandler`
- [ ] **100% error responses** follow standard format
- [ ] **0 inconsistent** error handling patterns
- [ ] **All tests passing** for error scenarios
- [ ] **Code coverage** for error handling > 80%

## Risk Mitigation

### Risks
1. **Breaking Changes**: Changing error formats might break clients
2. **Missing Edge Cases**: Some routes might have special error handling needs
3. **Testing Coverage**: Difficult to test all error scenarios

### Mitigation
1. **Version API**: Use API versioning to introduce breaking changes
2. **Gradual Rollout**: Refactor routes incrementally
3. **Comprehensive Testing**: Add tests before and after refactoring
4. **Monitoring**: Monitor error rates and formats during rollout

## Progress Tracking

### Routes by Category

#### ✅ Completed (20 routes)
- Real Estate routes (10)
- Clients route
- Dashboard AI insights
- Platform hub routes (5)
- Invoices route
- Expenses route

#### 🔄 In Progress (0 routes)

#### ⏳ Pending (182 routes)
- Accounts (5)
- Transactions (5)
- Invoices (5)
- Expenses (5)
- Projects (10)
- Time entries (5)
- Payments (5)
- Workflows (10)
- Webhooks (5)
- Integrations (10)
- Marketplace (10)
- Analytics (10)
- AI features (5)
- Dashboard (10)
- Settings (5)
- Notifications (5)
- Onboarding (3)
- Marketing (10)
- Leads (5)
- Others (50+)

## Next Steps

1. **Start with Phase 1**: Complete audit and test suite setup
2. **Begin Phase 2**: Refactor high-priority routes
3. **Monitor Progress**: Track refactoring progress daily
4. **Review and Adjust**: Adjust plan based on learnings

## Related Documentation

- [ApiErrorHandler Implementation](../../lib/api-error-handler.ts)
- [Error Audit Report](../../ERROR_AUDIT_REPORT.md)
- [ADR-0004: Centralized Error Handling](../adr/0004-centralized-error-handling.md)
- [API Documentation](../api/README.md)
