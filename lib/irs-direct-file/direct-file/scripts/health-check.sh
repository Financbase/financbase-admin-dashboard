#!/usr/bin/env bash

# Health check script for IRS Direct File backend services
# Checks if all required services are running and accessible

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIRECT_FILE_DIR="$(dirname "$SCRIPT_DIR")"

echo "IRS Direct File Backend Services Health Check"
echo "=============================================="
echo ""

# Check Docker containers
echo "Checking Docker containers..."
if docker ps --filter "name=direct-file-db" --filter "status=running" | grep -q direct-file-db; then
    echo "  ✓ Direct File database: Running"
else
    echo "  ✗ Direct File database: Not running"
fi

if docker ps --filter "name=localstack" --filter "status=running" | grep -q localstack; then
    echo "  ✓ LocalStack: Running"
    # Check LocalStack health
    if curl -s http://localhost:4566/health > /dev/null 2>&1; then
        echo "    ✓ LocalStack health endpoint: Accessible"
    else
        echo "    ✗ LocalStack health endpoint: Not accessible"
    fi
else
    echo "  ✗ LocalStack: Not running"
fi

echo ""

# Check backend services
echo "Checking backend services..."

# Backend API (port 8080)
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "  ✓ Backend API (port 8080): Running"
else
    echo "  ✗ Backend API (port 8080): Not running"
fi

# State API (port 8081)
if curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
    echo "  ✓ State API (port 8081): Running"
else
    echo "  ✗ State API (port 8081): Not running"
fi

# Email Service (port 8082)
if curl -s http://localhost:8082/actuator/health > /dev/null 2>&1; then
    echo "  ✓ Email Service (port 8082): Running"
else
    echo "  ✗ Email Service (port 8082): Not running"
fi

echo ""
echo "Health check complete!"
echo ""

