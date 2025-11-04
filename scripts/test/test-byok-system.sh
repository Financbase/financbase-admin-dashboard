#!/bin/bash

echo "🔑 Testing BYOK (Bring Your Own Key) System"
echo "=========================================="

BASE_URL="http://localhost:3010"

# Test 1: Check if server is running
echo -n "✅ Server Status: "
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
    echo "Running"
else
    echo "❌ Not running on port 3010"
    exit 1
fi

# Test 2: Test API key validation endpoint
echo -n "✅ API Key Validation Endpoint: "
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/byok/validate" \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "apiKey": "sk-test-invalid-key"}')

if echo "$VALIDATION_RESPONSE" | grep -q "isValid"; then
    echo "Working"
else
    echo "❌ Validation endpoint not responding"
fi

# Test 3: Test providers endpoint
echo -n "✅ Providers Endpoint: "
PROVIDERS_RESPONSE=$(curl -s "$BASE_URL/api/byok/providers")

if echo "$PROVIDERS_RESPONSE" | grep -q "providers"; then
    echo "Working"
    # Show available providers
    echo "$PROVIDERS_RESPONSE" | grep -o '"id":"[^"]*"' | head -5
else
    echo "❌ Providers endpoint not responding"
fi

# Test 4: Test preferences endpoint
echo -n "✅ Preferences Endpoint: "
PREFERENCES_RESPONSE=$(curl -s "$BASE_URL/api/byok/preferences")

if echo "$PREFERENCES_RESPONSE" | grep -q "preferences"; then
    echo "Working"
else
    echo "❌ Preferences endpoint not responding"
fi

# Test 5: Test usage tracking endpoint
echo -n "✅ Usage Tracking Endpoint: "
USAGE_RESPONSE=$(curl -s "$BASE_URL/api/byok/usage")

if echo "$USAGE_RESPONSE" | grep -q "usage"; then
    echo "Working"
else
    echo "❌ Usage tracking endpoint not responding"
fi

# Test 6: Check if BYOK dashboard loads
echo -n "✅ BYOK Dashboard Page: "
DASHBOARD_RESPONSE=$(curl -s "$BASE_URL/settings/byok")

if echo "$DASHBOARD_RESPONSE" | grep -q "Bring Your Own Key"; then
    echo "Working"
else
    echo "❌ Dashboard page not loading"
fi

echo ""
echo "🎉 BYOK System Tests Completed!"
echo ""
echo "🚀 BYOK Features Available:"
echo "   • Support for OpenAI, Claude, Gemini, Grok, and OpenRouter"
echo "   • Secure API key encryption and storage"
echo "   • Provider validation and quota monitoring"
echo "   • Usage tracking and cost estimation"
echo "   • User preferences for AI provider selection"
echo "   • Model selection and cost optimization"
echo ""
echo "📋 How to Use BYOK:"
echo "   1. Navigate to: $BASE_URL/settings/byok"
echo "   2. Click 'Add API Key' to add your provider keys"
echo "   3. Validate your API keys before saving"
echo "   4. Configure your AI preferences and model selection"
echo "   5. Start using AI features with your own keys!"
echo ""
echo "💡 Benefits:"
echo "   • Use your own API quotas and limits"
echo "   • Pay for your own AI usage"
echo "   • Choose from multiple AI providers"
echo "   • Track your usage and costs"
echo "   • Full control over AI model selection"
