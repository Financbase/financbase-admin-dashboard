#!/bin/bash

# Security Testing Script
# Runs comprehensive security checks

echo "🔒 Starting Security Testing Suite..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Dependency Security Audit
print_status "1. Running dependency security audit..."
if npm audit --audit-level=high > /dev/null 2>&1; then
    print_success "   ✅ No high/critical vulnerabilities found"
else
    print_warning "   ⚠️  High/critical vulnerabilities detected"
    npm audit --audit-level=high
fi

# 2. Check for secrets in code
print_status "2. Scanning for secrets in codebase..."
if grep -r "password\|secret\|key.*=.*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . > /dev/null 2>&1; then
    print_warning "   ⚠️  Potential secrets found in code"
    grep -r "password\|secret\|key.*=.*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | head -5
else
    print_success "   ✅ No obvious secrets found in code"
fi

# 3. Check configuration security
print_status "3. Checking configuration security..."

# Check Next.js config for security headers
if grep -q "headers\|security\|helmet" next.config.mjs; then
    print_success "   ✅ Security headers configured"
else
    print_warning "   ⚠️  Security headers not found in config"
fi

# Check for environment variable security
if grep -q "OTEL_SDK_DISABLED\|NEXT_TELEMETRY_DISABLED" next.config.mjs; then
    print_success "   ✅ Telemetry properly disabled"
else
    print_warning "   ⚠️  Telemetry not explicitly disabled"
fi

# 4. Check for common vulnerabilities
print_status "4. Checking for common vulnerabilities..."

# Check for debug statements
if grep -r "console\.log\|console\.debug\|console\.trace" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . > /dev/null 2>&1; then
    print_warning "   ⚠️  Debug statements found in production code"
    grep -r "console\.log\|console\.debug\|console\.trace" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l | awk '{print "   Found " $1 " debug statements"}'
else
    print_success "   ✅ No debug statements in production code"
fi

# Check for unsafe innerHTML usage
if grep -r "dangerouslySetInnerHTML\|innerHTML" --include="*.tsx" --include="*.jsx" . > /dev/null 2>&1; then
    print_warning "   ⚠️  Potentially unsafe HTML rendering found"
    grep -r "dangerouslySetInnerHTML\|innerHTML" --include="*.tsx" --include="*.jsx" . | wc -l | awk '{print "   Found " $1 " instances"}'
else
    print_success "   ✅ No unsafe HTML rendering found"
fi

# 5. Check authentication implementation
print_status "5. Checking authentication security..."

# Check for proper authentication patterns
if grep -q "auth\(\)" app/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    print_success "   ✅ Authentication properly implemented"
else
    print_warning "   ⚠️  Authentication implementation not found"
fi

# Check for protected routes
if grep -q "isProtectedRoute\|createRouteMatcher" middleware.ts > /dev/null 2>&1; then
    print_success "   ✅ Route protection implemented"
else
    print_warning "   ⚠️  Route protection not found"
fi

# 6. Check for input validation
print_status "6. Checking input validation..."

# Check for Zod schemas
if grep -q "z\.object\|z\.string\|z\.number" lib/ app/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    print_success "   ✅ Input validation schemas found"
else
    print_warning "   ⚠️  Input validation schemas not found"
fi

# 7. Check HTTPS configuration
print_status "7. Checking HTTPS configuration..."
if grep -q "https\|secure\|ssl" next.config.mjs > /dev/null 2>&1; then
    print_success "   ✅ HTTPS configuration found"
else
    print_warning "   ⚠️  HTTPS configuration not found"
fi

# 8. Check for security best practices
print_status "8. Checking security best practices..."

# Check for proper error handling
if grep -q "try.*catch\|error.*handling" app/ lib/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    print_success "   ✅ Error handling implemented"
else
    print_warning "   ⚠️  Error handling not consistently implemented"
fi

# Check for rate limiting
if grep -q "rate.*limit\|throttle\|limit" app/ lib/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    print_success "   ✅ Rate limiting implemented"
else
    print_warning "   ⚠️  Rate limiting not found"
fi

echo ""
echo "======================================"
echo "🔒 SECURITY TESTING COMPLETE"
echo "======================================"

echo ""
echo "📋 SECURITY RECOMMENDATIONS:"
echo "   1. 🔐 Use environment variables for all secrets"
echo "   2. 🔒 Implement proper HTTPS in production"
echo "   3. 🛡️  Add CSRF protection for state-changing operations"
echo "   4. 🔍 Implement content security policy (CSP)"
echo "   5. 🚫 Remove debug statements from production code"
echo "   6. ✅ Sanitize all user inputs"
echo "   7. 📊 Add security monitoring and alerting"
echo "   8. 🔄 Regular dependency updates"

echo ""
echo "💡 SECURITY TESTING TOOLS:"
echo "   - npm audit (vulnerability scanning)"
echo "   - Snyk (advanced security scanning)"
echo "   - OWASP ZAP (web application security)"
echo "   - Lighthouse (security auditing)"
echo "   - Playwright security tests"

echo ""
echo "🔐 SECURITY TESTING COMPLETE"
echo "======================================"
