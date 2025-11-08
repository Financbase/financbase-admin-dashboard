#!/bin/bash

# Direct File Exports API Testing Script
# Tests the three endpoints: GET, POST, DELETE

echo "🧪 Testing Direct File Exports API Endpoints"
echo "=============================================="
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="/api/tax/direct-file/exports"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if server is running
if ! curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    print_error "Development server is not running!"
    print_status "Please start the server with: pnpm dev"
    exit 1
fi

print_success "Development server is running at $BASE_URL"
echo ""

# Check for auth token
if [ -z "$CLERK_SESSION_TOKEN" ]; then
    print_warning "No CLERK_SESSION_TOKEN environment variable set"
    print_status "For authenticated testing, you need to:"
    echo "  1. Login to your app in the browser"
    echo "  2. Open Developer Tools (F12)"
    echo "  3. Go to Application → Cookies"
    echo "  4. Copy the __session or __clerk_session value"
    echo "  5. Export it: export CLERK_SESSION_TOKEN='your-token'"
    echo ""
    print_status "Testing without authentication (will get 401)..."
    AUTH_HEADER=""
else
    print_success "Using authentication token"
    AUTH_HEADER="-H 'Cookie: __session=$CLERK_SESSION_TOKEN'"
fi

echo ""
print_status "Test 1: GET $ENDPOINT - Fetch export history"
echo "---------------------------------------------------"
if [ -z "$CLERK_SESSION_TOKEN" ]; then
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$ENDPOINT")
else
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "Cookie: __session=$CLERK_SESSION_TOKEN" "$BASE_URL$ENDPOINT")
fi

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    print_success "GET request successful (200)"
    echo "$body" | jq . 2>/dev/null || echo "$body"
elif [ "$http_code" = "401" ]; then
    print_warning "GET request returned 401 (Unauthorized - expected without auth)"
else
    print_error "GET request failed with status $http_code"
    echo "$body"
fi

echo ""
print_status "Test 2: POST $ENDPOINT - Create new export"
echo "---------------------------------------------------"
test_data='{
  "filename": "test-export-'$(date +%s)'.json",
  "format": "json",
  "fileSize": 1024
}'

if [ -z "$CLERK_SESSION_TOKEN" ]; then
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "$BASE_URL$ENDPOINT")
else
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Cookie: __session=$CLERK_SESSION_TOKEN" \
        -d "$test_data" \
        "$BASE_URL$ENDPOINT")
fi

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "201" ]; then
    print_success "POST request successful (201)"
    export_id=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    print_status "Created export ID: $export_id"
    echo "$export_id" > /tmp/direct_file_export_id.txt
elif [ "$http_code" = "401" ]; then
    print_warning "POST request returned 401 (Unauthorized - expected without auth)"
else
    print_error "POST request failed with status $http_code"
    echo "$body"
fi

echo ""
print_status "Test 3: DELETE $ENDPOINT/{id} - Delete export"
echo "---------------------------------------------------"
if [ -f /tmp/direct_file_export_id.txt ]; then
    export_id=$(cat /tmp/direct_file_export_id.txt)
    print_status "Deleting export ID: $export_id"
    
    if [ -z "$CLERK_SESSION_TOKEN" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X DELETE \
            "$BASE_URL$ENDPOINT/$export_id")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X DELETE \
            -H "Cookie: __session=$CLERK_SESSION_TOKEN" \
            "$BASE_URL$ENDPOINT/$export_id")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d')
    
    if [ "$http_code" = "200" ]; then
        print_success "DELETE request successful (200)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    elif [ "$http_code" = "401" ]; then
        print_warning "DELETE request returned 401 (Unauthorized - expected without auth)"
    elif [ "$http_code" = "404" ]; then
        print_warning "DELETE request returned 404 (Not found - may have been deleted already)"
    else
        print_error "DELETE request failed with status $http_code"
        echo "$body"
    fi
else
    print_warning "No export ID available for DELETE test (POST test may have failed)"
fi

echo ""
print_status "Test 4: Validation - Invalid format"
echo "---------------------------------------------------"
invalid_data='{
  "filename": "test.pdf",
  "format": "pdf",
  "fileSize": 512
}'

if [ -z "$CLERK_SESSION_TOKEN" ]; then
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$invalid_data" \
        "$BASE_URL$ENDPOINT")
else
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Cookie: __session=$CLERK_SESSION_TOKEN" \
        -d "$invalid_data" \
        "$BASE_URL$ENDPOINT")
fi

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "400" ]; then
    print_success "Validation test passed (400 Bad Request for invalid format)"
    echo "$body" | jq . 2>/dev/null || echo "$body"
else
    print_warning "Validation test: Expected 400, got $http_code"
    echo "$body"
fi

echo ""
echo "=============================================="
print_status "Testing Complete!"
echo ""
print_status "📋 Summary:"
echo "  - GET: Should return 200 (with auth) or 401 (without auth)"
echo "  - POST: Should return 201 (with auth) or 401 (without auth)"
echo "  - DELETE: Should return 200 (with auth) or 401 (without auth)"
echo "  - Validation: Should return 400 for invalid format"
echo ""
print_status "🔑 For full testing with authentication:"
echo "  1. Login to your app: $BASE_URL"
echo "  2. Get your session token from browser cookies"
echo "  3. Run: export CLERK_SESSION_TOKEN='your-token'"
echo "  4. Run this script again"
echo ""


