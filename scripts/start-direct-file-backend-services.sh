#!/bin/bash
# Script to start all Direct File backend services in the background
# 
# Prerequisites:
# - Backend services must be set up from IRS Direct File repository
# - Docker containers must be running (db, localstack)
# - Java 21 must be installed
# - Maven must be available
#
# Usage: ./scripts/start-direct-file-backend-services.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIRECT_FILE_DIR="$PROJECT_ROOT/lib/irs-direct-file/direct-file"
LOGS_DIR="$PROJECT_ROOT/logs"

# Source PID manager
source "$SCRIPT_DIR/utils/direct-file-pid-manager.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Starting Direct File Backend Services"
echo "========================================"
echo ""

# Check if backend services directory exists
if [ ! -d "$DIRECT_FILE_DIR" ]; then
    echo -e "${RED}❌ Error: Backend services directory not found.${NC}"
    echo "   Expected: $DIRECT_FILE_DIR"
    echo ""
    echo "   Backend services need to be cloned from the IRS Direct File repository."
    echo "   See docs/integrations/irs-direct-file-backend-setup.md for instructions."
    exit 1
fi

# Source environment setup
if [ -f "$PROJECT_ROOT/scripts/setup-direct-file-env.sh" ]; then
    source "$PROJECT_ROOT/scripts/setup-direct-file-env.sh"
fi

# Set database port environment variables (from docker-compose defaults)
export DF_DB_PORT=${DF_DB_PORT:-5435}
export STATEAPI_DB_PORT=${STATEAPI_DB_PORT:-5433}
export DF_EMAIL_DB_PORT=${DF_EMAIL_DB_PORT:-5434}

# Set LOCAL_WRAPPING_KEY if not already set (required for encryption)
# Generate a new key if needed using: cd lib/irs-direct-file/direct-file && ./scripts/local-setup.sh
if [ -z "$LOCAL_WRAPPING_KEY" ]; then
    # Use default from docker-compose if available, otherwise generate or use a default
    export LOCAL_WRAPPING_KEY=${LOCAL_WRAPPING_KEY:-"oE3Pm+fr1I+YbX2ZxEe/n9INqJjy00KSl7oXXW4p5Xw="}
    echo -e "${YELLOW}⚠️  LOCAL_WRAPPING_KEY not set, using default.${NC}"
    echo "   For production, generate a new key: cd lib/irs-direct-file/direct-file && ./scripts/local-setup.sh"
fi

# Verify Java 21
if ! command -v java > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Java not found.${NC}"
    echo "   Please install Java 21 and ensure it's in your PATH."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" != "21" ]; then
    echo -e "${YELLOW}⚠️  Warning: Java version is not 21 (found: $JAVA_VERSION)${NC}"
    echo "   Continuing anyway, but issues may occur."
fi

# Verify Maven
if ! command -v mvn > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Maven not found.${NC}"
    echo "   Please install Maven and ensure it's in your PATH."
    exit 1
fi

# Create logs directory
mkdir -p "$LOGS_DIR"

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local profile=$3
    local port=$4
    local health_url=$5
    
    echo -e "${BLUE}📦 Starting $service_name...${NC}"
    
    # Check if service is already running
    local existing_pid=$(read_pid "$service_name")
    if [ -n "$existing_pid" ] && is_process_running "$existing_pid"; then
        echo -e "${YELLOW}⚠️  $service_name is already running (PID: $existing_pid)${NC}"
        return 0
    fi
    
    # Check if service directory exists
    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}❌ Error: $service_name directory not found: $service_dir${NC}"
        return 1
    fi
    
    # Check if mvnw exists
    if [ ! -f "$service_dir/mvnw" ]; then
        echo -e "${RED}❌ Error: mvnw not found in $service_dir${NC}"
        return 1
    fi
    
    # Make mvnw executable
    chmod +x "$service_dir/mvnw" 2>/dev/null || true
    
    # Start service in background
    cd "$service_dir"
    local log_file="$LOGS_DIR/${service_name}.log"
    
    echo "   Logging to: $log_file"
    
    # Start the service
    nohup ./mvnw spring-boot:run \
        -Dspring-boot.run.profiles="$profile" \
        > "$log_file" 2>&1 &
    
    local pid=$!
    save_pid "$service_name" "$pid"
    
    echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
    
    # Wait for service to become healthy (if health URL provided)
    if [ -n "$health_url" ]; then
        echo "   Waiting for $service_name to become healthy..."
        local max_attempts=60
        local attempt=0
        local healthy=false
        
        while [ $attempt -lt $max_attempts ]; do
            sleep 2
            attempt=$((attempt + 1))
            
            if curl -s -f "$health_url" > /dev/null 2>&1; then
                healthy=true
                break
            fi
            
            # Check if process is still running
            if ! is_process_running "$pid"; then
                echo -e "${RED}❌ $service_name process died. Check logs: $log_file${NC}"
                remove_pid "$service_name"
                return 1
            fi
            
            if [ $((attempt % 5)) -eq 0 ]; then
                echo "   Still waiting... (attempt $attempt/$max_attempts)"
            fi
        done
        
        if [ "$healthy" = true ]; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name may not be fully ready (timeout after $max_attempts attempts)${NC}"
            echo "   Check logs: $log_file"
        fi
    fi
    
    return 0
}

# Start Backend API
start_service \
    "backend-api" \
    "$DIRECT_FILE_DIR/backend" \
    "development" \
    "8080" \
    "http://localhost:8080/df/file/api/actuator/health"

echo ""

# Start State API
start_service \
    "state-api" \
    "$DIRECT_FILE_DIR/state-api" \
    "development" \
    "8081" \
    "http://localhost:8081/actuator/health"

echo ""

# Start Email Service
start_service \
    "email-service" \
    "$DIRECT_FILE_DIR/email-service" \
    "blackhole" \
    "" \
    ""

echo ""
echo -e "${GREEN}✅ All backend services started${NC}"
echo ""
echo "📝 Service Status:"
echo "   - Backend API: http://localhost:8080"
echo "   - State API: http://localhost:8081"
echo "   - Email Service: Running (blackhole profile - emails logged, not sent)"
echo ""
echo "📋 Logs:"
echo "   - Backend API: $LOGS_DIR/backend-api.log"
echo "   - State API: $LOGS_DIR/state-api.log"
echo "   - Email Service: $LOGS_DIR/email-service.log"
echo ""
echo "🛑 To stop services: npm run direct-file:backend:stop"
echo "📊 To check status: npm run direct-file:backend:status"

