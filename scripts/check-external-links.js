#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const DOCS_DIR = path.join(__dirname, '../docs');
const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, 'external-links-report.txt');
const TIMEOUT = 10000; // 10 seconds
const CONCURRENT_LIMIT = 5; // Max concurrent requests

// Track results
const checkedUrls = new Map();
const brokenLinks = [];
const validLinks = [];
const skippedLinks = [];
let pendingRequests = 0;

// URL patterns to extract
const URL_REGEX = /https?:\/\/[^\s\)\]"<>]+/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;

// Domains to skip (optional - for domains that might be intentionally broken or require auth)
const SKIP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'your-org',
  'your-app',
  'your_sentry_dsn',
  'example.com',
  'api.example.com',
  'app.example.com',
  'company.com',
  'api.company.com',
  'financbase.com', // Main domain - API endpoints require auth (401 is expected)
  'api.financbase.com',
  'docs.financbase.com', // Not yet deployed
  'status.financbase.com', // Not yet deployed
  'community.financbase.com', // Not yet deployed
  'help.financbase.com', // Not yet deployed
  'developers.financbase.com', // Not yet deployed
  'app.financbase.com', // Not yet deployed
  'cdn.financbase.com', // Not yet deployed
  'js.clerk.com', // CSP configuration example (not a direct link)
  'fonts.googleapis.com', // CSP configuration example
  'fonts.gstatic.com', // CSP configuration example
  'clerk-telemetry.com', // CSP configuration example
  'dashboard.clerk.com', // Should be dashboard.clerk.dev - skip for now
  'console.neon.tech', // Should be console.neon.tech - may require auth
];

// URLs to skip (specific URLs that are examples or placeholders)
const SKIP_URLS = [
  'https://github.com/your-org',
  'https://github.com/your-org/',
  'https://api.financbase.com',
];

// URL patterns to skip (example URLs, placeholders, etc.)
const SKIP_PATTERNS = [
  /example\.com/i,
  /your-app/i,
  /your-org/i,
  /your_sentry/i,
  /\$\{.*\}/, // Template variables
  /`$/, // URLs ending with backtick (parsing error)
  /'$/, // URLs ending with quote (parsing error)
  /github\.com\/financbase\//, // Placeholder GitHub repos (not yet created)
  /grafana\/k6\/releases\/download/, // Version-specific download URLs (may become outdated)
  /req\.header/, // Code examples with req.header
  /req\[/, // Code examples with req[...]
];

/**
 * Clean URL (remove trailing punctuation, quotes, backticks)
 */
function cleanUrl(url) {
  return url
    .replace(/[.,;:!?]+$/, '') // Remove trailing punctuation
    .replace(/['"`]+$/, '') // Remove trailing quotes/backticks
    .replace(/['"`]+$/, '') // Remove any remaining quotes
    .trim();
}

/**
 * Check if URL should be skipped
 */
function shouldSkip(url) {
  try {
    // Skip if URL matches skip patterns
    if (SKIP_PATTERNS.some(pattern => pattern.test(url))) {
      return true;
    }
    
    const urlObj = new URL(url);
    
    // Skip localhost and placeholder domains
    if (SKIP_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return true;
    }
    
    // Skip specific URLs
    if (SKIP_URLS.some(skipUrl => url.includes(skipUrl))) {
      return true;
    }
    
    return false;
  } catch (e) {
    return true; // Skip invalid URLs
  }
}

/**
 * Check if a URL is accessible
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    if (checkedUrls.has(url)) {
      resolve(checkedUrls.get(url));
      return;
    }
    
    if (shouldSkip(url)) {
      const result = { url, status: 'skipped', reason: 'Domain/URL in skip list' };
      checkedUrls.set(url, result);
      skippedLinks.push(result);
      resolve(result);
      return;
    }
    
    pendingRequests++;
    
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD', // Use HEAD to avoid downloading content
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
      };
      
      // Security: HTTP is intentional for localhost testing/development
      // This script tests external links and may use HTTP for localhost connections
      const req = client.request(options, (res) => {
        pendingRequests--;
        const status = res.statusCode;
        // Consider 401/403 as valid for API endpoints (they exist, just require auth)
        // Also consider 405 (Method Not Allowed) as valid for HEAD requests on POST endpoints
        const isValid = (status >= 200 && status < 400) || 
                       status === 401 || 
                       status === 403 || 
                       status === 405;
        
        const result = {
          url,
          status: isValid ? 'ok' : 'broken',
          statusCode: status,
          reason: isValid ? (status === 401 ? 'OK (requires auth)' : 
                             status === 403 ? 'OK (forbidden but exists)' :
                             status === 405 ? 'OK (method not allowed)' : 'OK') : 
                         `HTTP ${status}`,
        };
        
        checkedUrls.set(url, result);
        resolve(result);
      });
      
      req.on('error', (error) => {
        pendingRequests--;
        const result = {
          url,
          status: 'broken',
          reason: error.message || 'Connection error',
        };
        checkedUrls.set(url, result);
        resolve(result);
      });
      
      req.on('timeout', () => {
        pendingRequests--;
        req.destroy();
        const result = {
          url,
          status: 'broken',
          reason: 'Timeout',
        };
        checkedUrls.set(url, result);
        resolve(result);
      });
      
      req.setTimeout(TIMEOUT);
      req.end();
      
    } catch (error) {
      pendingRequests--;
      const result = {
        url,
        status: 'broken',
        reason: error.message || 'Invalid URL',
      };
      checkedUrls.set(url, result);
      resolve(result);
    }
  });
}

/**
 * Process URLs in batches
 */
async function processUrls(urls) {
  const results = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENT_LIMIT) {
    const batch = urls.slice(i, i + CONCURRENT_LIMIT);
    const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
    results.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming servers
    if (i + CONCURRENT_LIMIT < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Extract URLs from markdown file
 */
function extractUrlsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const urls = new Set();
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  // Extract URLs from markdown links: [text](url)
  let match;
  const linkRegex = new RegExp(MARKDOWN_LINK_REGEX);
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    if (url && url.startsWith('http')) {
      urls.add(url);
    }
  }
  
  // Extract standalone URLs
  const urlMatches = content.match(URL_REGEX);
  if (urlMatches) {
    urlMatches.forEach(url => {
      // Skip if it looks like a code example or template variable
      if (/\$\{|req\.|req\[|header\(/i.test(url)) {
        return;
      }
      
      // Clean up URL (remove trailing punctuation, quotes, backticks)
      const cleaned = cleanUrl(url);
      if (cleaned.startsWith('http') && cleaned.length > 10 && !shouldSkip(cleaned)) {
        urls.add(cleaned);
      }
    });
  }
  
  return Array.from(urls).map(url => ({
    url,
    source: relativePath,
  }));
}

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting external link checker...\n');
  console.log(`📁 Scanning: ${DOCS_DIR}\n`);
  
  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles(DOCS_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown files\n`);
  
  // Extract all URLs
  const urlSources = [];
  markdownFiles.forEach(file => {
    try {
      const urls = extractUrlsFromFile(file);
      urls.forEach(({ url, source }) => {
        urlSources.push({ url, source });
      });
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message);
    }
  });
  
  // Get unique URLs
  const uniqueUrls = [...new Set(urlSources.map(us => us.url))];
  console.log(`🌐 Found ${uniqueUrls.length} unique external URLs\n`);
  console.log('Checking URLs...\n');
  
  // Check all URLs
  const results = await processUrls(uniqueUrls);
  
  // Categorize results
  results.forEach(result => {
    if (result.status === 'ok') {
      validLinks.push(result);
    } else if (result.status === 'broken') {
      brokenLinks.push(result);
    } else if (result.status === 'skipped') {
      skippedLinks.push(result);
    }
  });
  
  // Find source files for broken links
  const brokenWithSources = brokenLinks.map(broken => {
    const sources = urlSources.filter(us => us.url === broken.url).map(us => us.source);
    return {
      ...broken,
      sources: [...new Set(sources)],
    };
  });
  
  // Generate report
  let report = 'External Link Check Report\n';
  report += '='.repeat(50) + '\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total URLs found: ${uniqueUrls.length}\n`;
  report += `Valid links: ${validLinks.length}\n`;
  report += `Broken links: ${brokenLinks.length}\n`;
  report += `Skipped links: ${skippedLinks.length}\n\n`;
  
  if (brokenLinks.length > 0) {
    report += 'BROKEN LINKS\n';
    report += '-'.repeat(50) + '\n\n';
    
    brokenWithSources.forEach(link => {
      report += `URL: ${link.url}\n`;
      report += `Status: ${link.reason}\n`;
      if (link.statusCode) {
        report += `HTTP Status: ${link.statusCode}\n`;
      }
      report += `Found in:\n`;
      link.sources.forEach(source => {
        report += `  - ${source}\n`;
      });
      report += '\n';
    });
  }
  
  if (skippedLinks.length > 0) {
    report += '\nSKIPPED LINKS\n';
    report += '-'.repeat(50) + '\n\n';
    skippedLinks.forEach(link => {
      report += `${link.url} - ${link.reason}\n`;
    });
  }
  
  // Write report to file
  fs.writeFileSync(REPORT_FILE, report);
  
  // Console output
  console.log('📊 Results:');
  console.log(`  ✅ Valid links: ${validLinks.length}`);
  console.log(`  ❌ Broken links: ${brokenLinks.length}`);
  console.log(`  ⏭️  Skipped links: ${skippedLinks.length}`);
  console.log(`\n📄 Report saved to: ${REPORT_FILE}\n`);
  
  if (brokenLinks.length > 0) {
    console.log('❌ Broken Links:\n');
    brokenWithSources.forEach(link => {
      console.log(`  ${link.url}`);
      console.log(`    Status: ${link.reason}`);
      if (link.statusCode) {
        console.log(`    HTTP: ${link.statusCode}`);
      }
      console.log(`    Found in: ${link.sources.join(', ')}`);
      console.log('');
    });
    
    console.log('\n');
    process.exit(1);
  } else {
    console.log('🎉 All external links are valid!\n');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { main, checkUrl, extractUrlsFromFile };

