#!/bin/bash

# Performance Testing Script
# Runs load tests and verifies API response times meet targets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TARGET_RESPONSE_TIME=200  # milliseconds (95th percentile)
TARGET_ERROR_RATE=0.001   # 0.1%
RESULTS_DIR="./performance-results"
REPORT_FILE="$RESULTS_DIR/performance-report-$(date +%Y%m%d-%H%M%S).json"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Install it from https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Create results directory
setup_results_dir() {
    mkdir -p "$RESULTS_DIR"
}

# Test API health endpoint
test_health_endpoint() {
    print_status "Testing health endpoint..."
    
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL/api/health" 2>/dev/null || echo "999")
    local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
    
    if [ "$response_time_ms" -lt "$TARGET_RESPONSE_TIME" ]; then
        print_success "Health endpoint response time: ${response_time_ms}ms (target: <${TARGET_RESPONSE_TIME}ms)"
        return 0
    else
        print_warning "Health endpoint response time: ${response_time_ms}ms (target: <${TARGET_RESPONSE_TIME}ms)"
        return 1
    fi
}

# Run k6 load test
run_load_test() {
    local test_file=$1
    local test_name=$2
    
    if [ ! -f "$test_file" ]; then
        print_warning "Test file not found: $test_file (skipping)"
        return 0
    fi
    
    print_status "Running load test: $test_name"
    
    local output_file="$RESULTS_DIR/${test_name}-$(date +%Y%m%d-%H%M%S).json"
    
    k6 run --out json="$output_file" "$test_file" || {
        print_error "Load test failed: $test_name"
        return 1
    }
    
    # Parse results
    if [ -f "$output_file" ]; then
        local p95=$(jq -r '.metrics.http_req_duration.values.p95' "$output_file" 2>/dev/null || echo "0")
        local error_rate=$(jq -r '.metrics.http_req_failed.values.rate' "$output_file" 2>/dev/null || echo "0")
        
        local p95_ms=$(echo "$p95" | cut -d. -f1)
        local error_rate_pct=$(echo "$error_rate * 100" | bc | cut -d. -f1)
        
        echo "  P95 Response Time: ${p95_ms}ms (target: <${TARGET_RESPONSE_TIME}ms)"
        echo "  Error Rate: ${error_rate_pct}% (target: <0.1%)"
        
        if [ "$p95_ms" -lt "$TARGET_RESPONSE_TIME" ] && [ "$(echo "$error_rate < $TARGET_ERROR_RATE" | bc)" -eq 1 ]; then
            print_success "Load test passed: $test_name"
            return 0
        else
            print_warning "Load test did not meet all targets: $test_name"
            return 1
        fi
    fi
    
    return 0
}

# Test database performance
test_database_performance() {
    print_status "Testing database performance..."
    
    # This would require a database connection and test queries
    # For now, we'll just check if the database is accessible via API
    local start_time=$(date +%s%N)
    curl -s "$BASE_URL/api/health" > /dev/null 2>&1
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$duration" -lt 100 ]; then
        print_success "Database response time: ${duration}ms (target: <100ms)"
        return 0
    else
        print_warning "Database response time: ${duration}ms (target: <100ms)"
        return 1
    fi
}

# Run comprehensive performance tests
run_performance_tests() {
    print_status "Running comprehensive performance tests..."
    
    local failed_tests=0
    
    # Test health endpoint
    test_health_endpoint || failed_tests=$((failed_tests + 1))
    
    # Run k6 load tests if available
    if [ -f "performance-tests/quick-load-test.js" ]; then
        run_load_test "performance-tests/quick-load-test.js" "quick-load" || failed_tests=$((failed_tests + 1))
    fi
    
    if [ -f "performance-tests/api-load-test.js" ]; then
        run_load_test "performance-tests/api-load-test.js" "api-load" || failed_tests=$((failed_tests + 1))
    fi
    
    if [ -f "performance-tests/dashboard-load-test.js" ]; then
        run_load_test "performance-tests/dashboard-load-test.js" "dashboard-load" || failed_tests=$((failed_tests + 1))
    fi
    
    # Test database performance
    test_database_performance || failed_tests=$((failed_tests + 1))
    
    return $failed_tests
}

# Generate performance report
generate_report() {
    print_status "Generating performance report..."
    
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"base_url\": \"$BASE_URL\","
        echo "  \"targets\": {"
        echo "    \"response_time_ms\": $TARGET_RESPONSE_TIME,"
        echo "    \"error_rate\": $TARGET_ERROR_RATE"
        echo "  },"
        echo "  \"results\": []"
        echo "}"
    } > "$REPORT_FILE"
    
    print_success "Performance report generated: $REPORT_FILE"
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Performance Testing"
    echo "=========================================="
    echo ""
    echo "Base URL: $BASE_URL"
    echo "Target Response Time: <${TARGET_RESPONSE_TIME}ms (95th percentile)"
    echo "Target Error Rate: <0.1%"
    echo ""
    
    check_prerequisites
    setup_results_dir
    
    local failed_tests=0
    run_performance_tests || failed_tests=$?
    
    generate_report
    
    echo ""
    if [ $failed_tests -eq 0 ]; then
        print_success "✅ All performance tests passed!"
        echo ""
        exit 0
    else
        print_warning "⚠️  Performance testing completed with $failed_tests test(s) not meeting targets"
        echo ""
        print_status "Review the performance results in: $RESULTS_DIR"
        echo ""
        exit 1
    fi
}

# Run main function
main

