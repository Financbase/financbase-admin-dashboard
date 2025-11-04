#!/bin/bash

echo "🔍 Testing Authentication Routes..."
echo "=================================="

# Start the server in background
echo "Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Test public routes (should work without auth)
echo ""
echo "📋 Testing Public Routes:"
echo "------------------------"

echo -n "Home page: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
echo ""

echo -n "Security page: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/security
echo ""

echo -n "Legal page: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/legal
echo ""

echo -n "Privacy page: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/privacy
echo ""

echo -n "Terms page: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/terms
echo ""

# Test protected routes (should redirect to auth)
echo ""
echo "🔒 Testing Protected Routes:"
echo "---------------------------"

echo -n "Dashboard: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard
echo ""

echo -n "Settings: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/settings
echo ""

echo -n "Profile: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/profile
echo ""

# Test API routes
echo ""
echo "🔌 Testing API Routes:"
echo "---------------------"

echo -n "Health API: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
echo ""

echo -n "Dashboard API: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/overview
echo ""

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Authentication route testing complete!"
