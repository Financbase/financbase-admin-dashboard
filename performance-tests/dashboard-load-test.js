import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Test configuration for dashboard performance
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    'http_req_duration{url:https://localhost:3000/dashboard}': ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Simulate user journey through dashboard
export default function () {
  // Homepage visit
  const homeResponse = http.get(BASE_URL);
  check(homeResponse, {
    'homepage loads': (r) => r.status === 200,
  });

  sleep(Math.random() * 3 + 1); // Random delay 1-4 seconds

  // Dashboard (requires auth - expect redirect or 401)
  const dashboardResponse = http.get(`${BASE_URL}/dashboard`);
  check(dashboardResponse, {
    'dashboard accessible': (r) => r.status === 200 || r.status === 401 || r.status === 302,
  });

  sleep(Math.random() * 2 + 1);

  // Test public pages
  const collaborationResponse = http.get(`${BASE_URL}/collaboration`);
  check(collaborationResponse, {
    'collaboration page loads': (r) => r.status === 200 || r.status === 401,
  });

  sleep(Math.random() * 2 + 1);

  // Test API endpoints (expecting 401 for unauthenticated)
  const apiResponse = http.get(`${BASE_URL}/api/clients`);
  check(apiResponse, {
    'API responds': (r) => r.status === 401 || r.status === 200,
  });

  sleep(Math.random() * 3 + 2);
}

export function handleSummary(data) {
  return {
    'performance-tests/reports/dashboard-load-results.html': htmlReport(data),
    'performance-tests/reports/dashboard-load-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
