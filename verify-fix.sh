#!/bin/bash

# Verification script for Next.js chunk loading fix
# This script checks if all chunks are loading correctly

echo "🔍 Verifying Next.js Chunk Loading Fix"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "1️⃣  Checking if dev server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    echo -e "${GREEN}✅ Dev server is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Dev server is not running. Please run: npm run dev${NC}"
    exit 1
fi
echo ""

# Check main page
echo "2️⃣  Checking main page..."
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Main page returns HTTP $MAIN_STATUS${NC}"
else
    echo -e "${RED}❌ Main page returns HTTP $MAIN_STATUS${NC}"
fi
echo ""

# Check for main-app.js chunk
echo "3️⃣  Checking main-app.js chunk..."
CHUNK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/chunks/main-app.js)
if [ "$CHUNK_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ main-app.js chunk is accessible (HTTP 200)${NC}"
    
    # Check Content-Type
    CONTENT_TYPE=$(curl -s -I http://localhost:3000/_next/static/chunks/main-app.js | grep -i "content-type" | awk '{print $2 $3}' | tr -d '\r')
    if echo "$CONTENT_TYPE" | grep -q "application/javascript"; then
        echo -e "${GREEN}✅ Content-Type is correct: $CONTENT_TYPE${NC}"
    else
        echo -e "${RED}❌ Content-Type is incorrect: $CONTENT_TYPE (expected application/javascript)${NC}"
    fi
else
    echo -e "${RED}❌ main-app.js chunk is not accessible (HTTP $CHUNK_RESPONSE)${NC}"
fi
echo ""

# Check if chunk file exists on disk
echo "4️⃣  Checking chunk files on disk..."
if [ -f ".next/static/chunks/main-app.js" ]; then
    CHUNK_SIZE=$(ls -lh .next/static/chunks/main-app.js | awk '{print $5}')
    echo -e "${GREEN}✅ main-app.js exists on disk (size: $CHUNK_SIZE)${NC}"
    
    # Count total chunk files
    CHUNK_COUNT=$(find .next/static/chunks -name "*.js" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Found $CHUNK_COUNT JavaScript chunk files${NC}"
else
    echo -e "${RED}❌ main-app.js does not exist on disk${NC}"
fi
echo ""

# Check middleware configuration
echo "5️⃣  Checking middleware configuration..."
if grep -q "pathname.startsWith('/_next/')" middleware.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Middleware correctly excludes /_next/ files${NC}"
else
    echo -e "${YELLOW}⚠️  Middleware may not be excluding /_next/ files${NC}"
fi
echo ""

# Check for multiple dev server processes
echo "6️⃣  Checking for duplicate dev server processes..."
DEV_SERVER_COUNT=$(ps aux | grep -i "next dev" | grep -v grep | wc -l | tr -d ' ')
if [ "$DEV_SERVER_COUNT" -eq 1 ]; then
    echo -e "${GREEN}✅ Only one dev server process running${NC}"
elif [ "$DEV_SERVER_COUNT" -gt 1 ]; then
    echo -e "${YELLOW}⚠️  Multiple dev server processes detected ($DEV_SERVER_COUNT). This may cause issues.${NC}"
    echo "   Run: pkill -f 'next dev' && npm run dev"
else
    echo -e "${RED}❌ No dev server process found${NC}"
fi
echo ""

# Final summary
echo "======================================="
echo "📊 Verification Summary"
echo "======================================="
echo ""
echo "✅ If all checks passed, the fix is working!"
echo ""
echo "🌐 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Open DevTools (F12 or Cmd+Option+I)"
echo "   3. Go to Network tab"
echo "   4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   5. Look for main-app.js - it should show:"
echo "      - Status: 200"
echo "      - Type: script"
echo "      - Size: [some number]"
echo ""
echo "💡 If you still see errors:"
echo "   - Clear browser cache completely"
echo "   - Try incognito/private window"
echo "   - Check Console tab for any JavaScript errors"
echo ""

