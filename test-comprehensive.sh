#!/bin/bash

# Comprehensive Testing Script for Financbase Admin Dashboard
# This script runs all tests and provides a detailed report

set -e

echo "🧪 Starting Comprehensive Testing for Financbase Admin Dashboard"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Running: $test_name${NC}"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if server is running
check_server() {
    echo -e "\n${YELLOW}Checking if development server is running...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running${NC}"
        echo "Please start the development server with: pnpm dev"
        return 1
    fi
}

# Function to run API endpoint tests
test_api_endpoints() {
    echo -e "\n${YELLOW}Testing API Endpoints...${NC}"
    
    local endpoints=(
        "/api/real-estate/stats"
        "/api/real-estate/properties"
        "/api/real-estate/realtor/stats"
        "/api/real-estate/realtor/leads"
        "/api/real-estate/realtor/listings"
        "/api/real-estate/buyer/stats"
        "/api/real-estate/buyer/saved-properties"
        "/api/analytics"
        "/api/dashboard/overview"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        echo "Testing: $endpoint"
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint" | grep -q "200\|404"; then
            echo -e "  ${GREEN}✅ OK${NC}"
        else
            echo -e "  ${RED}❌ FAILED${NC}"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All API endpoints are responding${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed endpoints: ${failed_endpoints[*]}${NC}"
        return 1
    fi
}

# Function to test database connectivity
test_database() {
    echo -e "\n${YELLOW}Testing Database Connectivity...${NC}"
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL environment variable not set${NC}"
        return 1
    fi
    
    # Test basic database connection
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
        
        # Test if real estate tables exist
        local tables=("listings" "leads" "buyer_profiles" "saved_properties")
        local missing_tables=()
        
        for table in "${tables[@]}"; do
            if psql "$DATABASE_URL" -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
                echo -e "  ${GREEN}✅ Table '$table' exists${NC}"
            else
                echo -e "  ${RED}❌ Table '$table' missing${NC}"
                missing_tables+=("$table")
            fi
        done
        
        if [ ${#missing_tables[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All required tables exist${NC}"
            return 0
        else
            echo -e "${RED}❌ Missing tables: ${missing_tables[*]}${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        return 1
    fi
}

# Function to run unit tests
run_unit_tests() {
    echo -e "\n${YELLOW}Running Unit Tests...${NC}"
    
    if [ -f "vitest.config.ts" ]; then
        pnpm vitest run --reporter=verbose
    else
        echo -e "${YELLOW}⚠️  No vitest configuration found, skipping unit tests${NC}"
        return 0
    fi
}

# Function to run integration tests
run_integration_tests() {
    echo -e "\n${YELLOW}Running Integration Tests...${NC}"
    
    if [ -f "playwright.config.ts" ]; then
        pnpm playwright test --reporter=line
    else
        echo -e "${YELLOW}⚠️  No Playwright configuration found, skipping integration tests${NC}"
        return 0
    fi
}

# Function to test build process
test_build() {
    echo -e "\n${YELLOW}Testing Build Process...${NC}"
    
    # Clean previous build
    rm -rf .next
    
    # Run build
    if pnpm build; then
        echo -e "${GREEN}✅ Build successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    fi
}

# Function to test linting
test_linting() {
    echo -e "\n${YELLOW}Running Linting...${NC}"
    
    if [ -f "eslint.config.js" ]; then
        if pnpm lint; then
            echo -e "${GREEN}✅ Linting passed${NC}"
            return 0
        else
            echo -e "${RED}❌ Linting failed${NC}"
            return 1
    fi
else
        echo -e "${YELLOW}⚠️  No ESLint configuration found, skipping linting${NC}"
        return 0
    fi
}

# Function to test type checking
test_types() {
    echo -e "\n${YELLOW}Running Type Checking...${NC}"
    
    if [ -f "tsconfig.json" ]; then
        if pnpm tsc --noEmit; then
            echo -e "${GREEN}✅ Type checking passed${NC}"
            return 0
        else
            echo -e "${RED}❌ Type checking failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  No TypeScript configuration found, skipping type checking${NC}"
        return 0
    fi
}

# Function to generate test report
generate_report() {
    echo -e "\n${BLUE}================================================================"
    echo -e "                    TEST REPORT SUMMARY"
    echo -e "================================================================"
    
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Success Rate: $success_rate%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}The application is ready for production deployment.${NC}"
        return 0
    else
        echo -e "\n${RED}⚠️  SOME TESTS FAILED${NC}"
        echo -e "${RED}Please fix the failing tests before deploying to production.${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo "Starting comprehensive testing at $(date)"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        pnpm install
    fi
    
    # Run tests
    run_test "Database Connectivity" "test_database"
    run_test "API Endpoints" "test_api_endpoints"
    run_test "Type Checking" "test_types"
    run_test "Linting" "test_linting"
    run_test "Unit Tests" "run_unit_tests"
    run_test "Integration Tests" "run_integration_tests"
    run_test "Build Process" "test_build"
    
    # Generate final report
    generate_report
    
    echo -e "\nTesting completed at $(date)"
}

# Run main function
main "$@"