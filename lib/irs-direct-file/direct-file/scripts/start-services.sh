#!/usr/bin/env bash

# Start all IRS Direct File backend services
# This script starts all required services for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIRECT_FILE_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting IRS Direct File Backend Services..."
echo "=============================================="

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start Docker containers
echo ""
echo "Starting Docker containers (db, localstack)..."
cd "$DIRECT_FILE_DIR"
docker compose up -d db localstack

# Wait for containers to be healthy
echo "Waiting for containers to be ready..."
sleep 5

# Check container health
if ! docker ps --filter "name=direct-file-db" --filter "status=running" | grep -q direct-file-db; then
    echo "Warning: Direct File database container is not running"
fi

if ! docker ps --filter "name=localstack" --filter "status=running" | grep -q localstack; then
    echo "Warning: LocalStack container is not running"
fi

echo ""
echo "Docker containers started successfully!"
echo ""
echo "To start backend services, run in separate terminals:"
echo ""
echo "1. Backend API (port 8080):"
echo "   cd $DIRECT_FILE_DIR/backend"
echo "   ./mvnw spring-boot:run -Dspring-boot.run.profiles=development"
echo ""
echo "2. State API (port 8081):"
echo "   cd $DIRECT_FILE_DIR/state-api"
echo "   ./mvnw spring-boot:run -Dspring-boot.run.profiles=development"
echo ""
echo "3. Email Service (port 8082):"
echo "   cd $DIRECT_FILE_DIR/email-service"
echo "   ./mvnw spring-boot:run -Dspring-boot.run.profiles=blackhole"
echo ""
echo "Services will be available at:"
echo "  - Backend API: http://localhost:8080"
echo "  - State API: http://localhost:8081"
echo "  - Email Service: http://localhost:8082"
echo ""

