# Pre-existing Test Issues - Separate PR

## Overview
This document catalogs pre-existing test issues that are not related to Next.js 16/React 19 dependency updates. These should be addressed in a separate PR to keep concerns separated.

## Categories

### 1. Missing Service Modules

#### Email Service
- ✅ **FIXED**: Created `lib/services/email-service.ts`
- Tests were referencing `@/lib/services/email-service` which didn't exist
- Service now provides `sendEmail()` and `sendTemplateEmail()` methods

#### Other Missing Services
- Check for other missing service references in test files
- Create services or fix import paths as needed

### 2. Mock Service Constructor Issues

**Pattern**: `TypeError: () => mockServiceInstance is not a constructor`

**Affected Tests**:
- `__tests__/integration/workflow-execution.test.ts`
- `__tests__/api/rate-limits-api.test.ts`

**Solution Pattern**:
```typescript
// Use class-based mocks
vi.mock('@/lib/services/some-service', () => ({
  SomeService: class {
    method1 = vi.fn();
    method2 = vi.fn();
  },
}));
```

### 3. Missing Service Methods

**Pattern**: `TypeError: service.method is not a function`

**Affected Services**:
- `WorkflowEngine` - Missing: `executeWorkflow`, `testWorkflow`, `executeStepsParallel`, `evaluateCondition`, `interpolateVariables`
- `WebhookService` - Missing: `createWebhook`, `deliverEvent`, `testWebhook`, `retryDelivery`, `generateSignature`, `verifySignature`
- `MetricsCollector` - Missing: `recordMetric`, `recordBusinessMetric`, `recordSystemMetric`, `getMetrics`, `getMetricStats`, `recordEvent`, `getEventAnalytics`
- `IntegrationSyncEngine` - Missing: `syncIntegration`, `mapData`, `transformData`, `retrySync`, `getSyncStatus`, `scheduleSync`

**Action Required**:
1. Verify if methods exist in actual service implementations
2. If missing, either:
   - Implement missing methods in services
   - Update tests to match actual service API
   - Remove tests for unimplemented features

### 4. API Response Format Mismatches

**Issue**: Tests expect standardized format but routes return different formats

**Examples**:
- GET `/api/workflows` returns array directly, test expects `{ success: true, workflows: [...] }`
- POST `/api/workflows` returns workflow object, test expects `{ success: true, workflowId: ... }`

**Decision Needed**:
- Option A: Update routes to use standard format (recommended)
- Option B: Update tests to match actual route responses

**Standard Format**:
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
}
```

### 5. Test Expectations vs Actual Behavior

**Pattern**: Tests expect certain behavior but routes behave differently

**Examples**:
- Tests expect `response.json()` to work but response structure changed
- Tests expect certain error codes but routes return different codes
- Tests expect certain data structure but routes return different structure

**Action Required**:
- Review each failing test
- Determine if test or route needs updating
- Update accordingly

## Recommended Approach

### Phase 1: Investigation
1. Run full test suite to identify all failures
2. Categorize failures (Next.js 16 vs pre-existing)
3. Document each category with examples

### Phase 2: Service Method Audit
1. Check which services have missing methods
2. Determine if methods should exist or tests are wrong
3. Create implementation plan

### Phase 3: API Standardization
1. Decide on standard response format
2. Create migration plan for routes
3. Update tests to match standard

### Phase 4: Fix Implementation
1. Fix mock constructors
2. Implement or remove missing service methods
3. Standardize API responses
4. Update test expectations

## Files to Review

### Service Implementations
- `lib/services/workflow-engine.ts`
- `lib/services/webhook-service.ts`
- `lib/services/analytics/metrics-collector.ts` (if exists)
- `lib/services/integrations/integration-sync-engine.ts` (if exists)

### Test Files Needing Updates
- `__tests__/lib/services/workflow-engine.test.ts`
- `__tests__/lib/services/webhook-service.test.ts`
- `__tests__/lib/analytics/metrics-collector.test.ts`
- `__tests__/lib/services/integrations/integration-sync-engine.test.ts`
- `__tests__/integration/workflow-execution.test.ts`
- `__tests__/performance/workflow-performance.test.ts`
- `__tests__/api/rate-limits-api.test.ts`

## Priority Order

1. **High**: Fix mock constructor issues (blocks many tests)
2. **High**: Resolve missing service method questions (decide: implement or update tests)
3. **Medium**: Standardize API response formats
4. **Low**: Update test expectations for edge cases

## Notes

- These issues existed before the dependency updates
- The dependency updates may have exposed these issues
- Fixing these will improve overall test reliability
- Consider creating separate PRs for each category

---

**Status**: Documented, awaiting separate PR
**Related**: `docs/TEST_FAILURES_ANALYSIS.md`

