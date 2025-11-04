#!/usr/bin/env node

/**
 * Comprehensive Onboarding Flow Test Script
 * Tests all 4 personas: Digital Agency, Real Estate, Tech Startup, Freelancer
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAILS = {
  digital_agency: 'agency@test.com',
  real_estate: 'realtor@test.com', 
  tech_startup: 'startup@test.com',
  freelancer: 'freelancer@test.com'
};

// Test personas and their expected steps
const PERSONA_FLOWS = {
  digital_agency: [
    'welcome_agency',
    'import_agency_data', 
    'connect_slack',
    'create_invoice_expense',
    'explore_agency_dashboard',
    'invite_team_agency'
  ],
  real_estate: [
    'welcome_real_estate',
    'add_property',
    'log_rental_income',
    'generate_owner_statement',
    'explore_portfolio_dashboard',
    'invite_property_manager'
  ],
  tech_startup: [
    'welcome_startup',
    'import_startup_data',
    'connect_stripe',
    'explore_burn_rate_dashboard',
    'set_up_workflows',
    'invite_advisors'
  ],
  freelancer: [
    'welcome_freelancer',
    'set_up_profile',
    'create_invoice_template',
    'log_expense_demo',
    'view_income_report',
    'tax_preview'
  ]
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  personaResults: {}
};

/**
 * Test API endpoint
 */
async function testAPIEndpoint(method, endpoint, data = null) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test persona onboarding flow
 */
async function testPersonaFlow(persona) {
  console.log(`\n🧪 Testing ${persona} onboarding flow...`);
  
  const personaResults = {
    persona,
    steps: [],
    passed: 0,
    failed: 0,
    errors: []
  };
  
  const steps = PERSONA_FLOWS[persona];
  const testEmail = TEST_EMAILS[persona];
  
  try {
    // Step 1: Initialize onboarding
    console.log(`  📝 Initializing ${persona} onboarding...`);
    const initResult = await testAPIEndpoint('POST', '/api/onboarding', {
      persona,
      userName: `Test ${persona} User`,
      userEmail: testEmail
    });
    
    if (initResult.success) {
      console.log(`  ✅ Onboarding initialized successfully`);
      personaResults.passed++;
    } else {
      console.log(`  ❌ Failed to initialize onboarding: ${initResult.error || initResult.data?.error}`);
      personaResults.failed++;
      personaResults.errors.push(`Init failed: ${initResult.error || initResult.data?.error}`);
    }
    
    // Step 2: Get onboarding status
    console.log(`  📊 Getting onboarding status...`);
    const statusResult = await testAPIEndpoint('GET', '/api/onboarding');
    
    if (statusResult.success) {
      console.log(`  ✅ Onboarding status retrieved`);
      personaResults.passed++;
    } else {
      console.log(`  ❌ Failed to get status: ${statusResult.error || statusResult.data?.error}`);
      personaResults.failed++;
      personaResults.errors.push(`Status failed: ${statusResult.error || statusResult.data?.error}`);
    }
    
    // Step 3: Test each step completion
    for (let i = 0; i < steps.length; i++) {
      const stepId = steps[i];
      console.log(`  🔄 Testing step: ${stepId}`);
      
      const stepResult = await testAPIEndpoint('PATCH', `/api/onboarding/steps/${stepId}`, {
        stepData: {
          testData: true,
          stepIndex: i,
          timestamp: new Date().toISOString()
        }
      });
      
      if (stepResult.success) {
        console.log(`    ✅ Step ${stepId} completed`);
        personaResults.passed++;
      } else {
        console.log(`    ❌ Step ${stepId} failed: ${stepResult.error || stepResult.data?.error}`);
        personaResults.failed++;
        personaResults.errors.push(`Step ${stepId} failed: ${stepResult.error || stepResult.data?.error}`);
      }
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Step 4: Test skip functionality
    console.log(`  ⏭️  Testing skip functionality...`);
    const skipResult = await testAPIEndpoint('PATCH', '/api/onboarding/skip', {
      stepId: steps[0] // Skip first step
    });
    
    if (skipResult.success) {
      console.log(`  ✅ Skip functionality works`);
      personaResults.passed++;
    } else {
      console.log(`  ❌ Skip failed: ${skipResult.error || skipResult.data?.error}`);
      personaResults.failed++;
      personaResults.errors.push(`Skip failed: ${skipResult.error || skipResult.data?.error}`);
    }
    
  } catch (error) {
    console.log(`  ❌ ${persona} flow failed with error: ${error.message}`);
    personaResults.failed++;
    personaResults.errors.push(`Flow error: ${error.message}`);
  }
  
  testResults.personaResults[persona] = personaResults;
  testResults.passed += personaResults.passed;
  testResults.failed += personaResults.failed;
  testResults.errors.push(...personaResults.errors);
  
  console.log(`  📊 ${persona} results: ${personaResults.passed} passed, ${personaResults.failed} failed`);
}

/**
 * Test database connectivity
 */
async function testDatabaseConnectivity() {
  console.log('\n🗄️  Testing database connectivity...');
  
  try {
    // Test if we can connect to the database
    const result = await testAPIEndpoint('GET', '/api/health');
    
    if (result.success) {
      console.log('  ✅ Database connection successful');
      return true;
    } else {
      console.log('  ❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Database test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test email functionality
 */
async function testEmailFunctionality() {
  console.log('\n📧 Testing email functionality...');
  
  try {
    // Test persona welcome email
    const emailResult = await testAPIEndpoint('POST', '/api/onboarding', {
      persona: 'digital_agency',
      userName: 'Email Test User',
      userEmail: 'email-test@example.com'
    });
    
    if (emailResult.success) {
      console.log('  ✅ Email functionality working');
      return true;
    } else {
      console.log('  ❌ Email functionality failed');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Email test failed: ${error.message}`);
    return false;
  }
}

/**
 * Generate test report
 */
function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalTests: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2) + '%'
    },
    personaResults: testResults.personaResults,
    errors: testResults.errors
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, 'onboarding-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Test Report Generated: ${reportPath}`);
  console.log(`📈 Success Rate: ${report.summary.successRate}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  
  return report;
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Onboarding Flow Tests');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📧 Test Emails: ${Object.values(TEST_EMAILS).join(', ')}`);
  
  // Test database connectivity
  const dbConnected = await testDatabaseConnectivity();
  if (!dbConnected) {
    console.log('❌ Database not connected. Please start your application first.');
    process.exit(1);
  }
  
  // Test email functionality
  const emailWorking = await testEmailFunctionality();
  if (!emailWorking) {
    console.log('⚠️  Email functionality not working. Check Resend configuration.');
  }
  
  // Test each persona flow
  for (const persona of Object.keys(PERSONA_FLOWS)) {
    await testPersonaFlow(persona);
  }
  
  // Generate and display report
  const report = generateTestReport();
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    console.log('\n❌ Some tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testPersonaFlow,
  testDatabaseConnectivity,
  testEmailFunctionality,
  generateTestReport
};
