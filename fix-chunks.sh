#!/bin/bash

# Quick fix script for Next.js chunk loading errors
# This script cleans caches and restarts the dev server properly

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🛑 Stopping any running Next.js processes..."
pkill -f "next dev" || true
sleep 2

# Verify no processes are still running
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  Warning: Some Next.js processes may still be running"
    echo "   Please manually kill them: pkill -9 -f 'next dev'"
else
    echo "✅ All Next.js processes stopped"
fi

echo "🚀 Starting fresh dev server..."
echo "   The server will start on http://localhost:3000"
echo ""
echo "📝 Note: If you still see errors, try:"
echo "   1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   2. Clear browser cache"
echo "   3. Test in incognito mode (browser extension errors are harmless)"
echo ""

npm run dev

