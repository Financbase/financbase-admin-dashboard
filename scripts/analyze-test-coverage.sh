#!/bin/bash

# Test Coverage Analysis Script
# Analyzes current test coverage and identifies gaps

set -e

echo "📊 Test Coverage Analysis"
echo "========================="
echo ""

# Configuration
COVERAGE_DIR="coverage"
REPORT_FILE="test-coverage-analysis.md"
THRESHOLD=80

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run tests with coverage (continue on error to get partial coverage)
echo "🧪 Running tests with coverage..."
pnpm test:coverage || true

# Check if coverage directory exists
if [ ! -d "$COVERAGE_DIR" ]; then
    echo "❌ Coverage directory not found. Run 'pnpm test:coverage' first."
    exit 1
fi

# Check for coverage-summary.json
if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
    echo "✅ Coverage data found"
    echo ""
    
    # Extract coverage metrics
    COVERAGE_DATA=$(cat "$COVERAGE_DIR/coverage-summary.json")
    
    # Parse coverage percentages
    LINES=$(echo "$COVERAGE_DATA" | grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d: -f2)
    STATEMENTS=$(echo "$COVERAGE_DATA" | grep -o '"statements":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d: -f2)
    FUNCTIONS=$(echo "$COVERAGE_DATA" | grep -o '"functions":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d: -f2)
    BRANCHES=$(echo "$COVERAGE_DATA" | grep -o '"branches":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d: -f2)
    
    # Display summary
    echo "📈 Coverage Summary:"
    echo "-------------------"
    printf "Lines:       %6.2f%% " "$LINES"
    if (( $(echo "$LINES >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Below threshold${NC}"
    fi
    
    printf "Statements:  %6.2f%% " "$STATEMENTS"
    if (( $(echo "$STATEMENTS >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Below threshold${NC}"
    fi
    
    printf "Functions:   %6.2f%% " "$FUNCTIONS"
    if (( $(echo "$FUNCTIONS >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Below threshold${NC}"
    fi
    
    printf "Branches:    %6.2f%% " "$BRANCHES"
    if (( $(echo "$BRANCHES >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Below threshold${NC}"
    fi
    
    echo ""
    
    # Calculate overall status
    OVERALL=$(echo "scale=2; ($LINES + $STATEMENTS + $FUNCTIONS + $BRANCHES) / 4" | bc)
    
    echo "Overall Coverage: ${OVERALL}%"
    if (( $(echo "$OVERALL >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅ Meets ${THRESHOLD}% threshold${NC}"
    else
        echo -e "${YELLOW}⚠️  Below ${THRESHOLD}% threshold${NC}"
        GAP=$(echo "scale=2; $THRESHOLD - $OVERALL" | bc)
        echo "Gap: ${GAP}%"
    fi
    
    echo ""
fi

# Analyze HTML coverage report if available
if [ -f "$COVERAGE_DIR/index.html" ]; then
    echo "📄 Detailed coverage report available at:"
    echo "   file://$(pwd)/$COVERAGE_DIR/index.html"
    echo ""
    echo "💡 Open in browser to see file-by-file coverage"
    echo ""
fi

# Check for files with low coverage
echo "🔍 Analyzing file-level coverage..."
echo ""

# Use vitest coverage report if available
if command -v node &> /dev/null; then
    cat > /tmp/analyze-coverage.js << 'EOF'
const fs = require('fs');
const path = require('path');

const coverageDir = process.argv[2] || 'coverage';
const threshold = parseFloat(process.argv[3] || '80');

try {
  const summaryPath = path.join(coverageDir, 'coverage-summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.log('Coverage summary not found');
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const lowCoverageFiles = [];

  function analyzeDir(obj, filePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = filePath ? `${filePath}/${key}` : key;
      
      if (value.lines && typeof value.lines.pct === 'number') {
        const coverage = value.lines.pct;
        if (coverage < threshold && !currentPath.includes('node_modules')) {
          lowCoverageFiles.push({
            path: currentPath,
            lines: coverage.toFixed(2),
            statements: value.statements?.pct?.toFixed(2) || 'N/A',
            functions: value.functions?.pct?.toFixed(2) || 'N/A',
            branches: value.branches?.pct?.toFixed(2) || 'N/A',
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        analyzeDir(value, currentPath);
      }
    }
  }

  analyzeDir(summary);

  if (lowCoverageFiles.length > 0) {
    console.log(`\n⚠️  Files below ${threshold}% coverage:\n`);
    console.log('File Path | Lines | Statements | Functions | Branches');
    console.log('----------|-------|------------|-----------|----------');
    
    lowCoverageFiles
      .sort((a, b) => parseFloat(a.lines) - parseFloat(b.lines))
      .slice(0, 20) // Show top 20
      .forEach(file => {
        console.log(`${file.path} | ${file.lines}% | ${file.statements}% | ${file.functions}% | ${file.branches}%`);
      });
    
    if (lowCoverageFiles.length > 20) {
      console.log(`\n... and ${lowCoverageFiles.length - 20} more files`);
    }
    
    console.log(`\n📝 Total files needing attention: ${lowCoverageFiles.length}`);
  } else {
    console.log(`\n✅ All files meet ${threshold}% coverage threshold!`);
  }
} catch (error) {
  console.error('Error analyzing coverage:', error.message);
  process.exit(1);
}
EOF

    node /tmp/analyze-coverage.js "$COVERAGE_DIR" "$THRESHOLD"
    rm /tmp/analyze-coverage.js
fi

echo ""
echo "✅ Coverage analysis complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review files with low coverage"
echo "2. Prioritize critical paths (lib/, app/api/)"
echo "3. Add tests for uncovered code"
echo "4. Re-run analysis after adding tests"

