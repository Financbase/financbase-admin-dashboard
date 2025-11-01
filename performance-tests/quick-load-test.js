import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Quick load test configuration - 10x expected traffic
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },     // Stay at 20 users
    { duration: '30s', target: 50 },    // Ramp up to 50 users
    { duration: '1m', target: 50 },     // Stay at 50 users
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Critical endpoints to test
const endpoints = [
  { url: '/api/health', name: 'health', critical: true },
  { url: '/api/unified-dashboard/metrics', name: 'dashboard_metrics' },
  { url: '/api/transactions/stats', name: 'transaction_stats' },
  { url: '/api/analytics/performance', name: 'analytics' },
  { url: '/api/search?q=test&index=all', name: 'search' },
  { url: '/api/transactions?limit=20', name: 'transactions' },
  { url: '/api/expenses?limit=20', name: 'expenses' },
  { url: '/', name: 'homepage' },
];

export default function () {
  // Select random endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const url = `${BASE_URL}${endpoint.url}`;
  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: endpoint.name },
    timeout: '30s',
  };

  const response = http.get(url, params);
  
  // Record metrics
  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  
  // Validation
  check(response, {
    [`${endpoint.name} status is acceptable`]: (r) => 
      r.status < 500 || (endpoint.critical && r.status === 200),
    [`${endpoint.name} response time < 3s`]: (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
}

export function handleSummary(data) {
  const errorRate = (data.metrics.http_req_failed?.values?.rate || 0) * 100;
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 0;
  const p99 = data.metrics.http_req_duration?.values?.['p(99)'] || 0;
  
  return {
    'performance-tests/reports/quick-load-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

