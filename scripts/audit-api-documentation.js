/**
 * Audit API Documentation Coverage
 * Identifies routes with and without Swagger/OpenAPI annotations
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

function checkForSwaggerAnnotations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasSwagger = /@swagger|@openapi/i.test(content);
    const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);
    
    // Extract route path from file path
    const relativePath = path.relative(path.join(process.cwd(), 'app/api'), filePath);
    const routePath = '/' + relativePath.replace(/\/route\.(ts|js)$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
    
    // Extract HTTP methods
    const methods = [];
    if (/export\s+(async\s+)?function\s+GET/i.test(content)) methods.push('GET');
    if (/export\s+(async\s+)?function\s+POST/i.test(content)) methods.push('POST');
    if (/export\s+(async\s+)?function\s+PUT/i.test(content)) methods.push('PUT');
    if (/export\s+(async\s+)?function\s+PATCH/i.test(content)) methods.push('PATCH');
    if (/export\s+(async\s+)?function\s+DELETE/i.test(content)) methods.push('DELETE');
    
    // Extract category from path
    const category = routePath.split('/')[2] || 'root';
    
    return {
      filePath: relativePath,
      routePath,
      category,
      hasSwagger,
      hasJSDoc,
      methods,
      methodCount: methods.length,
    };
  } catch (error) {
    return {
      filePath: path.relative(process.cwd(), filePath),
      routePath: 'unknown',
      category: 'unknown',
      hasSwagger: false,
      hasJSDoc: false,
      methods: [],
      methodCount: 0,
      error: error.message,
    };
  }
}

function categorizeRoutes(routes) {
  const categories = {
    financial: ['accounts', 'bills', 'budgets', 'expenses', 'invoices', 'payments', 'transactions'],
    core: ['clients', 'vendors', 'projects', 'workflows', 'orders', 'products'],
    analytics: ['analytics', 'dashboard', 'dashboards', 'reports', 'performance'],
    integrations: ['integrations', 'webhooks', 'marketplace'],
    admin: ['admin', 'organizations', 'settings', 'employees', 'hr'],
    ai: ['ai', 'chat', 'financial-intelligence'],
    other: [],
  };
  
  return routes.map(route => {
    const categoryKey = Object.keys(categories).find(key => 
      categories[key].some(cat => route.category.includes(cat))
    ) || 'other';
    
    return {
      ...route,
      priority: categoryKey === 'financial' ? 'high' : 
                categoryKey === 'core' ? 'high' :
                categoryKey === 'analytics' ? 'medium' :
                categoryKey === 'integrations' ? 'medium' : 'low',
      categoryGroup: categoryKey,
    };
  });
}

function main() {
  console.log('🔍 Auditing API documentation coverage...\n');
  
  const apiDir = path.join(process.cwd(), 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    process.exit(1);
  }
  
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Found ${routeFiles.length} route files\n`);
  
  const routes = routeFiles.map(checkForSwaggerAnnotations);
  const categorizedRoutes = categorizeRoutes(routes);
  
  // Statistics
  const documented = categorizedRoutes.filter(r => r.hasSwagger);
  const undocumented = categorizedRoutes.filter(r => !r.hasSwagger);
  
  const byCategory = categorizedRoutes.reduce((acc, route) => {
    const cat = route.categoryGroup;
    if (!acc[cat]) acc[cat] = { total: 0, documented: 0, undocumented: 0 };
    acc[cat].total++;
    if (route.hasSwagger) acc[cat].documented++;
    else acc[cat].undocumented++;
    return acc;
  }, {});
  
  const byPriority = categorizedRoutes.reduce((acc, route) => {
    const pri = route.priority;
    if (!acc[pri]) acc[pri] = { total: 0, documented: 0, undocumented: 0 };
    acc[pri].total++;
    if (route.hasSwagger) acc[pri].documented++;
    else acc[pri].undocumented++;
    return acc;
  }, {});
  
  // Generate report
  const report = {
    summary: {
      totalRoutes: routeFiles.length,
      documented: documented.length,
      undocumented: undocumented.length,
      coverage: ((documented.length / routeFiles.length) * 100).toFixed(1) + '%',
      totalOperations: categorizedRoutes.reduce((sum, r) => sum + r.methodCount, 0),
      documentedOperations: documented.reduce((sum, r) => sum + r.methodCount, 0),
    },
    byCategory,
    byPriority,
    undocumentedRoutes: undocumented
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
      })),
    documentedRoutes: documented.map(r => ({
      route: r.routePath,
      category: r.category,
      methods: r.methods,
      file: r.filePath,
    })),
  };
  
  // Write report
  const reportPath = path.join(process.cwd(), 'docs/api/documentation-gap-analysis.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate markdown report
  let markdown = `# API Documentation Gap Analysis\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Routes:** ${report.summary.totalRoutes}\n`;
  markdown += `- **Documented Routes:** ${report.summary.documented}\n`;
  markdown += `- **Undocumented Routes:** ${report.summary.undocumented}\n`;
  markdown += `- **Coverage:** ${report.summary.coverage}\n`;
  markdown += `- **Total Operations:** ${report.summary.totalOperations}\n`;
  markdown += `- **Documented Operations:** ${report.summary.documentedOperations}\n\n`;
  
  markdown += `## Coverage by Category\n\n`;
  markdown += `| Category | Total | Documented | Undocumented | Coverage |\n`;
  markdown += `|----------|-------|------------|--------------|----------|\n`;
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const coverage = ((stats.documented / stats.total) * 100).toFixed(1) + '%';
    markdown += `| ${cat} | ${stats.total} | ${stats.documented} | ${stats.undocumented} | ${coverage} |\n`;
  });
  
  markdown += `\n## Coverage by Priority\n\n`;
  markdown += `| Priority | Total | Documented | Undocumented | Coverage |\n`;
  markdown += `|----------|-------|------------|--------------|----------|\n`;
  Object.entries(byPriority).forEach(([pri, stats]) => {
    const coverage = ((stats.documented / stats.total) * 100).toFixed(1) + '%';
    markdown += `| ${pri} | ${stats.total} | ${stats.documented} | ${stats.undocumented} | ${coverage} |\n`;
  });
  
  markdown += `\n## Undocumented Routes (${undocumented.length})\n\n`;
  
  // Group by priority
  const highPriority = undocumented.filter(r => r.priority === 'high');
  const mediumPriority = undocumented.filter(r => r.priority === 'medium');
  const lowPriority = undocumented.filter(r => r.priority === 'low');
  
  if (highPriority.length > 0) {
    markdown += `### High Priority (${highPriority.length})\n\n`;
    markdown += `| Route | Category | Methods | File |\n`;
    markdown += `|-------|----------|---------|------|\n`;
    highPriority.forEach(r => {
      markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | \`${r.filePath}\` |\n`;
    });
    markdown += `\n`;
  }
  
  if (mediumPriority.length > 0) {
    markdown += `### Medium Priority (${mediumPriority.length})\n\n`;
    markdown += `| Route | Category | Methods | File |\n`;
    markdown += `|-------|----------|---------|------|\n`;
    mediumPriority.slice(0, 50).forEach(r => {
      markdown += `| \`${r.routePath}\` | ${r.category} | ${r.methods.join(', ')} | \`${r.filePath}\` |\n`;
    });
    if (mediumPriority.length > 50) {
      markdown += `\n*... and ${mediumPriority.length - 50} more medium priority routes*\n`;
    }
    markdown += `\n`;
  }
  
  if (lowPriority.length > 0) {
    markdown += `### Low Priority (${lowPriority.length})\n\n`;
    markdown += `*${lowPriority.length} low priority routes need documentation*\n\n`;
  }
  
  fs.writeFileSync(reportPath, markdown);
  
  // Also write JSON for programmatic access
  const jsonPath = path.join(process.cwd(), 'docs/api/documentation-gap-analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Documentation audit complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Routes: ${report.summary.totalRoutes}`);
  console.log(`   Documented: ${report.summary.documented} (${report.summary.coverage})`);
  console.log(`   Undocumented: ${report.summary.undocumented}\n`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📄 JSON report saved to: ${jsonPath}\n`);
  
  // Print top undocumented routes by priority
  console.log('🔴 High Priority Undocumented Routes:');
  highPriority.slice(0, 10).forEach(r => {
    console.log(`   - ${r.routePath} (${r.methods.join(', ')})`);
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

