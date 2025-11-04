#!/bin/bash

# Test Notifications System
# This script tests the notifications API and UI functionality

echo "🔔 Testing Notifications System"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if notifications API is accessible
echo "1. Testing GET /api/notifications (should return 401 if not authenticated)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/notifications")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓${NC} API endpoint exists and is protected (401 Unauthorized - expected)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} API endpoint accessible and authenticated"
    echo "Response preview:"
    echo "$BODY" | head -c 200
    echo "..."
else
    echo -e "${RED}✗${NC} Unexpected response: HTTP $HTTP_CODE"
fi
echo ""

# Test 2: Check if mark-all-read endpoint exists
echo "2. Testing POST /api/notifications/mark-all-read..."
RESPONSE=$(curl -s -X POST -w "\n%{http_code}" "$BASE_URL/api/notifications/mark-all-read")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓${NC} Mark all read endpoint exists and is protected (401 - expected)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Mark all read endpoint accessible"
else
    echo -e "${YELLOW}⚠${NC} Response: HTTP $HTTP_CODE"
fi
echo ""

# Test 3: Check if notification routes exist
echo "3. Checking notification route handlers..."
ROUTES=(
    "/api/notifications"
    "/api/notifications/mark-all-read"
)

for route in "${ROUTES[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
    if [ "$RESPONSE" != "000" ] && [ "$RESPONSE" != "404" ]; then
        echo -e "${GREEN}✓${NC} $route exists (HTTP $RESPONSE)"
    else
        echo -e "${RED}✗${NC} $route not found"
    fi
done
echo ""

# Test 4: Verify frontend components
echo "4. Checking frontend notification components..."
COMPONENTS=(
    "components/core/enhanced-notifications-panel.tsx"
    "components/layout/enhanced-top-nav.tsx"
    "components/layout/mobile-layout.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✓${NC} $component exists"
        
        # Check if EnhancedNotificationsPanel is imported
        if grep -q "EnhancedNotificationsPanel" "$component" 2>/dev/null; then
            echo -e "  ${GREEN}→${NC} EnhancedNotificationsPanel is used"
        fi
    else
        echo -e "${RED}✗${NC} $component not found"
    fi
done
echo ""

# Test 5: Check notification service
echo "5. Checking notification service implementation..."
if [ -f "lib/services/notification-service.ts" ]; then
    echo -e "${GREEN}✓${NC} NotificationService exists"
    
    if grep -q "getUnreadCount" "lib/services/notification-service.ts"; then
        echo -e "  ${GREEN}→${NC} getUnreadCount method exists"
    fi
    
    if grep -q "markAsRead" "lib/services/notification-service.ts"; then
        echo -e "  ${GREEN}→${NC} markAsRead method exists"
    fi
    
    if grep -q "markAllAsRead" "lib/services/notification-service.ts"; then
        echo -e "  ${GREEN}→${NC} markAllAsRead method exists"
    fi
else
    echo -e "${RED}✗${NC} NotificationService not found"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ Notifications System Test Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Log in to the application"
echo "3. Check the notification bell icon in the header"
echo "4. The count should reflect actual unread notifications from the database"
echo "5. Click the bell to see the notification panel with real data"
echo ""


