#!/bin/bash
# Script to check status of Direct File backend services
#
# Usage: ./scripts/status-direct-file-backend-services.sh

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

echo "📊 Direct File Backend Services Status"
echo "======================================"
echo ""

# Function to check service status
check_service() {
    local service_name=$1
    local port=$2
    local health_url=$3
    local pid=$(read_pid "$service_name")
    
    echo -e "${BLUE}🔌 $service_name${NC}"
    
    # Check PID
    if [ -z "$pid" ]; then
        echo -e "   Status: ${RED}❌ Not running (no PID)${NC}"
        return 1
    fi
    
    # Check if process is running
    if ! is_process_running "$pid"; then
        echo -e "   Status: ${RED}❌ Not running (stale PID: $pid)${NC}"
        remove_pid "$service_name"
        return 1
    fi
    
    echo -e "   PID: ${GREEN}$pid${NC}"
    
    # Check port if provided
    if [ -n "$port" ]; then
        if lsof -ti:$port > /dev/null 2>&1; then
            echo -e "   Port $port: ${GREEN}✅ In use${NC}"
        else
            echo -e "   Port $port: ${YELLOW}⚠️  Not in use${NC}"
        fi
    fi
    
    # Check health endpoint if provided
    if [ -n "$health_url" ]; then
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            echo -e "   Health: ${GREEN}✅ Healthy${NC}"
        else
            echo -e "   Health: ${YELLOW}⚠️  Not responding${NC}"
        fi
    fi
    
    return 0
}

# Check Backend API
check_service \
    "backend-api" \
    "8080" \
    "http://localhost:8080/df/file/api/actuator/health"

echo ""

# Check State API
check_service \
    "state-api" \
    "8081" \
    "http://localhost:8081/actuator/health"

echo ""

# Check Email Service
check_service \
    "email-service" \
    "" \
    ""

echo ""

# Summary
SERVICES=$(get_service_names)
RUNNING_COUNT=0
TOTAL_COUNT=0

for service in $SERVICES; do
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    pid=$(read_pid "$service")
    if [ -n "$pid" ] && is_process_running "$pid"; then
        RUNNING_COUNT=$((RUNNING_COUNT + 1))
    fi
done

echo "======================================"
if [ $TOTAL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No backend services are running${NC}"
else
    echo -e "Summary: ${GREEN}$RUNNING_COUNT${NC} of $TOTAL_COUNT services running"
fi

echo ""
echo "📋 Commands:"
echo "   Start:  npm run direct-file:backend:start"
echo "   Stop:   npm run direct-file:backend:stop"
echo "   Status: npm run direct-file:backend:status"

