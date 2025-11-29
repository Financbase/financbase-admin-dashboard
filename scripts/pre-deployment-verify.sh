#!/bin/bash

# Pre-Deployment Verification Script
# Runs all verification checks before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
FAIL_ON_WARNINGS="${2:-false}"

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

print_section() {
    echo ""
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo ""
}

# Track results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Run check and track results
run_check() {
    local check_name=$1
    local command=$2
    local allow_warnings=${3:-false}
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_status "Running: $check_name"
    
    if eval "$command" > /tmp/check_output.log 2>&1; then
        print_success "$check_name passed"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 1 ] && [ "$allow_warnings" = "true" ]; then
            print_warning "$check_name completed with warnings"
            WARNINGS=$((WARNINGS + 1))
            if [ "$FAIL_ON_WARNINGS" = "true" ]; then
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
                return 1
            fi
            return 0
        else
            print_error "$check_name failed"
            cat /tmp/check_output.log
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    fi
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Pre-Deployment Verification"
    echo "=========================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Fail on warnings: $FAIL_ON_WARNINGS"
    echo ""
    
    local failed=0
    
    # 1. TypeScript Check
    print_section "TypeScript Type Checking"
    if run_check "TypeScript compilation" "pnpm type-check"; then
        :
    else
        failed=1
    fi
    
    # 2. Linting
    print_section "Code Linting"
    if run_check "ESLint" "pnpm lint"; then
        :
    else
        failed=1
    fi
    
    # 3. Environment Variables
    print_section "Environment Variables Verification"
    if [ "$ENVIRONMENT" = "production" ]; then
        if run_check "Environment variables (production)" "node scripts/verify-env-vars.js --production" "true"; then
            :
        else
            failed=1
        fi
    else
        if run_check "Environment variables (staging)" "node scripts/verify-env-vars.js" "true"; then
            :
        else
            failed=1
        fi
    fi
    
    # 4. Security Audit
    print_section "Security Audit"
    if run_check "Security audit" "./scripts/security-audit.sh" "true"; then
        :
    else
        failed=1
    fi
    
    # 5. Unit Tests
    print_section "Unit Tests"
    if run_check "Unit tests" "pnpm test:ci"; then
        :
    else
        failed=1
    fi
    
    # 6. Critical Path Tests
    print_section "Critical Path Tests"
    if run_check "Critical path tests" "pnpm test:critical"; then
        :
    else
        print_warning "Some critical tests failed (review needed)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # 7. Build Verification
    print_section "Build Verification"
    if run_check "Production build" "pnpm build"; then
        :
    else
        failed=1
    fi
    
    # 8. Database Migrations (if database URL is set)
    if [ -n "$DATABASE_URL" ] || [ -n "$TEST_DATABASE_URL" ]; then
        print_section "Database Migration Testing"
        if run_check "Migration tests" "./scripts/test-migrations.sh" "true"; then
            :
        else
            print_warning "Migration tests had issues (review needed)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_warning "Skipping migration tests (DATABASE_URL not set)"
    fi
    
    # Summary
    echo ""
    echo "=========================================="
    echo "  Verification Summary"
    echo "=========================================="
    echo ""
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNINGS"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            print_success "✅ All checks passed! Ready for deployment."
            echo ""
            exit 0
        else
            print_warning "⚠️  All checks passed with $WARNINGS warning(s)"
            echo ""
            if [ "$FAIL_ON_WARNINGS" = "true" ]; then
                exit 1
            else
                exit 0
            fi
        fi
    else
        print_error "❌ $FAILED_CHECKS check(s) failed. Deployment blocked."
        echo ""
        exit 1
    fi
}

# Run main function
main

