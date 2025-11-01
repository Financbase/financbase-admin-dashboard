import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');
const activeUsers = new Gauge('active_users');
const endpointMetrics = new Trend('endpoint_specific_metrics');

// Test configuration - 10x expected traffic as per requirements
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 },  // Ramp up to 100 users over 1 minute
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '1m', target: 200 }, // Ramp up to 200 users over 1 minute
    { duration: '3m', target: 200 }, // Stay at 200 users for 3 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'], // 95% < 2s, 99% < 3s
    http_req_failed: ['rate<0.01'],                   // Error rate < 1%
    errors: ['rate<0.01'],                             // Custom error rate < 1%
    http_reqs: ['rate>10'],                            // Throughput > 10 req/s
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Comprehensive endpoint test suite
const CRITICAL_ENDPOINTS = [
  {
    name: 'health',
    method: 'GET',
    url: '/api/health',
    weight: 20,
    expectedStatus: [200],
    maxResponseTime: 500,
    critical: true,
  },
  {
    name: 'dashboard_metrics',
    method: 'GET',
    url: '/api/unified-dashboard/metrics',
    weight: 15,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
    critical: true,
  },
  {
    name: 'transaction_stats',
    method: 'GET',
    url: '/api/transactions/stats',
    weight: 15,
    expectedStatus: [200, 401],
    maxResponseTime: 1500,
    critical: true,
  },
  {
    name: 'analytics_performance',
    method: 'GET',
    url: '/api/analytics/performance',
    weight: 10,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
    critical: true,
  },
  {
    name: 'search',
    method: 'GET',
    url: '/api/search',
    weight: 10,
    expectedStatus: [200, 401],
    maxResponseTime: 1500,
    queryParams: { q: 'test', index: 'all' },
    critical: true,
  },
  {
    name: 'transactions',
    method: 'GET',
    url: '/api/transactions',
    weight: 10,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
    queryParams: { limit: '20', offset: '0' },
  },
  {
    name: 'expenses',
    method: 'GET',
    url: '/api/expenses',
    weight: 8,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
    queryParams: { limit: '20', offset: '0' },
  },
  {
    name: 'dashboard_widgets',
    method: 'GET',
    url: '/api/unified-dashboard/widgets',
    weight: 7,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
  },
  {
    name: 'expenses_analytics',
    method: 'GET',
    url: '/api/expenses/analytics',
    weight: 5,
    expectedStatus: [200, 401],
    maxResponseTime: 3000,
  },
  {
    name: 'clients',
    method: 'GET',
    url: '/api/clients',
    weight: 5,
    expectedStatus: [200, 401],
    maxResponseTime: 2000,
  },
  {
    name: 'notifications',
    method: 'GET',
    url: '/api/notifications',
    weight: 3,
    expectedStatus: [200, 401],
    maxResponseTime: 1500,
  },
  {
    name: 'homepage',
    method: 'GET',
    url: '/',
    weight: 2,
    expectedStatus: [200],
    maxResponseTime: 2000,
  },
];

// Weighted endpoint selection
function selectEndpoint() {
  const totalWeight = CRITICAL_ENDPOINTS.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of CRITICAL_ENDPOINTS) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return CRITICAL_ENDPOINTS[0]; // Fallback
}

// Build URL with query parameters
function buildUrl(endpoint) {
  let url = `${BASE_URL}${endpoint.url}`;
  if (endpoint.queryParams) {
    const params = new URLSearchParams(endpoint.queryParams);
    url += `?${params.toString()}`;
  }
  return url;
}

// Make request with proper headers
function makeRequest(endpoint) {
  const url = buildUrl(endpoint);
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-load-test/1.0',
    },
    timeout: '30s',
    tags: { name: endpoint.name, endpoint: endpoint.url },
  };

  let response;
  if (endpoint.method === 'POST') {
    response = http.post(url, endpoint.payload || '{}', params);
  } else {
    response = http.get(url, params);
  }

  return response;
}

// Validate response
function validateResponse(response, endpoint) {
  const checks = {
    [`${endpoint.name} status is valid`]: (r) => endpoint.expectedStatus.includes(r.status),
    [`${endpoint.name} response time < ${endpoint.maxResponseTime}ms`]: (r) => 
      r.timings.duration < endpoint.maxResponseTime,
  };

  if (endpoint.critical) {
    checks[`${endpoint.name} response has body`] = (r) => r.body && r.body.length > 0;
  }

  return check(response, checks);
}

export default function () {
  activeUsers.add(1);
  
  const endpoint = selectEndpoint();
  const startTime = Date.now();
  
  // Make request
  const response = makeRequest(endpoint);
  const responseTime = Date.now() - startTime;
  
  // Record metrics
  requestCount.add(1);
  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  endpointMetrics.add(response.timings.duration, { endpoint: endpoint.name });
  
  // Validate response
  const validationResult = validateResponse(response, endpoint);
  
  // Log critical failures
  if (endpoint.critical && response.status >= 500) {
    console.error(`❌ Critical endpoint ${endpoint.name} failed: ${response.status}`);
  }
  
  if (response.timings.duration > endpoint.maxResponseTime * 1.5) {
    console.warn(`⚠️ Slow response for ${endpoint.name}: ${response.timings.duration}ms`);
  }
  
  activeUsers.add(-1);
  
  // Realistic think time between requests
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString();
  const summary = {
    timestamp,
    testType: 'comprehensive_load_test',
    duration: `${data.state.testRunDurationMs / 1000}s`,
    summary: {
      totalRequests: data.metrics.http_reqs.values.count,
      failedRequests: data.metrics.http_req_failed.values.count,
      errorRate: ((data.metrics.http_req_failed.values.rate || 0) * 100).toFixed(2) + '%',
      averageResponseTime: data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms',
      minResponseTime: data.metrics.http_req_duration.values.min.toFixed(2) + 'ms',
      maxResponseTime: data.metrics.http_req_duration.values.max.toFixed(2) + 'ms',
      p90ResponseTime: data.metrics.http_req_duration.values['p(90)'].toFixed(2) + 'ms',
      p95ResponseTime: data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms',
      p99ResponseTime: data.metrics.http_req_duration.values['p(99)'].toFixed(2) + 'ms',
      requestsPerSecond: (data.metrics.http_reqs.values.rate || 0).toFixed(2),
      vus: data.metrics.vus.values.max,
    },
    thresholds: {
      p95ResponseTime: {
        threshold: '2000ms',
        actual: data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms',
        passed: data.metrics.http_req_duration.values['p(95)'] < 2000,
      },
      p99ResponseTime: {
        threshold: '3000ms',
        actual: data.metrics.http_req_duration.values['p(99)'].toFixed(2) + 'ms',
        passed: data.metrics.http_req_duration.values['p(99)'] < 3000,
      },
      errorRate: {
        threshold: '< 1%',
        actual: ((data.metrics.http_req_failed.values.rate || 0) * 100).toFixed(2) + '%',
        passed: (data.metrics.http_req_failed.values.rate || 0) < 0.01,
      },
    },
    recommendations: generateRecommendations(data),
  };

  return {
    'performance-tests/reports/comprehensive-load-results.json': JSON.stringify(summary, null, 2),
    'performance-tests/reports/comprehensive-load-summary.html': generateHtmlReport(summary, data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function generateRecommendations(data) {
  const recommendations = [];
  const errorRate = data.metrics.http_req_failed.values.rate || 0;
  const p95ResponseTime = data.metrics.http_req_duration.values['p(95)'];
  const p99ResponseTime = data.metrics.http_req_duration.values['p(99)'];
  const totalRequests = data.metrics.http_reqs.values.count;

  if (errorRate > 0.01) {
    recommendations.push({
      severity: 'critical',
      issue: 'High error rate detected',
      details: `Error rate: ${(errorRate * 100).toFixed(2)}% exceeds 1% threshold`,
      actions: [
        'Check application logs for error patterns',
        'Verify database connection pool settings',
        'Review external service dependencies',
        'Implement proper error handling and retry logic',
      ],
    });
  }

  if (p95ResponseTime > 2000) {
    recommendations.push({
      severity: 'high',
      issue: '95th percentile response time exceeds threshold',
      details: `P95: ${p95ResponseTime.toFixed(2)}ms exceeds 2000ms threshold`,
      actions: [
        'Optimize database queries with proper indexing',
        'Implement response caching for frequently accessed data',
        'Review and optimize complex aggregation queries',
        'Consider database read replicas for heavy read operations',
      ],
    });
  }

  if (p99ResponseTime > 3000) {
    recommendations.push({
      severity: 'medium',
      issue: '99th percentile response time exceeds threshold',
      details: `P99: ${p99ResponseTime.toFixed(2)}ms exceeds 3000ms threshold`,
      actions: [
        'Identify slow endpoints and optimize',
        'Implement request queuing for heavy operations',
        'Add database query timeouts',
        'Consider async processing for long-running tasks',
      ],
    });
  }

  if (errorRate < 0.01 && p95ResponseTime < 2000 && p99ResponseTime < 3000) {
    recommendations.push({
      severity: 'info',
      issue: 'System performing within acceptable parameters',
      details: 'All key metrics are within thresholds',
      actions: [
        'Continue monitoring in production',
        'Maintain current infrastructure setup',
        'Review metrics regularly for trends',
      ],
    });
  }

  return recommendations;
}

function generateHtmlReport(summary, data) {
  const thresholdStatus = (passed) => passed ? '✅ PASS' : '❌ FAIL';
  const thresholdClass = (passed) => passed ? 'pass' : 'fail';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Load Test Results</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .summary { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .metric { 
            margin: 15px 0; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 5px;
            background: #fafafa;
        }
        .metric.pass { background-color: #d4edda; border-color: #c3e6cb; }
        .metric.fail { background-color: #f8d7da; border-color: #f5c6cb; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background: white;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .recommendation { 
            margin: 15px 0; 
            padding: 15px; 
            border-left: 4px solid #007bff;
            background: #f8f9fa;
        }
        .recommendation.critical { border-left-color: #dc3545; background: #fff5f5; }
        .recommendation.high { border-left-color: #ffc107; background: #fffbf0; }
        .recommendation.medium { border-left-color: #17a2b8; background: #f0f9fa; }
        .recommendation.info { border-left-color: #28a745; background: #f0fff4; }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge.pass { background: #28a745; color: white; }
        .badge.fail { background: #dc3545; color: white; }
        .timestamp { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Comprehensive Load Test Results</h1>
        <p class="timestamp">Test Time: ${summary.timestamp}</p>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <table>
                <tr><td><strong>Total Requests</strong></td><td>${summary.summary.totalRequests.toLocaleString()}</td></tr>
                <tr><td><strong>Failed Requests</strong></td><td>${summary.summary.failedRequests.toLocaleString()}</td></tr>
                <tr><td><strong>Error Rate</strong></td><td>${summary.summary.errorRate}</td></tr>
                <tr><td><strong>Average Response Time</strong></td><td>${summary.summary.averageResponseTime}</td></tr>
                <tr><td><strong>Min Response Time</strong></td><td>${summary.summary.minResponseTime}</td></tr>
                <tr><td><strong>Max Response Time</strong></td><td>${summary.summary.maxResponseTime}</td></tr>
                <tr><td><strong>90th Percentile</strong></td><td>${summary.summary.p90ResponseTime}</td></tr>
                <tr><td><strong>95th Percentile</strong></td><td>${summary.summary.p95ResponseTime}</td></tr>
                <tr><td><strong>99th Percentile</strong></td><td>${summary.summary.p99ResponseTime}</td></tr>
                <tr><td><strong>Requests Per Second</strong></td><td>${summary.summary.requestsPerSecond}</td></tr>
                <tr><td><strong>Peak Virtual Users</strong></td><td>${summary.summary.vus}</td></tr>
            </table>
        </div>
        
        <h2>🎯 Thresholds</h2>
        <div class="metric ${thresholdClass(summary.thresholds.p95ResponseTime.passed)}">
            <h3>95th Percentile Response Time</h3>
            <p><strong>Threshold:</strong> ${summary.thresholds.p95ResponseTime.threshold}</p>
            <p><strong>Actual:</strong> ${summary.thresholds.p95ResponseTime.actual}</p>
            <p><strong>Status:</strong> <span class="badge ${thresholdClass(summary.thresholds.p95ResponseTime.passed)}">${thresholdStatus(summary.thresholds.p95ResponseTime.passed)}</span></p>
        </div>
        
        <div class="metric ${thresholdClass(summary.thresholds.p99ResponseTime.passed)}">
            <h3>99th Percentile Response Time</h3>
            <p><strong>Threshold:</strong> ${summary.thresholds.p99ResponseTime.threshold}</p>
            <p><strong>Actual:</strong> ${summary.thresholds.p99ResponseTime.actual}</p>
            <p><strong>Status:</strong> <span class="badge ${thresholdClass(summary.thresholds.p99ResponseTime.passed)}">${thresholdStatus(summary.thresholds.p99ResponseTime.passed)}</span></p>
        </div>
        
        <div class="metric ${thresholdClass(summary.thresholds.errorRate.passed)}">
            <h3>Error Rate</h3>
            <p><strong>Threshold:</strong> ${summary.thresholds.errorRate.threshold}</p>
            <p><strong>Actual:</strong> ${summary.thresholds.errorRate.actual}</p>
            <p><strong>Status:</strong> <span class="badge ${thresholdClass(summary.thresholds.errorRate.passed)}">${thresholdStatus(summary.thresholds.errorRate.passed)}</span></p>
        </div>
        
        <h2>💡 Recommendations</h2>
        ${summary.recommendations.map(rec => `
            <div class="recommendation ${rec.severity}">
                <h4>${rec.issue}</h4>
                <p><strong>Details:</strong> ${rec.details}</p>
                <p><strong>Recommended Actions:</strong></p>
                <ul>
                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
        
        <h2>📋 Test Configuration</h2>
        <table>
            <tr><td><strong>Base URL</strong></td><td>${BASE_URL}</td></tr>
            <tr><td><strong>Test Duration</strong></td><td>${summary.duration}</td></tr>
            <tr><td><strong>Test Type</strong></td><td>${summary.testType}</td></tr>
            <tr><td><strong>Load Profile</strong></td><td>50 → 100 → 200 users (ramp up/down)</td></tr>
        </table>
        
        <h2>🔍 Tested Endpoints</h2>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Weight</th>
                <th>Max Response Time</th>
                <th>Critical</th>
            </tr>
            ${CRITICAL_ENDPOINTS.map(ep => `
                <tr>
                    <td>${ep.url}</td>
                    <td>${ep.method}</td>
                    <td>${ep.weight}%</td>
                    <td>${ep.maxResponseTime}ms</td>
                    <td>${ep.critical ? '✅' : '❌'}</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>
  `;
}

