# Performance Testing Suite

This directory contains comprehensive performance testing scripts for the FinancBase Admin Dashboard using k6.

## Overview

The performance testing suite includes three main test types:

1. **Load Testing** (`k6-load-test.js`) - Normal expected load scenarios
2. **Stress Testing** (`stress-test.js`) - High load to find breaking points  
3. **Endpoint-Specific Testing** (`endpoint-specific-test.js`) - Detailed testing of individual endpoints

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

### Install Dependencies

```bash
npm run setup
```

## Running Tests

### Local Development

```bash
# Run all tests against local development server
npm run test:all

# Run specific test types
npm run test:load:local
npm run test:stress:local  
npm run test:endpoints:local
```

### Staging Environment

```bash
# Run all tests against staging
npm run test:all:staging

# Run specific test types
npm run test:load:staging
npm run test:stress:staging
npm run test:endpoints:staging
```

### Production Environment

```bash
# Run all tests against production (use with caution)
npm run test:all:production

# Run specific test types
npm run test:load:production
npm run test:stress:production
npm run test:endpoints:production
```

## Test Scenarios

### Load Test Scenarios

- **Health Check**: Basic system health verification
- **Dashboard Metrics**: Unified dashboard data aggregation
- **Transaction Stats**: Financial transaction statistics
- **Analytics Performance**: Complex analytics calculations
- **Search API**: Search functionality with external dependencies
- **Transaction List**: Pagination and filtering
- **Expenses List**: Expense management with filters
- **AI Financial Analysis**: AI-powered financial insights

### Stress Test Scenarios

- **High Concurrent Users**: Up to 200 concurrent users
- **System Breaking Points**: Identify performance limits
- **Error Handling**: Test system behavior under extreme load
- **Resource Bottlenecks**: Identify system constraints

### Endpoint-Specific Scenarios

- **Transactions CRUD**: Create, read, update, delete operations
- **Expenses CRUD**: Expense management operations
- **Analytics Heavy**: Complex analytics and reporting
- **Search Performance**: Search functionality optimization
- **AI Processing**: AI analysis with various data sizes
- **Dashboard Aggregation**: Dashboard data compilation

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

## Critical Endpoints Tested

### High Priority (Always Tested)

1. `/api/health` - System health check
2. `/api/unified-dashboard/metrics` - Dashboard metrics
3. `/api/transactions/stats` - Transaction statistics
4. `/api/analytics/performance` - Performance analytics
5. `/api/search` - Search functionality

### Medium Priority (Load Testing)

1. `/api/transactions` - Transaction management
2. `/api/expenses` - Expense management
3. `/api/ai/financial-analysis` - AI analysis
4. `/api/unified-dashboard/widgets` - Dashboard widgets

### Low Priority (Endpoint-Specific Testing)

1. `/api/expenses/analytics` - Expense analytics
2. `/api/analytics/revenue` - Revenue analytics
3. `/api/analytics/expenses` - Expense analytics
4. `/api/analytics/clients` - Client analytics

## Test Results

### Generated Reports

After running tests, the following files are generated:

- `performance-results.json` - Raw test data
- `performance-summary.html` - HTML report with visualizations
- `stress-test-results.json` - Stress test raw data
- `stress-test-summary.html` - Stress test HTML report
- `endpoint-specific-results.json` - Endpoint test raw data
- `endpoint-specific-summary.html` - Endpoint test HTML report

### Viewing Results

```bash
# Open HTML reports
npm run report

# Or manually open the HTML files
open performance-summary.html
open stress-test-summary.html
open endpoint-specific-summary.html
```

## Monitoring and Metrics

### Custom Metrics Tracked

- **Response Time**: Request duration
- **Error Rate**: Failed request percentage
- **Request Count**: Total requests made
- **Throughput**: Requests per second

### System Metrics Monitored

- **Database Performance**: Query execution times
- **External Service Dependencies**: API response times
- **Memory Usage**: System resource utilization
- **CPU Usage**: Processing capacity

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

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure application is running on correct port
2. **High Error Rates**: Check application logs for errors
3. **Slow Response Times**: Monitor database and external service performance
4. **Memory Issues**: Check system resources and application memory usage

### Debug Mode

```bash
# Run with verbose output
k6 run --verbose k6-load-test.js

# Run with debug logging
k6 run --log-output=file=debug.log k6-load-test.js
```

## Continuous Integration

### GitHub Actions Integration

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
      - name: Run Performance Tests
        run: |
          cd performance-tests
          npm run test:load:staging
```

## Performance Optimization Recommendations

### Based on Test Results

1. **Database Optimization**:
   - Add database indexes for frequently queried fields
   - Optimize complex queries
   - Implement query result caching

2. **API Optimization**:
   - Add response caching for static data
   - Implement pagination for large datasets
   - Use async processing for heavy operations

3. **Infrastructure Scaling**:
   - Implement horizontal scaling
   - Add load balancing
   - Use CDN for static assets

4. **Monitoring and Alerting**:
   - Set up performance monitoring
   - Implement alerting for performance degradation
   - Create dashboards for key metrics

## Support

For questions or issues with performance testing:

1. Check the k6 documentation: <https://k6.io/docs/>
2. Review application logs for errors
3. Monitor system resources during testing
4. Contact the development team for assistance
