#!/bin/bash

# Performance Monitoring Script
# Monitors system resources during load testing

echo "📊 Starting Performance Monitoring..."
echo "Monitoring system resources during load tests..."

# Create monitoring log
LOG_FILE="performance-tests/monitoring/perf-monitor-$(date +%Y%m%d-%H%M%S).log"

echo "Performance Monitor Log: $LOG_FILE"
echo "Started: $(date)" > "$LOG_FILE"

# Monitor function
monitor_system() {
  while true; do
    echo "=== $(date) ===" >> "$LOG_FILE"
    echo "CPU Usage:" >> "$LOG_FILE"
    top -l 1 | grep "CPU usage" >> "$LOG_FILE" 2>/dev/null || ps aux | awk '{sum += $3} END {print "CPU: " sum "%"}' >> "$LOG_FILE"

    echo "Memory Usage:" >> "$LOG_FILE"
    vm_stat | grep "Pages free" >> "$LOG_FILE" 2>/dev/null || free -h >> "$LOG_FILE" 2>/dev/null || echo "Memory monitoring not available" >> "$LOG_FILE"

    echo "Network Connections:" >> "$LOG_FILE"
    netstat -an | grep LISTEN | wc -l | awk '{print "Active connections: " $1}' >> "$LOG_FILE"

    echo "Node.js Processes:" >> "$LOG_FILE"
    ps aux | grep "next dev\|node" | grep -v grep | wc -l | awk '{print "Node processes: " $1}' >> "$LOG_FILE"

    sleep 5
  done
}

# Start monitoring in background
monitor_system &
MONITOR_PID=$!

echo "✅ Performance monitoring started (PID: $MONITOR_PID)"

# Function to stop monitoring
stop_monitoring() {
  echo "🛑 Stopping performance monitoring..."
  kill $MONITOR_PID 2>/dev/null || true
  echo "Finished: $(date)" >> "$LOG_FILE"
  echo "📊 Monitoring complete. Check $LOG_FILE for detailed metrics."
}

# Set trap to stop monitoring on script exit
trap stop_monitoring EXIT

echo "🔄 Monitoring will continue until load tests complete..."
echo "💡 Tip: Run 'kill $MONITOR_PID' to stop monitoring manually"
