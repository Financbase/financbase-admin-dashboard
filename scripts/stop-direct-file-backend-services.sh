#!/bin/bash
# Script to stop all Direct File backend services
#
# Usage: ./scripts/stop-direct-file-backend-services.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source PID manager
source "$SCRIPT_DIR/utils/direct-file-pid-manager.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🛑 Stopping Direct File Backend Services"
echo "========================================="
echo ""

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid=$(read_pid "$service_name")
    
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  $service_name: No PID found (may not be running)${NC}"
        return 0
    fi
    
    if ! is_process_running "$pid"; then
        echo -e "${YELLOW}⚠️  $service_name: Process $pid is not running (stale PID)${NC}"
        remove_pid "$service_name"
        return 0
    fi
    
    echo -e "${BLUE}🛑 Stopping $service_name (PID: $pid)...${NC}"
    
    # Try graceful shutdown first (SIGTERM)
    kill -TERM "$pid" 2>/dev/null || true
    
    # Wait for process to stop (max 30 seconds)
    local max_wait=30
    local waited=0
    
    while [ $waited -lt $max_wait ]; do
        if ! is_process_running "$pid"; then
            echo -e "${GREEN}✅ $service_name stopped gracefully${NC}"
            remove_pid "$service_name"
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    # If still running, force kill
    if is_process_running "$pid"; then
        echo -e "${YELLOW}⚠️  $service_name did not stop gracefully, forcing shutdown...${NC}"
        kill -KILL "$pid" 2>/dev/null || true
        sleep 1
        
        if ! is_process_running "$pid"; then
            echo -e "${GREEN}✅ $service_name stopped (forced)${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
            return 1
        fi
    fi
    
    remove_pid "$service_name"
    return 0
}

# Get all service names
SERVICES=$(get_service_names)

if [ -z "$SERVICES" ]; then
    echo -e "${YELLOW}⚠️  No backend services are running${NC}"
    clear_all_pids
    exit 0
fi

# Stop all services
ERRORS=0
for service in $SERVICES; do
    if ! stop_service "$service"; then
        ERRORS=$((ERRORS + 1))
    fi
    echo ""
done

# Clean up PID file if empty
if [ -f "$PID_FILE" ]; then
    local remaining=$(get_service_names | wc -l | tr -d ' ')
    if [ "$remaining" -eq 0 ]; then
        clear_all_pids
    fi
fi

echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All backend services stopped${NC}"
else
    echo -e "${RED}❌ Some services failed to stop ($ERRORS errors)${NC}"
    exit 1
fi

