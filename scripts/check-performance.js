const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const PAGES_TO_CHECK = [
  '/',
  '/about',
  '/pricing',
  '/features',
  '/docs'
];

const BASE_URL = 'http://localhost:3002';
const REPORTS_DIR = path.join(__dirname, '../reports/lighthouse');

// Ensure reports directory exists
fs.mkdirSync(REPORTS_DIR, { recursive: true });

// Function to run Lighthouse
async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    console.log(`\n🚀 Testing: ${url}`);
    const runnerResult = await lighthouse(url, options);
    
    // Save the report
    const filename = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-') + '.html';
    const reportPath = path.join(REPORTS_DIR, filename);
    
    fs.writeFileSync(reportPath, runnerResult.report);
    
    // Output the scores
    console.log('📊 Results:');
    console.log('------------------');
    console.log(`Performance: ${Math.round(runnerResult.lhr.categories.performance.score * 100)}/100`);
    console.log(`Accessibility: ${Math.round(runnerResult.lhr.categories.accessibility.score * 100)}/100`);
    console.log(`Best Practices: ${Math.round(runnerResult.lhr.categories['best-practices'].score * 100)}/100`);
    console.log(`SEO: ${Math.round(runnerResult.lhr.categories.seo.score * 100)}/100`);
    console.log(`\n📝 Full report saved to: ${reportPath}`);
    
    return runnerResult;
  } finally {
    await chrome.kill();
  }
}

// Main function to run all checks
async function runAllChecks() {
  console.log('🚀 Starting performance checks...');
  
  for (const page of PAGES_TO_CHECK) {
    const url = `${BASE_URL}${page}`;
    await runLighthouse(url);
  }
  
  console.log('\n🎉 All performance checks completed!');
  console.log(`📁 Reports saved to: ${REPORTS_DIR}`);
}

// Run the checks
runAllChecks().catch(console.error);
