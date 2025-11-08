#!/bin/bash
# Script to start Direct File backend services
# 
# Prerequisites:
# - Backend services must be set up from IRS Direct File repository
# - Docker must be running
# - Environment variables must be configured
#
# Usage: ./scripts/start-direct-file-services.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIRECT_FILE_DIR="$PROJECT_ROOT/lib/irs-direct-file"

echo "🚀 Starting Direct File Backend Services"
echo "=========================================="

# Check if backend services directory exists
if [ ! -d "$DIRECT_FILE_DIR/direct-file" ]; then
    echo "❌ Error: Backend services directory not found."
    echo "   Expected: $DIRECT_FILE_DIR/direct-file"
    echo ""
    echo "   Backend services need to be cloned from the IRS Direct File repository."
    echo "   See docs/integrations/irs-direct-file-backend-setup.md for instructions."
    exit 1
fi

# Source environment setup
if [ -f "$PROJECT_ROOT/scripts/setup-direct-file-env.sh" ]; then
    source "$PROJECT_ROOT/scripts/setup-direct-file-env.sh"
fi

cd "$DIRECT_FILE_DIR/direct-file"

# Check for docker-compose file
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found in $DIRECT_FILE_DIR/direct-file"
    echo "   Backend services need to be set up first."
    exit 1
fi

echo "📦 Starting Docker containers..."
docker compose up -d db localstack

echo "⏳ Waiting for containers to be healthy..."
sleep 5

echo "✅ Docker containers started"
echo ""

# Check if user wants to start backend services
if [ "${START_BACKEND:-}" = "true" ] || [ "${1:-}" = "--with-backend" ]; then
    echo "🚀 Starting backend services..."
    echo ""
    "$PROJECT_ROOT/scripts/start-direct-file-backend-services.sh"
else
    echo "📝 Next steps:"
    echo "   1. Start Backend API: cd backend && ./mvnw spring-boot:run"
    echo "   2. Start State API: cd state-api && ./mvnw spring-boot:run"
    echo "   3. Start Email Service: cd email-service && ./mvnw spring-boot:run"
    echo ""
    echo "   Or use: npm run direct-file:backend:start"
    echo "   Or use: npm run direct-file:start:all (starts Docker + backend)"
    echo ""
    echo "   See docs/integrations/irs-direct-file-backend-setup.md for details."
fi

