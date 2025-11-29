# Prioritized Test Failures List

**Date**: January 2025  
**Current Status**: 140 failed | 498 passed | 4 skipped (642 total)  
**Test Files**: ~35 failed | ~54 passed

---

## 🎯 Fix Priority Order

### 🔴 **Priority 1: Critical Infrastructure (Blocking ~35 tests)**

#### 1.1 Database Mock Chain Issues
**Count**: ~20 failures  
**Pattern**: `TypeError: db.select(...).from(...).where(...).limit is not a function`

**Affected Tests**:
- `__tests__/integration/simple-db.test.ts`
- `__tests__/integration/db-connection.test.ts`
- `__tests__/api/clerk-webhook.test.ts`
- Various integration tests

**Root Cause**: Global database mock in `__tests__/setup.ts` doesn't support method chaining

**Fix Strategy**:
```typescript
// Update __tests__/setup.ts database mock
db: {
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
      limit: vi.fn().mockResolvedValue([]),
    }),
  }),
  // ... other methods
}
```

**Estimated Effort**: 30 minutes  
**Impact**: Unblocks ~20 tests

---

#### 1.2 UUID LIKE Query Issues
**Count**: ~15 failures  
**Pattern**: `operator does not exist: uuid ~~ unknown` (LIKE on UUID fields)

**Affected Files**:
- `__tests__/test-db.ts` - cleanup queries
- `__tests__/test-data.ts` - data seeding

**Root Cause**: Using `LIKE` directly on UUID columns

**Fix Strategy**:
```typescript
// Change from:
DELETE FROM table WHERE id LIKE 'user-%'

// To:
DELETE FROM table WHERE id::text LIKE 'user-%'
// OR use proper UUID comparison:
DELETE FROM table WHERE id IN (SELECT id FROM ... WHERE id::text LIKE 'user-%')
```

**Files to Fix**:
- `__tests__/test-db.ts` lines 120, 129
- `__tests__/test-data.ts` line 265

**Estimated Effort**: 20 minutes  
**Impact**: Unblocks test cleanup and data seeding

---

#### 1.3 Missing Database Tables
**Count**: ~10 failures  
**Pattern**: `relation "X" does not exist` (PostgreSQL error code: '42P01')

**Affected Tests**:
- `__tests__/advanced-test-data.test.ts`
- `__tests__/api/platform-hub-integrations.test.ts`

**Root Cause**: Tests reference tables that don't exist in test database

**Fix Strategy**:
1. Check if tables should exist (run migrations)
2. Or update tests to skip/mock these tables
3. Or create test-specific table mocks

**Estimated Effort**: 1-2 hours (depends on whether migrations needed)  
**Impact**: Unblocks ~10 tests

---

### 🟡 **Priority 2: API Response Mismatches (~26 failures)**

#### 2.1 Tax API Tests
**Count**: 11 failures  
**Files**:
- `app/api/tax/export/route.test.ts` (3 failures)
- `app/api/tax/deductions/[id]/route.test.ts` (1 failure)
- `app/api/tax/direct-file/exports/route.test.ts` (2 failures)
- `lib/services/business/freelance-tax.service.test.ts` (8 failures)

**Common Issues**:
- Response format mismatches
- Missing fields in responses
- Incorrect status codes
- Validation error handling

**Fix Strategy**:
1. Review actual API responses
2. Update test expectations to match
3. Fix API routes if responses are incorrect

**Estimated Effort**: 2-3 hours  
**Impact**: Fixes tax feature tests

---

#### 2.2 Form Validation Tests
**Count**: ~15 failures  
**Files**:
- `__tests__/api/contact-form.test.ts`
- `__tests__/api/support-form.test.ts`

**Common Issues**:
- Expected 400 but got 500 (validation errors not caught)
- Error response format mismatches
- Missing error details

**Fix Strategy**:
1. Ensure ZodError is properly caught in API routes
2. Standardize error response format
3. Update test expectations

**Estimated Effort**: 1-2 hours  
**Impact**: Fixes form submission validation

---

### 🟢 **Priority 3: Component & Service Tests (~15 failures)**

#### 3.1 Component Test Failures
**Count**: ~10 failures  
**Files**:
- `__tests__/components/advanced-analytics.test.tsx`
- `__tests__/white-label.test.ts`
- `__tests__/theme-manager.test.ts`

**Common Issues**:
- Component rendering errors
- Prop validation issues
- Missing mock data

**Estimated Effort**: 1-2 hours  
**Impact**: UI component validation

---

#### 3.2 Service Test Failures
**Count**: ~5 failures  
**Files**:
- `__tests__/services/subscription-rbac.service.test.ts`
- `__tests__/services/folder-sharing-inviter.test.ts`
- `__tests__/lib/oauth/oauth-handler.test.ts`

**Common Issues**:
- Service method mocks
- Implementation mismatches

**Estimated Effort**: 1 hour  
**Impact**: Service layer validation

---

## 📊 Summary by Category

| Category | Count | Priority | Status | Estimated Time |
|----------|-------|----------|--------|----------------|
| Database Mock Chain | ~20 | 🔴 HIGH | Pending | 30 min |
| UUID LIKE Queries | ~15 | 🔴 HIGH | Pending | 20 min |
| Missing Tables | ~10 | 🔴 HIGH | Pending | 1-2 hrs |
| Tax API Mismatches | 11 | 🟡 MEDIUM | Pending | 2-3 hrs |
| Form Validation | ~15 | 🟡 MEDIUM | Pending | 1-2 hrs |
| Component Tests | ~10 | 🟢 LOW | Pending | 1-2 hrs |
| Service Tests | ~5 | 🟢 LOW | Pending | 1 hr |
| Other | ~54 | Various | Pending | TBD |

**Total Estimated Time**: 7-11 hours

---

## ✅ Recently Fixed

1. ✅ **Wallet Icon Mock** - Fixed by removing local mocks
2. ✅ **QueryClient Mock** - Fixed by using class constructor
3. ✅ **Integration DB UUID Issues** - Fixed UUID format and references
4. ✅ **Clients API Tests** - Fixed withRLS and auth mocks (8/8 passing)

**Improvement**: 144 → 140 failures (4 tests fixed)

---

## 🚀 Quick Wins (Next 1-2 Hours)

1. **Fix Database Mock Chain** (30 min) → Unblocks ~20 tests
2. **Fix UUID LIKE Queries** (20 min) → Unblocks ~15 tests
3. **Fix Form Validation Tests** (1-2 hrs) → Unblocks ~15 tests

**Potential Impact**: Fix ~50 tests in 2-3 hours

---

## 📝 Notes

- Many failures are test infrastructure issues, not application bugs
- Focus on infrastructure fixes first for maximum impact
- Consider excluding IRS Direct File tests if they're causing excessive timeouts
- Create shared test utilities for common patterns (withRLS, auth, db mocks)

---

## 🔄 Test Timeout Issues

**Status**: Needs investigation  
**Pattern**: Some tests timing out, especially IRS Direct File tests

**Recommendation**: 
- Increase timeout for specific slow tests
- Consider excluding IRS Direct File tests from main suite
- Add timeout configuration to `vitest.config.ts`

**Files to Check**:
- `vitest.config.ts` - current timeout settings
- Tests with explicit timeout settings
- IRS Direct File test files

