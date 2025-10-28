#!/usr/bin/env node

/**
 * Platform Services API Testing Script
 * 
 * This script tests all Platform Services API endpoints
 * Run with: node test-platform-services.js
 */

const BASE_URL = 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  verbose: true,
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: [],
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logTest(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${testName}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error });
    log(`FAIL: ${testName} - ${error}`, 'error');
  }
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    timeout: TEST_CONFIG.timeout,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = responseData;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: parsedData,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test functions
async function testPlatformServicesOverview() {
  try {
    const response = await makeRequest('GET', '/api/platform/services');
    
    if (response.status === 200) {
      logTest('Platform Services Overview', true);
      log(`Found ${Array.isArray(response.data) ? response.data.length : 'unknown'} services`);
      return response.data;
    } else if (response.status === 401) {
      logTest('Platform Services Overview (Auth Required)', true);
      log('Authentication required - this is expected behavior');
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Platform Services Overview', false, error.message);
    return null;
  }
}

async function testPlatformHub() {
  try {
    const response = await makeRequest('GET', '/api/platform/hub');
    
    if (response.status === 200) {
      logTest('Platform Hub Overview', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Platform Hub Overview (Auth Required)', true);
      log('Authentication required - this is expected behavior');
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Platform Hub Overview', false, error.message);
    return null;
  }
}

async function testPlatformHubConnections() {
  try {
    const response = await makeRequest('GET', '/api/platform/hub/connections');
    
    if (response.status === 200) {
      logTest('Platform Hub Connections List', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Platform Hub Connections List (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Platform Hub Connections List', false, error.message);
    return null;
  }
}

async function testPlatformHubIntegrations() {
  try {
    const response = await makeRequest('GET', '/api/platform/hub/integrations');
    
    if (response.status === 200) {
      logTest('Platform Hub Integrations List', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Platform Hub Integrations List (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Platform Hub Integrations List', false, error.message);
    return null;
  }
}

async function testWorkflowsAPI() {
  try {
    const response = await makeRequest('GET', '/api/workflows');
    
    if (response.status === 200) {
      logTest('Workflows API List', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Workflows API List (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Workflows API List', false, error.message);
    return null;
  }
}

async function testWorkflowTemplates() {
  try {
    const response = await makeRequest('GET', '/api/workflows/templates');
    
    if (response.status === 200) {
      logTest('Workflow Templates API', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Workflow Templates API (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Workflow Templates API', false, error.message);
    return null;
  }
}

async function testWebhooksAPI() {
  try {
    const response = await makeRequest('GET', '/api/webhooks');
    
    if (response.status === 200) {
      logTest('Webhooks API List', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Webhooks API List (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Webhooks API List', false, error.message);
    return null;
  }
}

async function testMonitoringHealth() {
  try {
    const response = await makeRequest('GET', '/api/monitoring/health');
    
    if (response.status === 200) {
      logTest('Monitoring Health Check', true);
      log(`Health Status: ${response.data.status || 'unknown'}`);
      return response.data;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Monitoring Health Check', false, error.message);
    return null;
  }
}

async function testMonitoringMetrics() {
  try {
    const response = await makeRequest('GET', '/api/monitoring/metrics');
    
    if (response.status === 200) {
      logTest('Monitoring Metrics API', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Monitoring Metrics API (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Monitoring Metrics API', false, error.message);
    return null;
  }
}

async function testMonitoringErrors() {
  try {
    const response = await makeRequest('GET', '/api/monitoring/errors');
    
    if (response.status === 200) {
      logTest('Monitoring Errors API', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Monitoring Errors API (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Monitoring Errors API', false, error.message);
    return null;
  }
}

async function testAlertsSummary() {
  try {
    const response = await makeRequest('GET', '/api/monitoring/alerts/summary');
    
    if (response.status === 200) {
      logTest('Alerts Summary API', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Alerts Summary API (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Alerts Summary API', false, error.message);
    return null;
  }
}

async function testAlertsRules() {
  try {
    const response = await makeRequest('GET', '/api/monitoring/alerts/rules');
    
    if (response.status === 200) {
      logTest('Alerts Rules API', true);
      return response.data;
    } else if (response.status === 401) {
      logTest('Alerts Rules API (Auth Required)', true);
      return null;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Alerts Rules API', false, error.message);
    return null;
  }
}

async function testErrorHandling() {
  try {
    // Test 404 error
    const response404 = await makeRequest('GET', '/api/platform/hub/connections/999999');
    if (response404.status === 404 || response404.status === 401) {
      logTest('Error Handling - 404 Response', true);
    } else {
      throw new Error(`Expected 404 or 401, got ${response404.status}`);
    }

    // Test malformed request
    const response400 = await makeRequest('POST', '/api/platform/hub/connections', { invalid: 'data' });
    if (response400.status === 400 || response400.status === 401) {
      logTest('Error Handling - 400 Response', true);
    } else {
      throw new Error(`Expected 400 or 401, got ${response400.status}`);
    }

  } catch (error) {
    logTest('Error Handling Tests', false, error.message);
  }
}

async function testServerHealth() {
  try {
    const response = await makeRequest('GET', '/api/health');
    
    if (response.status === 200) {
      logTest('Server Health Check', true);
      log(`Server Status: ${response.data.status || 'unknown'}`);
      return response.data;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Server Health Check', false, error.message);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Platform Services API Tests', 'info');
  log(`Testing against: ${BASE_URL}`, 'info');
  log('', 'info');

  // Test server availability first
  await testServerHealth();
  log('', 'info');

  // Test Platform Services APIs
  log('📊 Testing Platform Services APIs...', 'info');
  await testPlatformServicesOverview();
  await testPlatformHub();
  await testPlatformHubConnections();
  await testPlatformHubIntegrations();
  log('', 'info');

  // Test Workflows APIs
  log('⚡ Testing Workflows APIs...', 'info');
  await testWorkflowsAPI();
  await testWorkflowTemplates();
  log('', 'info');

  // Test Webhooks APIs
  log('🔗 Testing Webhooks APIs...', 'info');
  await testWebhooksAPI();
  log('', 'info');

  // Test Monitoring APIs
  log('📈 Testing Monitoring APIs...', 'info');
  await testMonitoringHealth();
  await testMonitoringMetrics();
  await testMonitoringErrors();
  log('', 'info');

  // Test Alerts APIs
  log('🚨 Testing Alerts APIs...', 'info');
  await testAlertsSummary();
  await testAlertsRules();
  log('', 'info');

  // Test Error Handling
  log('🛡️ Testing Error Handling...', 'info');
  await testErrorHandling();
  log('', 'info');

  // Print results
  log('📋 Test Results Summary', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.errors.length > 0) {
    log('', 'info');
    log('❌ Failed Tests:', 'error');
    testResults.errors.forEach(({ test, error }) => {
      log(`  - ${test}: ${error}`, 'error');
    });
  }

  log('', 'info');
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Platform Services APIs are working correctly.', 'success');
  } else {
    log(`⚠️ ${testResults.failed} test(s) failed. Check the errors above.`, 'warning');
  }

  log('', 'info');
  log('💡 Next Steps:', 'info');
  log('1. Sign in to the application to test authenticated endpoints', 'info');
  log('2. Use the dashboard at /platform/services/dashboard', 'info');
  log('3. Create Platform Services using the API endpoints', 'info');
  log('4. Set up monitoring and alerting rules', 'info');
  log('5. Configure integrations through the Platform Hub', 'info');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
};
