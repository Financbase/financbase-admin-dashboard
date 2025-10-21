# E2E Testing with Playwright

## Setup

### 1. Create Test User in Clerk

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Create a test user with email and password authentication
4. Note the email and password for testing

### 2. Set Environment Variables

Create a `.env.local` file in the project root with:

```bash
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=YourTestPassword123!
```

**Important**: Never commit these credentials to git!

### 3. Ensure Dev Server is Running

The E2E tests require a running development server:

```bash
pnpm dev
```

This will start the server on `http://localhost:3010`

## Running Tests

### Run all E2E tests (with authentication)
```bash
pnpm e2e
```

### Run tests in UI mode (interactive)
```bash
pnpm e2e:ui
```

### Run tests in headed mode (watch browser)
```bash
pnpm e2e:headed
```

### View last test report
```bash
pnpm exec playwright show-report
```

## How It Works

1. **auth.setup.ts**: Runs first, signs in with test credentials, saves auth state
2. **Test files**: Use the saved authentication state to access protected routes
3. All tests run with the authenticated session

## Skipping Authentication

If you don't set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`, the tests will:
- Skip the authentication setup
- Still run but may fail on protected routes
- Useful for testing public pages only

## Troubleshooting

### Tests fail with "not authenticated"
- Check that `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are set in `.env.local`
- Verify the test user exists in your Clerk dashboard
- Ensure the credentials are correct

### Tests timeout
- Make sure the dev server is running on port 3010
- Check network connection
- Increase timeout in playwright.config.ts if needed

### Authentication file not found
- The auth state is saved to `playwright/.auth/user.json`
- This file is git-ignored and created automatically
- If missing, the setup will recreate it

## CI/CD Integration

For CI/CD pipelines, set environment variables:

```bash
export TEST_USER_EMAIL="ci-test@example.com"
export TEST_USER_PASSWORD="SecurePassword123!"
pnpm e2e
```

Or use GitHub Actions secrets, CircleCI environment variables, etc.

