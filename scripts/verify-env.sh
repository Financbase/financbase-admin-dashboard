#!/bin/bash

# Environment Variables Verification Script
# This script checks if required environment variables are set (without showing values)

echo "🔍 Checking Environment Variables..."
echo ""

# Check required variables
echo "📋 Required Variables:"
echo "========================"

check_var() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 is not set"
        return 1
    else
        echo "✅ $1 is set"
        return 0
    fi
}

check_var_optional() {
    if [ -z "${!1}" ]; then
        echo "⚠️  $1 is not set (optional)"
        return 1
    else
        echo "✅ $1 is set"
        return 0
    fi
}

# Database
check_var "DATABASE_URL"

# Clerk
check_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
check_var "CLERK_SECRET_KEY"

# Email
check_var "RESEND_API_KEY"
check_var "RESEND_FROM_EMAIL"

# Security
check_var_optional "ARCJET_KEY"

# Contact/Support
check_var_optional "CONTACT_NOTIFICATION_EMAIL"
check_var_optional "SUPPORT_EMAIL"
check_var_optional "PUBLIC_SUPPORT_USER_ID"

echo ""
echo "🔧 Infrastructure Variables:"
echo "============================="

# PartyKit
check_var_optional "NEXT_PUBLIC_PARTYKIT_HOST"

# R2 Storage
check_var_optional "CLOUDFLARE_ACCOUNT_ID"
check_var_optional "R2_ACCESS_KEY_ID"
check_var_optional "R2_SECRET_ACCESS_KEY"
check_var_optional "R2_BUCKET"

echo ""
echo "🎯 Optional Variables:"
echo "======================"

# AI Services
check_var_optional "OPENAI_API_KEY"
check_var_optional "ANTHROPIC_API_KEY"

# Monitoring
check_var_optional "SENTRY_DSN"

# Application URL
check_var_optional "NEXT_PUBLIC_APP_URL"

echo ""
echo "✅ Verification complete!"
echo ""
echo "💡 Tip: Check docs/configuration/ENV_REVIEW_CHECKLIST.md for detailed review"
