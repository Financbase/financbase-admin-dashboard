#!/bin/bash

# Security Audit Script
# Runs comprehensive security checks and verifies all security fixes are in place

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUDIT_REPORT_DIR="./security-audit-reports"
AUDIT_REPORT_FILE="$AUDIT_REPORT_DIR/security-audit-$(date +%Y%m%d-%H%M%S).txt"

# Functions
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

# Create report directory
setup_report_dir() {
    mkdir -p "$AUDIT_REPORT_DIR"
}

# Check for hardcoded secrets
check_hardcoded_secrets() {
    print_status "Checking for hardcoded secrets..."
    
    local issues=0
    
    # Check for common secret patterns
    if grep -r "sk_live_\|pk_live_\|sk_test_\|pk_test_" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage \
        --exclude="*.test.ts" --exclude="*.test.tsx" --exclude="*.spec.ts" 2>/dev/null | grep -v "//.*test\|//.*example\|//.*placeholder"; then
        print_error "Potential hardcoded secrets found!"
        issues=$((issues + 1))
    else
        print_success "No hardcoded secrets detected"
    fi
    
    return $issues
}

# Verify security fixes are in place
verify_security_fixes() {
    print_status "Verifying security fixes..."
    
    local issues=0
    
    # Check for authentication in API routes
    print_status "Checking API route authentication..."
    if grep -r "export.*GET\|export.*POST\|export.*PUT\|export.*DELETE" app/api --include="route.ts" \
        | grep -v "auth()\|clerkAuth\|requireAuth" | head -5; then
        print_warning "Some API routes may be missing authentication checks"
        issues=$((issues + 1))
    else
        print_success "API routes appear to have authentication"
    fi
    
    # Check for SQL injection prevention (using parameterized queries)
    print_status "Checking SQL injection prevention..."
    if grep -r "sql\`.*\$\{" --include="*.ts" --include="*.tsx" \
        --exclude-dir=node_modules --exclude-dir=.next \
        --exclude="*.test.ts" --exclude="*.spec.ts" 2>/dev/null | grep -v "drizzle\|pg\."; then
        print_warning "Potential SQL injection risks found (raw SQL with variables)"
        issues=$((issues + 1))
    else
        print_success "SQL injection prevention appears to be in place"
    fi
    
    # Check for XSS prevention (input sanitization)
    print_status "Checking XSS prevention..."
    if grep -r "dangerouslySetInnerHTML\|innerHTML" --include="*.tsx" \
        --exclude-dir=node_modules --exclude-dir=.next \
        --exclude="*.test.tsx" --exclude="*.spec.tsx" 2>/dev/null | grep -v "DOMPurify\|sanitize"; then
        print_warning "Potential XSS risks found (unsanitized HTML)"
        issues=$((issues + 1))
    else
        print_success "XSS prevention appears to be in place"
    fi
    
    # Check security headers in next.config.mjs
    print_status "Checking security headers configuration..."
    if grep -q "X-Frame-Options\|X-Content-Type-Options\|Strict-Transport-Security\|Content-Security-Policy" next.config.mjs; then
        print_success "Security headers configured"
    else
        print_warning "Security headers may not be fully configured"
        issues=$((issues + 1))
    fi
    
    return $issues
}

# Run npm audit
run_npm_audit() {
    print_status "Running npm audit..."
    
    if npm audit --audit-level=moderate > "$AUDIT_REPORT_DIR/npm-audit.txt" 2>&1; then
        print_success "npm audit passed"
        return 0
    else
        print_warning "npm audit found vulnerabilities (check $AUDIT_REPORT_DIR/npm-audit.txt)"
        return 1
    fi
}

# Check for exposed environment variables
check_exposed_env_vars() {
    print_status "Checking for exposed environment variables..."
    
    local issues=0
    
    # Check if .env files are in .gitignore
    if ! grep -q "\.env" .gitignore 2>/dev/null; then
        print_warning ".env files may not be in .gitignore"
        issues=$((issues + 1))
    else
        print_success ".env files are in .gitignore"
    fi
    
    # Check for .env files in repository
    if find . -name ".env*" -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null | grep -v ".env.example\|.env.test.local"; then
        print_error "Found .env files in repository (should not be committed)"
        issues=$((issues + 1))
    else
        print_success "No .env files found in repository"
    fi
    
    return $issues
}

# Verify authentication middleware
verify_auth_middleware() {
    print_status "Verifying authentication middleware..."
    
    if [ -f "middleware.ts" ] || [ -f "middleware.ts.enabled" ]; then
        local middleware_file="middleware.ts"
        [ -f "middleware.ts.enabled" ] && middleware_file="middleware.ts.enabled"
        
        if grep -q "clerkMiddleware\|authMiddleware" "$middleware_file"; then
            print_success "Authentication middleware is configured"
            return 0
        else
            print_warning "Authentication middleware may not be properly configured"
            return 1
        fi
    else
        print_error "Authentication middleware file not found"
        return 1
    fi
}

# Check for rate limiting
check_rate_limiting() {
    print_status "Checking rate limiting configuration..."
    
    if grep -r "arcjet\|rateLimit\|rate-limit" --include="*.ts" --include="*.tsx" \
        --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | head -1; then
        print_success "Rate limiting appears to be configured"
        return 0
    else
        print_warning "Rate limiting may not be configured"
        return 1
    fi
}

# Generate security audit report
generate_report() {
    {
        echo "Security Audit Report"
        echo "Generated: $(date)"
        echo "=========================================="
        echo ""
        echo "Checks Performed:"
        echo "  - Hardcoded secrets check"
        echo "  - Security fixes verification"
        echo "  - npm audit"
        echo "  - Exposed environment variables check"
        echo "  - Authentication middleware verification"
        echo "  - Rate limiting check"
        echo ""
    } > "$AUDIT_REPORT_FILE"
    
    print_success "Security audit report generated: $AUDIT_REPORT_FILE"
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Security Audit"
    echo "=========================================="
    echo ""
    
    setup_report_dir
    
    local total_issues=0
    
    check_hardcoded_secrets || total_issues=$((total_issues + $?))
    verify_security_fixes || total_issues=$((total_issues + $?))
    run_npm_audit || total_issues=$((total_issues + $?))
    check_exposed_env_vars || total_issues=$((total_issues + $?))
    verify_auth_middleware || total_issues=$((total_issues + $?))
    check_rate_limiting || total_issues=$((total_issues + $?))
    
    generate_report
    
    echo ""
    if [ $total_issues -eq 0 ]; then
        print_success "✅ Security audit passed!"
        echo ""
        exit 0
    else
        print_warning "⚠️  Security audit completed with $total_issues issue(s)"
        echo ""
        print_status "Review the audit report for details: $AUDIT_REPORT_FILE"
        echo ""
        exit 1
    fi
}

# Run main function
main

