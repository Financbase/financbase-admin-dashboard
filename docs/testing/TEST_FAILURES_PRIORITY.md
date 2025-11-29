# Test Failures Priority List

**Date**: January 2025  
**Total Failures**: 144 tests  
**Test Files**: 38 failed | 51 passed

---

## 🔴 Critical Priority (Blocking Core Functionality)

### 1. Database Mock Chain Issues
**Count**: ~20+ failures  
**Pattern**: `TypeError: db.select(...).from(...).where(...).limit is not a function`

**Affected Tests**:
- `__tests__/integration/simple-db.test.ts`
- `__tests__/integration/db-connection.test.ts`
- `__tests__/api/clients-api.test.ts`
- `__tests__/api/clerk-webhook.test.ts`

**Root Cause**: Database mock in `__tests__/setup.ts` doesn't properly chain `.limit()` method

**Fix Priority**: 🔴 HIGH - Blocks integration tests

---

### 2. UUID LIKE Query Issues
**Count**: ~15+ failures  
**Pattern**: `operator does not exist: uuid ~~ unknown` (LIKE operator on UUID fields)

**Affected Files**:
- `__tests__/test-db.ts` - cleanup queries
- `__tests__/test-data.ts` - data seeding

**Root Cause**: Using `LIKE` on UUID fields - PostgreSQL doesn't support LIKE on UUIDs directly

**Fix Priority**: 🔴 HIGH - Blocks test cleanup and data seeding

---

### 3. Missing Database Tables
**Count**: ~10+ failures  
**Pattern**: `relation "X" does not exist` (code: '42P01')

**Affected Tests**:
- `__tests__/advanced-test-data.test.ts`
- `__tests__/api/platform-hub-integrations.test.ts`

**Root Cause**: Tests reference tables that don't exist in test database schema

**Fix Priority**: 🟡 MEDIUM - May require schema migrations or test adjustments

---

## 🟡 Medium Priority (Feature-Specific)

### 4. Tax API Response Mismatches
**Count**: 11 failures  
**Files**:
- `app/api/tax/export/route.test.ts` (3 failures)
- `app/api/tax/deductions/[id]/route.test.ts` (1 failure)
- `app/api/tax/direct-file/exports/route.test.ts` (2 failures)
- `lib/services/business/freelance-tax.service.test.ts` (8 failures)

**Pattern**: Response format mismatches, missing fields, incorrect status codes

**Fix Priority**: 🟡 MEDIUM - Tax features may not be fully implemented

---

### 5. Form Validation Response Mismatches
**Count**: ~15 failures  
**Files**:
- `__tests__/api/contact-form.test.ts`
- `__tests__/api/support-form.test.ts`

**Pattern**: Expected error response format doesn't match actual API responses

**Fix Priority**: 🟡 MEDIUM - Affects form submission validation

---

### 6. Component Test Failures
**Count**: ~10 failures  
**Files**:
- `__tests__/components/advanced-analytics.test.tsx`
- `__tests__/white-label.test.ts`
- `__tests__/theme-manager.test.ts`

**Pattern**: Component rendering or prop validation issues

**Fix Priority**: 🟡 MEDIUM - UI components may have issues

---

## 🟢 Low Priority (Non-Critical)

### 7. Service Test Failures
**Count**: ~5 failures  
**Files**:
- `__tests__/services/subscription-rbac.service.test.ts`
- `__tests__/services/folder-sharing-inviter.test.ts`
- `__tests__/lib/oauth/oauth-handler.test.ts`

**Pattern**: Service method mocks or implementation mismatches

**Fix Priority**: 🟢 LOW - Service layer tests

---

### 8. Integration Test Failures
**Count**: ~5 failures  
**Files**:
- `__tests__/lib/ai-financial-service.test.ts`
- `__tests__/lib/oauth/oauth-handler.integration.test.ts`

**Pattern**: External service integration issues

**Fix Priority**: 🟢 LOW - May require external service setup

---

## 📊 Summary by Category

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Database Mock Issues | ~20 | 🔴 HIGH | In Progress |
| UUID LIKE Queries | ~15 | 🔴 HIGH | In Progress |
| Missing Tables | ~10 | 🟡 MEDIUM | Pending |
| Tax API Mismatches | 11 | 🟡 MEDIUM | Pending |
| Form Validation | ~15 | 🟡 MEDIUM | Pending |
| Component Tests | ~10 | 🟡 MEDIUM | Pending |
| Service Tests | ~5 | 🟢 LOW | Pending |
| Integration Tests | ~5 | 🟢 LOW | Pending |
| Other | ~53 | Various | Pending |

---

## 🎯 Recommended Fix Order

1. ✅ **Fix Database Mock Chain** - Enables integration tests
2. ✅ **Fix UUID LIKE Queries** - Enables test cleanup
3. ⏳ **Fix Tax API Responses** - Core feature
4. ⏳ **Fix Form Validation Responses** - User-facing
5. ⏳ **Fix Component Tests** - UI validation
6. ⏳ **Fix Missing Tables** - Schema alignment
7. ⏳ **Fix Service Tests** - Service layer
8. ⏳ **Fix Integration Tests** - External services

---

## 🔧 Quick Wins

1. **Database Mock**: Add proper method chaining to mock
2. **UUID LIKE**: Use `id::text LIKE` or proper UUID comparison
3. **Response Format**: Standardize error response format across APIs

---

## 📝 Notes

- Many failures are related to test infrastructure (mocks, database setup)
- Actual application code may be working correctly
- Focus on fixing test infrastructure first, then address specific test failures
- Consider excluding IRS Direct File tests if they're causing excessive timeouts

