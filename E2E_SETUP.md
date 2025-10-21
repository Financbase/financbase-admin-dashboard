# E2E Testing Setup Guide

## Quick Start

### Step 1: Create a Test User in Clerk

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Users** section
4. Click **Create user**
5. Add a test user with:
   - Email: `test@yourdomain.com` (or any email)
   - Password: Create a strong password
   - ✅ Mark email as verified

### Step 2: Configure Environment Variables

Create or update `.env.local` in your project root:

```bash
# Add these lines
TEST_USER_EMAIL=test@yourdomain.com
TEST_USER_PASSWORD=YourStrongPassword123!
```

### Step 3: Check Configuration

```bash
npx tsx e2e/check-setup.ts
```

This will verify:
- ✅ Environment variables are set
- ✅ Dev server is running
- ✅ Ready for E2E testing

### Step 4: Run E2E Tests

```bash
# Make sure dev server is running first
pnpm dev

# In another terminal, run E2E tests
pnpm e2e
```

## What Was Changed

1. **Created `e2e/auth.setup.ts`**: Handles authentication before tests run
2. **Updated `playwright.config.ts`**: 
   - Uses authentication state from setup
   - All tests run as authenticated user
   - Skips auth if credentials not provided

3. **Created `playwright/.auth/`**: Stores authentication state (git-ignored)
4. **Added documentation**: E2E setup and troubleshooting guides

## Test Results Expected

With proper authentication:
- ✅ All 35 E2E tests should pass
- Tests will run across 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- Total test count: 35 tests × 5 browsers = 175 test runs

## Without Test Credentials

If you don't set credentials:
- Tests will skip authentication
- Most tests will fail (protected routes require auth)
- Only useful for testing public pages

## Current Status

**Unit Tests**: ✅ 20/20 PASSING
**E2E Tests**: ⏳ Awaiting test credentials setup

Once you set up the test user and credentials, run:
```bash
pnpm e2e
```
