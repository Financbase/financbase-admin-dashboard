#!/bin/bash
# Health check script for Direct File services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🏥 Direct File Services Health Check"
echo "====================================="
echo ""

# Check Docker
echo "📦 Docker:"
if docker ps > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
    
    # Check for Direct File containers
    if docker ps --format "{{.Names}}" | grep -q "direct-file"; then
        echo "   ✅ Direct File containers are running"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep "direct-file"
    else
        echo "   ⚠️  No Direct File containers found"
    fi
else
    echo "   ❌ Docker is not running"
fi

echo ""

# Check Backend Services
echo "🔌 Backend Services:"

# Source PID manager if available
if [ -f "$PROJECT_ROOT/scripts/utils/direct-file-pid-manager.sh" ]; then
    source "$PROJECT_ROOT/scripts/utils/direct-file-pid-manager.sh"
    
    # Check Backend API
    BACKEND_PID=$(read_pid "backend-api")
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "   Backend API: ✅ Running (PID: $BACKEND_PID)"
        if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo "      Health: ✅ Healthy"
        elif curl -s -f http://localhost:8080/df/file/api/health > /dev/null 2>&1; then
            echo "      Health: ✅ Healthy (alternative endpoint)"
        else
            echo "      Health: ⚠️  Not responding"
        fi
    else
        echo "   Backend API: ❌ Not running"
    fi
    
    # Check State API
    STATE_PID=$(read_pid "state-api")
    if [ -n "$STATE_PID" ] && kill -0 "$STATE_PID" 2>/dev/null; then
        echo "   State API: ✅ Running (PID: $STATE_PID)"
        if curl -s -f http://localhost:8081/actuator/health > /dev/null 2>&1; then
            echo "      Health: ✅ Healthy"
        else
            echo "      Health: ⚠️  Not responding"
        fi
    else
        echo "   State API: ❌ Not running"
    fi
    
    # Check Email Service
    EMAIL_PID=$(read_pid "email-service")
    if [ -n "$EMAIL_PID" ] && kill -0 "$EMAIL_PID" 2>/dev/null; then
        echo "   Email Service: ✅ Running (PID: $EMAIL_PID)"
    else
        echo "   Email Service: ❌ Not running"
    fi
else
    # Fallback: check without PID manager
    echo "   Backend API (port 8080):"
    if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "      ✅ Backend API is responding"
    elif curl -s -f http://localhost:8080/df/file/api/health > /dev/null 2>&1; then
        echo "      ✅ Backend API is responding (alternative endpoint)"
    else
        echo "      ❌ Backend API is not responding"
    fi
    
    echo "   State API (port 8081):"
    if curl -s -f http://localhost:8081/actuator/health > /dev/null 2>&1; then
        echo "      ✅ State API is responding"
    else
        echo "      ⚠️  State API is not responding (may not be required)"
    fi
fi

echo ""

# Check Fact Graph
echo "📊 Fact Graph:"
FACT_GRAPH_JS="$PROJECT_ROOT/lib/irs-direct-file/df-client/js-factgraph-scala/src/main.js"
if [ -f "$FACT_GRAPH_JS" ]; then
    SIZE=$(ls -lh "$FACT_GRAPH_JS" | awk '{print $5}')
    echo "   ✅ Fact graph compiled ($SIZE)"
else
    echo "   ❌ Fact graph not found"
fi

echo ""

# Check Client App
echo "💻 Client App:"
CLIENT_DIR="$PROJECT_ROOT/lib/irs-direct-file/df-client/df-client-app"
if [ -d "$CLIENT_DIR" ]; then
    if [ -f "$CLIENT_DIR/node_modules/.bin/vite" ]; then
        echo "   ✅ Dependencies installed"
    else
        echo "   ⚠️  Dependencies not installed (run: npm install)"
    fi
    
    if [ -f "$CLIENT_DIR/src/fact-dictionary/generated/facts.ts" ]; then
        echo "   ✅ Fact dictionary generated"
    else
        echo "   ⚠️  Fact dictionary not generated (run: npm run generate-fact-dictionary)"
    fi
else
    echo "   ❌ Client app directory not found"
fi

echo ""
echo "✅ Health check complete"

