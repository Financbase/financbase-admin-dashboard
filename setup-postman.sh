#!/bin/bash

# Financbase API Token Extractor and Test Script
# This script helps you get your Clerk session token and test the API

echo "🚀 Financbase API Token Extractor & Test Script"
echo "=============================================="

# Function to extract token from browser
get_token_from_browser() {
    echo ""
    echo "📋 Instructions to get your Clerk session token:"
    echo ""
    echo "1. Open Financbase in your browser: http://localhost:3000"
    echo "2. Login to your account"
    echo "3. Open Developer Tools (F12)"
    echo "4. Go to Application/Storage tab"
    echo "5. Look for cookies or localStorage"
    echo "6. Find the '__session' or '__clerk_session' token"
    echo "7. Copy the full token value"
    echo ""
    echo "Or run this in the browser console:"
    echo "document.cookie.split(';').find(c => c.includes('__session'))"
    echo ""
    read -p "Enter your Clerk session token: " token
    echo "export CLERK_TOKEN=\"$token\"" > .env.postman
    echo "✅ Token saved to .env.postman"
}

# Function to test API endpoints
test_api_endpoints() {
    echo ""
    echo "🧪 Testing API endpoints..."

    # Check if server is running
    if curl -s http://localhost:3010/api/health > /dev/null 2>&1; then
        echo "✅ Development server is running"
    else
        echo "❌ Development server not running. Please start it with: npm run dev"
        return 1
    fi

    # Test health endpoint
    echo ""
    echo "Testing health endpoint..."
    curl -s http://localhost:3010/api/health | jq . 2>/dev/null || curl -s http://localhost:3010/api/health

    # Test with token if available
    if [ -f .env.postman ]; then
        source .env.postman
        if [ ! -z "$CLERK_TOKEN" ]; then
            echo ""
            echo "Testing authenticated endpoints..."
            curl -s -H "Authorization: Bearer $CLERK_TOKEN" \
                 http://localhost:3010/api/ai/financial-analysis \
                 -X POST \
                 -H "Content-Type: application/json" \
                 -d '{
                   "revenue": [1000, 1200, 1100],
                   "expenses": [800, 900, 850],
                   "transactions": [],
                   "budget": {"total": 1500, "categories": []}
                 }' | jq . 2>/dev/null || echo "Response received"
        fi
    fi
}

# Function to update Postman environment
update_postman_env() {
    if [ -f .env.postman ]; then
        source .env.postman

        # Update Postman environment file
        if command -v jq &> /dev/null; then
            jq --arg token "$CLERK_TOKEN" '.values |= map(if .key == "clerk_session_token" then .value = $token else . end)' \
               Financbase_Environment.postman_environment.json > temp_env.json && \
            mv temp_env.json Financbase_Environment.postman_environment.json
            echo "✅ Postman environment updated with token"
        fi
    fi
}

# Main menu
echo ""
echo "What would you like to do?"
echo "1) Extract and save Clerk session token"
echo "2) Test API endpoints"
echo "3) Update Postman environment with token"
echo "4) Do all of the above"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        get_token_from_browser
        ;;
    2)
        test_api_endpoints
        ;;
    3)
        update_postman_env
        ;;
    4)
        get_token_from_browser
        update_postman_env
        test_api_endpoints
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Done! Check POSTMAN_README.md for detailed usage instructions."
echo "📁 Files created:"
echo "  - Financbase_API_Collection.postman_collection.json"
echo "  - Financbase_Environment.postman_environment.json"
echo "  - POSTMAN_README.md"
