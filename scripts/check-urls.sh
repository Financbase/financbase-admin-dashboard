#!/bin/bash

BASE_URL="http://localhost:3002"
ROUTES=(
  "" 
  "/about" 
  "/analytics" 
  "/blog" 
  "/careers" 
  "/contact" 
  "/docs" 
  "/guides" 
  "/home" 
  "/legal" 
  "/pricing" 
  "/privacy" 
  "/security" 
  "/support" 
  "/team-collaboration" 
  "/terms"
)

echo "Checking public routes on $BASE_URL..."
echo "----------------------------------------"

for route in "${ROUTES[@]}"; do
  url="$BASE_URL$route"
  status_code=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  
  if [ "$status_code" -eq 200 ]; then
    echo "✅ $url - $status_code OK"
  else
    echo "❌ $url - $status_code ERROR"
  fi
  
  # Small delay between requests
  sleep 0.5
done

echo "----------------------------------------"
echo "Check complete."
