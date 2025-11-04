const { linkinator } = require('linkinator');
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

async function checkLinks() {
  console.log('🔍 Starting link checker...');
  console.log(`🌐 Scanning ${SITE_URL} and its internal links...\n`);

  try {
    const results = await linkinator.check({
      path: SITE_URL,
      recurse: true,
      skip: IGNORED_DOMAINS.map(domain => `https?://${domain}.*`),
      timeout: 10000,
      verbosity: 'error',
      markdown: false,
      directoryListing: false,
    });

    // Process results
    for (const link of results.links) {
      // Skip email and tel links
      if (link.url.startsWith('mailto:') || link.url.startsWith('tel:')) {
        continue;
      }

      // Skip ignored domains
      if (IGNORED_DOMAINS.some(domain => link.url.includes(domain))) {
        continue;
      }

      // Check if link is broken
      if (link.state === 'BROKEN') {
        const message = `[${link.status || 'ERROR'}] ${link.url} (from: ${link.parent || 'unknown'})`;
        console.error(`❌ ${message}`);
        brokenLinks.push(message);
      } else if (link.status) {
        console.log(`✅ [${link.status}] ${link.url}`);
      }
    }

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
  } catch (error) {
    console.error('❌ Error during link checking:', error);
    process.exit(1);
  }
}

// Run the check
checkLinks();
