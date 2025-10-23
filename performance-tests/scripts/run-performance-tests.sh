#!/bin/bash

# Performance Testing Script for FinancBase Admin Dashboard
# This script runs comprehensive performance tests and generates reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3010"}
ENVIRONMENT=${ENVIRONMENT:-"local"}
OUTPUT_DIR="performance-results-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}🚀 Starting Performance Testing Suite${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Output Directory: ${OUTPUT_DIR}${NC}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to run test and capture results
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3
    
    echo -e "\n${YELLOW}📊 Running ${test_name}...${NC}"
    echo -e "${BLUE}Description: ${description}${NC}"
    
    # Run the test
    if BASE_URL="$BASE_URL" k6 run "$test_file" --out json="$OUTPUT_DIR/${test_name}-results.json" --summary-export="$OUTPUT_DIR/${test_name}-summary.json"; then
        echo -e "${GREEN}✅ ${test_name} completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ ${test_name} failed${NC}"
        return 1
    fi
}

# Function to check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}❌ k6 is not installed${NC}"
        echo -e "${YELLOW}Please install k6 first:${NC}"
        echo -e "${BLUE}  macOS: brew install k6${NC}"
        echo -e "${BLUE}  Linux: sudo apt-get install k6${NC}"
        echo -e "${BLUE}  Windows: choco install k6${NC}"
        echo -e "${BLUE}  Or visit: https://k6.io/docs/getting-started/installation/${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ k6 is installed${NC}"
}

# Function to check if application is running
check_application() {
    echo -e "${YELLOW}🔍 Checking application health...${NC}"
    
    if curl -s -f "$BASE_URL/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Application is running and healthy${NC}"
    else
        echo -e "${RED}❌ Application is not responding at $BASE_URL${NC}"
        echo -e "${YELLOW}Please ensure the application is running before running performance tests${NC}"
        exit 1
    fi
}

# Function to generate combined report
generate_combined_report() {
    echo -e "\n${YELLOW}📋 Generating combined report...${NC}"
    
    cat > "$OUTPUT_DIR/combined-report.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>FinancBase Performance Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .pass { background-color: #d4edda; border-color: #c3e6cb; }
        .fail { background-color: #f8d7da; border-color: #f5c6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .summary { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 FinancBase Performance Test Results</h1>
        <p><strong>Test Date:</strong> $(date)</p>
        <p><strong>Environment:</strong> ${ENVIRONMENT}</p>
        <p><strong>Base URL:</strong> ${BASE_URL}</p>
    </div>
    
    <div class="summary">
        <h2>📊 Test Summary</h2>
        <p>This report contains the results of comprehensive performance testing for the FinancBase Admin Dashboard.</p>
        <p>The tests include load testing, stress testing, and endpoint-specific testing to ensure optimal performance under various conditions.</p>
    </div>
    
    <div class="test-section">
        <h2>📈 Load Test Results</h2>
        <p>Normal expected load scenarios with up to 20 concurrent users.</p>
        <p><a href="performance-results.html">View Load Test Report</a></p>
    </div>
    
    <div class="test-section">
        <h2>🔥 Stress Test Results</h2>
        <p>High load testing with up to 200 concurrent users to identify breaking points.</p>
        <p><a href="stress-test-summary.html">View Stress Test Report</a></p>
    </div>
    
    <div class="test-section">
        <h2>🎯 Endpoint-Specific Test Results</h2>
        <p>Detailed testing of individual endpoints with realistic usage patterns.</p>
        <p><a href="endpoint-specific-summary.html">View Endpoint Test Report</a></p>
    </div>
    
    <div class="test-section">
        <h2>📊 Performance Monitoring</h2>
        <p>Continuous monitoring of critical endpoints for performance validation.</p>
        <p><a href="monitoring-summary.html">View Monitoring Report</a></p>
    </div>
    
    <div class="test-section">
        <h2>💡 Recommendations</h2>
        <h3>Based on Test Results</h3>
        <ul>
            <li>Review individual test reports for specific recommendations</li>
            <li>Implement performance monitoring in production</li>
            <li>Set up automated performance testing in CI/CD pipeline</li>
            <li>Consider performance optimization based on identified bottlenecks</li>
        </ul>
    </div>
    
    <div class="test-section">
        <h2>📋 Next Steps</h2>
        <ul>
            <li>Review all test reports and identify areas for improvement</li>
            <li>Implement recommended optimizations</li>
            <li>Set up continuous performance monitoring</li>
            <li>Schedule regular performance testing</li>
        </ul>
    </div>
</body>
</html>
EOF

    echo -e "${GREEN}✅ Combined report generated: $OUTPUT_DIR/combined-report.html${NC}"
}

# Function to cleanup old results
cleanup_old_results() {
    echo -e "${YELLOW}🧹 Cleaning up old test results...${NC}"
    find . -name "performance-results-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Pre-flight checks...${NC}"
    check_k6
    check_application
    cleanup_old_results
    
    echo -e "\n${BLUE}🧪 Starting Performance Tests...${NC}"
    
    # Track test results
    local passed_tests=0
    local total_tests=0
    
    # Run performance monitoring
    total_tests=$((total_tests + 1))
    if run_test "monitoring" "monitoring/performance-monitor.js" "Continuous monitoring of critical endpoints"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Run load test
    total_tests=$((total_tests + 1))
    if run_test "load" "k6-load-test.js" "Normal expected load scenarios"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Run stress test
    total_tests=$((total_tests + 1))
    if run_test "stress" "stress-test.js" "High load stress testing"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Run endpoint-specific test
    total_tests=$((total_tests + 1))
    if run_test "endpoints" "endpoint-specific-test.js" "Detailed endpoint testing"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Generate combined report
    generate_combined_report
    
    # Final summary
    echo -e "\n${BLUE}📊 Test Summary${NC}"
    echo -e "${GREEN}✅ Passed: ${passed_tests}/${total_tests} tests${NC}"
    
    if [ $passed_tests -eq $total_tests ]; then
        echo -e "${GREEN}🎉 All performance tests passed!${NC}"
        echo -e "${BLUE}📁 Results saved in: $OUTPUT_DIR${NC}"
        echo -e "${BLUE}📋 View combined report: $OUTPUT_DIR/combined-report.html${NC}"
    else
        echo -e "${RED}⚠️ Some tests failed. Please review the results.${NC}"
        echo -e "${BLUE}📁 Results saved in: $OUTPUT_DIR${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
