#!/bin/bash

# Quick Token Extractor for Postman Setup
# This script helps you quickly get your Clerk session token

echo "🔑 Financbase Clerk Token Extractor"
echo "==================================="

# Check if running in browser context or provide instructions
if [ -n "$BROWSER" ] || [ "$(uname)" = "Darwin" ]; then
    echo ""
    echo "📋 Instructions to get your Clerk session token:"
    echo ""
    echo "1. 🌐 Open Financbase: http://localhost:3010"
    echo "2. 🔐 Login to your account"
    echo "3. 🔧 Open Developer Tools (F12 or right-click → Inspect)"
    echo "4. 📑 Go to 'Application' tab"
    echo "5. 🍪 Look for 'Cookies' or 'Local Storage' in the left sidebar"
    echo "6. 🔍 Find '__session' or '__clerk_session' token"
    echo "7. 📋 Copy the full token value"
    echo ""
    echo "💡 Quick JavaScript to get token (paste in Console tab):"
    echo "document.cookie.split(';').find(c => c.includes('__session'))"
    echo ""
    read -p "Enter your Clerk session token: " token

    if [ ! -z "$token" ]; then
        # Clean up token (remove quotes and whitespace)
        token=$(echo "$token" | sed 's/^["\s]*//;s/["\s]*$//')

        # Save to environment file
        echo "export CLERK_TOKEN=\"$token\"" > .env.postman

        # Update Postman environment
        if command -v jq &> /dev/null; then
            jq --arg token "$token" '.values |= map(if .key == "clerk_session_token" then .value = $token else . end)' \
               Financbase_Environment.postman_environment.json > temp_env.json && \
            mv temp_env.json Financbase_Environment.postman_environment.json
            echo "✅ Postman environment updated!"
        fi

        echo "✅ Token saved successfully!"
        echo "📄 Token file: .env.postman"
        echo "🔄 Postman environment updated"
    else
        echo "❌ No token provided"
        exit 1
    fi
else
    echo "Please run this script in your terminal after getting the token from your browser."
fi

echo ""
echo "🚀 Ready for Postman testing!"
echo "1. Import: Financbase_API_Collection.postman_collection.json"
echo "2. Import: Financbase_Environment.postman_environment.json"
echo "3. Set environment to 'Financbase Environment'"
echo "4. Start testing the API endpoints!"
echo ""
echo "📚 See POSTMAN_README.md for detailed instructions"
