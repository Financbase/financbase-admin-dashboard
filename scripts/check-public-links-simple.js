#!/usr/bin/env node

/**
 * Simple Public Pages Link Checker
 * 
 * This script checks all links on public-facing pages by:
 * 1. Fetching each page's HTML
 * 2. Extracting all links
 * 3. Verifying each link is accessible
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { execSync } = require('child_process');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
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

// Public pages to check
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
  '/products/analytics',
  '/adboard',
  '/cloud-platform',
  '/team-collaboration',
  '/docs',
  '/auth/sign-in',
  '/auth/sign-up',
];

// Track results
const results = {
  checked: [],
  broken: [],
  allLinks: new Set(),
  stats: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
};

/**
 * Extract links from HTML content
 */
function extractLinks(html, baseUrl) {
  const links = [];
  const linkRegex = /href=["']([^"']+)["']/gi;
  const srcRegex = /src=["']([^"']+)["']/gi;
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  while ((match = srcRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links
    .map(link => {
      try {
        // Handle relative URLs
        if (link.startsWith('/')) {
          return new URL(link, baseUrl).href;
        } else if (link.startsWith('http://') || link.startsWith('https://')) {
          return link;
        } else if (!link.startsWith('mailto:') && !link.startsWith('tel:') && !link.startsWith('#')) {
          return new URL(link, baseUrl).href;
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter(link => link !== null && !link.startsWith('mailto:') && !link.startsWith('tel:') && !link.startsWith('#'));
}

/**
 * Check if URL should be ignored
 */
function shouldIgnore(url) {
  try {
    const urlObj = new URL(url);
    return IGNORED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Fetch page content using curl (handles redirects properly)
 */
function fetchPage(url) {
  try {
    // Use curl to fetch the page with redirect following
    const output = execSync(`curl -L -s -w "\\n%{http_code}" -m 10 "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Split status code from body
    const parts = output.split('\n');
    const statusCode = parseInt(parts[parts.length - 1], 10);
    const body = parts.slice(0, -1).join('\n');

    return {
      status: statusCode,
      body: body,
      finalUrl: url,
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

/**
 * Check if a link is accessible
 */
async function checkLink(url) {
  if (shouldIgnore(url)) {
    results.stats.skipped++;
    return { status: 'skipped', url };
  }

  if (results.allLinks.has(url)) {
    return { status: 'already_checked', url };
  }

  results.allLinks.add(url);
  results.stats.total++;

  try {
    const response = await fetchPage(url);
    if (response.status >= 200 && response.status < 400) {
      results.stats.passed++;
      return { status: 'ok', url, httpStatus: response.status };
    } else {
      results.stats.failed++;
      results.broken.push({
        url,
        status: response.status,
        reason: `HTTP ${response.status}`,
      });
      return { status: 'broken', url, httpStatus: response.status };
    }
  } catch (error) {
    results.stats.failed++;
    results.broken.push({
      url,
      status: 'ERROR',
      reason: error.message,
    });
    return { status: 'broken', url, error: error.message };
  }
}

/**
 * Check a single page
 */
async function checkPage(pagePath) {
  const fullUrl = `${BASE_URL}${pagePath}`;
  console.log(`\n🔍 Checking: ${fullUrl}`);

  try {
    // Fetch the page
    const response = await fetchPage(fullUrl);
    
    if (response.status !== 200) {
      console.log(`  ⚠️  Page returned status ${response.status}`);
      results.checked.push({
        url: fullUrl,
        status: 'error',
        error: `HTTP ${response.status}`,
      });
      return;
    }

    // Extract links
    const links = extractLinks(response.body, fullUrl);
    console.log(`  📄 Found ${links.length} links`);

    // Check each link
    const linkResults = [];
    for (const link of links) {
      const result = await checkLink(link);
      if (result.status === 'ok') {
        console.log(`  ✅ ${link}`);
      } else if (result.status === 'broken') {
        console.log(`  ❌ ${link} (${result.httpStatus || result.error})`);
      }
      linkResults.push(result);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const brokenCount = linkResults.filter(r => r.status === 'broken').length;
    results.checked.push({
      url: fullUrl,
      status: brokenCount > 0 ? 'has_broken_links' : 'completed',
      linksFound: links.length,
      brokenCount,
    });

  } catch (error) {
    console.error(`  ❌ ERROR: ${error.message}`);
    results.checked.push({
      url: fullUrl,
      status: 'error',
      error: error.message,
    });
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
      report += `${index + 1}. **URL:** ${broken.url}\n`;
      report += `   **Status:** ${broken.status}\n`;
      report += `   **Reason:** ${broken.reason}\n\n`;
    });
  }

  report += `## Pages Checked\n\n`;
  results.checked.forEach((page) => {
    report += `- ${page.url} - ${page.status}\n`;
    if (page.linksFound !== undefined) {
      report += `  Links found: ${page.linksFound}\n`;
      report += `  Broken links: ${page.brokenCount || 0}\n`;
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
    const response = await fetchPage(`${BASE_URL}/api/health`);
    if (!response || response.status !== 200) {
      console.warn(`⚠️  Warning: Server health check returned status ${response?.status}. Continuing anyway...`);
    } else {
      console.log('✅ Server is accessible\n');
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Server health check failed: ${error.message}. Continuing anyway...`);
  }

  // Check each page
  for (const page of PUBLIC_PAGES) {
    await checkPage(page);
    // Small delay between pages
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

