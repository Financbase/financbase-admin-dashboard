#!/bin/bash

# =============================================================================
# Database Backup Script
# =============================================================================
# 
# Creates a backup of the Financbase PostgreSQL database with:
# - Automated rotation (keeps last N backups)
# - Compressed backups
# - Timestamped filenames
# - Optional S3 upload
#
# Usage:
#   ./scripts/backup-database.sh [--retention-days=N] [--upload-s3]
#
# Environment Variables:
#   DATABASE_URL - PostgreSQL connection string (required)
#   BACKUP_DIR - Directory to store backups (default: ./backups)
#   S3_BUCKET - S3 bucket for backup storage (optional)
#   AWS_ACCESS_KEY_ID - AWS access key (required if --upload-s3)
#   AWS_SECRET_ACCESS_KEY - AWS secret key (required if --upload-s3)
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RETENTION_DAYS=${RETENTION_DAYS:-30}
BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
UPLOAD_S3=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --retention-days=*)
      RETENTION_DAYS="${1#*=}"
      shift
      ;;
    --upload-s3)
      UPLOAD_S3=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--retention-days=N] [--upload-s3]"
      exit 1
      ;;
  esac
done

# Validate DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Extract database name from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
  echo -e "${RED}Error: Could not extract database name from DATABASE_URL${NC}"
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

echo -e "${GREEN}Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE_COMPRESSED"
echo "Retention: $RETENTION_DAYS days"

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
  echo -e "${GREEN}✓ Backup created successfully${NC}"
else
  echo -e "${RED}✗ Backup failed${NC}"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
if gzip "$BACKUP_FILE"; then
  echo -e "${GREEN}✓ Backup compressed successfully${NC}"
  BACKUP_FILE="$BACKUP_FILE_COMPRESSED"
else
  echo -e "${RED}✗ Compression failed${NC}"
  exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Backup size: $BACKUP_SIZE${NC}"

# Verify backup integrity
echo -e "${YELLOW}Verifying backup integrity...${NC}"
if gunzip -t "$BACKUP_FILE" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backup integrity verified${NC}"
else
  echo -e "${RED}✗ Backup integrity check failed${NC}"
  exit 1
fi

# Upload to S3 if requested
if [ "$UPLOAD_S3" = true ]; then
  if [ -z "${S3_BUCKET:-}" ]; then
    echo -e "${RED}Error: S3_BUCKET environment variable is not set${NC}"
    exit 1
  fi
  
  if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    echo -e "${RED}Error: AWS credentials not set (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Uploading to S3...${NC}"
  S3_PATH="s3://$S3_BUCKET/database-backups/$(basename "$BACKUP_FILE")"
  
  if aws s3 cp "$BACKUP_FILE" "$S3_PATH"; then
    echo -e "${GREEN}✓ Backup uploaded to S3: $S3_PATH${NC}"
  else
    echo -e "${RED}✗ S3 upload failed${NC}"
    exit 1
  fi
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
DELETED_COUNT=0

# Find and delete old local backups
while IFS= read -r file; do
  if [ -f "$file" ]; then
    rm -f "$file"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    echo "  Deleted: $(basename "$file")"
  fi
done < <(find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS)

if [ $DELETED_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Cleaned up $DELETED_COUNT old backup(s)${NC}"
else
  echo -e "${GREEN}✓ No old backups to clean up${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Backup size: $BACKUP_SIZE"
echo "Timestamp: $TIMESTAMP"
echo "Retention: $RETENTION_DAYS days"

if [ "$UPLOAD_S3" = true ]; then
  echo "S3 location: $S3_PATH"
fi

echo ""
echo -e "${YELLOW}To restore this backup, run:${NC}"
echo "  ./scripts/restore-database.sh $BACKUP_FILE"
