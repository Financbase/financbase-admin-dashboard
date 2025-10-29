#!/bin/bash

# Tier 2 API Endpoints Testing Script
# Run this to test all API endpoints

echo "🧪 Testing Tier 2 API Endpoints"
echo "================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Dashboard API
echo "1. Testing Dashboard API..."
curl -s -o /dev/null -w "Dashboard: %{http_code}\n" "$BASE_URL/api/dashboard/overview" || echo "Dashboard: FAILED"

# Test 2: Financial API
echo "2. Testing Financial API..."
curl -s -o /dev/null -w "Financial: %{http_code}\n" "$BASE_URL/financial" || echo "Financial: FAILED"

# Test 3: Invoices API
echo "3. Testing Invoices API..."
curl -s -o /dev/null -w "Invoices: %{http_code}\n" "$BASE_URL/api/invoices" || echo "Invoices: FAILED"

# Test 4: Expenses API
echo "4. Testing Expenses API..."
curl -s -o /dev/null -w "Expenses: %{http_code}\n" "$BASE_URL/api/expenses" || echo "Expenses: FAILED"

# Test 5: Reports API
echo "5. Testing Reports API..."
curl -s -o /dev/null -w "Reports: %{http_code}\n" "$BASE_URL/api/reports" || echo "Reports: FAILED"

# Test 6: Settings API
echo "6. Testing Settings API..."
curl -s -o /dev/null -w "Settings: %{http_code}\n" "$BASE_URL/api/settings/notifications" || echo "Settings: FAILED"

# Test 7: Notifications API
echo "7. Testing Notifications API..."
curl -s -o /dev/null -w "Notifications: %{http_code}\n" "$BASE_URL/api/notifications" || echo "Notifications: FAILED"

# Test 8: AI GPT API
echo "8. Testing AI GPT API..."
curl -s -o /dev/null -w "AI GPT: %{http_code}\n" "$BASE_URL/api/ai/financbase-gpt" || echo "AI GPT: FAILED"

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "Expected Results:"
echo "- Dashboard: 200 (or 302 for redirect)"
echo "- Financial: 200 (or 302 for redirect)"
echo "- Invoices: 401 (unauthorized - expected)"
echo "- Expenses: 401 (unauthorized - expected)"
echo "- Reports: 401 (unauthorized - expected)"
echo "- Settings: 401 (unauthorized - expected)"
echo "- Notifications: 401 (unauthorized - expected)"
echo "- AI GPT: 401 (unauthorized - expected)"
echo ""
echo "Note: 401 responses are expected for API endpoints without authentication"
echo "This means the endpoints exist and are properly protected!"
