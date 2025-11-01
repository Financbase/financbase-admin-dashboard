# Load Testing Guide

## Quick Start

### Prerequisites

1. **Install k6** (if not already installed):
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo apt-get install k6
   
   # Windows
   choco install k6
   ```

2. **Start the application**:
   ```bash
   npm run dev
   # OR for production mode
   npm run build && npm start
   ```

### Running Load Tests

#### Quick Load Test (5-6 minutes)
Best for quick validation:
```bash
npm run test:performance:load:quick
```

#### Comprehensive Load Test (15+ minutes)
Full load test with detailed reporting:
```bash
npm run test:performance:comprehensive
```

#### Complete Test Suite
Runs all load test scenarios:
```bash
npm run test:performance:load:comprehensive
```

#### Individual Tests
```bash
# API endpoints only
npm run test:performance:api

# Dashboard only
npm run test:performance:dashboard

# Authentication endpoints
npm run test:performance:auth
```

### Custom Base URL

To test against a different environment:
```bash
BASE_URL=https://staging.example.com npm run test:performance:load:quick
BASE_URL=https://production.example.com npm run test:performance:comprehensive
```

## Test Scenarios

### Quick Load Test
- **Duration**: ~5-6 minutes
- **Users**: 20 → 50 → 100 (ramp up/down)
- **Endpoints**: All critical endpoints
- **Thresholds**:
  - 95th percentile < 2000ms
  - 99th percentile < 3000ms
  - Error rate < 1%

### Comprehensive Load Test
- **Duration**: ~15 minutes
- **Users**: 50 → 100 → 200 (ramp up/down)
- **Endpoints**: 12 critical endpoints with weighted distribution
- **Thresholds**:
  - 95th percentile < 2000ms
  - 99th percentile < 3000ms
  - Error rate < 1%
  - Throughput > 10 req/s

### Ultra-High Load Test (10,000+ users)
- **Duration**: ~22 minutes
- **Users**: 1,000 → 5,000 → 10,000 → 15,000
- **Purpose**: Stress testing to find breaking points
- **Thresholds**: Relaxed (error rate < 30%, response time < 10s)

## Tested Endpoints

### Critical Endpoints (Always Tested)

1. **`/api/health`** - Health check (20% weight)
   - Expected: 200 status
   - Max response time: 500ms
   - Critical for monitoring

2. **`/api/unified-dashboard/metrics`** - Dashboard metrics (15% weight)
   - Expected: 200 or 401
   - Max response time: 2000ms
   - Complex aggregation

3. **`/api/transactions/stats`** - Transaction stats (15% weight)
   - Expected: 200 or 401
   - Max response time: 1500ms
   - Database intensive

4. **`/api/analytics/performance`** - Analytics (10% weight)
   - Expected: 200 or 401
   - Max response time: 2000ms
   - Complex calculations

5. **`/api/search`** - Search (10% weight)
   - Expected: 200
   - Max response time: 1500ms
   - External service dependency

### Additional Endpoints

- `/api/transactions` - Transaction list (10% weight)
- `/api/expenses` - Expense list (8% weight)
- `/api/unified-dashboard/widgets` - Dashboard widgets (7% weight)
- `/api/expenses/analytics` - Expense analytics (5% weight)
- `/api/clients` - Client list (5% weight)
- `/api/notifications` - Notifications (3% weight)
- `/` - Homepage (2% weight)

## Understanding Results

### Key Metrics

1. **Response Time Percentiles**:
   - **p95**: 95% of requests completed in this time (target: < 2000ms)
   - **p99**: 99% of requests completed in this time (target: < 3000ms)
   - **Average**: Mean response time across all requests

2. **Error Rate**:
   - Percentage of failed requests (target: < 1%)
   - Includes HTTP 4xx and 5xx errors

3. **Throughput**:
   - Requests per second (target: > 10 req/s)
   - Indicates system capacity

4. **Virtual Users (VUs)**:
   - Number of concurrent simulated users
   - Peak VUs shows maximum load handled

### Reading Reports

#### JSON Reports
Located in `performance-tests/reports/`:
- Contains raw metrics data
- Useful for automated analysis
- Includes all k6 internal metrics

#### HTML Reports
Located in `performance-tests/reports/`:
- Visual summary with charts
- Threshold pass/fail status
- Recommendations for optimization

#### Console Output
Real-time metrics during test execution:
- Current VU count
- Request rate
- Response time percentiles
- Error rate

## Performance Thresholds

### Production-Ready Thresholds

| Metric | Target | Critical |
|--------|--------|----------|
| 95th percentile | < 2000ms | < 5000ms |
| 99th percentile | < 3000ms | < 10000ms |
| Error rate | < 1% | < 5% |
| Throughput | > 10 req/s | > 5 req/s |

### Load Test Results Interpretation

**✅ PASS**: All thresholds met
- System is performing well under load
- Ready for production deployment
- Continue monitoring in production

**⚠️ WARNING**: Some thresholds exceeded
- Review recommendations in test report
- Identify bottlenecks
- Optimize slow endpoints
- Re-run tests after optimizations

**❌ FAIL**: Critical thresholds exceeded
- System may not handle expected load
- Immediate optimization required
- Consider infrastructure scaling
- Review database queries and indexes

## Optimization Recommendations

Based on test results, you may see recommendations for:

### Database Optimization
- Add indexes for frequently queried fields
- Optimize complex aggregation queries
- Implement query result caching
- Use database read replicas

### API Optimization
- Add response caching for static data
- Implement pagination for large datasets
- Use async processing for heavy operations
- Optimize database connection pooling

### Infrastructure Scaling
- Implement horizontal scaling
- Add load balancing
- Use CDN for static assets
- Configure auto-scaling policies

### Monitoring and Alerting
- Set up performance monitoring
- Implement alerting for performance degradation
- Create dashboards for key metrics
- Track error rates and response times

## Troubleshooting

### Common Issues

1. **"Application is not responding"**
   - Ensure the app is running: `npm run dev`
   - Check the port (default: 3010 or 3000)
   - Verify with: `curl http://localhost:3010/api/health`

2. **"k6 is not installed"**
   - Install k6 using platform-specific instructions above
   - Verify: `k6 version`

3. **High Error Rates**
   - Check application logs for errors
   - Verify database connectivity
   - Review external service dependencies
   - Check system resources (CPU, memory)

4. **Slow Response Times**
   - Review database query performance
   - Check for N+1 query problems
   - Verify indexes are in place
   - Monitor external API response times

### Debug Mode

Run tests with verbose output:
```bash
BASE_URL=http://localhost:3010 k6 run --verbose performance-tests/quick-load-test.js
```

Save detailed logs:
```bash
BASE_URL=http://localhost:3010 k6 run --log-output=file=debug.log performance-tests/quick-load-test.js
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Start application
        run: |
          npm install
          npm run build
          npm start &
          sleep 30
      
      - name: Run load tests
        run: |
          npm run test:performance:load:quick
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: performance-tests/reports/
```

## Best Practices

1. **Run tests regularly**: Include in CI/CD pipeline
2. **Test in production-like environment**: Use staging environment
3. **Monitor during tests**: Watch system resources
4. **Compare results**: Track performance trends over time
5. **Document findings**: Record test results and optimizations
6. **Test incrementally**: Start with quick tests, then comprehensive
7. **Review recommendations**: Act on optimization suggestions

## Support

For issues or questions:
1. Check application logs for errors
2. Review test output logs in `performance-tests/reports/`
3. Verify system resources during testing
4. Check k6 documentation: https://k6.io/docs/

