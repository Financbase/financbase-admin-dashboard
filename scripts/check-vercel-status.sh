#!/bin/bash

# Check Vercel Project Status
# Uses Vercel CLI to check project status and deployment information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_NAME="financbase-admin-dashboard"

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

main() {
    echo ""
    echo "=========================================="
    echo "  Vercel Project Status Check"
    echo "=========================================="
    echo ""
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        print_status "Install it with: npm install -g vercel"
        exit 1
    fi
    
    # Check if logged in
    print_status "Checking Vercel authentication..."
    if vercel whoami &> /dev/null; then
        local user=$(vercel whoami 2>/dev/null)
        print_success "Logged in as: $user"
    else
        print_error "Not logged in to Vercel"
        print_status "Run: vercel login"
        exit 1
    fi
    
    echo ""
    print_status "Listing Vercel projects..."
    echo ""
    
    # List projects
    if vercel projects ls 2>&1 | grep -q "$PROJECT_NAME"; then
        print_success "Project '$PROJECT_NAME' found!"
        echo ""
        vercel projects ls | grep "$PROJECT_NAME" || true
    else
        print_warning "Project '$PROJECT_NAME' not found"
        print_status "You may need to create it or link it"
        print_status "Run: vercel link"
    fi
    
    echo ""
    print_status "Recent deployments:"
    vercel ls --limit=5 2>&1 || print_warning "Could not list deployments"
    
    echo ""
    print_status "To deploy:"
    print_status "  Preview:  ./scripts/vercel-deploy.sh preview"
    print_status "  Production: ./scripts/vercel-deploy.sh production"
    echo ""
}

main

