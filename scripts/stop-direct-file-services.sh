#!/bin/bash
# Script to stop Direct File backend services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIRECT_FILE_DIR="$PROJECT_ROOT/lib/irs-direct-file"

echo "🛑 Stopping Direct File Backend Services"
echo "========================================="

if [ ! -d "$DIRECT_FILE_DIR/direct-file" ]; then
    echo "⚠️  Backend services directory not found. Nothing to stop."
    exit 0
fi

cd "$DIRECT_FILE_DIR/direct-file"

if [ ! -f "docker-compose.yml" ]; then
    echo "⚠️  docker-compose.yml not found. Nothing to stop."
    exit 0
fi

echo "📦 Stopping Docker containers..."
docker compose down

echo "✅ Direct File services stopped"

