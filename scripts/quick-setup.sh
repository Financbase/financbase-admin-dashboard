#!/bin/bash
# Quick setup script for RLS and Snapshot Cron configuration
# 
# Usage:
#   chmod +x scripts/quick-setup.sh
#   ./scripts/quick-setup.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RLS & Snapshot Cron Quick Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Generate CRON_SECRET
echo -e "${GREEN}Step 1: Generating CRON_SECRET...${NC}"
CRON_SECRET=$(openssl rand -hex 32)
echo -e "${YELLOW}Generated CRON_SECRET: ${CRON_SECRET}${NC}\n"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    if grep -q "CRON_SECRET" .env.local; then
        echo -e "${YELLOW}CRON_SECRET already exists in .env.local${NC}"
        read -p "Do you want to update it? (y/n): " update_secret
        if [ "$update_secret" = "y" ]; then
            sed -i.bak "s/CRON_SECRET=.*/CRON_SECRET=$CRON_SECRET/" .env.local
            echo -e "${GREEN}Updated CRON_SECRET in .env.local${NC}"
        fi
    else
        echo "" >> .env.local
        echo "# Query Snapshot Cron Secret" >> .env.local
        echo "CRON_SECRET=$CRON_SECRET" >> .env.local
        echo -e "${GREEN}Added CRON_SECRET to .env.local${NC}"
    fi
else
    echo "# Query Snapshot Cron Secret" > .env.local
    echo "CRON_SECRET=$CRON_SECRET" >> .env.local
    echo -e "${GREEN}Created .env.local with CRON_SECRET${NC}"
fi

echo ""

# Step 2: Verify DATABASE_URL
echo -e "${GREEN}Step 2: Checking DATABASE_URL...${NC}"
if [ -z "$DATABASE_URL" ]; then
    if [ -f ".env.local" ] && grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}DATABASE_URL found in .env.local${NC}"
    else
        echo -e "${YELLOW}DATABASE_URL not found${NC}"
        echo "Please set DATABASE_URL in .env.local or export it"
    fi
else
    echo -e "${GREEN}DATABASE_URL is set${NC}"
fi

echo ""

# Step 3: Test RLS connection
echo -e "${GREEN}Step 3: Testing database connection...${NC}"
if [ -n "$DATABASE_URL" ]; then
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            echo -e "${GREEN}Database connection successful${NC}"
        else
            echo -e "${YELLOW}Database connection failed - please check DATABASE_URL${NC}"
        fi
    else
        echo -e "${YELLOW}psql not found - skipping database connection test${NC}"
    fi
else
    echo -e "${YELLOW}Skipping database test - DATABASE_URL not set${NC}"
fi

echo ""

# Step 4: Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✓ CRON_SECRET configured${NC}"
echo -e "  Secret: ${CRON_SECRET:0:20}..."
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. For Vercel: Add CRON_SECRET to Vercel environment variables"
echo "2. For GitHub Actions: Add CRON_SECRET and APP_URL as repository secrets"
echo "3. Test RLS policies: Run 'psql \$DATABASE_URL -f scripts/test-rls-policies.sql'"
echo "4. Test snapshot endpoint:"
echo "   curl -X POST 'http://localhost:3000/api/monitoring/snapshot-queries' \\"
echo "     -H 'X-Cron-Secret: $CRON_SECRET'"
echo ""
echo -e "${BLUE}For detailed instructions, see: docs/SETUP_NEXT_STEPS.md${NC}"

