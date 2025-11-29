#!/bin/bash

# Script to find and update RLS policies to use app.current_org_id
# This script identifies policies that need updating and generates SQL

set -e

echo "🔍 Finding RLS Policies to Update"
echo "=================================="
echo ""

# Find all migration files with RLS policies
MIGRATION_FILES=$(find drizzle/migrations -name "*.sql" -type f | sort)

echo "📋 Migration files found:"
echo "$MIGRATION_FILES"
echo ""

# Pattern to find policies that need updating
PATTERN="organization_id IN \([\s\n]*SELECT organization_id FROM financbase\.users WHERE id = current_setting\('app\.current_user_id'"

echo "🔎 Searching for policies that need updating..."
echo ""

FOUND=0
for file in $MIGRATION_FILES; do
  if grep -q "$PATTERN" "$file" 2>/dev/null; then
    echo "⚠️  Found policies in: $file"
    FOUND=$((FOUND + 1))
  fi
done

if [ $FOUND -eq 0 ]; then
  echo "✅ No policies found matching the old pattern"
  echo "   (This might mean they're already updated or use a different pattern)"
else
  echo ""
  echo "📊 Found $FOUND file(s) with policies that may need updating"
  echo ""
  echo "💡 To update these policies:"
  echo "   1. Review each file manually"
  echo "   2. Replace the pattern:"
  echo "      organization_id IN (SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid)"
  echo "   With:"
  echo "      organization_id = current_setting('app.current_org_id', true)::uuid"
  echo ""
  echo "   3. Or run the migration: drizzle/migrations/0066_update_rls_policies_for_active_org.sql"
fi

echo ""
echo "📝 See docs/organizations/RLS_POLICY_UPDATE_GUIDE.md for detailed instructions"

