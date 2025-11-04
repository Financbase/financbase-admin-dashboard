const http = require('http');

const BASE_URL = 'http://localhost:3000';
const routesToTest = [
  // Career pages
  '/careers/1',
  '/careers/2',
  '/careers/3',
  '/careers/4',
  '/careers/5',
  '/careers/6',
  '/careers/apply',
  
  // Documentation help pages
  '/docs/help/account-setup',
  '/docs/help/dashboard',
  '/docs/help/2fa',
  '/docs/help/payment',
  '/docs/help/payment-issues',
  '/docs/help/import-errors',
  '/docs/help/performance',
  '/docs/help/workflows',
  '/docs/help/reporting',
  '/docs/help/webhooks',
  
  // Legal page
  '/legal',
];

function testRoute(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    // Security: HTTP is intentional for localhost testing - this is a test script
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          success: res.statusCode === 200,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        status: 'ERROR',
        success: false,
        error: error.message,
      });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        path,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout',
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing new routes...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = [];

  for (const route of routesToTest) {
    process.stdout.write(`Testing ${route}... `);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status}${result.error ? ` - ${result.error}` : ''}`);
    }
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed routes:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.path} (${r.status}${r.error ? ` - ${r.error}` : ''})`);
      });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();

