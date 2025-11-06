#!/usr/bin/env node
/**
 * Lighthouse Performance Check Script
 * Runs Lighthouse performance audit and generates reports
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(process.cwd(), 'reports', 'lighthouse');
const URL = process.argv[2] || 'http://localhost:3000/home';

async function runLighthouse() {
  console.log(`🚀 Starting Lighthouse performance audit for: ${URL}`);
  
  // Ensure reports directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
    ],
  });

  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance'],
    port: chrome.port,
    skipAudits: ['uses-http2'],
    settings: {
      maxWaitForLoad: 45000,
      maxWaitForFcp: 30000,
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
  };

  try {
    console.log('📊 Running Lighthouse audit...');
    const runnerResult = await lighthouse(URL, options);

    // Generate timestamp for filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `lighthouse-performance-${timestamp}`;

    // Save HTML report
    const htmlPath = path.join(REPORT_DIR, `${baseName}.html`);
    fs.writeFileSync(htmlPath, runnerResult.report[0]);
    console.log(`✅ HTML report saved: ${htmlPath}`);

    // Save JSON report
    const jsonPath = path.join(REPORT_DIR, `${baseName}.json`);
    fs.writeFileSync(jsonPath, runnerResult.report[1]);
    console.log(`✅ JSON report saved: ${jsonPath}`);

    // Display performance score
    const lhr = runnerResult.lhr;
    const performanceScore = (lhr.categories.performance?.score || 0) * 100;
    const metrics = lhr.audits;

    console.log('\n📈 Performance Score:', performanceScore.toFixed(0));
    console.log('\n📊 Key Metrics:');
    console.log(`  First Contentful Paint: ${(metrics['first-contentful-paint']?.numericValue || 0).toFixed(0)}ms`);
    console.log(`  Largest Contentful Paint: ${(metrics['largest-contentful-paint']?.numericValue || 0).toFixed(0)}ms`);
    console.log(`  Total Blocking Time: ${(metrics['total-blocking-time']?.numericValue || 0).toFixed(0)}ms`);
    console.log(`  Cumulative Layout Shift: ${(metrics['cumulative-layout-shift']?.numericValue || 0).toFixed(3)}`);
    console.log(`  Speed Index: ${(metrics['speed-index']?.numericValue || 0).toFixed(0)}ms`);
    console.log(`  Time to Interactive: ${(metrics['interactive']?.numericValue || 0).toFixed(0)}ms`);

    // List opportunities
    const opportunities = Object.values(metrics)
      .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 5);

    if (opportunities.length > 0) {
      console.log('\n🎯 Top Performance Opportunities:');
      opportunities.forEach(opp => {
        const savings = opp.numericValue ? `${(opp.numericValue / 1000).toFixed(2)}s` : '';
        console.log(`  • ${opp.title}: ${savings} (${((1 - opp.score) * 100).toFixed(0)}% improvement)`);
      });
    }

    await chrome.kill();
    console.log('\n✨ Lighthouse audit completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    await chrome.kill();
    process.exit(1);
  }
}

runLighthouse().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

