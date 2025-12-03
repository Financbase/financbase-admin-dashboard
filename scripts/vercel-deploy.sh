#!/bin/bash

# Vercel Deployment Script
# Deploys application to Vercel with comprehensive checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-preview}" # preview or production
TEAM_ID="${TEAM_ID:-team_2yJW4xxLipUWlyI6tFeQSgFk}"
PROJECT_NAME="financbase-admin-dashboard"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        print_status "Install it with: npm install -g vercel"
        exit 1
    fi
    
    print_success "Vercel CLI is installed"
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        print_error "Not logged in to Vercel"
        print_status "Run: vercel login"
        exit 1
    fi
    
    print_success "Logged in to Vercel"
}

# Pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Run pre-deployment verification
    if ./scripts/pre-deployment-verify.sh staging; then
        print_success "Pre-deployment verification passed"
    else
        print_error "Pre-deployment verification failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel ($ENVIRONMENT)..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Deploying to production..."
        if vercel --prod --yes; then
            print_success "Production deployment completed"
        else
            print_error "Production deployment failed"
            exit 1
        fi
    else
        print_status "Deploying to preview..."
        if vercel --yes; then
            print_success "Preview deployment completed"
        else
            print_error "Preview deployment failed"
            exit 1
        fi
    fi
}

# Get deployment URL
get_deployment_url() {
    print_status "Getting deployment URL..."
    
    # Get latest deployment
    local deployment_url=$(vercel ls --scope="$TEAM_ID" --limit=1 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
    
    if [ -n "$deployment_url" ]; then
        print_success "Deployment URL: $deployment_url"
        echo "$deployment_url"
    else
        print_warning "Could not retrieve deployment URL automatically"
        print_status "Check Vercel dashboard for deployment URL"
    fi
}

# Run smoke tests
run_smoke_tests() {
    local deployment_url=$1
    
    if [ -z "$deployment_url" ]; then
        print_warning "Skipping smoke tests (no deployment URL)"
        return
    fi
    
    print_status "Running smoke tests against $deployment_url..."
    
    if [ -f "./scripts/smoke-tests.sh" ]; then
        if BASE_URL="$deployment_url" ENVIRONMENT="$ENVIRONMENT" bash ./scripts/smoke-tests.sh; then
            print_success "Smoke tests passed"
        else
            print_warning "Some smoke tests failed (review needed)"
        fi
    else
        print_warning "Smoke tests script not found, skipping"
    fi
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Vercel Deployment"
    echo "=========================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_NAME"
    echo "Team: $TEAM_ID"
    echo ""
    
    check_prerequisites
    pre_deployment_checks
    deploy_vercel
    
    local deployment_url=$(get_deployment_url)
    
    if [ -n "$deployment_url" ]; then
        run_smoke_tests "$deployment_url"
    fi
    
    echo ""
    print_success "✅ Vercel deployment completed successfully!"
    echo ""
    if [ -n "$deployment_url" ]; then
        print_status "Deployment URL: $deployment_url"
    fi
    print_status "Next steps:"
    print_status "  1. Verify application functionality"
    print_status "  2. Check Vercel dashboard for deployment details"
    print_status "  3. Monitor error rates and performance"
    echo ""
}

# Run main function
main

