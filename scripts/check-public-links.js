#!/usr/bin/env node

/**
 * Public Pages Link Checker
 * 
 * This script checks all links on public-facing pages of the Financbase application.
 * It uses linkinator to verify both internal and external links.
 */

const linkinator = require('linkinator');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const REPORTS_DIR = path.join(__dirname, '../reports');
const IGNORED_DOMAINS = [
  'twitter.com',
  'linkedin.com',
  'github.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'status.financbase.com',
];

// Public pages to check (based on app/(public) directory structure)
const PUBLIC_PAGES = [
  '/',
  '/home',
  '/about',
  '/contact',
  '/pricing',
  '/privacy',
  '/terms',
  '/legal',
  '/security',
  '/support',
  '/blog',
  '/careers',
  '/analytics',
  '/adboard',
  '/cloud-platform',
  '/team-collaboration',
  '/docs',
  '/docs/account-setup',
  '/docs/analytics',
  '/docs/api',
  '/docs/api/auth',
  '/docs/api/endpoints',
  '/docs/api/sdks',
  '/docs/api/webhooks',
  '/docs/dashboard',
  '/docs/first-steps',
  '/docs/help',
  '/docs/help/getting-started',
  '/docs/help/best-practices',
  '/docs/help/billing',
  '/docs/help/cancel',
  '/docs/help/issues',
  '/docs/help/security',
  '/docs/help/support',
  '/docs/installation',
  '/docs/integrations',
  '/docs/mobile',
  '/docs/multi-tenant',
  '/docs/security',
  '/guides',
  '/auth/sign-in',
  '/auth/sign-up',
];

// Track results
const results = {
  checked: [],
  broken: [],
  skipped: [],
  stats: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
};

/**
 * Check if a URL should be ignored
 */
function shouldIgnore(url) {
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return true;
  }
  return IGNORED_DOMAINS.some(domain => url.includes(domain));
}

/**
 * Check links on a single page
 */
async function checkPage(pageUrl) {
  const fullUrl = `${BASE_URL}${pageUrl}`;
  
  console.log(`\n🔍 Checking: ${fullUrl}`);
  
  try {
    const checker = new linkinator.LinkChecker({
      timeout: 10000,
      retryErrors: true,
      retryErrorsCount: 2,
      retryErrorsJitter: 1000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const brokenLinks = [];

    // Check links
    const result = await checker.check({
      path: fullUrl,
      recurse: false, // Only check the specific page, not follow links
      linksToSkip: IGNORED_DOMAINS,
    });

    // Process results
    if (result.links && result.links.length > 0) {
      for (const link of result.links) {
        results.stats.total++;
        
        if (shouldIgnore(link.url)) {
          results.stats.skipped++;
          continue;
        }

        if (link.state === 'BROKEN') {
          brokenLinks.push(link);
          results.broken.push({
            page: fullUrl,
            link: link.url,
            status: link.status || 'UNKNOWN',
            reason: link.reason || 'No reason provided',
          });
          results.stats.failed++;
          console.log(`  ❌ BROKEN: ${link.url} (${link.status || 'UNKNOWN'})`);
        } else if (link.state === 'OK') {
          results.stats.passed++;
          console.log(`  ✅ OK: ${link.url}`);
        } else {
          results.stats.skipped++;
        }
      }
    }

    results.checked.push({
      url: fullUrl,
      status: brokenLinks.length > 0 ? 'has_broken_links' : 'completed',
      linksFound: result.links?.length || 0,
      brokenCount: brokenLinks.length,
    });

  } catch (error) {
    console.error(`  ❌ ERROR checking ${fullUrl}:`, error.message);
    results.checked.push({
      url: fullUrl,
      status: 'error',
      error: error.message,
    });
    results.stats.failed++;
  }
}

/**
 * Generate report
 */
function generateReport() {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(REPORTS_DIR, 'public-links-check-report.txt');
  const jsonReportPath = path.join(REPORTS_DIR, 'public-links-check-report.json');

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  let report = `# Public Pages Link Check Report\n\n`;
  report += `Generated: ${timestamp}\n`;
  report += `Base URL: ${BASE_URL}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total Pages Checked: ${results.checked.length}\n`;
  report += `- Total Links Checked: ${results.stats.total}\n`;
  report += `- Passed: ${results.stats.passed}\n`;
  report += `- Failed: ${results.stats.failed}\n`;
  report += `- Skipped: ${results.stats.skipped}\n\n`;

  if (results.broken.length > 0) {
    report += `## Broken Links (${results.broken.length})\n\n`;
    results.broken.forEach((broken, index) => {
      report += `${index + 1}. **Page:** ${broken.page}\n`;
      report += `   **Link:** ${broken.link}\n`;
      report += `   **Status:** ${broken.status}\n`;
      report += `   **Reason:** ${broken.reason}\n\n`;
    });
  }

  report += `## Pages Checked\n\n`;
  results.checked.forEach((page) => {
    report += `- ${page.url} - ${page.status}\n`;
    if (page.linksFound) {
      report += `  Links found: ${page.linksFound}\n`;
    }
    if (page.error) {
      report += `  Error: ${page.error}\n`;
    }
  });

  // Write text report
  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Text report saved to: ${reportPath}`);

  // Write JSON report
  const jsonReport = {
    timestamp,
    baseUrl: BASE_URL,
    summary: results.stats,
    brokenLinks: results.broken,
    pagesChecked: results.checked,
  };
  fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));
  console.log(`📝 JSON report saved to: ${jsonReportPath}`);

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔗 Public Pages Link Checker');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📄 Pages to check: ${PUBLIC_PAGES.length}\n`);

  // Check if server is accessible
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) {
      console.warn(`⚠️  Warning: Server health check failed (${response.status}). Continuing anyway...`);
    } else {
      console.log('✅ Server is accessible\n');
    }
  } catch (error) {
    console.error(`❌ Error: Cannot reach server at ${BASE_URL}`);
    console.error(`   Please ensure the development server is running:`);
    console.error(`   npm run dev`);
    process.exit(1);
  }

  // Check each page
  for (const page of PUBLIC_PAGES) {
    await checkPage(page);
    // Small delay between pages to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Results');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${results.checked.length}`);
  console.log(`Total Links: ${results.stats.total}`);
  console.log(`✅ Passed: ${results.stats.passed}`);
  console.log(`❌ Failed: ${results.stats.failed}`);
  console.log(`⏭️  Skipped: ${results.stats.skipped}`);

  const report = generateReport();

  if (results.stats.failed > 0) {
    console.log(`\n❌ Found ${results.stats.failed} broken links. See report for details.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All links are working!`);
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

