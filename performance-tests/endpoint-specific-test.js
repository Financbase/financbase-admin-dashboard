import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for endpoint-specific testing
const endpointErrorRate = new Rate('endpoint_errors');
const endpointResponseTime = new Trend('endpoint_response_time');
const endpointRequestCount = new Counter('endpoint_requests');

// Endpoint-specific test configuration
export const options = {
  stages: [
    { duration: '1m', target: 5 },   // Ramp up to 5 users
    { duration: '3m', target: 5 },  // Stay at 5 users
    { duration: '1m', target: 10 }, // Ramp to 10 users
    { duration: '3m', target: 10 }, // Stay at 10 users
    { duration: '1m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    endpoint_errors: ['rate<0.05'],     // Custom error rate must be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Test specific endpoints with detailed scenarios
export default function() {
  const testScenarios = [
    'transactions_crud',
    'expenses_crud', 
    'analytics_heavy',
    'search_performance',
    'ai_processing',
    'dashboard_aggregation'
  ];
  
  const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
  
  switch (scenario) {
    case 'transactions_crud':
      testTransactionsCRUD();
      break;
    case 'expenses_crud':
      testExpensesCRUD();
      break;
    case 'analytics_heavy':
      testAnalyticsHeavy();
      break;
    case 'search_performance':
      testSearchPerformance();
      break;
    case 'ai_processing':
      testAIProcessing();
      break;
    case 'dashboard_aggregation':
      testDashboardAggregation();
      break;
  }
  
  sleep(1);
}

function testTransactionsCRUD() {
  // Test transaction listing with various filters
  const filters = [
    '?limit=10&offset=0',
    '?type=income&limit=20',
    '?type=expense&limit=20',
    '?startDate=2024-01-01&endDate=2024-12-31',
    '?category=office&limit=15'
  ];
  
  const filter = filters[Math.floor(Math.random() * filters.length)];
  const response = http.get(`${BASE_URL}/api/transactions${filter}`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'transactions list status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'transactions list response time < 2s': (r) => r.timings.duration < 2000,
    'transactions list has valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });
  
  // Test transaction stats
  const statsResponse = http.get(`${BASE_URL}/api/transactions/stats`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(statsResponse.timings.duration);
  endpointErrorRate.add(statsResponse.status >= 400);
  
  check(statsResponse, {
    'transaction stats status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'transaction stats response time < 1.5s': (r) => r.timings.duration < 1500,
  });
}

function testExpensesCRUD() {
  // Test expense listing with various filters
  const filters = [
    '?limit=10&offset=0',
    '?status=pending&limit=20',
    '?category=travel&limit=15',
    '?billable=true&limit=20',
    '?startDate=2024-01-01&endDate=2024-12-31'
  ];
  
  const filter = filters[Math.floor(Math.random() * filters.length)];
  const response = http.get(`${BASE_URL}/api/expenses${filter}`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'expenses list status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'expenses list response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  // Test expense analytics
  const analyticsResponse = http.get(`${BASE_URL}/api/expenses/analytics`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(analyticsResponse.timings.duration);
  endpointErrorRate.add(analyticsResponse.status >= 400);
  
  check(analyticsResponse, {
    'expense analytics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'expense analytics response time < 2s': (r) => r.timings.duration < 2000,
  });
}

function testAnalyticsHeavy() {
  // Test various analytics endpoints
  const analyticsEndpoints = [
    '/api/analytics/performance',
    '/api/analytics/revenue',
    '/api/analytics/expenses',
    '/api/analytics/clients'
  ];
  
  const endpoint = analyticsEndpoints[Math.floor(Math.random() * analyticsEndpoints.length)];
  const response = http.get(`${BASE_URL}${endpoint}`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'analytics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'analytics response time < 3s': (r) => r.timings.duration < 3000,
  });
}

function testSearchPerformance() {
  // Test search with various queries
  const searchQueries = [
    'financial',
    'transaction',
    'expense report',
    'revenue analysis',
    'client data',
    'payment method',
    'invoice',
    'budget'
  ];
  
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  const response = http.get(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}&index=all`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 2s': (r) => r.timings.duration < 2000,
    'search returns valid response': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success === true;
      } catch {
        return false;
      }
    },
  });
}

function testAIProcessing() {
  // Test AI financial analysis with various transaction sets
  const transactionSets = [
    generateTransactionSet('small'),
    generateTransactionSet('medium'),
    generateTransactionSet('large')
  ];
  
  const transactions = transactionSets[Math.floor(Math.random() * transactionSets.length)];
  const payload = JSON.stringify({ transactions });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const response = http.post(`${BASE_URL}/api/ai/financial-analysis`, payload, params);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'AI analysis status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'AI analysis response time < 10s': (r) => r.timings.duration < 10000,
  });
}

function testDashboardAggregation() {
  // Test unified dashboard metrics
  const response = http.get(`${BASE_URL}/api/unified-dashboard/metrics`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(response.timings.duration);
  endpointErrorRate.add(response.status >= 400);
  
  check(response, {
    'dashboard metrics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'dashboard metrics response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  // Test dashboard widgets
  const widgetsResponse = http.get(`${BASE_URL}/api/unified-dashboard/widgets`);
  
  endpointRequestCount.add(1);
  endpointResponseTime.add(widgetsResponse.timings.duration);
  endpointErrorRate.add(widgetsResponse.status >= 400);
  
  check(widgetsResponse, {
    'dashboard widgets status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'dashboard widgets response time < 2s': (r) => r.timings.duration < 2000,
  });
}

function generateTransactionSet(size) {
  const sizes = {
    small: 5,
    medium: 15,
    large: 30
  };
  
  const count = sizes[size];
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    transactions.push({
      amount: Math.floor(Math.random() * 1000) + 10,
      type: Math.random() > 0.5 ? 'income' : 'expense',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Transaction ${i + 1}`,
      category: ['office', 'travel', 'marketing', 'utilities'][Math.floor(Math.random() * 4)]
    });
  }
  
  return transactions;
}

export function handleSummary(data) {
  return {
    'endpoint-specific-results.json': JSON.stringify(data, null, 2),
    'endpoint-specific-summary.html': generateEndpointReport(data),
  };
}

function generateEndpointReport(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const failedRequests = data.metrics.http_req_failed.values.count;
  const errorRate = (failedRequests / totalRequests * 100).toFixed(2);
  const avgResponseTime = data.metrics.http_req_duration.values.avg.toFixed(2);
  const p95ResponseTime = data.metrics.http_req_duration.values.p95.toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Endpoint-Specific Performance Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .pass { background-color: #d4edda; border-color: #c3e6cb; }
            .fail { background-color: #f8d7da; border-color: #f5c6cb; }
            .warning { background-color: #fff3cd; border-color: #ffeaa7; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 30px; }
            .endpoint-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🎯 Endpoint-Specific Performance Test Results</h1>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <p><strong>Total Requests:</strong> ${totalRequests.toLocaleString()}</p>
            <p><strong>Failed Requests:</strong> ${failedRequests.toLocaleString()}</p>
            <p><strong>Error Rate:</strong> ${errorRate}%</p>
            <p><strong>Average Response Time:</strong> ${avgResponseTime}ms</p>
            <p><strong>95th Percentile Response Time:</strong> ${p95ResponseTime}ms</p>
        </div>
        
        <div class="metric ${errorRate < 5 ? 'pass' : 'fail'}">
            <h3>🔴 Error Rate: ${errorRate}%</h3>
            <p>Threshold: < 5% (Endpoint-specific test requires high reliability)</p>
            <p>Status: ${errorRate < 5 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <div class="metric ${p95ResponseTime < 3000 ? 'pass' : 'fail'}">
            <h3>⏱️ 95th Percentile Response Time: ${p95ResponseTime}ms</h3>
            <p>Threshold: < 3000ms (Endpoint-specific test requires good performance)</p>
            <p>Status: ${p95ResponseTime < 3000 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <h2>🔍 Tested Endpoints</h2>
        
        <div class="endpoint-section">
            <h3>📊 Transactions API</h3>
            <p>Tested transaction listing, filtering, and statistics endpoints</p>
            <ul>
                <li>GET /api/transactions (with various filters)</li>
                <li>GET /api/transactions/stats</li>
            </ul>
        </div>
        
        <div class="endpoint-section">
            <h3>💰 Expenses API</h3>
            <p>Tested expense management and analytics endpoints</p>
            <ul>
                <li>GET /api/expenses (with various filters)</li>
                <li>GET /api/expenses/analytics</li>
            </ul>
        </div>
        
        <div class="endpoint-section">
            <h3>📈 Analytics API</h3>
            <p>Tested various analytics and reporting endpoints</p>
            <ul>
                <li>GET /api/analytics/performance</li>
                <li>GET /api/analytics/revenue</li>
                <li>GET /api/analytics/expenses</li>
                <li>GET /api/analytics/clients</li>
            </ul>
        </div>
        
        <div class="endpoint-section">
            <h3>🔍 Search API</h3>
            <p>Tested search functionality with various queries</p>
            <ul>
                <li>GET /api/search (with different query terms)</li>
            </ul>
        </div>
        
        <div class="endpoint-section">
            <h3>🤖 AI Processing API</h3>
            <p>Tested AI financial analysis with different transaction sets</p>
            <ul>
                <li>POST /api/ai/financial-analysis</li>
            </ul>
        </div>
        
        <div class="endpoint-section">
            <h3>📊 Dashboard API</h3>
            <p>Tested dashboard aggregation and widget endpoints</p>
            <ul>
                <li>GET /api/unified-dashboard/metrics</li>
                <li>GET /api/unified-dashboard/widgets</li>
            </ul>
        </div>
        
        <h2>📈 Performance Insights</h2>
        <div class="metric">
            <h3>Endpoint Performance Analysis</h3>
            <p>This test focuses on individual endpoint performance with realistic usage patterns:</p>
            <ul>
                <li>Various filter combinations for listing endpoints</li>
                <li>Different query types for search functionality</li>
                <li>Multiple transaction set sizes for AI processing</li>
                <li>Realistic user behavior patterns</li>
            </ul>
        </div>
        
        <h2>🔧 Recommendations</h2>
        <div class="metric">
            <h3>Based on Endpoint-Specific Results</h3>
            ${errorRate > 5 ? `
                <p><strong>⚠️ High Error Rate Detected:</strong></p>
                <ul>
                    <li>Review error logs for specific failing endpoints</li>
                    <li>Implement better error handling and validation</li>
                    <li>Add input sanitization for user queries</li>
                    <li>Consider rate limiting for resource-intensive endpoints</li>
                </ul>
            ` : ''}
            ${p95ResponseTime > 3000 ? `
                <p><strong>⚠️ High Response Times Detected:</strong></p>
                <ul>
                    <li>Optimize database queries for slow endpoints</li>
                    <li>Implement caching for frequently accessed data</li>
                    <li>Consider pagination for large result sets</li>
                    <li>Review external service dependencies</li>
                </ul>
            ` : ''}
            ${errorRate < 5 && p95ResponseTime < 3000 ? `
                <p><strong>✅ Endpoints Performing Well:</strong></p>
                <ul>
                    <li>All endpoints meeting performance thresholds</li>
                    <li>Good error handling and response times</li>
                    <li>Consider this as baseline for production monitoring</li>
                </ul>
            ` : ''}
        </div>
    </body>
    </html>
  `;
}
