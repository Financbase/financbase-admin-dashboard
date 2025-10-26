#!/bin/bash

# Load Testing Script for Financbase Admin Dashboard
# Tests high-traffic scenarios and performance under load

echo "🚀 Starting Load Testing Suite..."

# Test 1: API Load Testing
echo "📊 Testing API endpoints under load..."
npx k6 run performance-tests/api-load-test.js

echo ""
echo "📈 Testing dashboard performance..."
npx k6 run performance-tests/dashboard-load-test.js

echo ""
echo "🔐 Testing authentication under load..."
npx k6 run performance-tests/auth-load-test.js

echo ""
echo "📋 Testing form submissions..."
npx k6 run performance-tests/form-load-test.js

echo ""
echo "🎯 Load testing complete! Check performance-tests/reports/ for detailed results."
