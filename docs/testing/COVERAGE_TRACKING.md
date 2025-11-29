# Coverage Tracking Infrastructure

**Last Updated:** January 2025  
**Status:** Active

## Overview

This document describes the coverage tracking infrastructure for the Financbase Admin Dashboard. The infrastructure includes CI/CD checks, automated reporting, and coverage dashboards.

## Components

### 1. CI/CD Pipeline

**File:** `.github/workflows/test-coverage.yml`

The GitHub Actions workflow automatically:
- Runs tests with coverage on every push and pull request
- Generates coverage reports in multiple formats (HTML, JSON, LCOV)
- Checks coverage thresholds and fails if not met
- Uploads coverage to Codecov (if configured)
- Comments on pull requests with coverage information
- Publishes coverage reports to GitHub Pages (main branch only)
- Runs weekly on Monday at 9 AM UTC

### 2. Coverage Threshold Checks

**File:** `scripts/check-coverage-thresholds.js`

This script validates that coverage meets minimum thresholds:

- **Global:** 80% for branches, functions, lines, statements
- **Critical Paths:** 80% (Security, Payments, Auth)
- **Business Logic:** 70% (Services, API Routes)
- **UI Components:** 60% (Components, Hooks)

The script:
- Reads coverage summary from `coverage/coverage-summary.json`
- Checks global and file-level coverage
- Categorizes files by type (critical, business, UI)
- Reports failing files
- Exits with error code if thresholds not met

**Usage:**
```bash
npm run test:coverage:check
```

### 3. Coverage Summary Generator

**File:** `scripts/generate-coverage-summary.js`

Generates a detailed coverage summary with:
- Overall coverage metrics
- Coverage by category (Critical Paths, Business Logic, UI Components, Utilities)
- Markdown and JSON output formats

**Usage:**
```bash
npm run test:coverage:summary
```

**Output:**
- `coverage-summary.md` - Human-readable markdown report
- `coverage/coverage-summary-detailed.json` - Machine-readable JSON report

### 4. Weekly Coverage Reports

**File:** `scripts/generate-weekly-coverage-report.js`

Generates weekly coverage reports that:
- Compare current coverage with previous week
- Show trends (improvements/declines)
- Provide recommendations
- Store historical data for trend analysis

**Usage:**
```bash
npm run test:coverage:weekly
```

**Output:**
- `docs/testing/coverage-reports/coverage-YYYY-MM-DD.md` - Weekly markdown report
- `docs/testing/coverage-reports/coverage-YYYY-MM-DD.json` - Weekly JSON data

## Setup Instructions

### 1. GitHub Actions Setup

The workflow is automatically triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Monday 9 AM UTC)
- Manual trigger via `workflow_dispatch`

### 2. Codecov Integration (Optional)

To enable Codecov integration:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Get your Codecov token
4. Add it as a GitHub secret named `CODECOV_TOKEN`
5. The workflow will automatically upload coverage

### 3. GitHub Pages Setup (Optional)

To enable coverage dashboard on GitHub Pages:

1. Go to repository Settings → Pages
2. Set source to "GitHub Actions"
3. The workflow will automatically publish coverage reports

### 4. Local Development

Run coverage checks locally:

```bash
# Generate coverage
npm run test:coverage

# Check thresholds
npm run test:coverage:check

# Generate summary
npm run test:coverage:summary

# Generate weekly report
npm run test:coverage:weekly
```

## Coverage Reports

### HTML Report

The most detailed coverage report is available as HTML:

**Location:** `coverage/index.html`

**Features:**
- File-by-file coverage breakdown
- Line-by-line coverage highlighting
- Branch coverage visualization
- Search and filter capabilities

### JSON Summary

Machine-readable coverage summary:

**Location:** `coverage/coverage-summary.json`

**Format:**
```json
{
  "total": {
    "branches": { "total": 1000, "covered": 800, "pct": 80.0 },
    "functions": { "total": 500, "covered": 400, "pct": 80.0 },
    "lines": { "total": 2000, "covered": 1600, "pct": 80.0 },
    "statements": { "total": 2000, "covered": 1600, "pct": 80.0 }
  },
  "files": { ... }
}
```

### LCOV Report

Standard LCOV format for external tools:

**Location:** `coverage/lcov.info`

## Coverage Thresholds

### Global Thresholds

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

### Category-Specific Thresholds

| Category | Threshold | Files |
|----------|-----------|-------|
| Critical Paths | 80% | Security, Payments, Auth |
| Business Logic | 70% | Services, API Routes |
| UI Components | 60% | Components, Hooks |
| Utilities | 80% | Utility Functions |

### File-Specific Thresholds

Some files have custom thresholds defined in `vitest.config.ts`:

- Test files: 0% (excluded)
- Library files: 85%
- Component files: 70%
- Hook files: 80%

## Weekly Reports

Weekly coverage reports are automatically generated and stored in:

`docs/testing/coverage-reports/`

Each report includes:
- Current week's coverage metrics
- Comparison with previous week
- Trend analysis (improvements/declines)
- Recommendations for improvement
- Links to detailed reports

### Report Naming

- Markdown: `coverage-YYYY-MM-DD.md`
- JSON: `coverage-YYYY-MM-DD.json`

### Accessing Reports

1. **Local:** Check `docs/testing/coverage-reports/`
2. **CI/CD:** Reports are generated in GitHub Actions
3. **GitHub Pages:** Coverage dashboard (if enabled)

## Coverage Dashboard

### GitHub Pages Dashboard

If GitHub Pages is enabled, coverage reports are published at:

`https://[username].github.io/[repo]/coverage/`

### Local Dashboard

To view coverage locally:

```bash
npm run test:coverage
open coverage/index.html
```

## Best Practices

### 1. Pre-commit Checks

Consider adding a pre-commit hook to check coverage:

```bash
npm run test:coverage:check
```

### 2. PR Reviews

Review coverage changes in pull requests:
- Check PR comments for coverage summary
- Review coverage artifacts
- Ensure new code has adequate coverage

### 3. Weekly Reviews

Review weekly coverage reports:
- Track coverage trends
- Identify declining areas
- Prioritize improvements

### 4. Coverage Goals

Set incremental coverage goals:
- Phase 1: 5-6% overall (Critical paths)
- Phase 2: 8-10% overall (Business logic)
- Phase 3: 12-15% overall (User-facing)
- Phase 4+: 15%+ overall (Incremental)

## Troubleshooting

### Coverage Not Generating

1. Ensure tests are running: `npm test`
2. Check vitest config: `vitest.config.ts`
3. Verify coverage provider: Should be `v8`

### Threshold Checks Failing

1. Review failing files in output
2. Check category thresholds
3. Improve coverage for failing files
4. Adjust thresholds if needed (in `vitest.config.ts`)

### Weekly Reports Not Generating

1. Ensure coverage file exists: `coverage/coverage-summary.json`
2. Check reports directory: `docs/testing/coverage-reports/`
3. Run manually: `npm run test:coverage:weekly`

### CI/CD Issues

1. Check GitHub Actions logs
2. Verify environment variables
3. Check coverage file paths
4. Review workflow configuration

## Future Enhancements

- [ ] Coverage trend visualization
- [ ] Integration with coverage services (Codecov, Coveralls)
- [ ] Automated coverage improvement suggestions
- [ ] Coverage badges for README
- [ ] Historical coverage charts
- [ ] Coverage alerts for declining trends

## Resources

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [Codecov Documentation](https://docs.codecov.com/)
- [Testing Standards](./TESTING_STANDARDS.md)
- [Test Coverage Action Plan](../test-coverage-action-plan.md)

