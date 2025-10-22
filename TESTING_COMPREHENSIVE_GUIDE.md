# 🧪 Comprehensive Testing Guide

## Overview

This document provides a complete guide to the testing infrastructure for the Financbase Admin Dashboard. The testing suite includes unit tests, integration tests, end-to-end tests, and real-world scenario tests.

## 🏗️ Testing Architecture

### Test Types

1. **Unit Tests** - Test individual services and components in isolation
2. **Integration Tests** - Test API endpoints and service interactions
3. **End-to-End Tests** - Test complete user workflows in the browser
4. **Scenario Tests** - Test complex business workflows and edge cases

### Test Structure

```
__tests__/
├── setup.ts                          # Global test setup
├── services/                         # Unit tests for services
│   ├── client-service.test.ts
│   ├── lead-management-service.test.ts
│   └── ...
├── api/                             # API integration tests
│   ├── clients-api.test.ts
│   ├── leads-api.test.ts
│   └── ...
├── integration/                     # Integration tests
│   ├── lead-management-integration.test.ts
│   ├── payment-processing-integration.test.ts
│   └── ...
├── e2e/                            # End-to-end tests
│   ├── lead-management-e2e.test.ts
│   ├── dashboard-e2e.test.ts
│   └── ...
└── scenarios/                      # Real-world scenario tests
    ├── real-world-scenarios.test.ts
    ├── financial-workflows.test.ts
    └── ...
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:scenarios

# Run E2E tests
npm run e2e
```

### Development Workflow

```bash
# Watch mode for development
npm run test:watch

# Debug tests
npm run test:debug

# Run tests with UI
npm run test:ui
```

### CI/CD Pipeline

```bash
# Full test suite for CI
npm run test:ci

# Complete test suite with E2E
npm run test:full
```

## 📊 Test Coverage

### Coverage Targets

- **Unit Tests**: 80%+ coverage for all services
- **Integration Tests**: 90%+ coverage for API endpoints
- **E2E Tests**: 100% coverage for critical user workflows
- **Scenario Tests**: 100% coverage for business-critical workflows

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

## 🔧 Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3010',
    trace: 'on-first-retry',
  },
});
```

## 🧪 Test Categories

### 1. Unit Tests

**Purpose**: Test individual functions, methods, and components in isolation.

**Examples**:
- Service method testing
- Component rendering
- Utility function testing
- Business logic validation

**Location**: `__tests__/services/`, `__tests__/components/`

**Example**:
```typescript
describe('ClientService', () => {
  it('should create a new client with valid data', async () => {
    const mockClient = { id: 'client-123', name: 'Test Client' };
    vi.mocked(ClientService.createClient).mockResolvedValue(mockClient);
    
    const result = await ClientService.createClient(clientData);
    expect(result).toEqual(mockClient);
  });
});
```

### 2. Integration Tests

**Purpose**: Test API endpoints and service interactions.

**Examples**:
- API route testing
- Service integration
- Database operations
- Authentication flows

**Location**: `__tests__/api/`, `__tests__/integration/`

**Example**:
```typescript
describe('/api/clients', () => {
  it('should return paginated clients successfully', async () => {
    const response = await GET(new NextRequest('http://localhost:3000/api/clients'));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.clients).toBeDefined();
  });
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows in the browser.

**Examples**:
- User registration and login
- Lead management workflows
- Payment processing
- Dashboard interactions

**Location**: `__tests__/e2e/`

**Example**:
```typescript
test('should create a new lead', async ({ page }) => {
  await page.goto('/leads');
  await page.click('[data-testid="new-lead-button"]');
  await page.fill('[data-testid="lead-name"]', 'John Doe');
  await page.click('[data-testid="submit-lead"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### 4. Scenario Tests

**Purpose**: Test complex business workflows and edge cases.

**Examples**:
- Complete lead-to-client conversion
- Multi-module data synchronization
- Financial health analysis
- Error recovery scenarios

**Location**: `__tests__/scenarios/`

**Example**:
```typescript
describe('Complete Lead-to-Client Conversion Workflow', () => {
  it('should handle a complete lead conversion with all related data', async () => {
    // 1. Create lead
    const lead = await LeadManagementService.createLead(leadData);
    
    // 2. Add activities
    const activity = await LeadManagementService.createLeadActivity(activityData);
    
    // 3. Convert to client
    const conversion = await LeadManagementService.convertLeadToClient(lead.id, clientData);
    
    // 4. Create transaction
    const transaction = await TransactionService.createTransaction(transactionData);
    
    expect(conversion.clientId).toBeDefined();
    expect(transaction).toBeDefined();
  });
});
```

## 🎯 Testing Best Practices

### 1. Test Organization

- **One test file per service/component**
- **Descriptive test names** that explain what is being tested
- **Group related tests** using `describe` blocks
- **Use consistent naming conventions**

### 2. Mocking Strategy

- **Mock external dependencies** (databases, APIs, services)
- **Use realistic mock data** that reflects production scenarios
- **Mock at the right level** (service boundaries, not internal implementation)
- **Reset mocks between tests**

### 3. Test Data Management

- **Use factories for test data** to ensure consistency
- **Create realistic test scenarios** that mirror production usage
- **Clean up test data** after each test
- **Use unique identifiers** to avoid conflicts

### 4. Assertion Best Practices

- **Test behavior, not implementation**
- **Use specific assertions** that provide clear failure messages
- **Test both success and failure cases**
- **Verify side effects** (database updates, API calls, etc.)

## 🔍 Test Debugging

### Debugging Unit Tests

```bash
# Run specific test with debug output
npm run test:debug -- --reporter=verbose client-service.test.ts

# Run tests in watch mode
npm run test:watch
```

### Debugging E2E Tests

```bash
# Run E2E tests in headed mode
npm run e2e:headed

# Debug E2E tests
npm run e2e:debug

# View test reports
npm run e2e:report
```

### Common Issues

1. **Mock not working**: Check if the module is properly mocked in setup.ts
2. **Test timeout**: Increase timeout in test configuration
3. **E2E test flaky**: Add proper waits and retries
4. **Coverage gaps**: Review uncovered code and add tests

## 📈 Performance Testing

### Load Testing

```bash
# Run performance tests
npm run test:performance

# Test with different load levels
npm run test:load -- --users=100 --duration=60s
```

### Memory Testing

```bash
# Run memory leak tests
npm run test:memory

# Profile memory usage
npm run test:profile
```

## 🚨 Error Handling Tests

### Network Errors

```typescript
it('should handle network errors gracefully', async () => {
  // Mock network failure
  vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
  
  const response = await api.getData();
  expect(response.error).toBeDefined();
});
```

### Validation Errors

```typescript
it('should return validation errors for invalid data', async () => {
  const invalidData = { email: 'invalid-email' };
  
  const response = await api.createClient(invalidData);
  expect(response.status).toBe(400);
  expect(response.errors).toBeDefined();
});
```

## 🔄 Continuous Integration

### GitHub Actions

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:ci
      - run: npm run e2e
```

### Test Reports

- **Coverage reports** generated in `coverage/` directory
- **E2E reports** generated in `playwright-report/` directory
- **Test results** available in CI/CD pipeline

## 📚 Additional Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)

### Tools

- **Test Runner**: Vitest
- **E2E Testing**: Playwright
- **Mocking**: Vitest mocks
- **Coverage**: V8 coverage
- **UI Testing**: Testing Library

### Best Practices

- **Write tests first** (TDD approach)
- **Keep tests simple** and focused
- **Use descriptive test names**
- **Test edge cases** and error conditions
- **Maintain test data** consistency
- **Regular test maintenance** and updates

## 🎉 Conclusion

This comprehensive testing suite ensures the Financbase Admin Dashboard is robust, reliable, and maintainable. The multi-layered approach provides confidence in both individual components and complete user workflows.

For questions or issues with testing, refer to the test files themselves or the documentation links provided above.
