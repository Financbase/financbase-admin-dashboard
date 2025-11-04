const { SiteChecker } = require('broken-link-checker');
const fs = require('fs');
const path = require('path');

// Configuration
// Security: HTTP is intentional for localhost development/testing
// In production, use HTTPS via SITE_URL environment variable
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const IGNORED_DOMAINS = [
  'twitter.com',
  'linkedin.com',
  'github.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'status.financbase.com'
];

// Track broken links
const brokenLinks = [];

// Create a new site checker instance
const siteChecker = new SiteChecker(
  {
    // Options
    excludeExternalLinks: false,
    excludeInternalLinks: false,
    excludeLinksToSamePage: true,
    filterLevel: 1,
    maxSockets: 10,
    maxSocketsPerHost: 5,
    rateLimit: 1000,
    retryCount: 2,
    retryDelay: 1000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  {
    // Event handlers
    'html': (treeCache) => {
      // Called for each HTML page processed
    },
    'queue': () => {
      // Called when a URL is added to the queue
    },
    'junk': (result) => {
      // Called for links that are not checked (e.g., mailto:)
    },
    'link': (result) => {
      const { url, base, broken, brokenReason, http } = result;
      
      // Skip ignored domains
      if (IGNORED_DOMAINS.some(domain => url.original.includes(domain))) {
        return;
      }
      
      // Skip email and tel links
      if (url.original.startsWith('mailto:') || url.original.startsWith('tel:')) {
        return;
      }
      
      if (broken) {
        const message = `[${brokenReason || 'ERROR'}] ${url.original} (from: ${base.original})`;
        console.error(`❌ ${message}`);
        brokenLinks.push(message);
      } else if (http && http.response) {
        console.log(`✅ [${http.response.statusCode}] ${url.original}`);
      }
    },
    'page': (error, pageUrl) => {
      if (error) {
        console.error(`❌ Error checking ${pageUrl}:`, error);
      }
    },
    'end': () => {
      console.log('\n📊 Scan complete!');
      
      if (brokenLinks.length > 0) {
        console.log(`\n❌ Found ${brokenLinks.length} broken links/redirects:\n`);
        brokenLinks.forEach(link => console.log(`- ${link}`));
        
        // Ensure reports directory exists
        const reportPath = path.join(__dirname, '../reports/broken-links.txt');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, brokenLinks.join('\n'));
        
        console.log(`\n📝 Full report saved to: ${reportPath}`);
        process.exit(1); // Exit with error code if broken links found
      } else {
        console.log('🎉 No broken links found!');
      }
    }
  }
);

console.log('🔍 Starting link checker...');
console.log(`🌐 Scanning ${SITE_URL} and its internal links...\n`);

// Start the link checking process
siteChecker.enqueue(SITE_URL);
