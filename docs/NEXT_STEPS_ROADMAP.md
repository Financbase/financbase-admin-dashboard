# Next Steps Roadmap - Next.js 16 Migration

## Current Status ✅

### Completed
- ✅ Fixed Next.js 16 compatibility issues in test suite
- ✅ Created reusable test utilities and patterns
- ✅ Standardized 4 API routes to use standard response format
- ✅ Created comprehensive documentation (8 guides)
- ✅ All fixed tests passing (5/5 for tax obligations route)

### Infrastructure Ready
- ✅ Test utilities: `__tests__/utils/nextjs16-test-helpers.ts`
- ✅ Mock patterns: `__tests__/utils/test-mock-patterns.ts`
- ✅ Standard responses: `lib/api/standard-response.ts`
- ✅ Email service: `lib/services/email-service.ts`

## Remaining Work

### Phase 1: Next.js 16 Compatibility (14 routes)

#### Routes Using withRLS Needing Updates

**Tax Routes (10 remaining)**
1. `app/api/tax/export/route.ts`
2. `app/api/tax/direct-file/exports/route.ts`
3. `app/api/tax/direct-file/exports/[id]/route.ts`
4. `app/api/tax/documents/route.ts`
5. `app/api/tax/deductions/route.ts`
6. `app/api/tax/summary/route.ts`
7. `app/api/tax/documents/[id]/route.ts`
8. `app/api/tax/deductions/[id]/route.ts`
9. `app/api/tax/obligations/[id]/payment/route.ts`
10. `app/api/tax/obligations/[id]/route.ts`

**Blog Routes (4 remaining)**
11. `app/api/blog/stats/route.ts`
12. `app/api/blog/categories/route.ts`
13. `app/api/blog/[id]/route.ts`
14. `app/api/blog/[id]/publish/route.ts`

#### Action Items
- [ ] Create test files for routes without tests
- [ ] Apply Next.js 16 mock patterns to all tests
- [ ] Standardize auth mocks across all test files
- [ ] Verify all tests pass after updates

### Phase 2: API Standardization (14 routes)

#### Standardization Checklist
- [ ] Update routes to use `createSuccessResponse()`
- [ ] Change `pages` to `totalPages` in pagination
- [ ] Add `requestId` to all responses
- [ ] Verify error responses use `ApiErrorHandler`
- [ ] Update tests to match standardized formats

#### Routes to Standardize
Same 14 routes as Phase 1, plus any other routes that need updates.

### Phase 3: Pre-existing Issues (Separate PR)

#### Documented Issues
See `docs/PRE_EXISTING_TEST_ISSUES.md` for complete list:

1. **Mock Service Constructors**
   - Fix `TypeError: () => mockServiceInstance is not a constructor`
   - Apply class-based mock pattern

2. **Missing Service Methods**
   - WorkflowEngine methods
   - WebhookService methods
   - MetricsCollector methods
   - IntegrationSyncEngine methods

3. **API Response Format Mismatches**
   - Update routes or tests to match standard format
   - Resolve inconsistencies

## Implementation Strategy

### For Each Route

#### Step 1: Standardize API Response
```typescript
// Before
return NextResponse.json({
  success: true,
  data: result,
  pagination: { page, limit, total, pages: ... }
});

// After
import { createSuccessResponse } from '@/lib/api/standard-response';
return createSuccessResponse(
  result,
  200,
  {
    requestId,
    pagination: {
      page,
      limit,
      total,
      totalPages: ...,  // Note: totalPages not pages
    },
  }
);
```

#### Step 2: Create/Update Test File
```typescript
// Use established patterns
const mockMethod = vi.fn();
vi.mock('@/lib/services/service', () => ({
  Service: class { method = mockMethod; },
}));
vi.mock('@/lib/api/with-rls', () => ({
  withRLS: async (fn: any) => await fn('user-123'),
}));
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
  currentUser: vi.fn().mockResolvedValue({...}),
}));
```

#### Step 3: Verify
```bash
pnpm test path/to/route.test.ts
pnpm build  # Verify no build errors
```

## Quick Reference

### Standard Mock Patterns
See `docs/NEXTJS16_TEST_MIGRATION_GUIDE.md` for detailed patterns.

### Standard Response Format
See `lib/api/standard-response.ts` for utilities.

### Working Example
See `app/api/tax/obligations/route.test.ts` for complete working example.

## Priority Order

1. **High**: Routes with existing tests (fix tests first)
2. **High**: Frequently used routes (invoices, blog main routes)
3. **Medium**: Remaining tax routes
4. **Medium**: Remaining blog routes
5. **Low**: Pre-existing issues (separate PR)

## Success Criteria

### Phase 1 Complete When
- [ ] All 14 routes have Next.js 16 compatible tests
- [ ] All tests pass
- [ ] Auth mocks standardized across all tests

### Phase 2 Complete When
- [ ] All 14 routes use standard response format
- [ ] All pagination uses `totalPages`
- [ ] All responses include `requestId`
- [ ] Tests updated to match standard format

### Phase 3 Complete When
- [ ] All pre-existing issues documented
- [ ] Issues categorized and prioritized
- [ ] Separate PR created for fixes

## Estimated Effort

- **Phase 1**: ~2-3 hours (14 routes × ~10 min each)
- **Phase 2**: ~1-2 hours (mostly mechanical updates)
- **Phase 3**: ~4-6 hours (investigation + fixes)

## Resources

- **Migration Guide**: `docs/NEXTJS16_TEST_MIGRATION_GUIDE.md`
- **Standardization Checklist**: `docs/API_STANDARDIZATION_CHECKLIST.md`
- **Test Utilities**: `__tests__/utils/`
- **Reference**: `app/api/tax/obligations/route.test.ts`

---

**Last Updated**: November 8, 2025
**Status**: Ready for Continued Migration
**Next Review**: After Phase 1 completion

