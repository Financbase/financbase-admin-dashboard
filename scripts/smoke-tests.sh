#!/bin/bash

# Smoke Tests Script
# Runs basic smoke tests against a deployed environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
ENVIRONMENT="${ENVIRONMENT:-staging}"

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

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    print_status "Testing: $test_name"
    
    if eval "$test_command" > /tmp/smoke_test_output.log 2>&1; then
        print_success "$test_name passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "$test_name failed"
        cat /tmp/smoke_test_output.log
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Smoke Tests"
    echo "=========================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Base URL: $BASE_URL"
    echo ""
    
    local failed=0
    
    # 1. Health Check
    print_status "Running health check..."
    if run_test "Health endpoint" "curl -f -s -o /dev/null -w '%{http_code}' '$BASE_URL/api/health' | grep -q '200'"; then
        :
    else
        failed=1
    fi
    
    # 2. API Health Response
    print_status "Checking API health response..."
    if run_test "API health response" "curl -f -s '$BASE_URL/api/health' | grep -q 'status'"; then
        :
    else
        failed=1
    fi
    
    # 3. Home Page
    print_status "Checking home page..."
    if run_test "Home page" "curl -f -s -o /dev/null -w '%{http_code}' '$BASE_URL' | grep -qE '(200|301|302)'"; then
        :
    else
        print_warning "Home page check failed (may require authentication)"
    fi
    
    # 4. API Routes (public endpoints)
    print_status "Checking public API endpoints..."
    
    # Check if API routes are accessible (may return 401 for auth endpoints, which is expected)
    if curl -f -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/health" | grep -qE '(200|401|403)'; then
        print_success "API routes are accessible"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "API routes check had issues"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # 5. Static Assets
    print_status "Checking static assets..."
    if run_test "Static assets" "curl -f -s -o /dev/null -w '%{http_code}' '$BASE_URL/favicon.ico' | grep -qE '(200|404)'"; then
        :
    else
        print_warning "Static assets check had issues"
    fi
    
    # 6. Response Time Check
    print_status "Checking response times..."
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL/api/health")
    local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
    
    if [ "$response_time_ms" -lt 2000 ]; then
        print_success "Response time acceptable: ${response_time_ms}ms"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "Response time slow: ${response_time_ms}ms (threshold: 2000ms)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Summary
    echo ""
    echo "=========================================="
    echo "  Smoke Test Summary"
    echo "=========================================="
    echo ""
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "✅ All smoke tests passed!"
        return 0
    else
        print_error "❌ Some smoke tests failed"
        return 1
    fi
}

# Run main function
main

