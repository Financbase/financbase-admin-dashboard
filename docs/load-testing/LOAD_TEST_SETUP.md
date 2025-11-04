# Load Testing Setup - Complete ✅

## What's Been Set Up

### 1. Comprehensive Load Test Suite
**File**: `performance-tests/comprehensive-load-test.js`
- Tests 12 critical endpoints with weighted distribution
- Ramp from 50 → 100 → 200 users over ~15 minutes
- Thresholds: 95th percentile < 2000ms, error rate < 1%
- Generates detailed HTML and JSON reports

### 2. Quick Load Test
**File**: `performance-tests/quick-load-test.js`
- Faster test (5-6 minutes) for quick validation
- Ramp from 20 → 50 → 100 users
- Same thresholds as comprehensive test
- Perfect for CI/CD pipelines

### 3. Test Runner Script
**File**: `performance-tests/run-comprehensive-load-tests.sh`
- Automated test execution with health checks
- Validates app is running before tests
- Generates combined reports
- Handles multiple test scenarios

### 4. Documentation
- `performance-tests/LOAD_TESTING_GUIDE.md` - Complete guide
- Updated `package.json` with new test scripts

## Quick Start

### Step 1: Ensure App is Running
```bash
npm run dev
# Wait for "Ready in Xms" message
# App should be on http://localhost:3000 or http://localhost:3010
```

### Step 2: Verify Health Check
```bash
curl http://localhost:3000/api/health
# OR
curl http://localhost:3010/api/health
```

### Step 3: Run Load Tests

#### Quick Test (Recommended First)
```bash
npm run test:performance:load:quick
```
- Duration: ~5-6 minutes
- Users: 20 → 50 → 100

#### Comprehensive Test
```bash
npm run test:performance:comprehensive
```
- Duration: ~15 minutes  
- Users: 50 → 100 → 200

#### Complete Suite (with health checks)
```bash
npm run test:performance:load:comprehensive
```
- Runs multiple test scenarios
- Includes health checks

## Available Test Commands

```bash
# Quick load test (5-6 min)
npm run test:performance:load:quick

# Comprehensive load test (15+ min)
npm run test:performance:comprehensive

# Complete test suite with health checks
npm run test:performance:load:comprehensive

# Individual tests
npm run test:performance:api
npm run test:performance:dashboard
npm run test:performance:auth

# Original test suite
npm run test:performance:load
```

## Test Against Different Environments

```bash
# Test staging
BASE_URL=https://staging.example.com npm run test:performance:load:quick

# Test production (use with caution)
BASE_URL=https://production.example.com npm run test:performance:comprehensive
```

## What Gets Tested

### Critical Endpoints (Weighted Distribution)

1. **`/api/health`** (20%) - Health check, < 500ms target
2. **`/api/unified-dashboard/metrics`** (15%) - Dashboard metrics, < 2000ms
3. **`/api/transactions/stats`** (15%) - Transaction stats, < 1500ms
4. **`/api/analytics/performance`** (10%) - Analytics, < 2000ms
5. **`/api/search`** (10%) - Search API, < 1500ms
6. **`/api/transactions`** (10%) - Transaction list, < 2000ms
7. **`/api/expenses`** (8%) - Expense list, < 2000ms
8. **`/api/unified-dashboard/widgets`** (7%) - Widgets, < 2000ms
9. **`/api/expenses/analytics`** (5%) - Expense analytics, < 3000ms
10. **`/api/clients`** (5%) - Client list, < 2000ms
11. **`/api/notifications`** (3%) - Notifications, < 1500ms
12. **`/`** (2%) - Homepage, < 2000ms

## Performance Thresholds

### Success Criteria
- ✅ **95th percentile response time**: < 2000ms
- ✅ **99th percentile response time**: < 3000ms  
- ✅ **Error rate**: < 1%
- ✅ **Throughput**: > 10 requests/second

### Test Load Profile
- **Quick Test**: 20 → 50 → 100 users (10x normal load)
- **Comprehensive**: 50 → 100 → 200 users (10x normal load)
- **Ultra-High**: Up to 15,000 users (stress testing)

## Test Results

Reports are generated in:
```
performance-tests/reports/
├── comprehensive-load-results.json
├── comprehensive-load-summary.html
├── quick-load-results.json
└── load-test-YYYYMMDD-HHMMSS/
    ├── comprehensive-load-results.json
    ├── comprehensive-load-summary.html
    ├── README.md
    └── *.log files
```

### Viewing Results

**HTML Reports**:
```bash
open performance-tests/reports/comprehensive-load-summary.html
```

**JSON Results**:
```bash
cat performance-tests/reports/comprehensive-load-results.json | jq
```

## Understanding Results

### Key Metrics
1. **Response Time Percentiles**
   - p95: 95% of requests < 2000ms ✅
   - p99: 99% of requests < 3000ms ✅
   
2. **Error Rate**
   - Should be < 1% ✅
   - Includes HTTP 4xx/5xx errors

3. **Throughput**
   - Requests per second
   - Target: > 10 req/s ✅

4. **Virtual Users**
   - Peak concurrent users handled
   - Shows system capacity

### Recommendations

The test reports include automatic recommendations:
- **Critical**: High error rates - immediate action needed
- **High**: Slow response times - optimization required
- **Medium**: Performance improvements suggested
- **Info**: System performing well

## Troubleshooting

### App Not Responding
```bash
# Check if app is running
lsof -i:3000 -i:3010

# Start the app
npm run dev

# Wait for startup, then verify
curl http://localhost:3000/api/health
```

### k6 Not Installed
```bash
# macOS
brew install k6

# Verify installation
k6 version
```

### High Error Rates
1. Check application logs
2. Verify database connectivity
3. Review external service dependencies
4. Check system resources (CPU, memory)

### Slow Response Times
1. Review database query performance
2. Check for missing indexes
3. Verify caching is working
4. Monitor external API calls

## Next Steps

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Run quick test first**:
   ```bash
   npm run test:performance:load:quick
   ```

3. **Review results**:
   - Check HTML report
   - Review recommendations
   - Identify bottlenecks

4. **Optimize if needed**:
   - Implement recommended fixes
   - Re-run tests
   - Compare results

5. **Run comprehensive test**:
   ```bash
   npm run test:performance:comprehensive
   ```

6. **Integrate into CI/CD**:
   - Add to GitHub Actions
   - Set up automated testing
   - Monitor trends over time

## Files Created/Updated

- ✅ `performance-tests/comprehensive-load-test.js` - Main load test
- ✅ `performance-tests/quick-load-test.js` - Quick validation test
- ✅ `performance-tests/run-comprehensive-load-tests.sh` - Test runner
- ✅ `performance-tests/LOAD_TESTING_GUIDE.md` - Complete documentation
- ✅ `package.json` - Added test scripts
- ✅ `LOAD_TEST_SETUP.md` - This file

## Ready to Test!

Your load testing infrastructure is complete. Once your app is running, you can execute the load tests using the commands above.

For detailed information, see: `performance-tests/LOAD_TESTING_GUIDE.md`

