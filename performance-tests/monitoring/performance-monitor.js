import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics for performance monitoring
const endpointPerformance = new Trend('endpoint_performance');
const errorRate = new Rate('monitoring_errors');
const requestCount = new Counter('monitoring_requests');
const activeUsers = new Gauge('active_users');

// Monitoring configuration
export const options = {
  stages: [
    { duration: '30s', target: 1 },   // Single user monitoring
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3010';

// Critical endpoints to monitor
const criticalEndpoints = [
  { name: 'health', url: '/api/health', expectedStatus: 200, maxResponseTime: 500 },
  { name: 'dashboard_metrics', url: '/api/unified-dashboard/metrics', expectedStatus: [200, 401], maxResponseTime: 2000 },
  { name: 'transaction_stats', url: '/api/transactions/stats', expectedStatus: [200, 401], maxResponseTime: 1500 },
  { name: 'analytics_performance', url: '/api/analytics/performance', expectedStatus: [200, 401], maxResponseTime: 2000 },
  { name: 'search', url: '/api/search?q=test&index=all', expectedStatus: 200, maxResponseTime: 1500 },
];

export default function() {
  activeUsers.add(1);
  
  // Monitor each critical endpoint
  criticalEndpoints.forEach(endpoint => {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}${endpoint.url}`);
    const responseTime = Date.now() - startTime;
    
    // Record metrics
    requestCount.add(1);
    endpointPerformance.add(responseTime);
    errorRate.add(response.status >= 400);
    
    // Validate response
    const statusCheck = Array.isArray(endpoint.expectedStatus) 
      ? endpoint.expectedStatus.includes(response.status)
      : response.status === endpoint.expectedStatus;
    
    check(response, {
      [`${endpoint.name} status is correct`]: () => statusCheck,
      [`${endpoint.name} response time < ${endpoint.maxResponseTime}ms`]: () => responseTime < endpoint.maxResponseTime,
      [`${endpoint.name} has valid JSON`]: () => {
        try {
          JSON.parse(response.body);
          return true;
        } catch {
          return false;
        }
      },
    });
    
    // Log performance issues
    if (responseTime > endpoint.maxResponseTime) {
      console.warn(`⚠️ ${endpoint.name} response time exceeded threshold: ${responseTime}ms > ${endpoint.maxResponseTime}ms`);
    }
    
    if (response.status >= 400) {
      console.error(`❌ ${endpoint.name} returned error status: ${response.status}`);
    }
    
    sleep(1);
  });
  
  activeUsers.add(-1);
}

export function handleSummary(data) {
  const results = {
    timestamp: new Date().toISOString(),
    testType: 'performance_monitoring',
    summary: {
      totalRequests: data.metrics.http_reqs.values.count,
      failedRequests: data.metrics.http_req_failed.values.count,
      errorRate: (data.metrics.http_req_failed.values.rate * 100).toFixed(2),
      averageResponseTime: data.metrics.http_req_duration.values.avg.toFixed(2),
      p95ResponseTime: data.metrics.http_req_duration.values.p95.toFixed(2),
      p99ResponseTime: data.metrics.http_req_duration.values.p99.toFixed(2),
    },
    endpoints: criticalEndpoints.map(endpoint => ({
      name: endpoint.name,
      url: endpoint.url,
      expectedStatus: endpoint.expectedStatus,
      maxResponseTime: endpoint.maxResponseTime,
    })),
    recommendations: generateRecommendations(data),
  };
  
  return {
    'monitoring-results.json': JSON.stringify(results, null, 2),
    'monitoring-summary.html': generateMonitoringReport(results),
  };
}

function generateRecommendations(data) {
  const recommendations = [];
  const errorRate = data.metrics.http_req_failed.values.rate;
  const p95ResponseTime = data.metrics.http_req_duration.values.p95;
  
  if (errorRate > 0.01) {
    recommendations.push({
      type: 'error',
      message: 'High error rate detected',
      details: `Error rate: ${(errorRate * 100).toFixed(2)}%`,
      action: 'Review application logs and check system health'
    });
  }
  
  if (p95ResponseTime > 1000) {
    recommendations.push({
      type: 'performance',
      message: 'High response times detected',
      details: `95th percentile: ${p95ResponseTime.toFixed(2)}ms`,
      action: 'Optimize database queries and implement caching'
    });
  }
  
  if (errorRate < 0.01 && p95ResponseTime < 1000) {
    recommendations.push({
      type: 'success',
      message: 'System performing well',
      details: 'All metrics within acceptable ranges',
      action: 'Continue monitoring and maintain current performance levels'
    });
  }
  
  return recommendations;
}

function generateMonitoringReport(results) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Performance Monitoring Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .pass { background-color: #d4edda; border-color: #c3e6cb; }
            .fail { background-color: #f8d7da; border-color: #f5c6cb; }
            .warning { background-color: #fff3cd; border-color: #ffeaa7; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 30px; }
            .recommendation { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
            .recommendation.error { border-left-color: #dc3545; }
            .recommendation.performance { border-left-color: #ffc107; }
            .recommendation.success { border-left-color: #28a745; }
        </style>
    </head>
    <body>
        <h1>📊 Performance Monitoring Report</h1>
        
        <div class="summary">
            <h2>📈 System Status</h2>
            <p><strong>Test Time:</strong> ${results.timestamp}</p>
            <p><strong>Total Requests:</strong> ${results.summary.totalRequests}</p>
            <p><strong>Failed Requests:</strong> ${results.summary.failedRequests}</p>
            <p><strong>Error Rate:</strong> ${results.summary.errorRate}%</p>
            <p><strong>Average Response Time:</strong> ${results.summary.averageResponseTime}ms</p>
            <p><strong>95th Percentile Response Time:</strong> ${results.summary.p95ResponseTime}ms</p>
            <p><strong>99th Percentile Response Time:</strong> ${results.summary.p99ResponseTime}ms</p>
        </div>
        
        <div class="metric ${results.summary.errorRate < 1 ? 'pass' : 'fail'}">
            <h3>🔴 Error Rate: ${results.summary.errorRate}%</h3>
            <p>Threshold: < 1%</p>
            <p>Status: ${results.summary.errorRate < 1 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <div class="metric ${results.summary.p95ResponseTime < 1000 ? 'pass' : 'fail'}">
            <h3>⏱️ 95th Percentile Response Time: ${results.summary.p95ResponseTime}ms</h3>
            <p>Threshold: < 1000ms</p>
            <p>Status: ${results.summary.p95ResponseTime < 1000 ? '✅ PASS' : '❌ FAIL'}</p>
        </div>
        
        <h2>🎯 Monitored Endpoints</h2>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>URL</th>
                <th>Expected Status</th>
                <th>Max Response Time</th>
            </tr>
            ${results.endpoints.map(endpoint => `
                <tr>
                    <td>${endpoint.name}</td>
                    <td>${endpoint.url}</td>
                    <td>${Array.isArray(endpoint.expectedStatus) ? endpoint.expectedStatus.join(', ') : endpoint.expectedStatus}</td>
                    <td>${endpoint.maxResponseTime}ms</td>
                </tr>
            `).join('')}
        </table>
        
        <h2>💡 Recommendations</h2>
        ${results.recommendations.map(rec => `
            <div class="recommendation ${rec.type}">
                <h4>${rec.message}</h4>
                <p><strong>Details:</strong> ${rec.details}</p>
                <p><strong>Action:</strong> ${rec.action}</p>
            </div>
        `).join('')}
        
        <h2>📋 Next Steps</h2>
        <div class="metric">
            <h3>Continuous Monitoring</h3>
            <ul>
                <li>Set up automated performance monitoring</li>
                <li>Configure alerting for performance degradation</li>
                <li>Implement performance dashboards</li>
                <li>Regular performance testing schedule</li>
            </ul>
        </div>
    </body>
    </html>
  `;
}
