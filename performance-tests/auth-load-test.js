import http from 'k6/http';
import { check, sleep } from 'k6';

// Authentication load test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Light load
    { duration: '1m', target: 50 },  // Medium load
    { duration: '30s', target: 100 }, // Heavy load
    { duration: '1m', target: 100 }, // Sustained load
    { duration: '30s', target: 0 },  // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% under 2 seconds
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test sign-in page load
  const signInResponse = http.get(`${BASE_URL}/auth/sign-in`);
  check(signInResponse, {
    'sign-in page loads': (r) => r.status === 200,
    'sign-in page loads quickly': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test sign-up page load
  const signUpResponse = http.get(`${BASE_URL}/auth/sign-up`);
  check(signUpResponse, {
    'sign-up page loads': (r) => r.status === 200,
    'sign-up page loads quickly': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test authentication API (expect 401 for invalid credentials)
  const authResponse = http.post(`${BASE_URL}/api/auth/callback`, {
    code: 'invalid_code',
  });

  check(authResponse, {
    'auth API responds': (r) => r.status >= 200,
  });

  sleep(2);
}
