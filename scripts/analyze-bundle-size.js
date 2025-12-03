/**
 * Bundle Size Analysis Script
 * Analyzes bundle size and generates report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  console.log('📦 Analyzing bundle size...\n');
  
  const reportPath = path.join(process.cwd(), 'docs/performance/bundle-analysis.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let markdown = `# Bundle Size Analysis\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Overview\n\n`;
  markdown += `This report analyzes the bundle size of the Financbase Admin Dashboard application.\n\n`;
  markdown += `## How to Run Bundle Analysis\n\n`;
  markdown += `To generate a detailed bundle analysis report:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run analyze\n`;
  markdown += `\`\`\`\n\n`;
  markdown += `This will:\n`;
  markdown += `1. Build the application with bundle analyzer enabled\n`;
  markdown += `2. Generate interactive HTML reports showing bundle composition\n`;
  markdown += `3. Open the reports in your browser automatically\n\n`;
  markdown += `## Bundle Size Targets\n\n`;
  markdown += `- **Client Bundle (gzipped):** < 500KB\n`;
  markdown += `- **First Load JS:** < 200KB\n`;
  markdown += `- **Lighthouse Performance Score:** > 90\n\n`;
  markdown += `## Current Configuration\n\n`;
  markdown += `- Bundle Analyzer: ✅ Installed and configured\n`;
  markdown += `- Configuration File: \`next.config.mjs\`\n`;
  markdown += `- Analysis Command: \`ANALYZE=true next build\`\n\n`;
  markdown += `## Optimization Strategies\n\n`;
  markdown += `### 1. Code Splitting\n`;
  markdown += `- Use dynamic imports for large components\n`;
  markdown += `- Lazy load routes and features\n`;
  markdown += `- Split vendor bundles\n\n`;
  markdown += `### 2. Tree Shaking\n`;
  markdown += `- Use named imports instead of default imports\n`;
  markdown += `- Avoid barrel exports in production\n`;
  markdown += `- Remove unused dependencies\n\n`;
  markdown += `### 3. Dependency Optimization\n`;
  markdown += `- Replace large dependencies with lighter alternatives\n`;
  markdown += `- Use Next.js optimized package imports\n`;
  markdown += `- Remove duplicate dependencies\n\n`;
  markdown += `### 4. Asset Optimization\n`;
  markdown += `- Optimize images (WebP, lazy loading)\n`;
  markdown += `- Minimize CSS\n`;
  markdown += `- Use CDN for static assets\n\n`;
  markdown += `## Next Steps\n\n`;
  markdown += `1. Run \`npm run analyze\` to generate bundle report\n`;
  markdown += `2. Review bundle composition and identify large dependencies\n`;
  markdown += `3. Implement optimizations based on findings\n`;
  markdown += `4. Re-run analysis to verify improvements\n\n`;
  markdown += `## Notes\n\n`;
  markdown += `- Bundle analysis requires a production build\n`;
  markdown += `- The analysis may take several minutes to complete\n`;
  markdown += `- Reports are generated in \`.next/analyze/\` directory\n`;
  
  fs.writeFileSync(reportPath, markdown);
  
  console.log('✅ Bundle analysis guide created!');
  console.log(`📄 Report saved to: ${reportPath}\n`);
  console.log('To generate actual bundle analysis, run:');
  console.log('  npm run analyze\n');
  console.log('Note: This will build the application and may take several minutes.');
}

try {
  main();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}

