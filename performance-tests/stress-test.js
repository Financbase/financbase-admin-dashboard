import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for stress testing
const errorRate = new Rate('stress_errors');
const responseTime = new Trend('stress_response_time');
const requestCount = new Counter('stress_requests');

// Stress test configuration - more aggressive than load test
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Quick ramp to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 200 }, // Ramp to 200 users
    { duration: '2m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    http_req_failed: ['rate<0.2'],     // Error rate must be below 20% (higher for stress test)
    stress_errors: ['rate<0.2'],        // Custom error rate must be below 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Stress test scenarios focusing on the most critical endpoints
export default function() {
  const scenarios = [
    'health_check',
    'dashboard_metrics',
    'transaction_stats',
    'search_api',
    'ai_analysis'
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  switch (scenario) {
    case 'health_check':
      stressTestHealthCheck();
      break;
    case 'dashboard_metrics':
      stressTestDashboardMetrics();
      break;
    case 'transaction_stats':
      stressTestTransactionStats();
      break;
    case 'search_api':
      stressTestSearchAPI();
      break;
    case 'ai_analysis':
      stressTestAIAnalysis();
      break;
  }
  
  sleep(0.5); // Shorter sleep for stress test
}

function stressTestHealthCheck() {
  const response = http.get(`${BASE_URL}/api/health`);
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 1s': (r) => r.timings.duration < 1000,
  });
}

function stressTestDashboardMetrics() {
  const response = http.get(`${BASE_URL}/api/unified-dashboard/metrics`);
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  check(response, {
    'dashboard metrics status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'dashboard metrics response time < 5s': (r) => r.timings.duration < 5000,
  });
}

function stressTestTransactionStats() {
  const response = http.get(`${BASE_URL}/api/transactions/stats`);
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  check(response, {
    'transaction stats status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'transaction stats response time < 3s': (r) => r.timings.duration < 3000,
  });
}

function stressTestSearchAPI() {
  const searchQueries = ['financial', 'transaction', 'expense', 'revenue', 'analytics'];
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  const response = http.get(`${BASE_URL}/api/search?q=${query}&index=all`);
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 3s': (r) => r.timings.duration < 3000,
  });
}

function stressTestAIAnalysis() {
  const analysisPayload = JSON.stringify({
    transactions: generateRandomTransactions()
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const response = http.post(`${BASE_URL}/api/ai/financial-analysis`, analysisPayload, params);
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  errorRate.add(response.status >= 400);
  
  check(response, {
    'AI analysis status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'AI analysis response time < 15s': (r) => r.timings.duration < 15000,
  });
}

function generateRandomTransactions() {
  const transactions = [];
  const count = Math.floor(Math.random() * 10) + 5; // 5-15 transactions
  
  for (let i = 0; i < count; i++) {
    transactions.push({
      amount: Math.floor(Math.random() * 1000) + 10,
      type: Math.random() > 0.5 ? 'income' : 'expense',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Transaction ${i + 1}`
    });
  }
  
  return transactions;
}

export function handleSummary(data) {
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
    'stress-test-summary.html': generateStressTestReport(data),
  };
}

function generateStressTestReport(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const failedRequests = data.metrics.http_req_failed.values.count;
  const errorRate = (failedRequests / totalRequests * 100).toFixed(2);
  const avgResponseTime = data.metrics.http_req_duration.values.avg.toFixed(2);
  const p95ResponseTime = data.metrics.http_req_duration.values.p95.toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Stress Test Results</title>
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
        </style>
    </head>
    <body>
        <h1>🚀 Stress Test Results</h1>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <p><strong>Total Requests:</strong> ${totalRequests.toLocaleString()}</p>
            <p><strong>Failed Requests:</strong> ${failedRequests.toLocaleString()}</p>
            <p><strong>Error Rate:</strong> ${errorRate}%</p>
            <p><strong>Average Response Time:</strong> ${avgResponseTime}ms</p>
            <p><strong>95th Percentile Response Time:</strong> ${p95ResponseTime}ms</p>
        </div>
        
        <div class="metric ${errorRate < 20 ? 'pass' : 'fail'}">
            <h3>🔴 Error Rate: ${errorRate}%</h3>
            <p>Threshold: < 20% (Stress test allows higher error rate)</p>
            <p>Status: ${errorRate < 20 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <div class="metric ${p95ResponseTime < 5000 ? 'pass' : 'fail'}">
            <h3>⏱️ 95th Percentile Response Time: ${p95ResponseTime}ms</h3>
            <p>Threshold: < 5000ms (Stress test allows higher response times)</p>
            <p>Status: ${p95ResponseTime < 5000 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <h2>📈 Detailed Metrics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Threshold</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Total Requests</td>
                <td>${totalRequests.toLocaleString()}</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Failed Requests</td>
                <td>${failedRequests.toLocaleString()}</td>
                <td>< 20%</td>
                <td>${errorRate < 20 ? '✅ PASS' : '❌ FAIL'}</td>
            </tr>
            <tr>
                <td>Average Response Time</td>
                <td>${avgResponseTime}ms</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>${p95ResponseTime}ms</td>
                <td>< 5000ms</td>
                <td>${p95ResponseTime < 5000 ? '✅ PASS' : '❌ FAIL'}</td>
            </tr>
            <tr>
                <td>Max Response Time</td>
                <td>${data.metrics.http_req_duration.values.max.toFixed(2)}ms</td>
                <td>-</td>
                <td>-</td>
            </tr>
        </table>
        
        <h2>🎯 Performance Insights</h2>
        <div class="metric">
            <h3>System Behavior Under Stress</h3>
            <p>This stress test simulates high concurrent load to identify:</p>
            <ul>
                <li>System breaking points</li>
                <li>Performance degradation patterns</li>
                <li>Resource bottlenecks</li>
                <li>Error handling under load</li>
            </ul>
        </div>
        
        <h2>🔧 Recommendations</h2>
        <div class="metric">
            <h3>Based on Test Results</h3>
            ${errorRate > 20 ? `
                <p><strong>⚠️ High Error Rate Detected:</strong></p>
                <ul>
                    <li>Consider implementing rate limiting</li>
                    <li>Optimize database queries</li>
                    <li>Add caching layers</li>
                    <li>Scale horizontal infrastructure</li>
                </ul>
            ` : ''}
            ${p95ResponseTime > 5000 ? `
                <p><strong>⚠️ High Response Times Detected:</strong></p>
                <ul>
                    <li>Optimize slow database queries</li>
                    <li>Implement response caching</li>
                    <li>Consider async processing for heavy operations</li>
                    <li>Review external service dependencies</li>
                </ul>
            ` : ''}
            ${errorRate < 20 && p95ResponseTime < 5000 ? `
                <p><strong>✅ System Performed Well Under Stress:</strong></p>
                <ul>
                    <li>System handled high load gracefully</li>
                    <li>Consider this as baseline for production capacity planning</li>
                    <li>Monitor for gradual performance degradation</li>
                </ul>
            ` : ''}
        </div>
    </body>
    </html>
  `;
}



