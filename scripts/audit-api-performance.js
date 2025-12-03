/**
 * API Performance Audit Script
 * Measures response times for API endpoints
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

function getRoutePathFromFile(filePath) {
  const relativePath = path.relative(path.join(process.cwd(), 'app/api'), filePath);
  const routePath = '/' + relativePath.replace(/\/route\.(ts|js)$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
  return routePath;
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
  console.log('🔍 Auditing API routes for performance considerations...\n');
  
  const apiDir = path.join(process.cwd(), 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    process.exit(1);
  }
  
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Found ${routeFiles.length} route files\n`);
  
  // Analyze routes for performance considerations
  const routes = routeFiles.map(routeFile => {
    const relativePath = path.relative(path.join(process.cwd(), 'app/api'), routeFile);
    const routePath = getRoutePathFromFile(routeFile);
    const category = routePath.split('/')[2] || 'root';
    const categorized = categorizeRoute(routePath);
    
    // Extract HTTP methods and check for performance patterns
    let methods = [];
    let hasPagination = false;
    let hasCaching = false;
    let hasDatabaseQueries = false;
    let hasComplexQueries = false;
    
    try {
      const content = fs.readFileSync(routeFile, 'utf-8');
      
      if (/export\s+(async\s+)?function\s+GET/i.test(content)) methods.push('GET');
      if (/export\s+(async\s+)?function\s+POST/i.test(content)) methods.push('POST');
      if (/export\s+(async\s+)?function\s+PUT/i.test(content)) methods.push('PUT');
      if (/export\s+(async\s+)?function\s+PATCH/i.test(content)) methods.push('PATCH');
      if (/export\s+(async\s+)?function\s+DELETE/i.test(content)) methods.push('DELETE');
      
      // Check for pagination
      hasPagination = /page|limit|offset|pagination/i.test(content);
      
      // Check for caching
      hasCaching = /cache|Cache|redis|Redis|revalidate/i.test(content);
      
      // Check for database queries
      hasDatabaseQueries = /db\.|\.select\(|\.insert\(|\.update\(|\.delete\(|await\s+sql/i.test(content);
      
      // Check for complex queries (joins, aggregations)
      hasComplexQueries = /join|JOIN|groupBy|GROUP BY|aggregate|COUNT\(|SUM\(|AVG\(/i.test(content);
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
      hasPagination,
      hasCaching,
      hasDatabaseQueries,
      hasComplexQueries,
      performanceRisk: !hasPagination && hasDatabaseQueries && methods.includes('GET') ? 'high' :
                       hasComplexQueries && !hasCaching ? 'medium' :
                       hasDatabaseQueries && !hasPagination && methods.includes('GET') ? 'medium' : 'low',
    };
  });
  
  // Statistics
  const highRisk = routes.filter(r => r.performanceRisk === 'high');
  const mediumRisk = routes.filter(r => r.performanceRisk === 'medium');
  const lowRisk = routes.filter(r => r.performanceRisk === 'low');
  
  const byCategory = routes.reduce((acc, route) => {
    const cat = route.categoryGroup;
    if (!acc[cat]) acc[cat] = { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, withPagination: 0, withCaching: 0 };
    acc[cat].total++;
    if (route.performanceRisk === 'high') acc[cat].highRisk++;
    else if (route.performanceRisk === 'medium') acc[cat].mediumRisk++;
    else acc[cat].lowRisk++;
    if (route.hasPagination) acc[cat].withPagination++;
    if (route.hasCaching) acc[cat].withCaching++;
    return acc;
  }, {});
  
  // Generate report
  const report = {
    summary: {
      totalRoutes: routeFiles.length,
      highRisk: highRisk.length,
      mediumRisk: mediumRisk.length,
      lowRisk: lowRisk.length,
      withPagination: routes.filter(r => r.hasPagination).length,
      withCaching: routes.filter(r => r.hasCaching).length,
      withDatabaseQueries: routes.filter(r => r.hasDatabaseQueries).length,
      withComplexQueries: routes.filter(r => r.hasComplexQueries).length,
    },
    byCategory,
    highRiskRoutes: highRisk.map(r => ({
      route: r.routePath,
      category: r.category,
      methods: r.methods,
      file: r.filePath,
      issues: [
        !r.hasPagination && 'Missing pagination',
        !r.hasCaching && 'No caching',
        r.hasComplexQueries && 'Complex queries',
      ].filter(Boolean),
    })),
    mediumRiskRoutes: mediumRisk.slice(0, 50).map(r => ({
      route: r.routePath,
      category: r.category,
      methods: r.methods,
      file: r.filePath,
      issues: [
        !r.hasPagination && r.hasDatabaseQueries && 'Consider pagination',
        !r.hasCaching && r.hasComplexQueries && 'Consider caching',
      ].filter(Boolean),
    })),
  };
  
  // Write report
  const reportPath = path.join(process.cwd(), 'docs/performance/api-performance-audit.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate markdown report
  let markdown = `# API Performance Audit\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Routes:** ${report.summary.totalRoutes}\n`;
  markdown += `- **High Risk Routes:** ${report.summary.highRisk}\n`;
  markdown += `- **Medium Risk Routes:** ${report.summary.mediumRisk}\n`;
  markdown += `- **Low Risk Routes:** ${report.summary.lowRisk}\n`;
  markdown += `- **Routes with Pagination:** ${report.summary.withPagination}\n`;
  markdown += `- **Routes with Caching:** ${report.summary.withCaching}\n`;
  markdown += `- **Routes with Database Queries:** ${report.summary.withDatabaseQueries}\n`;
  markdown += `- **Routes with Complex Queries:** ${report.summary.withComplexQueries}\n\n`;
  
  markdown += `## Performance Risk by Category\n\n`;
  markdown += `| Category | Total | High Risk | Medium Risk | With Pagination | With Caching |\n`;
  markdown += `|----------|-------|-----------|-------------|-----------------|--------------|\n`;
  Object.entries(byCategory).forEach(([cat, stats]) => {
    markdown += `| ${cat} | ${stats.total} | ${stats.highRisk} | ${stats.mediumRisk} | ${stats.withPagination} | ${stats.withCaching} |\n`;
  });
  
  markdown += `\n## High Risk Routes (${highRisk.length})\n\n`;
  markdown += `These routes may have performance issues and should be prioritized for optimization:\n\n`;
  markdown += `| Route | Category | Methods | Issues |\n`;
  markdown += `|-------|----------|---------|--------|\n`;
  highRisk.forEach(r => {
    const issues = [
      !r.hasPagination && 'Missing pagination',
      !r.hasCaching && 'No caching',
      r.hasComplexQueries && 'Complex queries',
    ].filter(Boolean);
    markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | ${issues.join(', ')} |\n`;
  });
  
  if (mediumRisk.length > 0) {
    markdown += `\n## Medium Risk Routes (${mediumRisk.length})\n\n`;
    markdown += `These routes should be monitored and may benefit from optimization:\n\n`;
    markdown += `| Route | Category | Methods | Recommendations |\n`;
    markdown += `|-------|----------|---------|-----------------|\n`;
    mediumRisk.slice(0, 20).forEach(r => {
      const issues = [
        !r.hasPagination && r.hasDatabaseQueries && 'Consider pagination',
        !r.hasCaching && r.hasComplexQueries && 'Consider caching',
      ].filter(Boolean);
      markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | ${issues.join(', ')} |\n`;
    });
    if (mediumRisk.length > 20) {
      markdown += `\n*... and ${mediumRisk.length - 20} more medium risk routes*\n`;
    }
  }
  
  markdown += `\n## Recommendations\n\n`;
  markdown += `1. **Add Pagination**: ${routes.filter(r => !r.hasPagination && r.hasDatabaseQueries && r.methods.includes('GET')).length} GET routes with database queries are missing pagination\n`;
  markdown += `2. **Implement Caching**: ${routes.filter(r => !r.hasCaching && r.hasComplexQueries).length} routes with complex queries could benefit from caching\n`;
  markdown += `3. **Optimize Queries**: Review complex queries for N+1 problems and missing indexes\n`;
  markdown += `4. **Load Testing**: Run load tests on high-risk routes to identify bottlenecks\n`;
  
  fs.writeFileSync(reportPath, markdown);
  
  // Also write JSON for programmatic access
  const jsonPath = path.join(process.cwd(), 'docs/performance/api-performance-audit.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Performance audit complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Routes: ${report.summary.totalRoutes}`);
  console.log(`   High Risk: ${report.summary.highRisk}`);
  console.log(`   Medium Risk: ${report.summary.mediumRisk}`);
  console.log(`   With Pagination: ${report.summary.withPagination}`);
  console.log(`   With Caching: ${report.summary.withCaching}\n`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📄 JSON report saved to: ${jsonPath}\n`);
  
  // Print high-risk routes
  console.log('🔴 High Risk Routes (need optimization):');
  highRisk.slice(0, 10).forEach(r => {
    const issues = [
      !r.hasPagination && 'Missing pagination',
      !r.hasCaching && 'No caching',
      r.hasComplexQueries && 'Complex queries',
    ].filter(Boolean);
    console.log(`   - ${r.routePath} (${r.methods.join(', ')}) - ${issues.join(', ')}`);
  });
  if (highRisk.length > 10) {
    console.log(`   ... and ${highRisk.length - 10} more`);
  }
}

try {
  main();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}

