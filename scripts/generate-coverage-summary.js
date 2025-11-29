#!/usr/bin/env node

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

// Category patterns
const CATEGORIES = {
  'Critical Paths': [
    /lib\/services\/(payment|invoice|transaction|auth|security)/,
    /lib\/utils\/(security|rbac)/,
    /app\/api\/(payments|invoices|auth)/,
  ],
  'Business Logic': [
    /lib\/services\//,
    /app\/api\//,
  ],
  'UI Components': [
    /components\//,
    /hooks\//,
  ],
  'Utilities': [
    /lib\/utils\//,
  ],
};

function getCategory(filePath) {
  for (const [category, patterns] of Object.entries(CATEGORIES)) {
    if (patterns.some(pattern => pattern.test(filePath))) {
      return category;
    }
  }
  return 'Other';
}

function calculateCategoryStats(coverage, categoryName) {
  const categoryPatterns = CATEGORIES[categoryName] || [];
  const files = Object.keys(coverage).filter(key => {
    if (key === 'total') return false;
    return categoryPatterns.some(pattern => pattern.test(key));
  });

  if (files.length === 0) {
    return null;
  }

  const stats = {
    files: files.length,
    branches: { covered: 0, total: 0, pct: 0 },
    functions: { covered: 0, total: 0, pct: 0 },
    lines: { covered: 0, total: 0, pct: 0 },
    statements: { covered: 0, total: 0, pct: 0 },
  };

  files.forEach(filePath => {
    const file = coverage[filePath];
    ['branches', 'functions', 'lines', 'statements'].forEach(key => {
      stats[key].covered += file[key].covered;
      stats[key].total += file[key].total;
    });
  });

  ['branches', 'functions', 'lines', 'statements'].forEach(key => {
    if (stats[key].total > 0) {
      stats[key].pct = (stats[key].covered / stats[key].total) * 100;
    }
  });

  return stats;
}

function generateSummary() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Coverage file not found:', COVERAGE_FILE);
    console.log('💡 Run "npm run test:coverage" first');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
  const total = coverage.total;

  const summary = {
    generated: new Date().toISOString(),
    overall: {
      branches: total.branches.pct,
      functions: total.functions.pct,
      lines: total.lines.pct,
      statements: total.statements.pct,
    },
    categories: {},
    trends: {
      // This would be populated by comparing with previous reports
      branches: null,
      functions: null,
      lines: null,
      statements: null,
    },
  };

  // Calculate category stats
  Object.keys(CATEGORIES).forEach(category => {
    const stats = calculateCategoryStats(coverage, category);
    if (stats) {
      summary.categories[category] = {
        files: stats.files,
        branches: stats.branches.pct,
        functions: stats.functions.pct,
        lines: stats.lines.pct,
        statements: stats.statements.pct,
      };
    }
  });

  // Generate markdown report
  const markdown = `# 📊 Test Coverage Summary

**Generated:** ${new Date().toLocaleString()}

## Overall Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Branches | ${total.branches.pct.toFixed(2)}% | ${total.branches.pct >= 80 ? '✅' : '⚠️'} |
| Functions | ${total.functions.pct.toFixed(2)}% | ${total.functions.pct >= 80 ? '✅' : '⚠️'} |
| Lines | ${total.lines.pct.toFixed(2)}% | ${total.lines.pct >= 80 ? '✅' : '⚠️'} |
| Statements | ${total.statements.pct.toFixed(2)}% | ${total.statements.pct >= 80 ? '✅' : '⚠️'} |

## Coverage by Category

${Object.entries(summary.categories).map(([category, stats]) => `
### ${category}

- **Files:** ${stats.files}
- **Branches:** ${stats.branches.toFixed(2)}%
- **Functions:** ${stats.functions.toFixed(2)}%
- **Lines:** ${stats.lines.toFixed(2)}%
- **Statements:** ${stats.statements.toFixed(2)}%
`).join('\n')}

## Coverage Thresholds

- **Critical Paths:** 80%+ (Security, Payments, Auth)
- **Business Logic:** 70%+ (Services, API Routes)
- **UI Components:** 60%+ (Components, Hooks)
- **Utilities:** 80%+ (Utility Functions)

## Files

- [HTML Report](./coverage/index.html)
- [JSON Summary](./coverage/coverage-summary.json)
- [LCOV Report](./coverage/lcov.info)

## Next Steps

1. Review files below threshold in HTML report
2. Prioritize critical path coverage improvements
3. Add tests for uncovered business logic
4. Maintain coverage as codebase grows
`;

  // Write markdown summary
  const summaryPath = path.join(__dirname, '..', 'coverage-summary.md');
  fs.writeFileSync(summaryPath, markdown);

  // Write JSON summary
  const jsonPath = path.join(__dirname, '..', 'coverage', 'coverage-summary-detailed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  console.log('✅ Coverage summary generated');
  console.log(`📄 Markdown: ${summaryPath}`);
  console.log(`📄 JSON: ${jsonPath}`);
}

generateSummary();

