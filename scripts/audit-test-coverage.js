/**
 * Audit API Test Coverage
 * Identifies API routes with and without test files
 */

const fs = require('fs');
const path = require('path');

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function findTestFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function getRoutePathFromFile(filePath) {
  const relativePath = path.relative(path.join(process.cwd(), 'app/api'), filePath);
  const routePath = '/' + relativePath.replace(/\/route\.(ts|js)$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
  return routePath;
}

function getTestNameFromRoute(routePath) {
  // Convert route path to test file name
  // /api/accounts -> accounts-api.test.ts
  // /api/bills -> bills-api.test.ts
  // /api/analytics/clients -> analytics-clients-api.test.ts
  const parts = routePath.split('/').filter(p => p && p !== 'api');
  const testName = parts.join('-') + '-api.test.ts';
  return testName;
}

function categorizeRoute(routePath) {
  const categories = {
    financial: ['accounts', 'bills', 'budgets', 'expenses', 'invoices', 'payments', 'transactions', 'reconciliation'],
    core: ['clients', 'vendors', 'projects', 'workflows', 'orders', 'products'],
    analytics: ['analytics', 'dashboard', 'dashboards', 'reports', 'performance'],
    integrations: ['integrations', 'webhooks', 'marketplace'],
    admin: ['admin', 'organizations', 'settings', 'employees', 'hr'],
    ai: ['ai', 'chat', 'financial-intelligence'],
  };
  
  const categoryKey = Object.keys(categories).find(key => 
    categories[key].some(cat => routePath.includes(cat))
  ) || 'other';
  
  return {
    categoryGroup: categoryKey,
    priority: categoryKey === 'financial' ? 'high' : 
              categoryKey === 'core' ? 'high' :
              categoryKey === 'analytics' ? 'medium' :
              categoryKey === 'integrations' ? 'medium' : 'low',
  };
}

function main() {
  console.log('🔍 Auditing API test coverage...\n');
  
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const testDir = path.join(process.cwd(), '__tests__', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    process.exit(1);
  }
  
  const routeFiles = findRouteFiles(apiDir);
  const testFiles = findTestFiles(testDir);
  
  console.log(`Found ${routeFiles.length} route files`);
  console.log(`Found ${testFiles.length} test files\n`);
  
  // Map routes to tests
  const routes = routeFiles.map(routeFile => {
    const relativePath = path.relative(path.join(process.cwd(), 'app/api'), routeFile);
    const routePath = '/' + relativePath.replace(/\/route\.(ts|js)$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
    const category = routePath.split('/')[2] || 'root';
    const testName = getTestNameFromRoute(routePath);
    
    // Check if test exists
    const testFile = testFiles.find(tf => {
      const testFileName = path.basename(tf);
      return testFileName === testName || 
             testFileName.includes(category) ||
             testFiles.some(t => path.basename(t).includes(category.replace(/-/g, '')));
    });
    
    const categorized = categorizeRoute(routePath);
    
    // Extract HTTP methods from route file
    let methods = [];
    try {
      const content = fs.readFileSync(routeFile, 'utf-8');
      if (/export\s+(async\s+)?function\s+GET/i.test(content)) methods.push('GET');
      if (/export\s+(async\s+)?function\s+POST/i.test(content)) methods.push('POST');
      if (/export\s+(async\s+)?function\s+PUT/i.test(content)) methods.push('PUT');
      if (/export\s+(async\s+)?function\s+PATCH/i.test(content)) methods.push('PATCH');
      if (/export\s+(async\s+)?function\s+DELETE/i.test(content)) methods.push('DELETE');
    } catch (error) {
      // Ignore
    }
    
    return {
      filePath: relativePath,
      routePath,
      category,
      categoryGroup: categorized.categoryGroup,
      priority: categorized.priority,
      methods,
      methodCount: methods.length,
      hasTest: !!testFile,
      testFile: testFile ? path.relative(process.cwd(), testFile) : null,
      expectedTestName: testName,
    };
  });
  
  // Statistics
  const tested = routes.filter(r => r.hasTest);
  const untested = routes.filter(r => !r.hasTest);
  
  const byCategory = routes.reduce((acc, route) => {
    const cat = route.categoryGroup;
    if (!acc[cat]) acc[cat] = { total: 0, tested: 0, untested: 0 };
    acc[cat].total++;
    if (route.hasTest) acc[cat].tested++;
    else acc[cat].untested++;
    return acc;
  }, {});
  
  const byPriority = routes.reduce((acc, route) => {
    const pri = route.priority;
    if (!acc[pri]) acc[pri] = { total: 0, tested: 0, untested: 0 };
    acc[pri].total++;
    if (route.hasTest) acc[pri].tested++;
    else acc[pri].untested++;
    return acc;
  }, {});
  
  // Generate report
  const report = {
    summary: {
      totalRoutes: routeFiles.length,
      tested: tested.length,
      untested: untested.length,
      coverage: ((tested.length / routeFiles.length) * 100).toFixed(1) + '%',
      totalOperations: routes.reduce((sum, r) => sum + r.methodCount, 0),
      testedOperations: tested.reduce((sum, r) => sum + r.methodCount, 0),
    },
    byCategory,
    byPriority,
    untestedRoutes: untested
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .map(r => ({
        route: r.routePath,
        category: r.category,
        categoryGroup: r.categoryGroup,
        priority: r.priority,
        methods: r.methods,
        file: r.filePath,
        expectedTestName: r.expectedTestName,
      })),
    testedRoutes: tested.map(r => ({
      route: r.routePath,
      category: r.category,
      methods: r.methods,
      testFile: r.testFile,
    })),
  };
  
  // Write report
  const reportPath = path.join(process.cwd(), 'docs/testing/api-test-coverage-gap.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate markdown report
  let markdown = `# API Test Coverage Gap Analysis\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Routes:** ${report.summary.totalRoutes}\n`;
  markdown += `- **Tested Routes:** ${report.summary.tested}\n`;
  markdown += `- **Untested Routes:** ${report.summary.untested}\n`;
  markdown += `- **Coverage:** ${report.summary.coverage}\n`;
  markdown += `- **Total Operations:** ${report.summary.totalOperations}\n`;
  markdown += `- **Tested Operations:** ${report.summary.testedOperations}\n\n`;
  
  markdown += `## Coverage by Category\n\n`;
  markdown += `| Category | Total | Tested | Untested | Coverage |\n`;
  markdown += `|----------|-------|--------|----------|----------|\n`;
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const coverage = ((stats.tested / stats.total) * 100).toFixed(1) + '%';
    markdown += `| ${cat} | ${stats.total} | ${stats.tested} | ${stats.untested} | ${coverage} |\n`;
  });
  
  markdown += `\n## Coverage by Priority\n\n`;
  markdown += `| Priority | Total | Tested | Untested | Coverage |\n`;
  markdown += `|----------|-------|--------|----------|----------|\n`;
  Object.entries(byPriority).forEach(([pri, stats]) => {
    const coverage = ((stats.tested / stats.total) * 100).toFixed(1) + '%';
    markdown += `| ${pri} | ${stats.total} | ${stats.tested} | ${stats.untested} | ${coverage} |\n`;
  });
  
  markdown += `\n## Untested Routes (${untested.length})\n\n`;
  
  // Group by priority
  const highPriority = untested.filter(r => r.priority === 'high');
  const mediumPriority = untested.filter(r => r.priority === 'medium');
  const lowPriority = untested.filter(r => r.priority === 'low');
  
  if (highPriority.length > 0) {
    markdown += `### High Priority (${highPriority.length})\n\n`;
    markdown += `| Route | Category | Methods | Expected Test File |\n`;
    markdown += `|-------|----------|---------|-------------------|\n`;
    highPriority.forEach(r => {
      markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | \`${r.expectedTestName}\` |\n`;
    });
    markdown += `\n`;
  }
  
  if (mediumPriority.length > 0) {
    markdown += `### Medium Priority (${mediumPriority.length})\n\n`;
    markdown += `| Route | Category | Methods | Expected Test File |\n`;
    markdown += `|-------|----------|---------|-------------------|\n`;
    mediumPriority.slice(0, 50).forEach(r => {
      markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | \`${r.expectedTestName}\` |\n`;
    });
    if (mediumPriority.length > 50) {
      markdown += `\n*... and ${mediumPriority.length - 50} more medium priority routes*\n`;
    }
    markdown += `\n`;
  }
  
  if (lowPriority.length > 0) {
    markdown += `### Low Priority (${lowPriority.length})\n\n`;
    markdown += `*${lowPriority.length} low priority routes need tests*\n\n`;
  }
  
  fs.writeFileSync(reportPath, markdown);
  
  // Also write JSON for programmatic access
  const jsonPath = path.join(process.cwd(), 'docs/testing/api-test-coverage-gap.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Test coverage audit complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Routes: ${report.summary.totalRoutes}`);
  console.log(`   Tested: ${report.summary.tested} (${report.summary.coverage})`);
  console.log(`   Untested: ${report.summary.untested}\n`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📄 JSON report saved to: ${jsonPath}\n`);
  
  // Print top untested routes by priority
  console.log('🔴 High Priority Untested Routes:');
  highPriority.slice(0, 10).forEach(r => {
    console.log(`   - ${r.routePath} (${r.methods.join(', ')}) -> ${r.expectedTestName}`);
  });
  if (highPriority.length > 10) {
    console.log(`   ... and ${highPriority.length - 10} more`);
  }
}

try {
  main();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}

