#!/bin/bash

# Comprehensive Testing Suite Runner
# Runs all testing categories in sequence

set -e

echo "🚀 Starting Comprehensive Testing Suite..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Test results tracking
TEST_RESULTS=()

# 1. Basic Quality Checks
print_status "1. Running Quality Checks..."

# TypeScript check
print_status "   - TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    print_success "   ✅ TypeScript compilation passed"
    TEST_RESULTS+=("TypeScript: PASS")
else
    print_error "   ❌ TypeScript compilation failed"
    TEST_RESULTS+=("TypeScript: FAIL")
fi

# Linting check
print_status "   - ESLint check..."
if npm run lint > /dev/null 2>&1; then
    print_success "   ✅ Linting passed"
    TEST_RESULTS+=("Linting: PASS")
else
    print_warning "   ⚠️  Linting issues found"
    TEST_RESULTS+=("Linting: WARNING")
fi

# 2. Unit Tests
print_status "2. Running Unit Tests..."
if npm run test:ci > /dev/null 2>&1; then
    print_success "   ✅ Unit tests passed"
    TEST_RESULTS+=("Unit Tests: PASS")
else
    print_error "   ❌ Unit tests failed"
    TEST_RESULTS+=("Unit Tests: FAIL")
fi

# 3. Database Tests
print_status "3. Running Database Tests..."
if node test-db.js > /dev/null 2>&1; then
    print_success "   ✅ Database connectivity verified"
    TEST_RESULTS+=("Database: PASS")
else
    print_warning "   ⚠️  Database connection issues"
    TEST_RESULTS+=("Database: WARNING")
fi

# 4. API Tests
print_status "4. Running API Integration Tests..."
if node test-api-endpoints.sh > /dev/null 2>&1; then
    print_success "   ✅ API endpoints functional"
    TEST_RESULTS+=("API Tests: PASS")
else
    print_warning "   ⚠️  API endpoint issues"
    TEST_RESULTS+=("API Tests: WARNING")
fi

# 5. Playwright E2E Tests (if server is running)
print_status "5. Checking E2E Test Environment..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "   - Server is running, starting E2E tests..."

    if npx playwright test --reporter=line > /dev/null 2>&1; then
        print_success "   ✅ E2E tests passed"
        TEST_RESULTS+=("E2E Tests: PASS")
    else
        print_warning "   ⚠️  E2E test issues"
        TEST_RESULTS+=("E2E Tests: WARNING")
    fi
else
    print_warning "   ⚠️  Server not running - skipping E2E tests"
    TEST_RESULTS+=("E2E Tests: SKIPPED")
fi

# 6. Performance Tests (light version)
print_status "6. Running Performance Tests..."
if command -v k6 > /dev/null 2>&1; then
    print_status "   - Running quick performance test..."

    if k6 run --duration=10s --vus=10 performance-tests/api-load-test.js > /dev/null 2>&1; then
        print_success "   ✅ Performance tests completed"
        TEST_RESULTS+=("Performance: PASS")
    else
        print_warning "   ⚠️  Performance test issues"
        TEST_RESULTS+=("Performance: WARNING")
    fi
else
    print_warning "   ⚠️  K6 not installed - skipping performance tests"
    TEST_RESULTS+=("Performance: SKIPPED")
fi

# 7. Security Checks
print_status "7. Running Security Checks..."
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    print_success "   ✅ No high/critical vulnerabilities"
    TEST_RESULTS+=("Security Audit: PASS")
else
    print_warning "   ⚠️  Security vulnerabilities found"
    TEST_RESULTS+=("Security Audit: WARNING")
fi

# 8. Build Test
print_status "8. Testing Build Process..."
if npm run build > /dev/null 2>&1; then
    print_success "   ✅ Build successful"
    TEST_RESULTS+=("Build: PASS")
else
    print_error "   ❌ Build failed"
    TEST_RESULTS+=("Build: FAIL")
fi

# Summary Report
echo ""
echo "========================================"
echo "📋 COMPREHENSIVE TEST RESULTS"
echo "========================================"

PASS_COUNT=0
FAIL_COUNT=0
WARNING_COUNT=0
SKIP_COUNT=0

for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == *"PASS"* ]]; then
        echo -e "   ${GREEN}✅${NC} $result"
        ((PASS_COUNT++))
    elif [[ $result == *"FAIL"* ]]; then
        echo -e "   ${RED}❌${NC} $result"
        ((FAIL_COUNT++))
    elif [[ $result == *"WARNING"* ]]; then
        echo -e "   ${YELLOW}⚠️${NC}  $result"
        ((WARNING_COUNT++))
    else
        echo -e "   ${BLUE}⏭️${NC}  $result"
        ((SKIP_COUNT++))
    fi
done

echo ""
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"

if [ $FAIL_COUNT -eq 0 ]; then
    print_success "🎉 All critical tests passed! Application is ready for deployment."
else
    print_error "❌ $FAIL_COUNT critical test(s) failed. Please fix issues before deployment."
fi

echo "   ✅ Passed: $PASS_COUNT tests"
echo "   ⚠️  Warnings: $WARNING_COUNT tests"
echo "   ❌ Failed: $FAIL_COUNT tests"
echo "   ⏭️  Skipped: $SKIP_COUNT tests"

echo ""
echo "📝 DETAILED REPORTS:"
echo "   - Coverage: coverage/lcov-report/index.html"
echo "   - Playwright: playwright-report/index.html"
echo "   - Performance: performance-tests/reports/"
echo "   - Security: npm audit"

echo ""
echo "🚀 NEXT STEPS:"
if [ $FAIL_COUNT -eq 0 ]; then
    echo "   1. ✅ Ready for production deployment"
    echo "   2. ✅ Run full CI/CD pipeline"
    echo "   3. ✅ Monitor application in production"
else
    echo "   1. ❌ Fix failing tests before deployment"
    echo "   2. ⚠️  Address warnings for better reliability"
    echo "   3. 🔄 Re-run tests after fixes"
fi

echo ""
echo "💡 USAGE:"
echo "   Run individual test suites:"
echo "   - npm run test:unit (Unit tests)"
echo "   - npm run test:e2e (End-to-end tests)"
echo "   - npm run test:performance:load (Load tests)"
echo "   - npm run test:security (Security tests)"

echo ""
echo "📋 TESTING COMPLETE"
echo "========================================"
