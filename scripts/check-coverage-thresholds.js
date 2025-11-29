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

// Coverage thresholds
const THRESHOLDS = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  critical: {
    branches: 40, // Minimum for launch readiness
    functions: 40,
    lines: 40,
    statements: 40,
  },
  business: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  ui: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60,
  },
};

// Critical path patterns
const CRITICAL_PATHS = [
  /lib\/services\/(payment|invoice|transaction|auth|security)/,
  /lib\/utils\/(security|rbac)/,
  /app\/api\/(payments|invoices|auth)/,
];

// Business logic patterns
const BUSINESS_PATTERNS = [
  /lib\/services\//,
  /app\/api\//,
];

// UI patterns
const UI_PATTERNS = [
  /components\//,
  /hooks\//,
];

function getCategory(filePath) {
  if (CRITICAL_PATHS.some(pattern => pattern.test(filePath))) {
    return 'critical';
  }
  if (BUSINESS_PATTERNS.some(pattern => pattern.test(filePath))) {
    return 'business';
  }
  if (UI_PATTERNS.some(pattern => pattern.test(filePath))) {
    return 'ui';
  }
  return 'global';
}

function checkCoverage() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Coverage file not found:', COVERAGE_FILE);
    console.log('💡 Run "npm run test:coverage" first');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
  const total = coverage.total;

  console.log('\n📊 Coverage Threshold Check\n');
  console.log('='.repeat(60));

  let hasFailures = false;
  const results = {
    global: {},
    critical: { files: [], passed: true },
    business: { files: [], passed: true },
    ui: { files: [], passed: true },
  };

  // Check global coverage
  console.log('\n🌐 Global Coverage:');
  ['branches', 'functions', 'lines', 'statements'].forEach(key => {
    const pct = total[key].pct;
    const threshold = THRESHOLDS.global[key];
    const passed = pct >= threshold;
    const icon = passed ? '✅' : '❌';
    
    console.log(`  ${icon} ${key.padEnd(12)}: ${pct.toFixed(2)}% (threshold: ${threshold}%)`);
    
    if (!passed) {
      hasFailures = true;
    }
    
    results.global[key] = { pct, threshold, passed };
  });

  // Check file-level coverage
  console.log('\n📁 File-Level Coverage:');
  
  Object.keys(coverage).forEach(filePath => {
    if (filePath === 'total') return;
    
    const file = coverage[filePath];
    const category = getCategory(filePath);
    const threshold = THRESHOLDS[category];
    
    let filePassed = true;
    ['branches', 'functions', 'lines', 'statements'].forEach(key => {
      const pct = file[key].pct;
      if (pct < threshold[key] && file[key].total > 0) {
        filePassed = false;
      }
    });

    if (!filePassed) {
      const relativePath = filePath.replace(process.cwd() + '/', '');
      results[category].files.push({
        path: relativePath,
        coverage: {
          branches: file.branches.pct,
          functions: file.functions.pct,
          lines: file.lines.pct,
          statements: file.statements.pct,
        },
      });
      results[category].passed = false;
    }
  });

  // Print category summaries
  console.log('\n📊 Category Summaries:');
  ['critical', 'business', 'ui'].forEach(category => {
    const count = results[category].files.length;
    const icon = results[category].passed ? '✅' : '❌';
    console.log(`  ${icon} ${category.padEnd(12)}: ${count} files below threshold`);
  });

  // Print failing files
  ['critical', 'business', 'ui'].forEach(category => {
    if (results[category].files.length > 0) {
      console.log(`\n❌ ${category.toUpperCase()} Files Below Threshold:`);
      results[category].files.slice(0, 10).forEach(file => {
        console.log(`  - ${file.path}`);
        console.log(`    Coverage: ${file.coverage.lines.toFixed(2)}% lines, ${file.coverage.functions.toFixed(2)}% functions`);
      });
      if (results[category].files.length > 10) {
        console.log(`  ... and ${results[category].files.length - 10} more files`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));

  if (hasFailures || !results.critical.passed || !results.business.passed) {
    console.log('\n❌ Coverage thresholds not met');
    console.log('💡 Improve coverage for failing files to meet thresholds');
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!');
    process.exit(0);
  }
}

checkCoverage();

