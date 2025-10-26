import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    errors: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// API endpoints to test
const API_ENDPOINTS = [
  '/api/clients',
  '/api/developer',
  '/api/marketplace/revenue',
  '/api/search',
  '/api/notifications',
];

export default function () {
  // Test API endpoints
  API_ENDPOINTS.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);

    const result = check(response, {
      'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!result);
    responseTime.add(response.timings.duration);

    sleep(1);
  });

  // Test homepage
  const homeResponse = http.get(BASE_URL);
  check(homeResponse, {
    'homepage loads': (r) => r.status === 200,
    'homepage loads quickly': (r) => r.timings.duration < 2000,
  });

  responseTime.add(homeResponse.timings.duration);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-tests/reports/api-load-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
