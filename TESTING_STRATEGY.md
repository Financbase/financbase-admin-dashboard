# Testing Strategy: Real Database vs Mocks

## Overview

This project now supports **two testing strategies**:

1. **Unit Tests with Mocks** - Fast, isolated tests using mocked services
2. **Integration Tests with Real Database** - Slower but more realistic tests using actual database operations

## Why Real Database Testing?

**Before:** Tests used mocks that might not match actual implementation
```typescript
// Mock-based test (fast but potentially inaccurate)
const mockClient = { id: '123', name: 'Test' };
vi.mocked(ClientService.getAll).mockResolvedValue([mockClient]);
```

**After:** Tests use real database operations that validate actual functionality
```typescript
// Real database test (slower but validates real behavior)
const testUser = await TestDataFactory.createTestUser();
const testClient = await TestDataFactory.createTestClient(testUser.id);
// Test actual API endpoints with real data
```

## Benefits of Real Database Testing

✅ **Validates Real Functionality** - Ensures code works with actual database
✅ **Catches Integration Issues** - Finds problems between components
✅ **Tests Real Constraints** - Validates foreign keys, unique constraints, etc.
✅ **More Realistic** - Tests match production behavior
✅ **Better Confidence** - Higher assurance that features work end-to-end

## Test Categories

### Unit Tests (`__tests__/api/`, `__tests__/components/`)
- **Purpose:** Test individual functions/components in isolation
- **Database:** Mocked services
- **Speed:** Very fast (< 100ms per test)
- **Coverage:** Logic validation, error handling

### Integration Tests (`__tests__/integration/`)
- **Purpose:** Test complete workflows with real database
- **Database:** Actual Neon database with test data
- **Speed:** Slower (database operations)
- **Coverage:** End-to-end functionality, data consistency

### Scenario Tests (`__tests__/scenarios/`)
- **Purpose:** Test complex business workflows
- **Database:** Currently mocked (can be converted to real DB)
- **Speed:** Medium
- **Coverage:** Multi-step business processes

## How to Write Real Database Tests

### 1. Setup Test Database

```typescript
import { testDatabase } from '__tests__/test-db';
import { TestDataFactory } from '__tests__/test-data';

beforeAll(async () => {
  await testDatabase.setup();
});

afterAll(async () => {
  await testDatabase.teardown();
});

beforeEach(async () => {
  await testDatabase.cleanup(); // Clean between tests
});
```

### 2. Create Test Data

```typescript
// Create realistic test data
const testUser = await TestDataFactory.createTestUser();
const testClient = await TestDataFactory.createTestClient(testUser.id);
const testProject = await TestDataFactory.createTestProject(testUser.id, testClient.id);

// Or use bulk seeding
const testData = await TestDataFactory.seedBasicTestData();
```

### 3. Test Real API Endpoints

```typescript
// Test actual API routes with real data
const request = new NextRequest('http://localhost:3000/api/clients');
const response = await GET(request);

expect(response.status).toBe(200);
const data = await response.json();
expect(data.clients).toHaveLength(1);
```

### 4. Test Service Methods

```typescript
// Test actual service methods with real database
const clients = await ClientService.getAll(testUser.id);
expect(clients).toHaveLength(1);
expect(clients[0].companyName).toBe('Test Company Inc.');
```

## Test Data Factory

The `TestDataFactory` provides methods to create realistic test data:

```typescript
// Individual factories
const user = await TestDataFactory.createTestUser();
const client = await TestDataFactory.createTestClient(user.id);
const lead = await TestDataFactory.createTestLead(user.id);
const transaction = await TestDataFactory.createTestTransaction(user.id, client.id);

// Bulk seeding
const data = await TestDataFactory.seedBasicTestData(); // user, client, lead, transaction, project, campaign
const complexData = await TestDataFactory.seedComplexTestData(); // + activities, tasks
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Only Unit Tests (Fast)
```bash
npm test -- __tests__/api/ __tests__/components/
```

### Run Only Integration Tests (Real DB)
```bash
npm test -- __tests__/integration/
```

### Run Specific Test File
```bash
npm test -- __tests__/integration/clients-api.integration.test.ts
```

## Environment Setup

### Required Environment Variables

```bash
# Database connection (same as production)
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.us-east-1.aws.neon.tech/neondb
```

### Test Database Isolation

- Tests automatically clean up data between runs
- Each test gets a fresh database state
- Test data is prefixed to avoid conflicts
- Foreign key constraints are respected

## Migration Strategy

### Phase 1: Keep Both Approaches
- Unit tests remain mocked (fast feedback)
- Integration tests use real database (confidence)

### Phase 2: Convert Critical Tests
- Convert high-risk API tests to integration tests
- Keep component tests mocked (UI logic doesn't need DB)

### Phase 3: Full Integration (Optional)
- Convert all tests to use real database
- Accept slower test execution for higher confidence

## Best Practices

### When to Use Mocks
- Component rendering logic
- Pure utility functions
- External API calls (Stripe, email services)
- Fast feedback during development

### When to Use Real Database
- API route handlers
- Service layer methods
- Business logic workflows
- Data validation and constraints
- Integration between modules

### Test Organization
```
__tests__/
├── setup.ts              # Global mocks for unit tests
├── integration-setup.ts  # Real DB setup for integration tests
├── test-db.ts           # Database connection utilities
├── test-data.ts         # Test data factories
├── api/                 # Unit tests (mocked)
├── components/          # Unit tests (mocked)
├── integration/         # Integration tests (real DB)
└── scenarios/           # Scenario tests (currently mocked)
```

## Performance Considerations

- **Unit Tests:** < 1 second for full suite
- **Integration Tests:** 5-15 seconds (database operations)
- **CI/CD:** Run unit tests first, then integration tests
- **Local Development:** Run unit tests on file save, integration tests manually

## Troubleshooting

### Database Connection Issues
```bash
# Check database connectivity
npm run db:check

# Reset test database
npm run db:reset
```

### Test Flakiness
- Ensure proper cleanup between tests
- Use unique IDs for test data
- Avoid timing-dependent tests
- Check for race conditions

### Schema Changes
- Update test data factories when schema changes
- Run migrations before tests
- Update type definitions

## Future Enhancements

- **Test Database Branching:** Create separate Neon branches for tests
- **Parallel Test Execution:** Run tests in parallel with isolated databases
- **Performance Testing:** Add database performance benchmarks
- **Data Validation:** Add schema validation tests
- **Migration Testing:** Test database migrations