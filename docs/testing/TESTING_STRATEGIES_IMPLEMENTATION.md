# Testing Strategies Implementation

This document outlines the implemented testing strategies for the Financbase application, providing workarounds for current API route issues.

## Overview

Three testing strategies are now available:

1. **Local PostgreSQL Testing** - Real database tests with local PostgreSQL
2. **API-Level Mock Testing** - Tests API routes with mocked database layer
3. **Hybrid Testing** - Combines real DB operations with selective mocking

## Quick Start

### 1. Local PostgreSQL Testing

```bash
# Start local test database
npm run db:test:setup

# Run integration tests with local PostgreSQL
npm run test:local

# Stop test database
npm run db:test:stop
```

### 2. API-Level Mock Testing

```bash
# Run tests that mock the database layer
npm run test:mock
```

### 3. Hybrid Testing

```bash
# Run tests combining real DB and mocks
npm run test:hybrid
```

## Testing Strategies in Detail

### Local PostgreSQL Testing

**Purpose**: Test with real database operations using local PostgreSQL instead of Neon serverless.

**Setup**:

- Uses `docker-compose.test.yml` for isolated test database
- Environment variable `TEST_DB_TYPE=local` switches to local PostgreSQL
- Automatic cleanup between tests

**Pros**:

- ✅ Real database validation
- ✅ No external dependencies during development
- ✅ Faster than remote databases
- ✅ Isolated test environment

**Cons**:

- Requires Docker
- Different from production (PostgreSQL vs Neon)

**Usage**:

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d postgres-test

# Run tests
TEST_DB_TYPE=local npm run test:integration

# Or use the convenience script
npm run test:local
```

### API-Level Mock Testing

**Purpose**: Test API route logic without database dependencies.

**Implementation**:

- Mocks the database layer (`lib/db`)
- Mocks service layer (`lib/services`)
- Tests request/response handling
- Validates error handling

**Pros**:

- ✅ Fast execution
- ✅ No database required
- ✅ Tests API logic in isolation
- ✅ Works even when DB is broken

**Cons**:

- Doesn't validate actual database operations
- May miss integration issues

**Example Test**:

```typescript
// Mocks database and services
vi.mock('../../lib/db', () => ({ /* mock implementation */ }));
vi.mock('../../lib/services', () => ({ /* mock services */ }));

// Test API routes
const response = await GET(request);
expect(response.status).toBe(200);
```

### Hybrid Testing

**Purpose**: Combine real database operations for simple cases with mocks for complex scenarios.

**Implementation**:
- Real database for basic CRUD operations
- Mocks for external services (email, payments, etc.)
- Mocks for complex business logic
- Selective mocking based on what's broken

**Pros**:
- ✅ Tests real database operations where possible
- ✅ Mocks unreliable components
- ✅ Balances speed and realism
- ✅ Adaptable to current system state

**Cons**:
- More complex setup
- Requires judgment on what to mock vs test for real

**Example**:
```typescript
// Real database for basic operations
const testUser = await TestDataFactory.createTestUser();

// Mock external services
vi.mocked(EmailService.sendWelcomeEmail).mockResolvedValue({ sent: true });

// Test with mix of real and mocked components
```

## Environment Variables

### Test Database Selection

```bash
# Use local PostgreSQL (default when not using Neon URLs)
TEST_DB_TYPE=local

# Use Neon serverless (default)
# No env var needed, or set DATABASE_URL to Neon URL
```

### Database URLs

```bash
# Local PostgreSQL for testing
TEST_DATABASE_URL=postgresql://financbase_test_user:financbase_test_password@localhost:5433/financbase_test

# Production Neon database
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.us-east-1.aws.neon.tech/neondb
```

## Test Categories

### Unit Tests (`__tests__/api/`, `__tests__/components/`)

```bash
npm run test:unit
```

- Mocked services
- Fast feedback
- Component and utility testing

### Integration Tests (`__tests__/integration/`)

```bash
npm run test:integration  # All integration tests
npm run test:local       # Local PostgreSQL
npm run test:neon        # Neon serverless
npm run test:mock        # Mocked database layer
npm run test:hybrid      # Hybrid approach
```

### API-Level Tests

```bash
npm run test:api-level   # Mock and hybrid tests combined
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if test database is running
docker ps | grep postgres-test

# View test database logs
docker-compose -f docker-compose.test.yml logs postgres-test

# Reset test database
npm run db:test:stop
npm run db:test:start
```

### Test Failures

```bash
# Run with verbose output
npm run test:debug

# Run specific test file
npx vitest run __tests__/integration/clients-api-mock.integration.test.ts
```

### Environment Issues

```bash
# Check environment variables
echo $TEST_DB_TYPE
echo $DATABASE_URL

# Verify Node environment
echo $NODE_ENV  # Should be 'test' during testing
```

## Migration Path

### Current State (API Routes Broken)

- Use API-level mock tests for validation
- Use hybrid tests for partial validation
- Use existing 151+ passing unit tests as foundation

### Future State (API Routes Fixed)

- Migrate hybrid tests to full integration tests
- Use local PostgreSQL for development
- Use Neon for staging/production testing
- Keep mock tests for specific scenarios

## Best Practices

### When to Use Each Strategy

**Use Local PostgreSQL Testing**:
- When testing database schema changes
- When validating data relationships
- During development (faster than remote DB)

**Use API-Level Mock Testing**:
- When database is unavailable
- When testing API logic in isolation
- For fast feedback during development

**Use Hybrid Testing**:
- When some components work, others don't
- When testing integration between working and broken parts
- As a bridge between mock and full integration testing

### Test Organization

```
__tests__/
├── integration/
│   ├── *-api.integration.test.ts        # Real DB tests
│   ├── *-api-mock.integration.test.ts   # Mocked DB tests
│   └── *-api-hybrid.integration.test.ts # Hybrid tests
├── api/                 # Unit tests (mocked)
├── components/          # Unit tests (mocked)
└── scenarios/           # Scenario tests (currently mocked)
```

## Next Steps

1. **Fix Core Issues**: Resolve API route 404 errors and Clerk authentication
2. **Migrate Tests**: Convert hybrid tests to full integration tests
3. **Add Coverage**: Ensure comprehensive test coverage
4. **CI/CD Integration**: Set up automated testing pipelines
5. **Performance Testing**: Add database performance benchmarks