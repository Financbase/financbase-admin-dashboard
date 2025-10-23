import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 }, // Stay at 10 users for 5 minutes
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 0 },  // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate must be below 10%
  },
};

// Base URL for the application
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Test data
const testUsers = [
  { userId: 'user_1', email: 'test1@example.com' },
  { userId: 'user_2', email: 'test2@example.com' },
  { userId: 'user_3', email: 'test3@example.com' },
];

// Helper function to get random user
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper function to make authenticated request
function makeRequest(method, url, payload = null, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-load-test',
  };
  
  const requestHeaders = { ...defaultHeaders, ...headers };
  
  const response = http.request(method, url, payload, { headers: requestHeaders });
  
  // Record metrics
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  return response;
}

export default function() {
  const user = getRandomUser();
  
  // Test 1: Health Check (Critical - should be fast)
  const healthResponse = makeRequest('GET', `${BASE_URL}/api/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check has database status': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.database !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  sleep(1);
  
  // Test 2: Dashboard Metrics (Critical - complex aggregation)
  const metricsResponse = makeRequest('GET', `${BASE_URL}/api/unified-dashboard/metrics`);
  check(metricsResponse, {
    'metrics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'metrics response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  sleep(1);
  
  // Test 3: Transaction Stats (Critical - database intensive)
  const transactionStatsResponse = makeRequest('GET', `${BASE_URL}/api/transactions/stats`);
  check(transactionStatsResponse, {
    'transaction stats status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'transaction stats response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
  
  // Test 4: Analytics Performance (Critical - complex calculations)
  const analyticsResponse = makeRequest('GET', `${BASE_URL}/api/analytics/performance`);
  check(analyticsResponse, {
    'analytics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'analytics response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  sleep(1);
  
  // Test 5: Search API (Critical - external service dependency)
  const searchResponse = makeRequest('GET', `${BASE_URL}/api/search?q=test&index=all`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 2s': (r) => r.timings.duration < 2000,
    'search returns results': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success === true;
      } catch {
        return false;
      }
    },
  });
  
  sleep(1);
  
  // Test 6: Transaction List (Critical - pagination and filtering)
  const transactionsResponse = makeRequest('GET', `${BASE_URL}/api/transactions?limit=20&offset=0`);
  check(transactionsResponse, {
    'transactions status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'transactions response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
  
  // Test 7: Expenses List (Critical - filtering and pagination)
  const expensesResponse = makeRequest('GET', `${BASE_URL}/api/expenses?limit=20&offset=0`);
  check(expactionsResponse, {
    'expenses status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'expenses response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
  
  // Test 8: AI Financial Analysis (Critical - external AI service)
  const aiAnalysisPayload = JSON.stringify({
    transactions: [
      { amount: 100, type: 'income', date: '2024-01-01' },
      { amount: 50, type: 'expense', date: '2024-01-02' }
    ]
  });
  
  const aiResponse = makeRequest('POST', `${BASE_URL}/api/ai/financial-analysis`, aiAnalysisPayload);
  check(aiResponse, {
    'AI analysis status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'AI analysis response time < 10s': (r) => r.timings.duration < 10000,
  });
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
    'performance-summary.html': generateHtmlReport(data),
  };
}

function generateHtmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Performance Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .pass { background-color: #d4edda; }
            .fail { background-color: #f8d7da; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>Performance Test Results</h1>
        
        <div class="metric ${data.metrics.http_req_failed.values.rate < 0.1 ? 'pass' : 'fail'}">
            <h3>Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</h3>
            <p>Threshold: < 10%</p>
        </div>
        
        <div class="metric ${data.metrics.http_req_duration.values.p95 < 2000 ? 'pass' : 'fail'}">
            <h3>95th Percentile Response Time: ${data.metrics.http_req_duration.values.p95.toFixed(2)}ms</h3>
            <p>Threshold: < 2000ms</p>
        </div>
        
        <h2>Detailed Metrics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Threshold</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Total Requests</td>
                <td>${data.metrics.http_reqs.values.count}</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Failed Requests</td>
                <td>${data.metrics.http_req_failed.values.count}</td>
                <td>< 10%</td>
                <td>${data.metrics.http_req_failed.values.rate < 0.1 ? 'PASS' : 'FAIL'}</td>
            </tr>
            <tr>
                <td>Average Response Time</td>
                <td>${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>${data.metrics.http_req_duration.values.p95.toFixed(2)}ms</td>
                <td>< 2000ms</td>
                <td>${data.metrics.http_req_duration.values.p95 < 2000 ? 'PASS' : 'FAIL'}</td>
            </tr>
        </table>
        
        <h2>Test Summary</h2>
        <p>Test completed with ${data.metrics.http_reqs.values.count} total requests.</p>
        <p>Error rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
        <p>Average response time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
    </body>
    </html>
  `;
}



