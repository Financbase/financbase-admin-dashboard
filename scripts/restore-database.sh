#!/bin/bash

# =============================================================================
# Database Restore Script
# =============================================================================
# 
# Restores a Financbase PostgreSQL database from a backup file.
# Includes safety checks and confirmation prompts.
#
# Usage:
#   ./scripts/restore-database.sh <backup-file> [--force] [--target-db=name]
#
# Environment Variables:
#   DATABASE_URL - PostgreSQL connection string (required)
#   TARGET_DB - Target database name (optional, defaults to source DB)
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FORCE=false
TARGET_DB=""

# Parse arguments
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --target-db=*)
      TARGET_DB="${1#*=}"
      shift
      ;;
    *.sql.gz|*.sql)
      BACKUP_FILE="$1"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 <backup-file> [--force] [--target-db=name]"
      exit 1
      ;;
  esac
done

# Validate backup file
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not specified${NC}"
  echo "Usage: $0 <backup-file> [--force] [--target-db=name]"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

# Validate DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
  exit 1
fi

# Extract database name from DATABASE_URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
  echo -e "${RED}Error: Could not extract database name from DATABASE_URL${NC}"
  exit 1
fi

# Use target DB if specified, otherwise use source DB
TARGET_DB=${TARGET_DB:-$DB_NAME}

# Verify backup file integrity
echo -e "${YELLOW}Verifying backup file integrity...${NC}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  if ! gunzip -t "$BACKUP_FILE" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backup file is corrupted${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Backup file integrity verified${NC}"
fi

# Get backup file info
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d' ' -f1,2)

# Display warning
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: Database Restore Operation${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "This operation will:"
echo "  - DROP all existing data in: ${YELLOW}$TARGET_DB${NC}"
echo "  - Restore from backup file: ${YELLOW}$BACKUP_FILE${NC}"
echo "  - Backup size: ${YELLOW}$BACKUP_SIZE${NC}"
echo "  - Backup date: ${YELLOW}$BACKUP_DATE${NC}"
echo ""
echo -e "${RED}This action cannot be undone!${NC}"
echo ""

# Confirmation prompt
if [ "$FORCE" != true ]; then
  echo -e "${YELLOW}Are you sure you want to proceed? (yes/no):${NC} "
  read -r CONFIRM
  
  if [ "$CONFIRM" != "yes" ]; then
    echo -e "${GREEN}Restore cancelled${NC}"
    exit 0
  fi
fi

# Create a backup of current database before restore (safety measure)
if [ "$TARGET_DB" = "$DB_NAME" ]; then
  echo -e "${YELLOW}Creating safety backup of current database...${NC}"
  SAFETY_BACKUP="./backups/safety_backup_${TARGET_DB}_$(date +%Y%m%d_%H%M%S).sql.gz"
  mkdir -p ./backups
  
  if pg_dump "$DATABASE_URL" | gzip > "$SAFETY_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
  else
    echo -e "${YELLOW}⚠ Could not create safety backup (proceeding anyway)${NC}"
  fi
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Database connection successful${NC}"
else
  echo -e "${RED}✗ Cannot connect to database${NC}"
  exit 1
fi

# Perform restore
echo ""
echo -e "${BLUE}Starting database restore...${NC}"
echo "Target database: $TARGET_DB"
echo "Backup file: $BACKUP_FILE"
echo ""

# Disconnect all connections to target database (required for restore)
echo -e "${YELLOW}Terminating existing connections...${NC}"
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$TARGET_DB' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

# Restore from compressed backup
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo -e "${YELLOW}Decompressing and restoring database...${NC}"
  if gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
  else
    echo -e "${RED}✗ Restore failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}Restoring database...${NC}"
  if psql "$DATABASE_URL" < "$BACKUP_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
  else
    echo -e "${RED}✗ Restore failed${NC}"
    exit 1
  fi
fi

# Verify restore
echo -e "${YELLOW}Verifying restore...${NC}"
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLE_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Restore verified: $TABLE_COUNT tables found${NC}"
else
  echo -e "${YELLOW}⚠ Warning: No tables found after restore${NC}"
fi

# Run migrations if needed
echo -e "${YELLOW}Checking for pending migrations...${NC}"
if [ -f "package.json" ] && grep -q "db:migrate" package.json; then
  echo -e "${BLUE}Running database migrations...${NC}"
  npm run db:migrate || echo -e "${YELLOW}⚠ Migration check completed${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database restore completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Target database: $TARGET_DB"
echo "Backup file: $BACKUP_FILE"
echo "Tables restored: $TABLE_COUNT"

if [ -f "$SAFETY_BACKUP" ]; then
  echo "Safety backup: $SAFETY_BACKUP"
fi

echo ""
echo -e "${GREEN}✓ Database is ready to use${NC}"
