#!/bin/bash

# Sentry Monitoring Script
# Checks Sentry for recent errors and alerts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SENTRY_ORG="${SENTRY_ORG:-financbase}"
SENTRY_PROJECT="${SENTRY_PROJECT:-financbase-admin-dashboard}"
SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN:-${SENTRY_AUTH_TOKEN}}"
TIME_WINDOW="${TIME_WINDOW:-1h}"  # 1h, 24h, 7d

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Sentry CLI is available
check_sentry_cli() {
    if ! command -v sentry-cli &> /dev/null; then
        print_warning "sentry-cli not found. Install it with: npm install -g @sentry/cli"
        print_status "You can also check Sentry dashboard manually at: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/"
        return 1
    fi
    return 0
}

# Get recent errors from Sentry
get_recent_errors() {
    if [ -z "$SENTRY_AUTH_TOKEN" ]; then
        print_warning "SENTRY_AUTH_TOKEN not set. Cannot fetch errors from API."
        print_status "Set SENTRY_AUTH_TOKEN environment variable to enable API access."
        return 1
    fi
    
    print_status "Fetching recent errors from Sentry..."
    
    # Use Sentry API to get recent issues
    local response=$(curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
        "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?statsPeriod=$TIME_WINDOW" \
        2>/dev/null || echo "[]")
    
    if [ "$response" = "[]" ] || [ -z "$response" ]; then
        print_success "No recent errors found in the last $TIME_WINDOW"
        return 0
    fi
    
    # Count errors
    local error_count=$(echo "$response" | jq '. | length' 2>/dev/null || echo "0")
    
    if [ "$error_count" -gt 0 ]; then
        print_warning "Found $error_count error(s) in the last $TIME_WINDOW"
        echo ""
        echo "Recent errors:"
        echo "$response" | jq -r '.[] | "  - \(.title) (Count: \(.count), Last seen: \(.lastSeen))"' 2>/dev/null || echo "$response"
        return 1
    else
        print_success "No errors found in the last $TIME_WINDOW"
        return 0
    fi
}

# Check error rate
check_error_rate() {
    print_status "Checking error rate..."
    
    if [ -z "$SENTRY_AUTH_TOKEN" ]; then
        print_warning "SENTRY_AUTH_TOKEN not set. Skipping error rate check."
        return 0
    fi
    
    # This would require Sentry API access to stats
    print_status "Error rate check requires Sentry API access"
    print_status "Check error rate in Sentry dashboard: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/performance/"
}

# Check performance metrics
check_performance() {
    print_status "Checking performance metrics..."
    
    if [ -z "$SENTRY_AUTH_TOKEN" ]; then
        print_warning "SENTRY_AUTH_TOKEN not set. Skipping performance check."
        return 0
    fi
    
    print_status "Performance metrics available in Sentry dashboard:"
    print_status "  https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/performance/"
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Sentry Monitoring Check"
    echo "=========================================="
    echo ""
    echo "Organization: $SENTRY_ORG"
    echo "Project: $SENTRY_PROJECT"
    echo "Time Window: $TIME_WINDOW"
    echo ""
    
    local has_errors=0
    
    # Check Sentry CLI
    if ! check_sentry_cli; then
        print_status "Using manual dashboard check instead"
    fi
    
    # Get recent errors
    if ! get_recent_errors; then
        has_errors=1
    fi
    
    # Check error rate
    check_error_rate
    
    # Check performance
    check_performance
    
    echo ""
    echo "=========================================="
    echo "  Dashboard Links"
    echo "=========================================="
    echo ""
    echo "Issues: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/issues/"
    echo "Performance: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/performance/"
    echo "Alerts: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/alerts/"
    echo ""
    
    if [ $has_errors -eq 0 ]; then
        print_success "✅ No critical issues detected"
        echo ""
        exit 0
    else
        print_warning "⚠️  Errors detected. Review Sentry dashboard for details."
        echo ""
        exit 1
    fi
}

# Run main function
main

