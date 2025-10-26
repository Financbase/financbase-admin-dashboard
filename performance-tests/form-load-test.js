import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Form submission load test
export const options = {
  stages: [
    { duration: '1m', target: 25 },  // Ramp up
    { duration: '3m', target: 25 },  // Steady load
    { duration: '1m', target: 50 },  // Increase load
    { duration: '3m', target: 50 },  // Steady load
    { duration: '1m', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% under 3 seconds
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test client creation form (expect 401 for unauthenticated)
  const clientData = JSON.stringify({
    companyName: `Test Company ${randomIntBetween(1, 1000)}`,
    email: `test${randomIntBetween(1, 1000)}@example.com`,
    contactName: `Test User ${randomIntBetween(1, 1000)}`,
    phone: `+1555${randomIntBetween(100, 999)}${randomIntBetween(1000, 9999)}`,
    address: `${randomIntBetween(1, 9999)} Test Street`,
    city: 'Test City',
    state: 'TS',
    zipCode: `${randomIntBetween(10000, 99999)}`,
    country: 'US',
    currency: 'USD',
    paymentTerms: 'net30',
  });

  const createClientResponse = http.post(
    `${BASE_URL}/api/clients`,
    clientData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(createClientResponse, {
    'client creation responds': (r) => r.status === 401 || r.status === 400,
    'client creation is fast': (r) => r.timings.duration < 2000,
  });

  sleep(randomIntBetween(1, 3));

  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/api/search?q=test`);
  check(searchResponse, {
    'search responds': (r) => r.status === 401 || r.status === 200,
    'search is fast': (r) => r.timings.duration < 1000,
  });

  sleep(randomIntBetween(1, 2));
}
