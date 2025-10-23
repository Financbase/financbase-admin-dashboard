# Performance Testing Guide

## Overview

This guide provides comprehensive instructions for running performance tests on the FinancBase Admin Dashboard. The testing suite includes load testing, stress testing, and endpoint-specific testing to ensure optimal performance under various conditions.

## Quick Start

### 1. Install Dependencies

```bash
# Install k6 (if not already installed)
npm run perf:install

# Or install manually
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

### 2. Start the Application

```bash
# Start the development server
npm run dev

# Or start production build
npm run build && npm run start
```

### 3. Run Performance Tests

```bash
# Run all performance tests
npm run perf:run-all

# Or run individual tests
npm run perf:load      # Load testing
npm run perf:stress    # Stress testing
npm run perf:endpoints # Endpoint-specific testing
npm run perf:monitor   # Performance monitoring
```

## Test Types

### 1. Load Testing (`perf:load`)

**Purpose**: Test normal expected load scenarios

**Configuration**:

- Users: 10-20 concurrent users
- Duration: 16 minutes total
- Thresholds: 95th percentile < 2000ms, Error rate < 10%

**What it tests**:

- Health check endpoint
- Dashboard metrics aggregation
- Transaction statistics
- Analytics performance
- Search functionality
- Transaction and expense listing
- AI financial analysis

### 2. Stress Testing (`perf:stress`)

**Purpose**: Identify system breaking points under high load

**Configuration**:

- Users: 50-200 concurrent users
- Duration: 12 minutes total
- Thresholds: 95th percentile < 5000ms, Error rate < 20%

**What it tests**:

- System behavior under extreme load
- Error handling under stress
- Resource bottlenecks
- Performance degradation patterns

### 3. Endpoint-Specific Testing (`perf:endpoints`)

**Purpose**: Detailed testing of individual endpoints with realistic usage patterns

**Configuration**:

- Users: 5-10 concurrent users
- Duration: 8 minutes total
- Thresholds: 95th percentile < 3000ms, Error rate < 5%

**What it tests**:

- Transaction CRUD operations
- Expense management
- Analytics calculations
- Search performance
- AI processing
- Dashboard aggregation

### 4. Performance Monitoring (`perf:monitor`)

**Purpose**: Continuous monitoring of critical endpoints

**Configuration**:

- Users: 1 user
- Duration: 30 seconds
- Thresholds: 95th percentile < 1000ms, Error rate < 1%

**What it monitors**:

- Health check
- Dashboard metrics
- Transaction stats
- Analytics performance
- Search functionality

## Critical Endpoints

### High Priority (Always Tested)

1. **`/api/health`** - System health check
   - Expected: 200 status, < 500ms response time
   - Critical for monitoring and load balancers

2. **`/api/unified-dashboard/metrics`** - Dashboard metrics
   - Expected: 200/401 status, < 2000ms response time
   - Complex aggregation of financial data

3. **`/api/transactions/stats`** - Transaction statistics
   - Expected: 200/401 status, < 1500ms response time
   - Database-intensive calculations

4. **`/api/analytics/performance`** - Performance analytics
   - Expected: 200/401 status, < 2000ms response time
   - Complex analytics calculations

5. **`/api/search`** - Search functionality
   - Expected: 200 status, < 1500ms response time
   - External service dependency (Algolia)

### Medium Priority (Load Testing)

1. **`/api/transactions`** - Transaction management
   - Pagination and filtering
   - Database queries with various filters

2. **`/api/expenses`** - Expense management
   - CRUD operations
   - Analytics and reporting

3. **`/api/ai/financial-analysis`** - AI analysis
   - External AI service calls
   - Complex data processing

4. **`/api/unified-dashboard/widgets`** - Dashboard widgets
   - Widget data aggregation
   - Real-time updates

### Low Priority (Endpoint-Specific Testing)

1. **`/api/expenses/analytics`** - Expense analytics
2. **`/api/analytics/revenue`** - Revenue analytics
3. **`/api/analytics/expenses`** - Expense analytics
4. **`/api/analytics/clients`** - Client analytics

## Performance Thresholds

### Load Test Thresholds

- **Response Time**: 95th percentile < 2000ms
- **Error Rate**: < 10%
- **Concurrent Users**: Up to 20 users

### Stress Test Thresholds

- **Response Time**: 95th percentile < 5000ms
- **Error Rate**: < 20% (higher tolerance for stress testing)
- **Concurrent Users**: Up to 200 users

### Endpoint-Specific Thresholds

- **Response Time**: 95th percentile < 3000ms
- **Error Rate**: < 5% (high reliability requirement)
- **Concurrent Users**: Up to 10 users

### Monitoring Thresholds

- **Response Time**: 95th percentile < 1000ms
- **Error Rate**: < 1%
- **Concurrent Users**: 1 user

## Test Results

### Generated Files

After running tests, the following files are generated:

```
performance-results-YYYYMMDD-HHMMSS/
├── combined-report.html          # Combined test results
├── load-results.json             # Load test raw data
├── load-summary.html             # Load test report
├── stress-results.json           # Stress test raw data
├── stress-summary.html           # Stress test report
├── endpoints-results.json        # Endpoint test raw data
├── endpoints-summary.html        # Endpoint test report
├── monitoring-results.json       # Monitoring raw data
└── monitoring-summary.html       # Monitoring report
```

### Viewing Results

```bash
# Open the combined report
open performance-results-*/combined-report.html

# Or open individual reports
open performance-results-*/load-summary.html
open performance-results-*/stress-summary.html
open performance-results-*/endpoints-summary.html
open performance-results-*/monitoring-summary.html
```

## Environment-Specific Testing

### Local Development

```bash
# Test against local development server
npm run perf:load
npm run perf:stress
npm run perf:endpoints
npm run perf:monitor
```

### Staging Environment

```bash
# Test against staging environment
cd performance-tests
BASE_URL=https://staging.financbase.com npm run test:load
BASE_URL=https://staging.financbase.com npm run test:stress
BASE_URL=https://staging.financbase.com npm run test:endpoints
```

### Production Environment

```bash
# Test against production (use with caution)
cd performance-tests
BASE_URL=https://app.financbase.com npm run test:load
BASE_URL=https://app.financbase.com npm run test:stress
BASE_URL=https://app.financbase.com npm run test:endpoints
```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   ```
   Error: dial tcp [::1]:3010: connect: connection refused
   ```

   **Solution**: Ensure the application is running on the correct port

2. **High Error Rates**

   ```
   Error rate: 15% (threshold: < 10%)
   ```

   **Solution**: Check application logs, verify database connectivity

3. **Slow Response Times**

   ```
   95th percentile: 5000ms (threshold: < 2000ms)
   ```

   **Solution**: Optimize database queries, implement caching

4. **Memory Issues**

   ```
   Error: out of memory
   ```

   **Solution**: Check system resources, reduce concurrent users

### Debug Mode

```bash
# Run with verbose output
k6 run --verbose k6-load-test.js

# Run with debug logging
k6 run --log-output=file=debug.log k6-load-test.js

# Run with custom thresholds
k6 run --threshold http_req_duration=p(95)<1000 k6-load-test.js
```

## Performance Optimization

### Based on Test Results

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Optimize complex queries
   - Implement query result caching
   - Use database connection pooling

2. **API Optimization**
   - Add response caching for static data
   - Implement pagination for large datasets
   - Use async processing for heavy operations
   - Add request rate limiting

3. **Infrastructure Scaling**
   - Implement horizontal scaling
   - Add load balancing
   - Use CDN for static assets
   - Implement auto-scaling

4. **Monitoring and Alerting**
   - Set up performance monitoring
   - Implement alerting for performance degradation
   - Create dashboards for key metrics
   - Set up automated performance testing

## Continuous Integration

### GitHub Actions

```yaml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Start Application
        run: |
          npm install
          npm run build
          npm run start &
          sleep 30
      - name: Run Performance Tests
        run: |
          cd performance-tests
          npm run test:load
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: performance-tests/performance-results-*/
```

## Best Practices

### Before Running Tests

1. **Ensure Application is Running**: Start the FinancBase application
2. **Check Database Connectivity**: Verify database is accessible
3. **Review Environment Variables**: Ensure proper configuration
4. **Monitor System Resources**: Check available CPU and memory

### During Testing

1. **Monitor System Resources**: Watch CPU, memory, and disk usage
2. **Check Application Logs**: Monitor for errors and warnings
3. **Database Monitoring**: Watch database performance metrics
4. **Network Monitoring**: Check for network bottlenecks

### After Testing

1. **Review Results**: Analyze performance metrics
2. **Identify Bottlenecks**: Look for slow endpoints or high error rates
3. **Generate Recommendations**: Create action items for optimization
4. **Document Findings**: Record test results and insights

## Support

For questions or issues with performance testing:

1. Check the k6 documentation: <https://k6.io/docs/>
2. Review application logs for errors
3. Monitor system resources during testing
4. Contact the development team for assistance

## Performance Testing Checklist

- [ ] Install k6 and dependencies
- [ ] Start the application
- [ ] Run load tests
- [ ] Run stress tests
- [ ] Run endpoint-specific tests
- [ ] Run performance monitoring
- [ ] Review test results
- [ ] Identify performance bottlenecks
- [ ] Implement optimizations
- [ ] Set up continuous monitoring
- [ ] Document findings and recommendations
