#!/usr/bin/env bash

# Stop all IRS Direct File backend services and Docker containers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIRECT_FILE_DIR="$(dirname "$SCRIPT_DIR")"

echo "Stopping IRS Direct File Backend Services..."
echo "============================================="

# Stop Docker containers
echo ""
echo "Stopping Docker containers..."
cd "$DIRECT_FILE_DIR"
docker compose down

echo ""
echo "All services stopped successfully!"
echo ""

