#!/bin/bash

# Script to apply careers tables migration
# Usage: ./scripts/apply-careers-migration.sh

set -e

echo "🚀 Applying Careers Tables Migration..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "   Please set it in your .env.local file or export it"
    exit 1
fi

# Find the migration file
MIGRATION_FILE="drizzle/migrations/XXXX_careers_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Found migration file: $MIGRATION_FILE"
echo "🔗 Database: ${DATABASE_URL%%\?*}" # Show URL without query params

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "✅ Using psql to apply migration..."
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    echo "✅ Migration applied successfully!"
elif command -v node &> /dev/null; then
    echo "✅ Using Node.js to apply migration..."
    node -e "
        const { neon } = require('@neondatabase/serverless');
        const fs = require('fs');
        const sql = neon(process.env.DATABASE_URL);
        const migration = fs.readFileSync('$MIGRATION_FILE', 'utf8');
        (async () => {
            try {
                await sql(migration);
                console.log('✅ Migration applied successfully!');
            } catch (error) {
                console.error('❌ Migration failed:', error.message);
                process.exit(1);
            }
        })();
    "
else
    echo "❌ Neither psql nor node found. Please install one of them."
    echo "   Or manually run the SQL file against your database"
    exit 1
fi

echo ""
echo "✅ Careers tables created successfully!"
echo "📝 Next steps:"
echo "   1. Test the API: curl http://localhost:3001/api/careers"
echo "   2. Access admin: http://localhost:3001/admin/careers"
echo "   3. View public page: http://localhost:3001/careers"

