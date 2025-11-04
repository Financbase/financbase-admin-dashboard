# Testing Infrastructure

## Overview

The Financbase Admin Dashboard implements a comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, and performance tests with high coverage standards.

## Testing Stack

### Tools

- **Unit Tests**: Jest 29.7.0
- **E2E Tests**: Playwright 1.56.1
- **Load Tests**: K6
- **Test Utilities**: React Testing Library 14.3.1
- **Coverage**: Jest Coverage with 80% minimum threshold

## Unit Testing

### Jest Configuration

```158:195:package.json
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": [
      "<rootDir>/jest.setup.js"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "collectCoverageFrom": [
      "lib/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "app/**/*.{js,jsx,ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/.next/**",
      "!**/coverage/**",
      "!**/dist/**",
      "!**/build/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "testMatch": [
      "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
      "<rootDir>/lib/**/__tests__/**/*.{js,jsx,ts,tsx}",
      "<rootDir>/components/**/__tests__/**/*.{js,jsx,ts,tsx}"
    ],
    "testPathIgnorePatterns": [
      "<rootDir>/.next/",
      "<rootDir>/node_modules/",
      "<rootDir>/e2e/"
    ]
  },
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### Coverage Requirements

- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

### E2E Test Scripts

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.test.local -- playwright test",
    "test:e2e:ui": "dotenv -e .env.test.local -- playwright test --ui"
  }
}
```

### Test Structure

```plaintext
e2e/
├── auth.spec.ts          # Authentication flows
├── dashboard.spec.ts     # Dashboard functionality
├── invoices.spec.ts      # Invoice management
├── transactions.spec.ts  # Transaction workflows
└── ...
```

## Performance Testing

### K6 Load Testing

```json
{
  "scripts": {
    "test:performance": "jest --testPathPattern=performance",
    "test:performance:load": "./performance-tests/run-load-tests.sh",
    "test:performance:api": "BASE_URL=${BASE_URL:-http://localhost:3010} k6 run performance-tests/api-load-test.js",
    "test:performance:dashboard": "BASE_URL=${BASE_URL:-http://localhost:3010} k6 run performance-tests/dashboard-load-test.js"
  }
}
```

### Load Test Types

1. **API Load Tests**: Test API endpoint performance
2. **Dashboard Load Tests**: Test dashboard rendering performance
3. **Auth Load Tests**: Test authentication flow performance
4. **Comprehensive Load Tests**: Full system load testing

## Test Organization

### Directory Structure

```plaintext
__tests__/
├── api/              # API route tests
├── components/       # Component tests
├── lib/              # Utility tests
└── services/         # Service layer tests

e2e/
├── auth.spec.ts
├── dashboard.spec.ts
└── ...

performance-tests/
├── api-load-test.js
├── dashboard-load-test.js
└── ...
```

## Testing Best Practices

### Unit Tests

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Isolate tests** (no shared state)
4. **Mock external dependencies**
5. **Test edge cases** and error scenarios

### Integration Tests

1. **Test API endpoints** end-to-end
2. **Use test database** (isolated from production)
3. **Clean up test data** after tests
4. **Test error handling** paths
5. **Validate response formats**

### E2E Tests

1. **Test critical user flows**
2. **Use realistic test data**
3. **Test across browsers** (Chrome, Firefox, Safari)
4. **Test responsive design**
5. **Test accessibility** with @axe-core/playwright

### Performance Tests

1. **Establish baselines** for performance metrics
2. **Test under realistic load**
3. **Monitor regression** in performance
4. **Test API response times**
5. **Test database query performance**

## Test Data Management

### Mock Data

- Use @faker-js/faker for realistic test data
- Create reusable test fixtures
- Isolate test data per test suite

### Test Database

- Use separate test database
- Reset database between test runs
- Seed test data programmatically

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- Pull requests
- Commits to main branch
- Scheduled runs (nightly)

### Test Pipeline

1. **Lint** - ESLint checks
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Jest with coverage
4. **E2E Tests** - Playwright
5. **Performance Tests** - K6 (on schedule)

## Coverage Reporting

### Coverage Tools

- Jest coverage reports
- Codecov integration (if configured)
- Coverage badges in README

### Coverage Goals

- Maintain 80%+ coverage
- Focus on critical paths
- Don't aim for 100% (unrealistic)

## Accessibility Testing

### Tools

- **@axe-core/playwright**: Automated accessibility testing
- **Manual testing**: Keyboard navigation, screen readers

### WCAG Compliance

- Target WCAG 2.1 AA compliance
- Test with screen readers
- Test keyboard navigation
- Test color contrast

## Security Testing

### SAST/SCA Tools

- **Snyk**: Static application security testing
- **Dependency scanning**: Automated vulnerability detection
- **Regular audits**: Quarterly security reviews

### Security Test Scripts

```json
{
  "scripts": {
    "test:security": "./test-security.sh"
  }
}
```

## Related Documentation

- [Testing Guide](../testing/README.md)
- [Test Results](../../TEST_RESULTS.md)
- [Security Audit](../../SECURITY_AUDIT_REPORT.md)
