# Test Coverage Analysis Guide

**Last Updated**: January 2025  
**Status**: ✅ Ready to Use

---

## Overview

The test coverage analysis tool helps identify gaps in test coverage and ensures we meet the 80% minimum threshold required for compliance.

## Quick Start

```bash
# Run coverage analysis
pnpm test:coverage:analyze

# Or directly
./scripts/analyze-test-coverage.sh
```

## What It Does

1. **Runs Test Coverage**: Executes the full test suite with coverage collection
2. **Analyzes Metrics**: Compares coverage against 80% threshold
3. **Identifies Gaps**: Lists files below the threshold
4. **Provides Recommendations**: Suggests next steps

## Output

The script provides:

### Coverage Summary
- **Lines**: Percentage of lines covered
- **Statements**: Percentage of statements covered
- **Functions**: Percentage of functions covered
- **Branches**: Percentage of branches covered
- **Overall**: Average coverage percentage

### Status Indicators
- ✅ **Green**: Meets 80% threshold
- ❌ **Red**: Below 80% threshold
- ⚠️ **Yellow**: Warning (close to threshold)

### File-Level Analysis
Lists files below the threshold with:
- File path
- Lines coverage
- Statements coverage
- Functions coverage
- Branches coverage

## Example Output

```
📊 Test Coverage Analysis
=========================

🧪 Running tests with coverage...
✅ Coverage data found

📈 Coverage Summary:
-------------------
Lines:       82.50% ✅
Statements:  81.20% ✅
Functions:   79.50% ❌ Below threshold
Branches:    80.10% ✅

Overall Coverage: 80.83%
✅ Meets 80% threshold

⚠️  Files below 80% coverage:

File Path | Lines | Statements | Functions | Branches
----------|-------|------------|-----------|----------
lib/services/email-service.ts | 65.20% | 64.80% | 60.00% | 62.50%
app/api/webhooks/route.ts | 72.30% | 71.90% | 75.00% | 70.00%

📝 Total files needing attention: 2
```

## Interpreting Results

### Overall Coverage
- **≥ 80%**: ✅ Meets compliance requirement
- **< 80%**: ❌ Needs improvement

### Per-Metric Analysis
Each metric should be ≥ 80%:
- **Lines**: Code lines executed
- **Statements**: Statements executed
- **Functions**: Functions called
- **Branches**: Conditional branches taken

### File-Level Priority
Focus on files in this order:
1. **Critical paths**: `lib/`, `app/api/`
2. **High-traffic**: Frequently used services
3. **Security-sensitive**: Authentication, authorization
4. **Business logic**: Core functionality

## Fixing Coverage Gaps

### 1. Identify Missing Tests

```bash
# View detailed HTML report
open coverage/index.html
```

### 2. Add Tests for Uncovered Code

```typescript
// Example: Adding test for uncovered function
describe('EmailService', () => {
  it('should send email with attachments', async () => {
    // Test implementation
  });
});
```

### 3. Prioritize Critical Paths

Focus on:
- API routes (`app/api/`)
- Service layer (`lib/services/`)
- Business logic (`lib/`)
- Security functions (`lib/security/`)

### 4. Re-run Analysis

```bash
pnpm test:coverage:analyze
```

## Configuration

### Threshold

The threshold is set in `vitest.config.ts`:

```typescript
thresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Custom Thresholds

File-type-specific thresholds:
- `lib/**/*.ts`: 85%
- `components/**/*.tsx`: 70%
- `hooks/**/*.ts`: 80%

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Analyze coverage
  run: pnpm test:coverage:analyze
```

### Coverage Reports

Coverage reports are generated in:
- `coverage/` - HTML and JSON reports
- `coverage/coverage-summary.json` - Machine-readable summary
- `coverage/lcov.info` - LCOV format for tools

## Troubleshooting

### Missing Coverage Dependency

If you see:
```
MISSING DEPENDENCY  Cannot find dependency '@vitest/coverage-v8'
```

Install it:
```bash
pnpm add -D @vitest/coverage-v8
```

### No Coverage Data

If coverage directory is empty:
1. Run `pnpm test:coverage` first
2. Check that tests are actually running
3. Verify vitest.config.ts has coverage enabled

### Script Permission Error

If script is not executable:
```bash
chmod +x scripts/analyze-test-coverage.sh
```

## Best Practices

### 1. Regular Analysis
- Run analysis before each release
- Check coverage in CI/CD pipeline
- Review after major changes

### 2. Incremental Improvement
- Don't try to reach 80% all at once
- Focus on new code first
- Gradually improve existing code

### 3. Quality Over Quantity
- 80% coverage with good tests > 90% with poor tests
- Focus on critical paths
- Test edge cases and error handling

### 4. Maintain Threshold
- Don't lower thresholds to meet goals
- Add tests for new code
- Refactor untestable code

## Metrics & Goals

### Current Target
- **Minimum**: 80% overall coverage
- **Ideal**: 85%+ overall coverage
- **Critical Paths**: 90%+ coverage

### Tracking
- Track coverage trends over time
- Set team goals
- Celebrate improvements
- Address regressions quickly

## Related Documentation

- [Testing Infrastructure](../architecture/TESTING_INFRASTRUCTURE.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Vitest Configuration](../../vitest.config.ts)

---

**Last Updated**: January 2025  
**Maintained By**: Engineering Team

