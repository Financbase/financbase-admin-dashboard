#!/bin/bash

# Track test coverage trends over time
# Run this script weekly to track coverage improvements

set -e

COVERAGE_DIR="coverage"
TRENDS_FILE="docs/coverage-trends.md"
SUMMARY_FILE="$COVERAGE_DIR/coverage-summary.json"

# Ensure coverage directory exists
mkdir -p "$COVERAGE_DIR"
mkdir -p "$(dirname "$TRENDS_FILE")"

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Extract coverage metrics
if [ -f "$SUMMARY_FILE" ]; then
  LINES=$(cat "$SUMMARY_FILE" | jq -r '.total.lines.pct')
  STATEMENTS=$(cat "$SUMMARY_FILE" | jq -r '.total.statements.pct')
  FUNCTIONS=$(cat "$SUMMARY_FILE" | jq -r '.total.functions.pct')
  BRANCHES=$(cat "$SUMMARY_FILE" | jq -r '.total.branches.pct')
  DATE=$(date +"%Y-%m-%d")
  
  # Append to trends file
  if [ ! -f "$TRENDS_FILE" ]; then
    cat > "$TRENDS_FILE" << EOF
# Test Coverage Trends

This file tracks test coverage over time.

| Date | Lines | Statements | Functions | Branches | Notes |
|------|-------|------------|-----------|----------|-------|
EOF
  fi
  
  echo "| $DATE | ${LINES}% | ${STATEMENTS}% | ${FUNCTIONS}% | ${BRANCHES}% | |" >> "$TRENDS_FILE"
  
  echo ""
  echo "✅ Coverage tracked successfully!"
  echo "📊 Current Coverage:"
  echo "   Lines: ${LINES}%"
  echo "   Statements: ${STATEMENTS}%"
  echo "   Functions: ${FUNCTIONS}%"
  echo "   Branches: ${BRANCHES}%"
  echo ""
  echo "📈 Trends saved to: $TRENDS_FILE"
else
  echo "❌ Coverage summary file not found: $SUMMARY_FILE"
  exit 1
fi

