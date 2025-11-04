#!/bin/bash

# Test script to verify link check fixes
# This script tests the pages that were previously broken

BASE_URL="${BASE_URL:-http://localhost:3003}"
echo "🔍 Testing link fixes on ${BASE_URL}"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test pages
declare -a PAGES=(
  "/"
  "/home"
  "/about"
  "/contact"
  "/pricing"
  "/products/analytics"
  "/privacy"
  "/terms"
  "/security"
  "/support"
  "/blog"
  "/careers"
)

PASSED=0
FAILED=0

echo "Testing public pages..."
echo "======================"
echo ""

for page in "${PAGES[@]}"; do
  full_url="${BASE_URL}${page}"
  
  # Check HTTP status
  status=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${full_url}" 2>&1)
  
  if [ "$status" -eq 200 ]; then
    echo -e "${GREEN}✅${NC} ${page} (${status})"
    ((PASSED++))
  elif [ "$status" -eq 307 ] || [ "$status" -eq 308 ]; then
    echo -e "${YELLOW}⚠️ ${NC} ${page} (${status} - Redirect)"
    ((PASSED++))
  else
    echo -e "${RED}❌${NC} ${page} (${status})"
    ((FAILED++))
  fi
done

echo ""
echo "======================"
echo "Results: ${PASSED} passed, ${FAILED} failed"

# Test analytics route conflict
echo ""
echo "Testing route conflict resolution..."
echo "====================================="

# Test old analytics route (should not conflict)
dashboard_analytics=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${BASE_URL}/analytics" 2>&1)
if [ "$dashboard_analytics" -eq 401 ] || [ "$dashboard_analytics" -eq 302 ] || [ "$dashboard_analytics" -eq 307 ]; then
  echo -e "${GREEN}✅${NC} /analytics route protected (${dashboard_analytics})"
  ((PASSED++))
else
  echo -e "${RED}❌${NC} /analytics route issue (${dashboard_analytics})"
  ((FAILED++))
fi

# Test new analytics route
products_analytics=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${BASE_URL}/products/analytics" 2>&1)
if [ "$products_analytics" -eq 200 ]; then
  echo -e "${GREEN}✅${NC} /products/analytics accessible (${products_analytics})"
  ((PASSED++))
else
  echo -e "${RED}❌${NC} /products/analytics not accessible (${products_analytics})"
  ((FAILED++))
fi

# Test logo file
echo ""
echo "Testing logo file..."
echo "===================="
logo_status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/financbase-logo.png" 2>&1)
if [ "$logo_status" -eq 200 ]; then
  echo -e "${GREEN}✅${NC} Logo file accessible (${logo_status})"
  ((PASSED++))
else
  echo -e "${RED}❌${NC} Logo file not accessible (${logo_status})"
  ((FAILED++))
fi

echo ""
echo "======================"
echo "Final Results: ${PASSED} passed, ${FAILED} failed"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
  exit 1
fi

