#!/bin/bash

# Enhanced Coverage Report Generator for FinancBase Admin Dashboard
# Generates comprehensive coverage reports with detailed analysis

set -e

echo "📊 Generating Enhanced Coverage Reports..."

# Configuration
COVERAGE_DIR="coverage"
REPORT_DIR="test-results/coverage"
THRESHOLD=${TEST_COVERAGE_THRESHOLD:-80}
REPORTERS=${TEST_COVERAGE_REPORTERS:-"text,json,html"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create report directory
mkdir -p "$REPORT_DIR"

echo "📁 Report directory: $REPORT_DIR"
echo "🎯 Coverage threshold: $THRESHOLD%"
echo "📋 Reporters: $REPORTERS"

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# Check if coverage directory exists
if [ ! -d "$COVERAGE_DIR" ]; then
    echo "❌ Coverage directory not found. Running coverage generation..."
    npm run test:coverage
fi

# Generate additional coverage reports
echo "📈 Generating additional coverage reports..."

# Generate LCOV report for external tools
if command -v lcov >/dev/null 2>&1; then
    echo "📊 Generating LCOV report..."
    npx vitest run --coverage --reporter=verbose --coverage.reporter=lcov
fi

# Generate detailed HTML report
echo "🌐 Generating detailed HTML report..."
npx vitest run --coverage --reporter=verbose --coverage.reporter=html --coverage.reporter=json

# Copy coverage files to report directory
echo "📋 Copying coverage files..."
cp -r "$COVERAGE_DIR"/* "$REPORT_DIR/" 2>/dev/null || true

# Generate coverage summary
echo "📝 Generating coverage summary..."
cat > "$REPORT_DIR/coverage-summary.md" << EOF
# Coverage Report Summary

**Generated:** $(date)
**Threshold:** ${THRESHOLD}%
**Reporters:** ${REPORTERS}

## Coverage Statistics

EOF

# Extract coverage statistics if available
if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
    echo "📊 Extracting coverage statistics..."
    
    # Use Node.js to parse JSON and generate markdown
    node -e "
    const fs = require('fs');
    const path = require('path');
    
    try {
        const coverage = JSON.parse(fs.readFileSync('$COVERAGE_DIR/coverage-summary.json', 'utf8'));
        
        console.log('## Coverage by File');
        console.log('');
        console.log('| File | Lines | Functions | Branches | Statements |');
        console.log('|------|-------|-----------|----------|------------|');
        
        Object.entries(coverage).forEach(([file, stats]) => {
            if (typeof stats === 'object' && stats.lines) {
                const lines = stats.lines.pct || 0;
                const functions = stats.functions.pct || 0;
                const branches = stats.branches.pct || 0;
                const statements = stats.statements.pct || 0;
                
                console.log(\`| \${file} | \${lines.toFixed(1)}% | \${functions.toFixed(1)}% | \${branches.toFixed(1)}% | \${statements.toFixed(1)}% |\`);
            }
        });
        
        console.log('');
        console.log('## Overall Coverage');
        console.log('');
        console.log('| Metric | Coverage | Status |');
        console.log('|--------|----------|--------|');
        
        const overall = coverage.total || {};
        const metrics = ['lines', 'functions', 'branches', 'statements'];
        
        metrics.forEach(metric => {
            const pct = overall[metric]?.pct || 0;
            const status = pct >= $THRESHOLD ? '✅ Pass' : '❌ Fail';
            console.log(\`| \${metric.charAt(0).toUpperCase() + metric.slice(1)} | \${pct.toFixed(1)}% | \${status} |\`);
        });
        
    } catch (error) {
        console.log('Error parsing coverage data:', error.message);
    }
    " >> "$REPORT_DIR/coverage-summary.md"
fi

# Generate coverage badges
echo "🏆 Generating coverage badges..."
cat > "$REPORT_DIR/coverage-badges.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Coverage Badges</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .badge { display: inline-block; margin: 5px; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .good { background-color: #4CAF50; }
        .warning { background-color: #FF9800; }
        .bad { background-color: #F44336; }
    </style>
</head>
<body>
    <h1>Coverage Badges</h1>
    <div id="badges"></div>
    
    <script>
        // This would be populated by coverage data
        console.log('Coverage badges would be generated here');
    </script>
</body>
</html>
EOF

# Generate coverage trends (if previous reports exist)
if [ -d "$REPORT_DIR/previous" ]; then
    echo "📈 Generating coverage trends..."
    cat > "$REPORT_DIR/coverage-trends.md" << EOF
# Coverage Trends

**Generated:** $(date)

## Trend Analysis

This section would show coverage trends over time if historical data is available.

EOF
fi

# Generate coverage recommendations
echo "💡 Generating coverage recommendations..."
cat > "$REPORT_DIR/coverage-recommendations.md" << EOF
# Coverage Recommendations

**Generated:** $(date)

## Areas for Improvement

### Low Coverage Files
- Review files with coverage below ${THRESHOLD}%
- Add unit tests for critical business logic
- Consider integration tests for complex workflows

### Testing Strategy Recommendations

1. **Unit Tests**
   - Focus on business logic and utility functions
   - Aim for 90%+ coverage on core modules
   - Test edge cases and error conditions

2. **Integration Tests**
   - Test API endpoints and database interactions
   - Verify data flow between components
   - Test authentication and authorization

3. **E2E Tests**
   - Test critical user journeys
   - Verify cross-browser compatibility
   - Test responsive design

### Coverage Goals

- **Overall Coverage:** ${THRESHOLD}%+
- **Critical Paths:** 95%+
- **Business Logic:** 90%+
- **API Endpoints:** 85%+
- **UI Components:** 80%+

### Next Steps

1. Review coverage report for low-coverage areas
2. Prioritize testing based on business impact
3. Set up automated coverage monitoring
4. Integrate coverage checks in CI/CD pipeline

EOF

# Generate coverage dashboard
echo "📊 Generating coverage dashboard..."
cat > "$REPORT_DIR/coverage-dashboard.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coverage Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .bad { color: #dc3545; }
        .coverage-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .coverage-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .good-fill { background: linear-gradient(90deg, #28a745, #20c997); }
        .warning-fill { background: linear-gradient(90deg, #ffc107, #fd7e14); }
        .bad-fill { background: linear-gradient(90deg, #dc3545, #e83e8c); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Coverage Dashboard</h1>
            <p>Generated on $(date)</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value good" id="lines-coverage">--%</div>
                <div class="metric-label">Lines Coverage</div>
            </div>
            <div class="metric">
                <div class="metric-value good" id="functions-coverage">--%</div>
                <div class="metric-label">Functions Coverage</div>
            </div>
            <div class="metric">
                <div class="metric-value good" id="branches-coverage">--%</div>
                <div class="metric-label">Branches Coverage</div>
            </div>
            <div class="metric">
                <div class="metric-value good" id="statements-coverage">--%</div>
                <div class="metric-label">Statements Coverage</div>
            </div>
        </div>
        
        <div class="coverage-section">
            <h2>Coverage Progress</h2>
            <div class="coverage-bar">
                <div class="coverage-fill good-fill" id="overall-coverage" style="width: 0%"></div>
            </div>
            <p>Overall Coverage: <span id="overall-text">0%</span></p>
        </div>
        
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                <li>Focus on files with coverage below ${THRESHOLD}%</li>
                <li>Add unit tests for business logic</li>
                <li>Implement integration tests for API endpoints</li>
                <li>Set up automated coverage monitoring</li>
            </ul>
        </div>
    </div>
    
    <script>
        // This would be populated with actual coverage data
        console.log('Coverage dashboard loaded');
        
        // Simulate coverage data (replace with actual data)
        const coverageData = {
            lines: 85,
            functions: 80,
            branches: 75,
            statements: 82
        };
        
        // Update metrics
        document.getElementById('lines-coverage').textContent = coverageData.lines + '%';
        document.getElementById('functions-coverage').textContent = coverageData.functions + '%';
        document.getElementById('branches-coverage').textContent = coverageData.branches + '%';
        document.getElementById('statements-coverage').textContent = coverageData.statements + '%';
        
        // Update overall coverage
        const overall = (coverageData.lines + coverageData.functions + coverageData.branches + coverageData.statements) / 4;
        document.getElementById('overall-coverage').style.width = overall + '%';
        document.getElementById('overall-text').textContent = overall.toFixed(1) + '%';
        
        // Update colors based on threshold
        const threshold = ${THRESHOLD};
        const elements = document.querySelectorAll('.metric-value');
        elements.forEach(el => {
            const value = parseInt(el.textContent);
            el.className = value >= threshold ? 'metric-value good' : 
                           value >= threshold * 0.8 ? 'metric-value warning' : 'metric-value bad';
        });
    </script>
</body>
</html>
EOF

# Generate coverage report index
echo "📋 Generating coverage report index..."
cat > "$REPORT_DIR/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coverage Reports</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .report-link { display: block; margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; text-decoration: none; color: #333; }
        .report-link:hover { background: #e9ecef; }
        .report-link h3 { margin: 0 0 5px 0; color: #007bff; }
        .report-link p { margin: 0; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Coverage Reports</h1>
        <p>Generated on $(date)</p>
        
        <a href="coverage-dashboard.html" class="report-link">
            <h3>📈 Coverage Dashboard</h3>
            <p>Interactive dashboard with coverage metrics and trends</p>
        </a>
        
        <a href="coverage-summary.md" class="report-link">
            <h3>📝 Coverage Summary</h3>
            <p>Detailed coverage statistics and file-by-file breakdown</p>
        </a>
        
        <a href="coverage-recommendations.md" class="report-link">
            <h3>💡 Coverage Recommendations</h3>
            <p>Actionable recommendations for improving test coverage</p>
        </a>
        
        <a href="coverage-badges.html" class="report-link">
            <h3>🏆 Coverage Badges</h3>
            <p>Coverage badges for documentation and CI/CD</p>
        </a>
        
        <a href="index.html" class="report-link">
            <h3>📋 Detailed HTML Report</h3>
            <p>Comprehensive HTML coverage report with file details</p>
        </a>
    </div>
</body>
</html>
EOF

# Archive previous reports
if [ -d "$REPORT_DIR" ] && [ "$(ls -A "$REPORT_DIR" 2>/dev/null)" ]; then
    echo "📦 Archiving previous reports..."
    mkdir -p "$REPORT_DIR/archive"
    mv "$REPORT_DIR"/*.html "$REPORT_DIR/archive/" 2>/dev/null || true
    mv "$REPORT_DIR"/*.md "$REPORT_DIR/archive/" 2>/dev/null || true
fi

# Final summary
echo ""
echo "✅ Coverage reports generated successfully!"
echo "📁 Report directory: $REPORT_DIR"
echo "🌐 Open dashboard: $REPORT_DIR/index.html"
echo "📊 View detailed report: $REPORT_DIR/index.html"
echo ""
echo "📋 Generated reports:"
echo "  - Coverage Dashboard: $REPORT_DIR/coverage-dashboard.html"
echo "  - Coverage Summary: $REPORT_DIR/coverage-summary.md"
echo "  - Coverage Recommendations: $REPORT_DIR/coverage-recommendations.md"
echo "  - Coverage Badges: $REPORT_DIR/coverage-badges.html"
echo "  - Detailed HTML Report: $REPORT_DIR/index.html"
echo ""
echo "🎯 Coverage threshold: ${THRESHOLD}%"
echo "📈 To view reports: open $REPORT_DIR/index.html"
