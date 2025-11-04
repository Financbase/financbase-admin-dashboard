const http = require('http');
const https = require('https');
const { URL } = require('url');

// Security: Use HTTPS for production, HTTP only for localhost testing
// Set BASE_URL environment variable to override (e.g., BASE_URL=https://app.financbase.com)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Routes that were fixed
const fixedRoutes = [
  // Career pages - these were 404 errors
  { path: '/careers/1', expected: 200, description: 'Career detail page 1' },
  { path: '/careers/2', expected: 200, description: 'Career detail page 2' },
  { path: '/careers/3', expected: 200, description: 'Career detail page 3' },
  { path: '/careers/4', expected: 200, description: 'Career detail page 4' },
  { path: '/careers/5', expected: 200, description: 'Career detail page 5' },
  { path: '/careers/6', expected: 200, description: 'Career detail page 6' },
  { path: '/careers/apply', expected: 200, description: 'Career apply page' },
  
  // Documentation help pages - these were 404 errors
  { path: '/docs/help/account-setup', expected: 200, description: 'Account setup help' },
  { path: '/docs/help/dashboard', expected: 200, description: 'Dashboard help' },
  { path: '/docs/help/2fa', expected: 200, description: '2FA help' },
  { path: '/docs/help/payment', expected: 200, description: 'Payment help' },
  { path: '/docs/help/payment-issues', expected: 200, description: 'Payment issues help' },
  { path: '/docs/help/import-errors', expected: 200, description: 'Import errors help' },
  { path: '/docs/help/performance', expected: 200, description: 'Performance help' },
  { path: '/docs/help/workflows', expected: 200, description: 'Workflows help' },
  { path: '/docs/help/reporting', expected: 200, description: 'Reporting help' },
  { path: '/docs/help/webhooks', expected: 200, description: 'Webhooks help' },
  
  // Legal page - this was a 500 error
  { path: '/legal', expected: 200, description: 'Legal page' },
];

function testRoute(route) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route.path}`;
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    // Security: HTTP is only used for localhost testing (http://localhost:3000)
    // For production testing, use HTTPS via BASE_URL environment variable
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const success = res.statusCode === route.expected;
        resolve({
          ...route,
          status: res.statusCode,
          success,
          fixed: success,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        ...route,
        status: 'ERROR',
        success: false,
        fixed: false,
        error: error.message,
      });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        ...route,
        status: 'TIMEOUT',
        success: false,
        fixed: false,
        error: 'Request timeout',
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Fixed Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log(`Testing ${fixedRoutes.length} routes that were previously broken...\n`);

  const results = [];

  for (const route of fixedRoutes) {
    process.stdout.write(`Testing ${route.path.padEnd(35)} ... `);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.fixed) {
      console.log(`✅ FIXED (${result.status})`);
    } else {
      console.log(`❌ STILL BROKEN (${result.status}${result.error ? ` - ${result.error}` : ''})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  
  const fixed = results.filter(r => r.fixed).length;
  const stillBroken = results.filter(r => !r.fixed).length;
  
  console.log(`✅ Fixed: ${fixed}/${results.length}`);
  console.log(`❌ Still Broken: ${stillBroken}/${results.length}`);
  
  if (stillBroken > 0) {
    console.log('\n❌ Routes Still Broken:');
    results
      .filter(r => !r.fixed)
      .forEach(r => {
        console.log(`  - ${r.path} (${r.status}${r.error ? ` - ${r.error}` : ''})`);
      });
  } else {
    console.log('\n🎉 All previously broken routes have been fixed!');
  }

  console.log('\n' + '='.repeat(60));

  process.exit(stillBroken > 0 ? 1 : 0);
}

runTests();

