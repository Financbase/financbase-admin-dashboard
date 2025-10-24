#!/bin/bash

# 404 Error Testing Script for Financbase Admin Dashboard
# This script tests all routes defined in the navigation for 404 errors

BASE_URL="http://localhost:3010"
LOG_FILE="404-test-results.log"

echo "🔍 Starting 404 Error Testing for Financbase Admin Dashboard" > $LOG_FILE
echo "📊 Base URL: $BASE_URL" >> $LOG_FILE
echo "🕒 Started at: $(date)" >> $LOG_FILE
echo "=================================================================" >> $LOG_FILE

# Function to test a route
test_route() {
    local route=$1
    local description=$2
    local full_url="$BASE_URL$route"

    echo "Testing: $full_url ($description)"

    # Test the route
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$full_url")

    if [ "$response" = "200" ]; then
        echo "✅ $route - OK ($response)" | tee -a $LOG_FILE
        return 0
    elif [ "$response" = "404" ]; then
        echo "❌ $route - 404 ERROR ($response)" | tee -a $LOG_FILE
        return 1
    elif [ "$response" = "000" ]; then
        echo "⏱️  $route - TIMEOUT (Connection failed)" | tee -a $LOG_FILE
        return 1
    else
        echo "⚠️  $route - OTHER ($response)" | tee -a $LOG_FILE
        return 1
    fi
}

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Test if server is responding
if ! curl -s --max-time 5 "$BASE_URL" > /dev/null; then
    echo "❌ Server not responding at $BASE_URL" | tee -a $LOG_FILE
    echo "Please ensure the development server is running with: pnpm dev" | tee -a $LOG_FILE
    exit 1
fi

echo "✅ Server is responding!" | tee -a $LOG_FILE
echo "" >> $LOG_FILE

# Test main navigation routes
echo "🧭 Testing Main Navigation Routes..." >> $LOG_FILE
main_routes=(
    "/:Home Page"
    "/dashboard:Dashboard"
    "/unified:Unified"
    "/transactions:Transactions"
    "/analytics:Analytics"
    "/accounts:Accounts"
    "/payments:Payments"
    "/reports:Reports"
    "/collaboration:Collaboration"
    "/settings:Settings"
    "/admin/rbac:Admin RBAC"
)

errors=0
total=0

for route_info in "${main_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test Financial Intelligence routes
echo "🧠 Testing Financial Intelligence Routes..." >> $LOG_FILE
fi_routes=(
    "/financial-intelligence:Financial Intelligence Overview"
    "/financial-intelligence/predictions:Predictions"
    "/financial-intelligence/recommendations:Recommendations"
    "/financial-intelligence/health:Health Score"
    "/financial-intelligence/startup:Startup Metrics"
    "/financial-intelligence/agency:Agency Metrics"
    "/financial-intelligence/ecommerce:E-commerce Metrics"
)

for route_info in "${fi_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test AI Assistant routes
echo "🤖 Testing AI Assistant Routes..." >> $LOG_FILE
ai_routes=(
    "/ai-assistant:AI Assistant"
    "/financbase-gpt:Financbase GPT"
)

for route_info in "${ai_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test Module routes
echo "🔧 Testing Module Routes..." >> $LOG_FILE
module_routes=(
    "/freelance:Freelance Module"
    "/real-estate:Real Estate Module"
    "/adboard:Adboard Module"
)

for route_info in "${module_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test Public routes
echo "🌐 Testing Public Routes..." >> $LOG_FILE
public_routes=(
    "/:Public Home"
    "/about:About"
    "/blog:Blog"
    "/careers:Careers"
    "/contact:Contact"
    "/docs:Documentation"
    "/guides:Guides"
    "/legal:Legal"
    "/pricing:Pricing"
    "/privacy:Privacy"
    "/security:Security"
    "/support:Support"
    "/terms:Terms"
)

for route_info in "${public_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test some additional routes that might exist
echo "🔍 Testing Additional Routes..." >> $LOG_FILE
additional_routes=(
    "/invoices:Invoices"
    "/expenses:Expenses"
    "/clients:Clients"
    "/bill-pay:Bill Pay"
    "/leads:Leads"
    "/workflows:Workflows"
    "/integrations:Integrations"
    "/webhooks:Webhooks"
    "/profile:Profile (redirects to settings/profile)"
    "/security-dashboard:Security Dashboard"
)

for route_info in "${additional_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE

# Test some API routes
echo "🔌 Testing API Routes..." >> $LOG_FILE
api_routes=(
    "/api/health:Health Check"
    "/api/auth/user:Auth User"
    "/api/transactions:Transactions API"
    "/api/analytics:Analytics API"
)

for route_info in "${api_routes[@]}"; do
    route=$(echo "$route_info" | cut -d: -f1)
    description=$(echo "$route_info" | cut -d: -f2)
    test_route "$route" "$description" && ((total++)) || ((errors++))
done

echo "" >> $LOG_FILE
echo "=================================================================" >> $LOG_FILE
echo "📈 Test Summary:" >> $LOG_FILE
echo "Total routes tested: $((total + errors))" >> $LOG_FILE
echo "✅ Successful: $total" >> $LOG_FILE
echo "❌ Errors: $errors" >> $LOG_FILE
echo "📊 Success rate: $((total * 100 / (total + errors)))%" >> $LOG_FILE
echo "🕒 Completed at: $(date)" >> $LOG_FILE

if [ $errors -eq 0 ]; then
    echo "🎉 All routes are working correctly!" | tee -a $LOG_FILE
else
    echo "⚠️  Found $errors routes with issues. Check the log for details." | tee -a $LOG_FILE
fi

echo "" >> $LOG_FILE
echo "📋 Detailed results saved to: $LOG_FILE" >> $LOG_FILE

echo "📋 404 Test Complete! Results saved to $LOG_FILE"
