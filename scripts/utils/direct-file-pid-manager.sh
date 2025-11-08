#!/bin/bash
# PID Management Utility for Direct File Backend Services
# Provides functions to save, read, and manage process IDs

PID_FILE="/tmp/direct-file-backend-pids.json"

# Save PID for a service
save_pid() {
    local service_name=$1
    local pid=$2
    
    if [ -z "$service_name" ] || [ -z "$pid" ]; then
        echo "Error: save_pid requires service_name and pid" >&2
        return 1
    fi
    
    # Create or update JSON file
    if [ -f "$PID_FILE" ]; then
        # Use jq if available
        if command -v jq > /dev/null 2>&1; then
            jq ". + {\"$service_name\": $pid}" "$PID_FILE" > "${PID_FILE}.tmp" && mv "${PID_FILE}.tmp" "$PID_FILE"
        else
            # Fallback: simple JSON manipulation without jq
            local temp_file=$(mktemp)
            local entries=""
            
            # Read existing entries and update/add the service
            if [ -s "$PID_FILE" ]; then
                # Extract all existing entries
                while IFS= read -r line; do
                    local key=$(echo "$line" | cut -d'"' -f2)
                    local value=$(echo "$line" | cut -d':' -f2 | tr -d ' ')
                    if [ "$key" != "$service_name" ] && [ -n "$key" ] && [ -n "$value" ]; then
                        if [ -n "$entries" ]; then
                            entries="$entries,"
                        fi
                        entries="${entries}\"$key\": $value"
                    fi
                done < <(grep -o '"[^"]*":[[:space:]]*[0-9]*' "$PID_FILE" 2>/dev/null || true)
            fi
            
            # Add the new/updated entry
            if [ -n "$entries" ]; then
                entries="$entries, "
            fi
            entries="${entries}\"$service_name\": $pid"
            
            echo "{ $entries }" > "$temp_file"
            mv "$temp_file" "$PID_FILE"
        fi
    else
        echo "{\"$service_name\": $pid}" > "$PID_FILE"
    fi
}

# Read PID for a service
read_pid() {
    local service_name=$1
    
    if [ -z "$service_name" ]; then
        echo "Error: read_pid requires service_name" >&2
        return 1
    fi
    
    if [ ! -f "$PID_FILE" ]; then
        return 1
    fi
    
    # Use jq if available
    if command -v jq > /dev/null 2>&1; then
        jq -r ".[\"$service_name\"] // empty" "$PID_FILE" 2>/dev/null
    else
        # Fallback: grep and sed
        grep -o "\"$service_name\"[[:space:]]*:[[:space:]]*[0-9]*" "$PID_FILE" 2>/dev/null | sed 's/.*:[[:space:]]*//' || echo ""
    fi
}

# Read all PIDs
read_all_pids() {
    if [ ! -f "$PID_FILE" ]; then
        echo "{}"
        return 0
    fi
    
    cat "$PID_FILE"
}

# Check if a process is running
is_process_running() {
    local pid=$1
    
    if [ -z "$pid" ]; then
        return 1
    fi
    
    # Check if process exists
    if kill -0 "$pid" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Validate PID for a service
validate_pid() {
    local service_name=$1
    local pid=$(read_pid "$service_name")
    
    if [ -z "$pid" ]; then
        return 1
    fi
    
    if is_process_running "$pid"; then
        return 0
    else
        # PID exists but process is not running, remove it
        remove_pid "$service_name"
        return 1
    fi
}

# Remove PID for a service
remove_pid() {
    local service_name=$1
    
    if [ -z "$service_name" ]; then
        echo "Error: remove_pid requires service_name" >&2
        return 1
    fi
    
    if [ ! -f "$PID_FILE" ]; then
        return 0
    fi
    
    # Use jq if available
    if command -v jq > /dev/null 2>&1; then
        jq "del(.[\"$service_name\"])" "$PID_FILE" > "${PID_FILE}.tmp" && mv "${PID_FILE}.tmp" "$PID_FILE"
    else
        # Fallback: remove line and clean up
        grep -v "\"$service_name\"" "$PID_FILE" > "${PID_FILE}.tmp" 2>/dev/null && mv "${PID_FILE}.tmp" "$PID_FILE" || true
    fi
}

# Clear all PIDs
clear_all_pids() {
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
}

# Get all service names from PID file
get_service_names() {
    if [ ! -f "$PID_FILE" ]; then
        return 0
    fi
    
    # Use jq if available
    if command -v jq > /dev/null 2>&1; then
        jq -r 'keys[]' "$PID_FILE" 2>/dev/null
    else
        # Fallback: extract keys manually (service names in quotes)
        grep -o '"[^"]*"' "$PID_FILE" 2>/dev/null | sed 's/"//g' | sort -u || true
    fi
}

