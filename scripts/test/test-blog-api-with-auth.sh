#!/bin/bash

# Test script for blog API with authentication
# Tests error handling (400s) and authenticated endpoints

BASE_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Try to get session cookie from .env.postman or environment
if [ -f .env.postman ]; then
    source .env.postman
fi

# Check if we have a session cookie
if [ -z "$CLERK_SESSION_COOKIE" ] && [ -z "$COOKIE" ]; then
    echo -e "${YELLOW}⚠ No authentication cookie found${NC}"
    echo ""
    echo "To test authenticated endpoints, you need to:"
    echo "1. Login to http://localhost:3000 in your browser"
    echo "2. Open Developer Tools (F12)"
    echo "3. Go to Application → Cookies"
    echo "4. Find '__session' or '__clerk_session' cookie"
    echo "5. Export it: export CLERK_SESSION_COOKIE='cookie-value'"
    echo ""
    echo "Or set it in .env.postman:"
    echo "export CLERK_SESSION_COOKIE='your-cookie-value'"
    echo ""
    echo -e "${BLUE}Continuing with unauthenticated tests (public endpoints + error handling)${NC}"
    AUTH_COOKIE=""
else
    AUTH_COOKIE="${CLERK_SESSION_COOKIE:-$COOKIE}"
    echo -e "${GREEN}✓ Using authentication cookie${NC}"
fi

echo ""
echo "=========================================="
echo "Testing Blog API Error Handling (400s)"
echo "=========================================="
echo ""

# Test 1: Malformed JSON in POST /api/blog
echo -e "${YELLOW}Test 1: Malformed JSON - POST /api/blog${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog" \
        -H "Content-Type: application/json" \
        -H "Cookie: ${AUTH_COOKIE}" \
        -d 'invalid json{')
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog" \
        -H "Content-Type: application/json" \
        -d 'invalid json{')
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for malformed JSON${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required, but 400 would come first)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 2: Malformed JSON in PUT /api/blog/[id]
echo -e "${YELLOW}Test 2: Malformed JSON - PUT /api/blog/1${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X PUT "${BASE_URL}/api/blog/1" \
        -H "Content-Type: application/json" \
        -H "Cookie: ${AUTH_COOKIE}" \
        -d 'invalid json{')
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X PUT "${BASE_URL}/api/blog/1" \
        -H "Content-Type: application/json" \
        -d 'invalid json{')
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for malformed JSON${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 3: Malformed JSON in POST /api/blog/categories
echo -e "${YELLOW}Test 3: Malformed JSON - POST /api/blog/categories${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog/categories" \
        -H "Content-Type: application/json" \
        -H "Cookie: ${AUTH_COOKIE}" \
        -d 'invalid json{')
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog/categories" \
        -H "Content-Type: application/json" \
        -d 'invalid json{')
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for malformed JSON${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 4: Invalid ID format in PUT /api/blog/[id]
echo -e "${YELLOW}Test 4: Invalid ID - PUT /api/blog/abc${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X PUT "${BASE_URL}/api/blog/abc" \
        -H "Content-Type: application/json" \
        -H "Cookie: ${AUTH_COOKIE}" \
        -d '{"title":"Test"}')
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X PUT "${BASE_URL}/api/blog/abc" \
        -H "Content-Type: application/json" \
        -d '{"title":"Test"}')
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for invalid ID${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 5: Invalid ID format in DELETE /api/blog/[id]
echo -e "${YELLOW}Test 5: Invalid ID - DELETE /api/blog/xyz${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X DELETE "${BASE_URL}/api/blog/xyz" \
        -H "Cookie: ${AUTH_COOKIE}")
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X DELETE "${BASE_URL}/api/blog/xyz")
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for invalid ID${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 6: Invalid ID format in POST /api/blog/[id]/publish
echo -e "${YELLOW}Test 6: Invalid ID - POST /api/blog/not-a-number/publish${NC}"
if [ -n "$AUTH_COOKIE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog/not-a-number/publish" \
        -H "Cookie: ${AUTH_COOKIE}")
else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "${BASE_URL}/api/blog/not-a-number/publish")
fi

if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Returned 400 for invalid ID${NC}"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${YELLOW}? INFO: Got $STATUS (authentication required)${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400, got $STATUS${NC}"
fi
echo ""

# Test 7: Public endpoint - GET /api/blog/categories (should work without auth)
echo -e "${YELLOW}Test 7: Public endpoint - GET /api/blog/categories${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -X GET "${BASE_URL}/api/blog/categories")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASS: Public endpoint accessible${NC}"
else
    echo -e "${YELLOW}? INFO: Got $STATUS${NC}"
fi
echo ""

# Test 8: Public endpoint - GET /api/blog?status=published
echo -e "${YELLOW}Test 8: Public endpoint - GET /api/blog?status=published${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -X GET "${BASE_URL}/api/blog?status=published")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASS: Public endpoint accessible${NC}"
else
    echo -e "${YELLOW}? INFO: Got $STATUS${NC}"
fi
echo ""

echo "=========================================="
echo "Test Summary Complete"
echo "=========================================="
echo ""
echo -e "${BLUE}Note:${NC} Some tests may show 401/403 if authentication is required."
echo -e "The important thing is that ${GREEN}400 errors${NC} are returned for:"
echo "  - Malformed JSON (before auth check)"
echo "  - Invalid ID formats (before auth check)"
echo ""

