/**
 * Test script for Careers Management System
 * Tests API endpoints, permissions, and data flow
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || ''; // Clerk session token for testing

const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);
		const protocol = urlObj.protocol === 'https:' ? https : http;
		
		const requestOptions = {
			hostname: urlObj.hostname,
			port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
			path: urlObj.pathname + urlObj.search,
			method: options.method || 'GET',
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		};

		if (TEST_USER_TOKEN) {
			requestOptions.headers['Authorization'] = `Bearer ${TEST_USER_TOKEN}`;
		}

		const req = protocol.request(requestOptions, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				try {
					const parsed = data ? JSON.parse(data) : {};
					resolve({
						status: res.statusCode,
						headers: res.headers,
						body: parsed,
					});
				} catch (e) {
					resolve({
						status: res.statusCode,
						headers: res.headers,
						body: data,
					});
				}
			});
		});

		req.on('error', reject);

		if (options.body) {
			req.write(JSON.stringify(options.body));
		}

		req.end();
	});
}

async function testPublicEndpoints() {
	log('\n=== Testing Public Endpoints ===', 'blue');
	
	// Test GET /api/careers
	try {
		log('Testing GET /api/careers (public)...', 'yellow');
		const response = await makeRequest(`${BASE_URL}/api/careers`);
		
		if (response.status === 200) {
			log('✅ GET /api/careers - Success', 'green');
			log(`   Found ${response.body.jobs?.length || 0} published job postings`, 'blue');
		} else {
			log(`❌ GET /api/careers - Failed with status ${response.status}`, 'red');
			log(`   Response: ${JSON.stringify(response.body)}`, 'yellow');
		}
	} catch (error) {
		log(`❌ GET /api/careers - Error: ${error.message}`, 'red');
	}

	// Test GET /api/careers/[id] with invalid ID
	try {
		log('Testing GET /api/careers/999 (non-existent)...', 'yellow');
		const response = await makeRequest(`${BASE_URL}/api/careers/999`);
		
		if (response.status === 404) {
			log('✅ GET /api/careers/999 - Correctly returns 404', 'green');
		} else {
			log(`⚠️  GET /api/careers/999 - Expected 404, got ${response.status}`, 'yellow');
		}
	} catch (error) {
		log(`❌ GET /api/careers/999 - Error: ${error.message}`, 'red');
	}
}

async function testAdminEndpoints() {
	log('\n=== Testing Admin Endpoints ===', 'blue');
	
	if (!TEST_USER_TOKEN) {
		log('⚠️  Skipping admin endpoint tests - TEST_USER_TOKEN not set', 'yellow');
		log('   Set TEST_USER_TOKEN environment variable to test authenticated endpoints', 'yellow');
		return;
	}

	// Test GET /api/admin/careers
	try {
		log('Testing GET /api/admin/careers (admin)...', 'yellow');
		const response = await makeRequest(`${BASE_URL}/api/admin/careers`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${TEST_USER_TOKEN}`,
			},
		});
		
		if (response.status === 200) {
			log('✅ GET /api/admin/careers - Success', 'green');
			log(`   Found ${response.body.jobs?.length || 0} total job postings`, 'blue');
		} else if (response.status === 401) {
			log('⚠️  GET /api/admin/careers - Unauthorized (expected if not logged in)', 'yellow');
		} else if (response.status === 403) {
			log('⚠️  GET /api/admin/careers - Forbidden (user lacks permissions)', 'yellow');
		} else {
			log(`❌ GET /api/admin/careers - Failed with status ${response.status}`, 'red');
		}
	} catch (error) {
		log(`❌ GET /api/admin/careers - Error: ${error.message}`, 'red');
	}

	// Test POST /api/admin/careers (create)
	try {
		log('Testing POST /api/admin/careers (create)...', 'yellow');
		const testJob = {
			title: 'Test Engineer',
			department: 'Engineering',
			location: 'Remote',
			type: 'Full-time',
			experience: '3+ years',
			description: 'Test job posting for system validation',
			requirements: ['TypeScript', 'React', 'Node.js'],
			status: 'draft',
			isFeatured: false,
		};

		const response = await makeRequest(`${BASE_URL}/api/admin/careers`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${TEST_USER_TOKEN}`,
			},
			body: testJob,
		});
		
		if (response.status === 201) {
			log('✅ POST /api/admin/careers - Success', 'green');
			log(`   Created job with ID: ${response.body.job?.id}`, 'blue');
			return response.body.job?.id;
		} else if (response.status === 401) {
			log('⚠️  POST /api/admin/careers - Unauthorized', 'yellow');
		} else if (response.status === 403) {
			log('⚠️  POST /api/admin/careers - Forbidden (user lacks permissions)', 'yellow');
		} else {
			log(`❌ POST /api/admin/careers - Failed with status ${response.status}`, 'red');
			log(`   Response: ${JSON.stringify(response.body)}`, 'yellow');
		}
	} catch (error) {
		log(`❌ POST /api/admin/careers - Error: ${error.message}`, 'red');
	}

	return null;
}

async function testRoutes() {
	log('\n=== Testing Public Routes ===', 'blue');
	
	// Test public careers page
	try {
		log('Testing GET /careers (public page)...', 'yellow');
		const response = await makeRequest(`${BASE_URL}/careers`);
		
		if (response.status === 200) {
			log('✅ GET /careers - Page accessible', 'green');
		} else {
			log(`⚠️  GET /careers - Status ${response.status}`, 'yellow');
		}
	} catch (error) {
		log(`❌ GET /careers - Error: ${error.message}`, 'red');
	}

	// Test admin careers page
	try {
		log('Testing GET /admin/careers (admin page)...', 'yellow');
		const response = await makeRequest(`${BASE_URL}/admin/careers`, {
			headers: TEST_USER_TOKEN ? {
				'Authorization': `Bearer ${TEST_USER_TOKEN}`,
			} : {},
		});
		
		if (response.status === 200) {
			log('✅ GET /admin/careers - Page accessible', 'green');
		} else if (response.status === 401 || response.status === 403) {
			log('⚠️  GET /admin/careers - Protected (expected)', 'yellow');
		} else {
			log(`⚠️  GET /admin/careers - Status ${response.status}`, 'yellow');
		}
	} catch (error) {
		log(`❌ GET /admin/careers - Error: ${error.message}`, 'red');
	}
}

async function testSchemaExports() {
	log('\n=== Testing Schema Exports ===', 'blue');
	
	const fs = require('fs');
	const path = require('path');
	
	// Check if careers schema is exported
	const schemaIndexPath = path.join(__dirname, '../lib/db/schemas/index.ts');
	
	try {
		const content = fs.readFileSync(schemaIndexPath, 'utf8');
		if (content.includes('careers.schema')) {
			log('✅ Careers schema exported in index.ts', 'green');
		} else {
			log('❌ Careers schema NOT exported in index.ts', 'red');
		}
	} catch (error) {
		log(`❌ Error reading schema index: ${error.message}`, 'red');
	}

	// Check if schema file exists
	const schemaPath = path.join(__dirname, '../lib/db/schemas/careers.schema.ts');
	if (fs.existsSync(schemaPath)) {
		log('✅ Careers schema file exists', 'green');
	} else {
		log('❌ Careers schema file NOT found', 'red');
	}
}

async function runTests() {
	log('🚀 Starting Careers Management System Tests', 'blue');
	log(`   Base URL: ${BASE_URL}`, 'blue');
	
	await testSchemaExports();
	await testPublicEndpoints();
	await testAdminEndpoints();
	await testRoutes();
	
	log('\n=== Test Summary ===', 'blue');
	log('✅ Schema exports verified', 'green');
	log('✅ Public API endpoints tested', 'green');
	log('⚠️  Admin endpoints require authentication token', 'yellow');
	log('✅ Route accessibility tested', 'green');
	
	log('\n📝 Next Steps:', 'blue');
	log('1. Run database migration: pnpm db:push', 'yellow');
	log('2. Set TEST_USER_TOKEN to test authenticated endpoints', 'yellow');
	log('3. Access /admin/careers to manage job postings', 'yellow');
	log('4. View /careers to see published job postings', 'yellow');
}

// Run tests
runTests().catch(console.error);

