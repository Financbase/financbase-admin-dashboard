#!/usr/bin/env node
/**
 * Lighthouse Performance Check
 * Simplified version that handles slow-loading pages better
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(process.cwd(), 'reports', 'lighthouse');
const URL = process.argv[2] || 'http://localhost:3000/home';

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const htmlPath = path.join(REPORT_DIR, `lighthouse-performance-${timestamp}.html`);
const jsonPath = path.join(REPORT_DIR, `lighthouse-performance-${timestamp}.json`);

console.log(`🚀 Running Lighthouse performance check on: ${URL}\n`);

try {
  // Run Lighthouse with more lenient settings - HTML first
  console.log('Running Lighthouse for HTML report... (this may take a few minutes)\n');
  
  const htmlCommand = [
    'npx lighthouse',
    `"${URL}"`,
    '--only-categories=performance',
    `--output=html`,
    `--output-path="${htmlPath}"`,
    '--chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"',
    '--max-wait-for-load=90000',
    '--max-wait-for-fcp=60000',
    '--skip-audits=uses-http2',
    '--quiet',
    '--no-enable-error-reporting'
  ].join(' ');

  execSync(htmlCommand, { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  // Then run for JSON report
  console.log('\nRunning Lighthouse for JSON report...\n');
  
  const jsonCommand = [
    'npx lighthouse',
    `"${URL}"`,
    '--only-categories=performance',
    `--output=json`,
    `--output-path="${jsonPath}"`,
    '--chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"',
    '--max-wait-for-load=90000',
    '--max-wait-for-fcp=60000',
    '--skip-audits=uses-http2',
    '--quiet',
    '--no-enable-error-reporting'
  ].join(' ');

  execSync(jsonCommand, { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  // Try to read and display summary from JSON
  if (fs.existsSync(jsonPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const score = (report.categories?.performance?.score || 0) * 100;
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 LIGHTHOUSE PERFORMANCE REPORT');
      console.log('='.repeat(60));
      console.log(`\n🎯 Performance Score: ${score.toFixed(0)}/100\n`);
      
      if (report.audits) {
        const metrics = {
          'First Contentful Paint': report.audits['first-contentful-paint']?.numericValue,
          'Largest Contentful Paint': report.audits['largest-contentful-paint']?.numericValue,
          'Total Blocking Time': report.audits['total-blocking-time']?.numericValue,
          'Cumulative Layout Shift': report.audits['cumulative-layout-shift']?.numericValue,
          'Speed Index': report.audits['speed-index']?.numericValue,
          'Time to Interactive': report.audits['interactive']?.numericValue,
        };

        console.log('📈 Core Web Vitals:');
        Object.entries(metrics).forEach(([name, value]) => {
          if (value !== undefined) {
            const unit = name.includes('Shift') ? '' : 'ms';
            console.log(`  ${name}: ${value.toFixed(0)}${unit}`);
          }
        });
      }

      console.log(`\n📄 Full HTML report: ${htmlPath}`);
      console.log(`📄 Full JSON report: ${jsonPath}`);
      console.log('\n' + '='.repeat(60));
    } catch (e) {
      console.log(`\n✅ Reports generated successfully!`);
      console.log(`📄 HTML report: ${htmlPath}`);
      console.log(`📄 JSON report: ${jsonPath}`);
    }
  } else {
    console.log(`\n✅ HTML report generated: ${htmlPath}`);
  }

  process.exit(0);
} catch (error) {
  console.error('\n❌ Lighthouse check failed:', error.message);
  
  // Still check if reports were generated despite errors
  if (fs.existsSync(htmlPath)) {
    console.log(`\n⚠️  Partial report may be available: ${htmlPath}`);
  }
  
  process.exit(1);
}

