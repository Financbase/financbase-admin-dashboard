#!/bin/bash

# Script to run the multi-organization support migration
# Usage: ./scripts/run-multi-org-migration.sh

set -e

echo "🚀 Running Multi-Organization Support Migration"
echo "================================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this migration"
    exit 1
fi

# Get the migration file path
MIGRATION_FILE="drizzle/migrations/0065_multi_organization_support.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  Warning: psql not found. You may need to run the migration manually."
    echo "You can execute the SQL file directly using your database client."
    echo ""
    echo "To run manually:"
    echo "  psql \$DATABASE_URL -f $MIGRATION_FILE"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run the migration
echo "🔄 Executing migration..."
if psql "$DATABASE_URL" -f "$MIGRATION_FILE"; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify the migration by checking your database"
    echo "2. Test organization switching functionality"
    echo "3. Verify RLS policies are working correctly"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

