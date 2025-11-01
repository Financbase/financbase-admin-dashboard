/**
 * Manual test script for Support API endpoint
 * Run this after starting the dev server: npm run dev
 * Usage: node test-support-api.js
 */

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, options) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    const response = await fetch(`${API_BASE_URL}/api/support/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.body),
    });

    const data = await response.json();
    const passed = options.expectStatus 
      ? response.status === options.expectStatus 
      : response.ok;

    if (passed && (!options.expectError || !data.error)) {
      log(`✅ PASS: ${name}`, 'green');
      if (options.expectFields) {
        options.expectFields.forEach(field => {
          if (data[field]) {
            log(`   ✓ Has ${field}: ${JSON.stringify(data[field])}`, 'green');
          } else {
            log(`   ✗ Missing ${field}`, 'red');
          }
        });
      }
      if (options.validate) {
        const valid = options.validate(data);
        if (valid) {
          log(`   ✓ Validation passed`, 'green');
        } else {
          log(`   ✗ Validation failed`, 'red');
        }
      }
      return true;
    } else {
      log(`❌ FAIL: ${name}`, 'red');
      log(`   Expected status: ${options.expectStatus || 200}, Got: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${name}`, 'red');
    log(`   ${error.message}`, 'red');
    if (error.message.includes('fetch')) {
      log(`   💡 Make sure the dev server is running: npm run dev`, 'yellow');
    }
    return false;
  }
}

async function runTests() {
  log('🚀 Starting Support API Tests\n', 'blue');
  log('Make sure your dev server is running: npm run dev\n', 'yellow');

  const results = [];

  // Test 1: Valid submission
  results.push(await testEndpoint('Valid Support Ticket Submission', {
    body: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Support Request',
      message: 'This is a test support message with enough characters.',
      category: 'general',
      priority: 'medium',
      website: '',
    },
    expectStatus: 200,
    expectFields: ['success', 'message', 'ticketNumber', 'submissionId'],
    validate: (data) => {
      return data.ticketNumber && /^SUPPORT-\d{8}-\d{4}$/.test(data.ticketNumber);
    },
  }));

  // Test 2: Missing required fields
  results.push(await testEndpoint('Missing Required Fields', {
    body: {
      name: 'Test User',
      // Missing email, subject, message
    },
    expectStatus: 400,
    expectError: true,
  }));

  // Test 3: Invalid email
  results.push(await testEndpoint('Invalid Email Format', {
    body: {
      name: 'Test User',
      email: 'invalid-email',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
      category: 'general',
      priority: 'medium',
      website: '',
    },
    expectStatus: 400,
    expectError: true,
  }));

  // Test 4: Invalid category
  results.push(await testEndpoint('Invalid Category', {
    body: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
      category: 'invalid_category',
      priority: 'medium',
      website: '',
    },
    expectStatus: 400,
    expectError: true,
  }));

  // Test 5: Honeypot filled (spam detection)
  results.push(await testEndpoint('Honeypot Field Filled (Spam Detection)', {
    body: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
      category: 'general',
      priority: 'medium',
      website: 'http://spam.com',
    },
    expectStatus: 400,
    expectError: true,
  }));

  // Test 6: Message too short
  results.push(await testEndpoint('Message Too Short', {
    body: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Short',
      category: 'general',
      priority: 'medium',
      website: '',
    },
    expectStatus: 400,
    expectError: true,
  }));

  // Test 7: XSS attempt (should succeed but sanitize)
  results.push(await testEndpoint('XSS Attempt (Should Sanitize)', {
    body: {
      name: '<script>alert("xss")</script>Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
      category: 'general',
      priority: 'medium',
      website: '',
    },
    expectStatus: 200,
    expectFields: ['success'],
  }));

  // Test 8: Email normalization
  results.push(await testEndpoint('Email Normalization (Uppercase)', {
    body: {
      name: 'Test User',
      email: 'TEST@EXAMPLE.COM',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
      category: 'general',
      priority: 'medium',
      website: '',
    },
    expectStatus: 200,
    expectFields: ['success'],
  }));

  // Test 9: All valid categories
  log(`\n📋 Testing All Valid Categories`, 'blue');
  const categories = ['general', 'technical', 'billing', 'feature', 'bug'];
  let categoryTestsPassed = 0;
  for (const category of categories) {
    const passed = await testEndpoint(`Category: ${category}`, {
      body: {
        name: 'Test User',
        email: `test-${category}@example.com`,
        subject: `Test ${category} Request`,
        message: 'This is a test message with enough characters.',
        category,
        priority: 'medium',
        website: '',
      },
      expectStatus: 200,
    });
    if (passed) categoryTestsPassed++;
  }

  // Test 10: All valid priorities
  log(`\n📋 Testing All Valid Priorities`, 'blue');
  const priorities = ['low', 'medium', 'high', 'critical'];
  let priorityTestsPassed = 0;
  for (const priority of priorities) {
    const passed = await testEndpoint(`Priority: ${priority}`, {
      body: {
        name: 'Test User',
        email: `test-${priority}@example.com`,
        subject: `Test ${priority} Priority Request`,
        message: 'This is a test message with enough characters.',
        category: 'general',
        priority,
        website: '',
      },
      expectStatus: 200,
    });
    if (passed) priorityTestsPassed++;
  }

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  const categoryTotal = categories.length;
  const priorityTotal = priorities.length;

  log(`\n📊 Test Summary:`, 'blue');
  log(`   Basic Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'red');
  log(`   Categories: ${categoryTestsPassed}/${categoryTotal} passed`, categoryTestsPassed === categoryTotal ? 'green' : 'red');
  log(`   Priorities: ${priorityTestsPassed}/${priorityTotal} passed`, priorityTestsPassed === priorityTotal ? 'green' : 'red');
  
  const allPassed = passed === total && categoryTestsPassed === categoryTotal && priorityTestsPassed === priorityTotal;
  
  if (allPassed) {
    log(`\n🎉 All tests passed!`, 'green');
    process.exit(0);
  } else {
    log(`\n⚠️  Some tests failed. Check the output above.`, 'yellow');
    process.exit(1);
  }
}

runTests();

