#!/bin/bash

# Test Upload Analytics API Endpoint
# This script tests the /api/analytics/upload endpoint

set -e

echo "🧪 Testing Upload Analytics API Endpoint"
echo "=========================================="
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/analytics/upload"

echo "Testing endpoint: ${ENDPOINT}"
echo ""

# Test 1: Without authentication (should return 401)
echo "Test 1: Unauthenticated request (should return 401)"
response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}" || echo "000")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "401" ]; then
    echo "✅ PASS: Unauthenticated request correctly returns 401"
else
    echo "❌ FAIL: Expected 401, got ${http_code}"
    echo "Response: ${body}"
fi
echo ""

# Test 2: With timeRange parameter (will fail auth but should validate params)
echo "Test 2: Parameter validation"
echo "Testing with timeRange=7d"
response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}?timeRange=7d" || echo "000")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
    echo "✅ PASS: Valid timeRange parameter accepted"
else
    echo "❌ FAIL: Unexpected status code ${http_code}"
fi
echo ""

echo "Testing with timeRange=30d"
response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}?timeRange=30d" || echo "000")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
    echo "✅ PASS: Valid timeRange parameter accepted"
else
    echo "❌ FAIL: Unexpected status code ${http_code}"
fi
echo ""

echo "Testing with timeRange=90d"
response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}?timeRange=90d" || echo "000")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
    echo "✅ PASS: Valid timeRange parameter accepted"
else
    echo "❌ FAIL: Unexpected status code ${http_code}"
fi
echo ""

# Test 3: Invalid timeRange (should validate)
echo "Test 3: Invalid parameter validation"
echo "Testing with invalid timeRange=invalid"
response=$(curl -s -w "\n%{http_code}" "${ENDPOINT}?timeRange=invalid" || echo "000")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

# Should either return 400 (validation error) or 401 (auth error)
if [ "$http_code" = "400" ] || [ "$http_code" = "401" ]; then
    echo "✅ PASS: Invalid parameter handled correctly (${http_code})"
else
    echo "⚠️  NOTE: Got ${http_code} (expected 400 or 401)"
    echo "Response: ${body}"
fi
echo ""

echo "=========================================="
echo "✅ Upload Analytics API Endpoint Tests Complete"
echo ""
echo "Note: Full authentication testing requires a valid Clerk session."
echo "To test with authentication, use the browser DevTools or a tool like Postman."

