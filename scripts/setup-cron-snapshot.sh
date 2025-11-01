#!/bin/bash
# Setup script for daily query snapshot cron job
# 
# This script helps you set up a daily cron job to capture slow query snapshots
# 
# Usage:
#   chmod +x scripts/setup-cron-snapshot.sh
#   ./scripts/setup-cron-snapshot.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up daily query snapshot cron job...${NC}\n"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}Warning: DATABASE_URL not found in environment${NC}"
  echo "Please set DATABASE_URL before running this script"
  exit 1
fi

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ] && [ -z "$CRON_SECRET_KEY" ]; then
  echo -e "${YELLOW}Warning: CRON_SECRET not found in environment${NC}"
  echo "Generating a random secret..."
  CRON_SECRET=$(openssl rand -hex 32)
  echo "Generated CRON_SECRET: $CRON_SECRET"
  echo "Please add this to your .env file:"
  echo "CRON_SECRET=$CRON_SECRET"
  echo ""
  read -p "Press enter to continue with this secret..."
fi

CRON_SECRET=${CRON_SECRET:-$CRON_SECRET_KEY}

# Determine the cron endpoint URL
if [ -z "$NEXT_PUBLIC_APP_URL" ] && [ -z "$VERCEL_URL" ]; then
  echo -e "${YELLOW}Warning: App URL not found${NC}"
  echo "Please set NEXT_PUBLIC_APP_URL or VERCEL_URL"
  read -p "Enter your app URL (e.g., https://your-app.vercel.app): " APP_URL
else
  APP_URL=${NEXT_PUBLIC_APP_URL:-https://$VERCEL_URL}
fi

# Create cron command
CRON_COMMAND="0 2 * * * curl -X POST '$APP_URL/api/monitoring/snapshot-queries?limit=50&min_ms=20' -H 'X-Cron-Secret: $CRON_SECRET' -H 'Content-Type: application/json'"

echo -e "${GREEN}Choose setup method:${NC}"
echo "1) Add to system crontab (requires sudo)"
echo "2) Use external cron service (Vercel Cron, GitHub Actions, etc.)"
echo "3) Use application scheduler (Node.js cron in your app)"
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo -e "\n${GREEN}Adding to system crontab...${NC}"
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    echo "Cron job added successfully!"
    echo "Run 'crontab -l' to verify"
    ;;
  2)
    echo -e "\n${GREEN}External cron service setup:${NC}"
    echo "Use this endpoint:"
    echo "  POST $APP_URL/api/monitoring/snapshot-queries"
    echo ""
    echo "Headers:"
    echo "  X-Cron-Secret: $CRON_SECRET"
    echo ""
    echo "Query params:"
    echo "  limit=50 (optional)"
    echo "  min_ms=20 (optional)"
    echo ""
    echo "Schedule: Daily at 2 AM UTC"
    echo ""
    echo "Services you can use:"
    echo "  - Vercel Cron: https://vercel.com/docs/cron-jobs"
    echo "  - GitHub Actions: Create a scheduled workflow"
    echo "  - EasyCron: https://www.easycron.com"
    echo "  - Cron-job.org: https://cron-job.org"
    ;;
  3)
    echo -e "\n${GREEN}Application scheduler setup:${NC}"
    echo "Install node-cron:"
    echo "  npm install node-cron"
    echo ""
    echo "Add to your app (e.g., lib/cron/snapshot-scheduler.ts):"
    echo ""
    echo "import cron from 'node-cron';"
    echo "import { sql } from '@/lib/db';"
    echo ""
    echo "// Run daily at 2 AM UTC"
    echo "cron.schedule('0 2 * * *', async () => {"
    echo "  try {"
    echo "    await sql\`SELECT perf.snapshot_top_queries(50, 20)\`;"
    echo "    console.log('[Cron] Query snapshot captured');"
    echo "  } catch (error) {"
    echo "    console.error('[Cron] Snapshot failed:', error);"
    echo "  }"
    echo "});"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo -e "\n${GREEN}Setup complete!${NC}"
echo ""
echo "To test manually, run:"
echo "  curl -X POST '$APP_URL/api/monitoring/snapshot-queries' \\"
echo "    -H 'X-Cron-Secret: $CRON_SECRET'"

