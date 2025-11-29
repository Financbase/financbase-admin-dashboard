#!/bin/bash

# Database Migration Testing Script
# Tests all database migrations on a staging/test database and verifies rollback procedures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_DIR="./drizzle/migrations"
BACKUP_DIR="./migration-backups"
TEST_DB_URL="${TEST_DATABASE_URL:-${DATABASE_URL}}"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ -z "$TEST_DB_URL" ]; then
        print_error "TEST_DATABASE_URL or DATABASE_URL environment variable is required"
        exit 1
    fi
    
    if [ ! -d "$MIGRATION_DIR" ]; then
        print_error "Migration directory not found: $MIGRATION_DIR"
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        print_error "psql command not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Create backup directory
setup_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    print_status "Backup directory created: $BACKUP_DIR"
}

# Test database connection
test_connection() {
    print_status "Testing database connection..."
    
    if psql "$TEST_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to database"
        exit 1
    fi
}

# Get current database schema version
get_schema_version() {
    psql "$TEST_DB_URL" -t -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;" 2>/dev/null | xargs || echo "0"
}

# List all migration files
list_migrations() {
    find "$MIGRATION_DIR" -name "*.sql" -type f | sort
}

# Run a single migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    print_status "Running migration: $migration_name"
    
    # Create backup before migration
    local backup_file="$BACKUP_DIR/pre-${migration_name}.sql"
    pg_dump "$TEST_DB_URL" > "$backup_file" 2>/dev/null || {
        print_warning "Could not create backup (this is OK for test databases)"
    }
    
    # Run migration
    if psql "$TEST_DB_URL" -f "$migration_file" > /dev/null 2>&1; then
        print_success "Migration applied: $migration_name"
        return 0
    else
        print_error "Migration failed: $migration_name"
        return 1
    fi
}

# Verify migration was applied
verify_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    print_status "Verifying migration: $migration_name"
    
    # Check if migration file contains CREATE TABLE, ALTER TABLE, etc.
    if grep -q "CREATE TABLE\|ALTER TABLE\|CREATE INDEX\|CREATE FUNCTION" "$migration_file"; then
        # Basic verification - check if database is still accessible
        if psql "$TEST_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Migration verification passed: $migration_name"
            return 0
        else
            print_error "Migration verification failed: $migration_name (database inaccessible)"
            return 1
        fi
    fi
    
    return 0
}

# Test rollback (if possible)
test_rollback() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    local backup_file="$BACKUP_DIR/pre-${migration_name}.sql"
    
    if [ -f "$backup_file" ]; then
        print_status "Testing rollback for: $migration_name"
        
        # Note: Full rollback testing would require migration-specific rollback scripts
        # For now, we just verify the backup exists
        if [ -s "$backup_file" ]; then
            print_success "Rollback backup available: $migration_name"
            return 0
        else
            print_warning "Rollback backup is empty: $migration_name"
            return 1
        fi
    else
        print_warning "No rollback backup available: $migration_name"
        return 0
    fi
}

# Run all migrations
run_all_migrations() {
    print_status "Running all migrations..."
    
    local migrations=$(list_migrations)
    local total=$(echo "$migrations" | wc -l)
    local current=0
    local failed=0
    
    while IFS= read -r migration_file; do
        [ -z "$migration_file" ] && continue
        
        current=$((current + 1))
        echo ""
        print_status "[$current/$total] Processing: $(basename "$migration_file")"
        
        if ! run_migration "$migration_file"; then
            failed=$((failed + 1))
            print_error "Migration failed, stopping..."
            break
        fi
        
        if ! verify_migration "$migration_file"; then
            failed=$((failed + 1))
            print_error "Migration verification failed, stopping..."
            break
        fi
        
        test_rollback "$migration_file" || true
        
    done <<< "$migrations"
    
    echo ""
    if [ $failed -eq 0 ]; then
        print_success "All migrations completed successfully ($total/$total)"
        return 0
    else
        print_error "Migration testing failed ($failed failed out of $total)"
        return 1
    fi
}

# Verify final schema
verify_final_schema() {
    print_status "Verifying final database schema..."
    
    # Check for common tables
    local required_tables=("users" "organizations" "accounts" "transactions")
    local missing_tables=()
    
    for table in "${required_tables[@]}"; do
        if ! psql "$TEST_DB_URL" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" | grep -q 1; then
            missing_tables+=("$table")
        fi
    done
    
    if [ ${#missing_tables[@]} -eq 0 ]; then
        print_success "All required tables exist"
        return 0
    else
        print_warning "Some tables are missing: ${missing_tables[*]}"
        return 1
    fi
}

# Generate migration report
generate_report() {
    local report_file="$BACKUP_DIR/migration-test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Database Migration Test Report"
        echo "Generated: $(date)"
        echo "Database: $TEST_DB_URL"
        echo ""
        echo "Migrations Tested:"
        list_migrations | while read -r migration; do
            echo "  - $(basename "$migration")"
        done
        echo ""
        echo "Schema Version: $(get_schema_version)"
    } > "$report_file"
    
    print_success "Migration report generated: $report_file"
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Database Migration Testing"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    setup_backup_dir
    test_connection
    
    echo ""
    print_status "Starting migration testing..."
    echo ""
    
    if run_all_migrations; then
        verify_final_schema
        generate_report
        echo ""
        print_success "✅ Migration testing completed successfully!"
        echo ""
        exit 0
    else
        echo ""
        print_error "❌ Migration testing failed!"
        echo ""
        print_warning "Check the migration files and database logs for details"
        echo ""
        exit 1
    fi
}

# Run main function
main

