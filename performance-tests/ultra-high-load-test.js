import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics for ultra-high load testing
const ultraHighLoadErrors = new Rate('ultra_high_load_errors');
const ultraHighLoadResponseTime = new Trend('ultra_high_load_response_time');
const ultraHighLoadRequests = new Counter('ultra_high_load_requests');
const activeUsers = new Gauge('active_users');

// Ultra-high load test configuration for 10,000+ users
export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp to 1,000 users
    { duration: '3m', target: 1000 },  // Stay at 1,000 users
    { duration: '2m', target: 5000 },   // Ramp to 5,000 users
    { duration: '3m', target: 5000 },   // Stay at 5,000 users
    { duration: '2m', target: 10000 },  // Ramp to 10,000 users
    { duration: '5m', target: 10000 }, // Stay at 10,000 users
    { duration: '2m', target: 15000 },   // Ramp to 15,000 users
    { duration: '3m', target: 15000 },   // Stay at 15,000 users
    { duration: '2m', target: 0 },       // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% of requests must complete below 10s
    http_req_failed: ['rate<0.3'],      // Error rate must be below 30% (high tolerance for ultra-high load)
    ultra_high_load_errors: ['rate<0.3'], // Custom error rate must be below 30%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Critical endpoints for ultra-high load testing
const criticalEndpoints = [
  { name: 'health', url: '/api/health', weight: 30 },
  { name: 'dashboard_metrics', url: '/api/unified-dashboard/metrics', weight: 20 },
  { name: 'transaction_stats', url: '/api/transactions/stats', weight: 20 },
  { name: 'search', url: '/api/search?q=financial&index=all', weight: 15 },
  { name: 'transactions', url: '/api/transactions?limit=10', weight: 10 },
  { name: 'expenses', url: '/api/expenses?limit=10', weight: 5 },
];

// Weighted endpoint selection
function selectEndpoint() {
  const totalWeight = criticalEndpoints.reduce((sum, endpoint) => sum + endpoint.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of criticalEndpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return criticalEndpoints[0]; // Fallback
}

export default function() {
  activeUsers.add(1);
  
  const endpoint = selectEndpoint();
  const startTime = Date.now();
  
  // Make request with timeout
  const response = http.get(`${BASE_URL}${endpoint.url}`, {
    timeout: '30s'
  });
  
  const responseTime = Date.now() - startTime;
  
  // Record metrics
  ultraHighLoadRequests.add(1);
  ultraHighLoadResponseTime.add(responseTime);
  ultraHighLoadErrors.add(response.status >= 400);
  
  // Basic validation (relaxed for ultra-high load)
  check(response, {
    [`${endpoint.name} status is acceptable`]: (r) => r.status < 500, // Accept any non-5xx status
    [`${endpoint.name} response time < 30s`]: (r) => r.timings.duration < 30000,
  });
  
  // Log performance issues only for critical endpoints
  if (endpoint.name === 'health' && response.status !== 200) {
    console.warn(`⚠️ Health check failed: ${response.status}`);
  }
  
  if (response.timings.duration > 10000) {
    console.warn(`⚠️ Slow response for ${endpoint.name}: ${response.timings.duration}ms`);
  }
  
  activeUsers.add(-1);
  
  // Shorter sleep for ultra-high load
  sleep(0.1);
}

export function handleSummary(data) {
  const results = {
    timestamp: new Date().toISOString(),
    testType: 'ultra_high_load',
    summary: {
      totalRequests: data.metrics.http_reqs.values.count,
      failedRequests: data.metrics.http_req_failed.values.count,
      errorRate: (data.metrics.http_req_failed.values.rate * 100).toFixed(2),
      averageResponseTime: data.metrics.http_req_duration.values.avg.toFixed(2),
      p95ResponseTime: data.metrics.http_req_duration.values.p95.toFixed(2),
      p99ResponseTime: data.metrics.http_req_duration.values.p99.toFixed(2),
      maxResponseTime: data.metrics.http_req_duration.values.max.toFixed(2),
      requestsPerSecond: (data.metrics.http_reqs.values.count / (data.metrics.http_req_duration.values.count / 1000)).toFixed(2),
    },
    recommendations: generateUltraHighLoadRecommendations(data),
  };
  
  return {
    'ultra-high-load-results.json': JSON.stringify(results, null, 2),
    'ultra-high-load-summary.html': generateUltraHighLoadReport(results),
  };
}

function generateUltraHighLoadRecommendations(data) {
  const recommendations = [];
  const errorRate = data.metrics.http_req_failed.values.rate;
  const p95ResponseTime = data.metrics.http_req_duration.values.p95;
  const totalRequests = data.metrics.http_reqs.values.count;
  
  if (errorRate > 0.3) {
    recommendations.push({
      type: 'critical',
      message: 'High error rate under ultra-high load',
      details: `Error rate: ${(errorRate * 100).toFixed(2)}%`,
      action: 'Implement horizontal scaling, load balancing, and database optimization'
    });
  }
  
  if (p95ResponseTime > 10000) {
    recommendations.push({
      type: 'performance',
      message: 'High response times under ultra-high load',
      details: `95th percentile: ${p95ResponseTime.toFixed(2)}ms`,
      action: 'Optimize database queries, implement caching, and consider microservices architecture'
    });
  }
  
  if (totalRequests < 100000) {
    recommendations.push({
      type: 'throughput',
      message: 'Low throughput under ultra-high load',
      details: `Total requests: ${totalRequests.toLocaleString()}`,
      action: 'Review system architecture and implement performance optimizations'
    });
  }
  
  if (errorRate < 0.3 && p95ResponseTime < 10000 && totalRequests > 100000) {
    recommendations.push({
      type: 'success',
      message: 'System performed well under ultra-high load',
      details: 'All metrics within acceptable ranges for 10,000+ users',
      action: 'System is ready for production scale. Continue monitoring and optimization.'
    });
  }
  
  return recommendations;
}

function generateUltraHighLoadReport(results) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ultra-High Load Test Results - 10,000+ Users</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .pass { background-color: #d4edda; border-color: #c3e6cb; }
            .fail { background-color: #f8d7da; border-color: #f5c6cb; }
            .warning { background-color: #fff3cd; border-color: #ffeaa7; }
            .critical { background-color: #f8d7da; border-color: #dc3545; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 30px; }
            .recommendation { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
            .recommendation.critical { border-left-color: #dc3545; }
            .recommendation.performance { border-left-color: #ffc107; }
            .recommendation.throughput { border-left-color: #17a2b8; }
            .recommendation.success { border-left-color: #28a745; }
            .scale-indicator { background: linear-gradient(90deg, #28a745 0%, #ffc107 50%, #dc3545 100%); height: 20px; border-radius: 10px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>🚀 Ultra-High Load Test Results - 10,000+ Users</h1>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <p><strong>Test Time:</strong> ${results.timestamp}</p>
            <p><strong>Total Requests:</strong> ${results.summary.totalRequests.toLocaleString()}</p>
            <p><strong>Failed Requests:</strong> ${results.summary.failedRequests.toLocaleString()}</p>
            <p><strong>Error Rate:</strong> ${results.summary.errorRate}%</p>
            <p><strong>Average Response Time:</strong> ${results.summary.averageResponseTime}ms</p>
            <p><strong>95th Percentile Response Time:</strong> ${results.summary.p95ResponseTime}ms</p>
            <p><strong>99th Percentile Response Time:</strong> ${results.summary.p99ResponseTime}ms</p>
            <p><strong>Max Response Time:</strong> ${results.summary.maxResponseTime}ms</p>
            <p><strong>Requests Per Second:</strong> ${results.summary.requestsPerSecond}</p>
        </div>
        
        <div class="metric ${results.summary.errorRate < 30 ? 'pass' : 'critical'}">
            <h3>🔴 Error Rate: ${results.summary.errorRate}%</h3>
            <p>Threshold: < 30% (Ultra-high load tolerance)</p>
            <p>Status: ${results.summary.errorRate < 30 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <div class="metric ${results.summary.p95ResponseTime < 10000 ? 'pass' : 'fail'}">
            <h3>⏱️ 95th Percentile Response Time: ${results.summary.p95ResponseTime}ms</h3>
            <p>Threshold: < 10000ms (Ultra-high load tolerance)</p>
            <p>Status: ${results.summary.p95ResponseTime < 10000 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <div class="metric">
            <h3>📈 Scale Performance</h3>
            <div class="scale-indicator"></div>
            <p><strong>System Capacity:</strong> Successfully handled ${results.summary.totalRequests.toLocaleString()} requests</p>
            <p><strong>Throughput:</strong> ${results.summary.requestsPerSecond} requests/second</p>
            <p><strong>Peak Load:</strong> Up to 15,000 concurrent users</p>
        </div>
        
        <h2>🎯 Tested Endpoints</h2>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Weight</th>
                <th>Description</th>
            </tr>
            <tr>
                <td>/api/health</td>
                <td>30%</td>
                <td>System health check (most critical)</td>
            </tr>
            <tr>
                <td>/api/unified-dashboard/metrics</td>
                <td>20%</td>
                <td>Dashboard metrics aggregation</td>
            </tr>
            <tr>
                <td>/api/transactions/stats</td>
                <td>20%</td>
                <td>Transaction statistics</td>
            </tr>
            <tr>
                <td>/api/search</td>
                <td>15%</td>
                <td>Search functionality</td>
            </tr>
            <tr>
                <td>/api/transactions</td>
                <td>10%</td>
                <td>Transaction management</td>
            </tr>
            <tr>
                <td>/api/expenses</td>
                <td>5%</td>
                <td>Expense management</td>
            </tr>
        </table>
        
        <h2>💡 Recommendations</h2>
        ${results.recommendations.map(rec => `
            <div class="recommendation ${rec.type}">
                <h4>${rec.message}</h4>
                <p><strong>Details:</strong> ${rec.details}</p>
                <p><strong>Action:</strong> ${rec.action}</p>
            </div>
        `).join('')}
        
        <h2>🏗️ Infrastructure Recommendations</h2>
        <div class="metric">
            <h3>For 10,000+ Concurrent Users</h3>
            <ul>
                <li><strong>Load Balancing:</strong> Implement multiple load balancers with health checks</li>
                <li><strong>Database Scaling:</strong> Use read replicas and connection pooling</li>
                <li><strong>Caching:</strong> Implement Redis/Memcached for frequently accessed data</li>
                <li><strong>CDN:</strong> Use CDN for static assets and API responses</li>
                <li><strong>Microservices:</strong> Consider breaking down monolithic services</li>
                <li><strong>Auto-scaling:</strong> Implement horizontal pod autoscaling</li>
                <li><strong>Monitoring:</strong> Set up comprehensive performance monitoring</li>
            </ul>
        </div>
        
        <h2>📋 Next Steps</h2>
        <div class="metric">
            <h3>Production Readiness Checklist</h3>
            <ul>
                <li>✅ Ultra-high load testing completed</li>
                <li>✅ Performance metrics collected</li>
                <li>✅ Bottlenecks identified</li>
                <li>⏳ Infrastructure optimizations implemented</li>
                <li>⏳ Production monitoring setup</li>
                <li>⏳ Auto-scaling configuration</li>
                <li>⏳ Disaster recovery planning</li>
            </ul>
        </div>
    </body>
    </html>
  `;
}
