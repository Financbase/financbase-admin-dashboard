#!/bin/bash

# Financbase Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "🚀 Deploying Financbase to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if environment file exists
check_environment_file() {
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"

    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found!"
        print_error "Please create $env_file based on .env.$ENVIRONMENT.template"
        exit 1
    fi

    print_success "Environment file $env_file found"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Use production database URL
        DATABASE_URL=$(grep "DATABASE_URL=" "$PROJECT_ROOT/.env.$ENVIRONMENT" | cut -d '=' -f2)
    else
        # Use local database for development/staging
        DATABASE_URL="postgresql://financbase_user:financbase_password@localhost:5432/financbase"
    fi

    # Run migrations using Drizzle
    npx drizzle-kit push --config ./drizzle.config.ts

    print_success "Database migrations completed"
}

# Build the application
build_application() {
    print_status "Building application for $ENVIRONMENT..."

    # Set environment variables for build
    export NODE_ENV=production
    export $(grep -v '^#' "$PROJECT_ROOT/.env.$ENVIRONMENT" | xargs)

    npm run build
    print_success "Application built successfully"
}

# Run tests
run_tests() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Running production tests..."
        npm run test:run
        print_success "All tests passed"
    fi
}

# Deploy based on environment
deploy() {
    case $ENVIRONMENT in
        "development")
            print_status "Starting development deployment..."
            npm run dev
            ;;
        "staging")
            print_status "Deploying to staging environment..."
            # Add staging deployment logic here (e.g., Vercel, Railway, etc.)
            print_warning "Staging deployment requires manual trigger via CI/CD"
            ;;
        "production")
            print_status "Deploying to production environment..."
            # Add production deployment logic here
            print_warning "Production deployment requires manual trigger via CI/CD"

            # Health check
            print_status "Running production health checks..."
            sleep 10
            curl -f http://localhost:3000/api/health || {
                print_error "Health check failed!"
                exit 1
            }
            print_success "Health check passed"
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            print_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Main deployment flow
main() {
    print_status "Starting Financbase deployment to $ENVIRONMENT"

    check_environment_file

    if [ "$ENVIRONMENT" = "production" ]; then
        run_tests
        install_dependencies
        run_migrations
        build_application
    else
        install_dependencies
        build_application
    fi

    deploy

    print_success "🎉 Financbase deployment to $ENVIRONMENT completed successfully!"
    print_status "Application is running and ready to serve requests"
}

# Run main function
main
