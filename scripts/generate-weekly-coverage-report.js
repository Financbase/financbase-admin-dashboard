#!/usr/bin/env node

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 * 
 * Weekly Coverage Report Generator
 * 
 * This script generates a weekly coverage report comparing current coverage
 * with previous week's coverage and identifying trends.
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'testing', 'coverage-reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function getPreviousWeekReport() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(file => file.startsWith('coverage-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const latestFile = path.join(REPORTS_DIR, files[0]);
  return JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
}

function calculateTrend(current, previous) {
  if (!previous) return null;
  
  return {
    branches: current.branches - previous.branches,
    functions: current.functions - previous.functions,
    lines: current.lines - previous.lines,
    statements: current.statements - previous.statements,
  };
}

function formatTrend(value) {
  if (value === null) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  const icon = value >= 0 ? '📈' : '📉';
  return `${icon} ${sign}${value.toFixed(2)}%`;
}

function generateWeeklyReport() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Coverage file not found:', COVERAGE_FILE);
    console.log('💡 Run "npm run test:coverage" first');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
  const total = coverage.total;

  const current = {
    branches: total.branches.pct,
    functions: total.functions.pct,
    lines: total.lines.pct,
    statements: total.statements.pct,
  };

  const previous = getPreviousWeekReport();
  const trend = calculateTrend(current, previous);

  const report = {
    week: new Date().toISOString().split('T')[0],
    generated: new Date().toISOString(),
    coverage: current,
    trend: trend,
    previous: previous ? previous.coverage : null,
  };

  // Save JSON report
  const reportFileName = `coverage-${report.week}.json`;
  const reportPath = path.join(REPORTS_DIR, reportFileName);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown report
  const markdown = `# 📊 Weekly Coverage Report

**Week of:** ${new Date(report.week).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Generated:** ${new Date().toLocaleString()}

## Coverage Metrics

| Metric | Current | Previous | Trend | Status |
|--------|---------|----------|-------|--------|
| Branches | ${current.branches.toFixed(2)}% | ${previous ? previous.branches.toFixed(2) + '%' : 'N/A'} | ${formatTrend(trend?.branches)} | ${current.branches >= 80 ? '✅' : '⚠️'} |
| Functions | ${current.functions.toFixed(2)}% | ${previous ? previous.functions.toFixed(2) + '%' : 'N/A'} | ${formatTrend(trend?.functions)} | ${current.functions >= 80 ? '✅' : '⚠️'} |
| Lines | ${current.lines.toFixed(2)}% | ${previous ? previous.lines.toFixed(2) + '%' : 'N/A'} | ${formatTrend(trend?.lines)} | ${current.lines >= 80 ? '✅' : '⚠️'} |
| Statements | ${current.statements.toFixed(2)}% | ${previous ? previous.statements.toFixed(2) + '%' : 'N/A'} | ${formatTrend(trend?.statements)} | ${current.statements >= 80 ? '✅' : '⚠️'} |

## Analysis

${trend ? `
### Coverage Trends

${trend.branches >= 0 ? '✅' : '⚠️'} **Branches:** ${trend.branches >= 0 ? 'Improved' : 'Declined'} by ${Math.abs(trend.branches).toFixed(2)}%
${trend.functions >= 0 ? '✅' : '⚠️'} **Functions:** ${trend.functions >= 0 ? 'Improved' : 'Declined'} by ${Math.abs(trend.functions).toFixed(2)}%
${trend.lines >= 0 ? '✅' : '⚠️'} **Lines:** ${trend.lines >= 0 ? 'Improved' : 'Declined'} by ${Math.abs(trend.lines).toFixed(2)}%
${trend.statements >= 0 ? '✅' : '⚠️'} **Statements:** ${trend.statements >= 0 ? 'Improved' : 'Declined'} by ${Math.abs(trend.statements).toFixed(2)}%
` : '### First Report\n\nThis is the first coverage report. Future reports will include trend analysis.'}

## Recommendations

${current.lines < 80 ? `
⚠️ **Overall coverage is below 80% target**

### Priority Actions:
1. Focus on critical path coverage (Security, Payments, Auth)
2. Add tests for uncovered business logic
3. Improve coverage for frequently used components
4. Review and test error handling paths
` : `
✅ **Overall coverage meets target threshold**

### Maintenance Actions:
1. Maintain coverage as new features are added
2. Review and improve coverage for new code
3. Monitor coverage trends weekly
4. Address any declining coverage areas
`}

## Coverage Files

- [HTML Report](../../coverage/index.html)
- [JSON Summary](../../coverage/coverage-summary.json)
- [Detailed Report](./${reportFileName})

## Next Steps

1. Review detailed coverage in HTML report
2. Identify files with low coverage
3. Prioritize test improvements based on business impact
4. Track progress in next week's report

---

*This report is generated automatically. For questions or issues, contact the development team.*
`;

  const markdownPath = path.join(REPORTS_DIR, `coverage-${report.week}.md`);
  fs.writeFileSync(markdownPath, markdown);

  console.log('✅ Weekly coverage report generated');
  console.log(`📄 Markdown: ${markdownPath}`);
  console.log(`📄 JSON: ${reportPath}`);
  
  if (trend) {
    console.log('\n📊 Trends:');
    console.log(`  Branches: ${formatTrend(trend.branches)}`);
    console.log(`  Functions: ${formatTrend(trend.functions)}`);
    console.log(`  Lines: ${formatTrend(trend.lines)}`);
    console.log(`  Statements: ${formatTrend(trend.statements)}`);
  }
}

generateWeeklyReport();

