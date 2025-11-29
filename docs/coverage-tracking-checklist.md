# Coverage Tracking Checklist

Use this checklist to track your progress on improving test coverage.

## Weekly Tasks

- [ ] Run `npm run test:coverage` to generate coverage report
- [ ] Review `coverage/index.html` for detailed breakdown
- [ ] Run `./scripts/track-coverage-trends.sh` to update trends
- [ ] Review `docs/coverage-trends.md` for progress tracking
- [ ] Identify top 5 files with lowest coverage
- [ ] Prioritize tests based on business impact

## Monthly Tasks

- [ ] Review coverage trends over past month
- [ ] Update coverage goals if needed
- [ ] Celebrate coverage milestones
- [ ] Share progress with team
- [ ] Adjust action plan based on learnings

## Per Feature/PR

- [ ] Write tests for new features
- [ ] Maintain 80%+ coverage for new code
- [ ] Review coverage in code review
- [ ] Ensure tests pass before merging
- [ ] Update coverage documentation if needed

## Priority 1: Authentication & Security ✅

### Security Utilities (`lib/utils/security.ts`)
- [x] ✅ Created `__tests__/lib/utils/security.test.ts`
- [ ] Review test coverage (target: 80%)
- [ ] Add edge case tests if needed
- [ ] Verify all security functions tested

### RBAC Utilities
- [x] ✅ Created `__tests__/lib/utils/subscription-rbac-utils.test.ts`
- [x] ✅ Created `__tests__/lib/auth/financbase-rbac.test.ts`
- [ ] Review test coverage (target: 80%)
- [ ] Add integration tests
- [ ] Test permission combinations

## Priority 2: Payment & Financial Operations

### Payment Service
- [ ] Create `__tests__/lib/services/payment-service.test.ts`
- [ ] Test payment processing flows
- [ ] Test error handling
- [ ] Test transaction atomicity

### Invoice Service
- [ ] Create `__tests__/lib/services/invoice-service.test.ts`
- [ ] Test invoice generation
- [ ] Test invoice validation
- [ ] Test payment linking

## Priority 3: User Data Management

### User Service
- [ ] Create `__tests__/lib/services/user-service.test.ts`
- [ ] Test user CRUD operations
- [ ] Test profile updates
- [ ] Test data validation

### Organization Service
- [ ] Create `__tests__/lib/services/organization-service.test.ts`
- [ ] Test organization management
- [ ] Test user-organization relationships
- [ ] Test permissions

---

**Last Updated:** $(date)  
**Current Coverage:** See `docs/coverage-trends.md`

