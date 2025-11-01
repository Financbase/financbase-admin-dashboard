#!/bin/bash

# Comprehensive Load Testing Script
# Runs comprehensive load tests with health checks and detailed reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3010"}
REPORT_DIR="performance-tests/reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TEST_DIR="${REPORT_DIR}/load-test-${TIMESTAMP}"

# Create report directory
mkdir -p "${TEST_DIR}"

echo -e "${BLUE}🚀 Comprehensive Load Testing Suite${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "Base URL: ${BASE_URL}"
echo -e "Report Directory: ${TEST_DIR}"
echo ""

# Health check function
check_health() {
  echo -e "${YELLOW}🔍 Checking application health...${NC}"
  
  local max_attempts=5
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -f "${BASE_URL}/api/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Application is healthy and responding${NC}"
      return 0
    fi
    
    if [ $attempt -lt $max_attempts ]; then
      echo -e "${YELLOW}⏳ Attempt ${attempt}/${max_attempts} - Waiting for application...${NC}"
      sleep 2
    fi
    
    attempt=$((attempt + 1))
  done
  
  echo -e "${RED}❌ Application is not responding at ${BASE_URL}${NC}"
  echo -e "${YELLOW}💡 Please start the application first:${NC}"
  echo -e "   npm run dev"
  echo ""
  return 1
}

# Check if k6 is installed
check_k6() {
  if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed${NC}"
    echo -e "${YELLOW}💡 Install k6:${NC}"
    echo -e "   macOS: brew install k6"
    echo -e "   Linux: sudo apt-get install k6"
    echo -e "   Windows: choco install k6"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✅ k6 is installed (version: $(k6 version | grep -oP 'k6 v\K[^\s]+'))${NC}"
  echo ""
}

# Run test function
run_test() {
  local test_name=$1
  local test_file=$2
  local test_duration=${3:-"default"}
  
  echo -e "${BLUE}📊 Running ${test_name}...${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  local output_file="${TEST_DIR}/${test_name}-results.json"
  local summary_file="${TEST_DIR}/${test_name}-summary.html"
  
  if BASE_URL="$BASE_URL" k6 run \
    --out json="${output_file}" \
    --summary-export="${TEST_DIR}/${test_name}-summary.json" \
    "$test_file" > "${TEST_DIR}/${test_name}-output.log" 2>&1; then
    
    echo -e "${GREEN}✅ ${test_name} completed successfully${NC}"
    echo ""
    return 0
  else
    echo -e "${RED}❌ ${test_name} failed${NC}"
    echo -e "${YELLOW}Check ${TEST_DIR}/${test_name}-output.log for details${NC}"
    echo ""
    return 1
  fi
}

# Generate combined report
generate_combined_report() {
  echo -e "${BLUE}📄 Generating combined report...${NC}"
  
  cat > "${TEST_DIR}/README.md" << EOF
# Load Test Results - ${TIMESTAMP}

## Test Configuration
- **Base URL**: ${BASE_URL}
- **Test Duration**: $(date -u -d @$(($(date +%s) - $(date -d "${TIMESTAMP}" +%s))) +%H:%M:%S)
- **Test Timestamp**: ${TIMESTAMP}

## Test Suite

### 1. Comprehensive Load Test
- **File**: comprehensive-load-test.js
- **Description**: Tests all critical endpoints under realistic load scenarios
- **Users**: 50 → 100 → 200 (ramp up/down)
- **Duration**: ~15 minutes
- **Thresholds**:
  - 95th percentile response time < 2000ms
  - 99th percentile response time < 3000ms
  - Error rate < 1%

### 2. API Load Test
- **File**: api-load-test.js
- **Description**: Focused API endpoint testing
- **Users**: 10 → 20 (ramp up/down)
- **Duration**: ~16 minutes

### 3. Dashboard Load Test
- **File**: dashboard-load-test.js
- **Description**: Dashboard-specific performance testing
- **Users**: Variable
- **Duration**: Variable

### 4. Auth Load Test
- **File**: auth-load-test.js
- **Description**: Authentication endpoints under load
- **Users**: Variable
- **Duration**: Variable

## Results

See individual test result files:
- \`comprehensive-load-results.json\` - Comprehensive test metrics
- \`comprehensive-load-summary.html\` - HTML report
- Individual test outputs in log files

## Recommendations

Review the recommendations in each test's summary for performance optimization suggestions.

## Next Steps

1. Review test results and identify bottlenecks
2. Implement recommended optimizations
3. Re-run tests to validate improvements
4. Monitor production metrics
EOF

  echo -e "${GREEN}✅ Combined report generated${NC}"
  echo ""
}

# Main execution
main() {
  # Check prerequisites
  check_k6
  check_health || exit 1
  
  echo -e "${GREEN}✅ All prerequisites met${NC}"
  echo ""
  echo -e "${BLUE}Starting load test suite...${NC}"
  echo ""
  
  # Track test results
  local passed=0
  local failed=0
  
  # Run comprehensive load test (main test)
  if run_test "comprehensive-load" "performance-tests/comprehensive-load-test.js"; then
    passed=$((passed + 1))
  else
    failed=$((failed + 1))
  fi
  
  # Run additional tests if comprehensive test passes
  if [ $failed -eq 0 ]; then
    echo -e "${YELLOW}📋 Running additional test scenarios...${NC}"
    echo ""
    
    if run_test "api-load" "performance-tests/api-load-test.js"; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
    fi
    
    if run_test "dashboard-load" "performance-tests/dashboard-load-test.js"; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
    fi
  fi
  
  # Generate combined report
  generate_combined_report
  
  # Summary
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📊 Test Suite Summary${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ Passed: ${passed}${NC}"
  echo -e "${RED}❌ Failed: ${failed}${NC}"
  echo ""
  echo -e "${BLUE}📁 Results directory: ${TEST_DIR}${NC}"
  echo ""
  echo -e "${YELLOW}💡 View results:${NC}"
  echo -e "   - HTML Report: ${TEST_DIR}/comprehensive-load-summary.html"
  echo -e "   - JSON Results: ${TEST_DIR}/comprehensive-load-results.json"
  echo -e "   - Test Logs: ${TEST_DIR}/*.log"
  echo ""
  
  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    exit 0
  else
    echo -e "${RED}⚠️  Some tests failed. Please review the logs.${NC}"
    exit 1
  fi
}

# Run main function
main

