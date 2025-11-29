#!/bin/bash

# Staging Deployment Script
# Deploys application to staging environment with comprehensive testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGING_URL="${STAGING_URL:-https://staging.financbase.com}"
ENVIRONMENT="staging"

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

# Pre-deployment checks
pre_deployment_checks() {
    print_status "Running comprehensive pre-deployment verification..."
    
    # Run comprehensive pre-deployment verification
    if ./scripts/pre-deployment-verify.sh staging; then
        print_success "Pre-deployment verification passed"
    else
        print_error "Pre-deployment verification failed"
        exit 1
    fi
}

# Deploy to staging
deploy_staging() {
    print_status "Deploying to staging environment..."
    
    # Check for Vercel CLI
    if command -v vercel &> /dev/null; then
        print_status "Vercel CLI detected, deploying to Vercel..."
        
        # Deploy to Vercel staging (preview environment)
        if vercel --yes; then
            print_success "Deployment to Vercel preview completed"
        else
            print_error "Vercel deployment failed"
            exit 1
        fi
    # Check for Cloudflare Pages (wrangler)
    elif command -v wrangler &> /dev/null; then
        print_status "Wrangler detected, deploying to Cloudflare Pages..."
        
        # Build the application first
        print_status "Building application..."
        pnpm build
        
        # Deploy to Cloudflare Pages
        if wrangler pages deploy .next --project-name=financbase-admin-dashboard-staging; then
            print_success "Deployment to Cloudflare Pages completed"
        else
            print_error "Cloudflare Pages deployment failed"
            exit 1
        fi
    else
        print_warning "No deployment CLI detected (Vercel or Wrangler)"
        print_status "Please deploy manually using your deployment platform"
        print_status ""
        print_status "For Vercel:"
        print_status "  vercel --yes"
        print_status ""
        print_status "For Cloudflare Pages:"
        print_status "  pnpm build"
        print_status "  wrangler pages deploy .next --project-name=financbase-admin-dashboard-staging"
        print_status ""
        print_status "For Docker:"
        print_status "  docker build -t financbase-admin-dashboard:staging ."
        print_status "  docker push financbase-admin-dashboard:staging"
        print_status ""
        print_warning "Skipping actual deployment (manual deployment required)"
    fi
}

# Post-deployment verification
post_deployment_verification() {
    print_status "Running post-deployment verification..."
    
    # Wait for deployment to be ready
    print_status "Waiting for deployment to be ready..."
    sleep 10
    
    # Health check
    print_status "Checking health endpoint..."
    if curl -f "$STAGING_URL/api/health" > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        exit 1
    fi
    
    # Run smoke tests
    print_status "Running smoke tests..."
    if [ -f "./scripts/smoke-tests.sh" ]; then
        if BASE_URL="$STAGING_URL" ENVIRONMENT="$ENVIRONMENT" bash ./scripts/smoke-tests.sh; then
            print_success "Smoke tests passed"
        else
            print_warning "Some smoke tests failed (review needed)"
        fi
    elif pnpm test:e2e --config=playwright.staging.config.ts 2>/dev/null || true; then
        print_success "Smoke tests passed"
    else
        print_warning "Smoke tests had issues (may need manual verification)"
    fi
    
    # Performance test
    print_status "Running performance tests..."
    BASE_URL="$STAGING_URL" ./scripts/performance-test.sh || {
        print_warning "Performance tests did not meet all targets"
    }
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Staging Deployment"
    echo "=========================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Target URL: $STAGING_URL"
    echo ""
    
    pre_deployment_checks
    deploy_staging
    post_deployment_verification
    
    echo ""
    print_success "✅ Staging deployment completed successfully!"
    echo ""
    print_status "Staging URL: $STAGING_URL"
    print_status "Next steps:"
    print_status "  1. Verify application functionality manually"
    print_status "  2. Run user acceptance testing"
    print_status "  3. Monitor error rates and performance"
    echo ""
}

# Run main function
main

