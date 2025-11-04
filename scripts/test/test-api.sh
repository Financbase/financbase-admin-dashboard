#!/bin/bash

# Comprehensive Financbase API Testing Script
# This script validates all API endpoints and provides testing guidance

echo "🚀 Financbase API Testing Suite"
echo "==============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test health endpoint
test_health() {
    print_status "Testing Health Check endpoint..."
    response=$(curl -s http://localhost:3010/api/health)
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
        print_success "Health endpoint is responding"
        return 0
    else
        print_error "Health endpoint is not responding"
        return 1
    fi
}

# Test AI endpoints
test_ai_endpoints() {
    print_status "Testing AI endpoints..."

    # Test financial analysis
    response=$(curl -s -X POST http://localhost:3010/api/ai/financial-analysis \
        -H "Content-Type: application/json" \
        -d '{
          "revenue": [45000, 52000, 48000, 55000],
          "expenses": [32000, 35000, 31000, 36000],
          "transactions": [],
          "budget": {"total": 60000, "categories": []}
        }')

    if [ $? -eq 0 ]; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
        print_success "AI Financial Analysis endpoint working"
    else
        print_error "AI Financial Analysis endpoint failed"
    fi

    # Test transaction categorization
    response=$(curl -s -X POST http://localhost:3010/api/ai/categorize \
        -H "Content-Type: application/json" \
        -d '{
          "description": "Amazon Web Services monthly hosting",
          "amount": 299.99,
          "type": "expense"
        }')

    if [ $? -eq 0 ]; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
        print_success "AI Categorization endpoint working"
    else
        print_error "AI Categorization endpoint failed"
    fi
}

# Test search endpoints
test_search_endpoints() {
    print_status "Testing Search endpoints..."

    # Test search suggestions
    response=$(curl -s "http://localhost:3010/api/search/suggestions?q=office&index=products")
    if [ $? -eq 0 ]; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
        print_success "Search Suggestions endpoint working"
    else
        print_error "Search Suggestions endpoint failed"
    fi

    # Test universal search
    response=$(curl -s "http://localhost:3010/api/search?q=test&index=invoices")
    if [ $? -eq 0 ]; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
        print_success "Universal Search endpoint working"
    else
        print_error "Universal Search endpoint failed"
    fi
}

# Test with authentication (if token available)
test_authenticated_endpoints() {
    print_status "Testing authenticated endpoints..."

    # Check if we have a stored token
    if [ -f .env.postman ]; then
        source .env.postman
        if [ ! -z "$CLERK_TOKEN" ]; then
            print_status "Found stored authentication token"

            # Test authenticated AI endpoint
            response=$(curl -s -X POST http://localhost:3010/api/ai/financial-analysis \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $CLERK_TOKEN" \
                -d '{
                  "revenue": [1000, 1200],
                  "expenses": [800, 900],
                  "transactions": [],
                  "budget": {"total": 1500, "categories": []}
                }')

            if [ $? -eq 0 ]; then
                echo "$response" | jq . 2>/dev/null || echo "$response"
                print_success "Authenticated AI endpoint working"
            else
                print_warning "Authenticated AI endpoint needs valid token"
            fi
        else
            print_warning "No authentication token found in .env.postman"
        fi
    else
        print_warning "No .env.postman file found - run setup script to get token"
    fi
}

# Main testing function
run_all_tests() {
    echo ""
    print_status "Starting comprehensive API testing..."
    echo ""

    # Check if server is running
    if ! curl -s http://localhost:3010/api/health > /dev/null 2>&1; then
        print_error "Development server is not running!"
        print_status "Please start the server with: npm run dev"
        print_status "Server should be available at: http://localhost:3010"
        exit 1
    fi

    print_success "Development server is running!"

    # Run all tests
    test_health
    echo ""

    test_ai_endpoints
    echo ""

    test_search_endpoints
    echo ""

    test_authenticated_endpoints
    echo ""

    print_success "API testing completed!"
    echo ""
    print_status "📋 Next Steps for Postman:"
    echo "1. Open Postman application"
    echo "2. Import Financbase_API_Collection.postman_collection.json"
    echo "3. Import Financbase_Environment.postman_environment.json"
    echo "4. Get your Clerk token from: http://localhost:3010"
    echo "5. Set the token in Postman environment variables"
    echo "6. Start testing the endpoints!"
    echo ""
    print_status "🔑 To get your Clerk session token:"
    echo "   - Login to Financbase in your browser"
    echo "   - Open Developer Tools (F12)"
    echo "   - Go to Application tab → Cookies/Local Storage"
    echo "   - Copy the __session or __clerk_session value"
    echo "   - Set it as 'clerk_session_token' in Postman"
    echo ""
    print_status "📚 Documentation: See POSTMAN_README.md for detailed instructions"
}

# Check if server is running first
if ! curl -s http://localhost:3010/api/health > /dev/null 2>&1; then
    print_error "Development server is not running!"
    print_status "Starting development server..."
    npm run dev &
    sleep 3
fi

# Run the tests
run_all_tests
