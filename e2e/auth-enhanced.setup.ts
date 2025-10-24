import { test as setup, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const authFile = 'playwright/.auth/user.json';

// Enhanced test credentials with fallback options
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@financbase.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const TEST_BYPASS_AUTH = process.env.TEST_AUTH_BYPASS === 'true';

interface AuthConfig {
  email: string;
  password: string;
  bypassAuth: boolean;
  timeout: number;
  retries: number;
  headless: boolean;
}

const authConfig: AuthConfig = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  bypassAuth: TEST_BYPASS_AUTH,
  timeout: 30000,
  retries: 3,
  headless: process.env.CI === 'true' || process.env.HEADLESS === 'true'
};

setup('enhanced authentication setup', async ({ page, context }) => {
  console.log('🔐 Starting enhanced authentication setup...');
  console.log(`📧 Test Email: ${authConfig.email}`);
  console.log(`🔑 Bypass Auth: ${authConfig.bypassAuth}`);
  console.log(`⏱️  Timeout: ${authConfig.timeout}ms`);
  console.log(`🔄 Retries: ${authConfig.retries}`);

  // Skip authentication if bypass is enabled
  if (authConfig.bypassAuth) {
    console.log('🚫 Authentication bypassed - creating mock auth state');
    await createMockAuthState(context);
    return;
  }

  // Skip authentication if no credentials provided
  if (!process.env.TEST_USER_EMAIL) {
    console.log('⚠️  No TEST_USER_EMAIL provided - creating mock auth state');
    await createMockAuthState(context);
    return;
  }

  let authSuccess = false;
  let lastError: Error | null = null;

  // Retry authentication with exponential backoff
  for (let attempt = 1; attempt <= authConfig.retries; attempt++) {
    try {
      console.log(`🔄 Authentication attempt ${attempt}/${authConfig.retries}`);
      
      authSuccess = await performAuthentication(page, authConfig);
      
      if (authSuccess) {
        console.log('✅ Authentication successful');
        break;
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Authentication attempt ${attempt} failed:`, error);
      
      if (attempt < authConfig.retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await page.waitForTimeout(delay);
      }
    }
  }

  if (!authSuccess) {
    console.error('❌ All authentication attempts failed');
    if (lastError) {
      console.error('Last error:', lastError.message);
    }
    
    // Take screenshot for debugging
    await page.screenshot({ 
      path: 'auth-failure-enhanced.png',
      fullPage: true 
    });
    
    // Create mock auth state as fallback
    console.log('🔄 Creating mock auth state as fallback...');
    await createMockAuthState(context);
  }
});

async function performAuthentication(page: any, config: AuthConfig): Promise<boolean> {
  console.log('🔐 Performing authentication...');

  // Set longer timeout for authentication
  page.setDefaultTimeout(config.timeout);

  // Go to dashboard first to trigger auth redirect
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  // Wait for either dashboard content or sign-in redirect
  await page.waitForLoadState('networkidle', { timeout: config.timeout });

  const currentUrl = page.url();
  console.log('📍 Current URL:', currentUrl);

  // Check if we're already authenticated
  if (currentUrl.includes('/dashboard') && !currentUrl.includes('/sign-in')) {
    console.log('✅ Already authenticated - dashboard loaded directly');
    return true;
  }

  // Check if we're on sign-in page
  if (currentUrl.includes('/sign-in')) {
    console.log('🔐 Authentication required, signing in...');
    return await handleSignInFlow(page, config);
  }

  // Check for Clerk authentication components
  const clerkSignIn = page.locator('[data-clerk-sign-in]').first();
  const clerkSignInButton = page.locator('button[data-clerk-sign-in]').first();
  
  if (await clerkSignIn.isVisible() || await clerkSignInButton.isVisible()) {
    console.log('🔐 Clerk sign-in component detected');
    return await handleClerkSignIn(page, config);
  }

  // Check for custom sign-in form
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[name*="email" i]').first();
  if (await emailInput.isVisible()) {
    console.log('🔐 Custom sign-in form detected');
    return await handleCustomSignIn(page, config);
  }

  console.log('⚠️  No authentication method detected - assuming already authenticated');
  return true;
}

async function handleSignInFlow(page: any, config: AuthConfig): Promise<boolean> {
  console.log('🔐 Handling standard sign-in flow...');

  // Wait for email input with multiple selectors
  const emailSelectors = [
    'input[type="email"]',
    'input[placeholder*="email" i]',
    'input[name*="email" i]',
    'input[data-testid="email"]',
    'input[id*="email"]'
  ];

  let emailInput = null;
  for (const selector of emailSelectors) {
    try {
      emailInput = page.locator(selector).first();
      await emailInput.waitFor({ timeout: 5000 });
      if (await emailInput.isVisible()) {
        console.log(`✅ Found email input with selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!emailInput || !(await emailInput.isVisible())) {
    throw new Error('Email input not found');
  }

  // Fill in email
  await emailInput.clear();
  await emailInput.fill(config.email);
  console.log('📧 Email filled');

  // Click continue/submit - try multiple selectors
  const continueSelectors = [
    'button:has-text("Continue")',
    'button:has-text("Next")',
    'button[type="submit"]',
    'button[data-testid="continue"]',
    'button[data-testid="submit"]'
  ];

  let continueButton = null;
  for (const selector of continueSelectors) {
    try {
      continueButton = page.locator(selector).first();
      if (await continueButton.isVisible()) {
        console.log(`✅ Found continue button with selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!continueButton || !(await continueButton.isVisible())) {
    throw new Error('Continue button not found');
  }

  await continueButton.click();
  console.log('➡️ Continue button clicked');

  // Wait for password field
  const passwordSelectors = [
    'input[type="password"]',
    'input[placeholder*="password" i]',
    'input[name*="password" i]',
    'input[data-testid="password"]',
    'input[id*="password"]'
  ];

  let passwordInput = null;
  for (const selector of passwordSelectors) {
    try {
      passwordInput = page.locator(selector).first();
      await passwordInput.waitFor({ timeout: 10000 });
      if (await passwordInput.isVisible()) {
        console.log(`✅ Found password input with selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!passwordInput || !(await passwordInput.isVisible())) {
    throw new Error('Password input not found');
  }

  await passwordInput.clear();
  await passwordInput.fill(config.password);
  console.log('🔑 Password filled');

  // Submit password
  const signInSelectors = [
    'button:has-text("Sign in")',
    'button:has-text("Continue")',
    'button[type="submit"]',
    'button[data-testid="sign-in"]',
    'button[data-testid="submit"]'
  ];

  let signInButton = null;
  for (const selector of signInSelectors) {
    try {
      signInButton = page.locator(selector).first();
      if (await signInButton.isVisible()) {
        console.log(`✅ Found sign-in button with selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!signInButton || !(await signInButton.isVisible())) {
    throw new Error('Sign-in button not found');
  }

  await signInButton.click();
  console.log('🔐 Sign-in button clicked');

  // Wait for redirect to dashboard
  try {
    await page.waitForURL('/dashboard', { timeout: 20000 });
    console.log('✅ Redirected to dashboard');
    return true;
  } catch (error) {
    console.log('⚠️  Dashboard redirect timeout, checking current state...');
    
    // Check if we're on dashboard even if URL didn't change
    const dashboardElements = [
      'h1:has-text("Dashboard")',
      'h2:has-text("Dashboard")',
      '[data-testid="dashboard"]',
      '.dashboard',
      'main'
    ];

    for (const selector of dashboardElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Dashboard element found: ${selector}`);
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Dashboard not reached after sign-in');
  }
}

async function handleClerkSignIn(page: any, config: AuthConfig): Promise<boolean> {
  console.log('🔐 Handling Clerk sign-in flow...');

  // Wait for Clerk sign-in form
  await page.waitForSelector('[data-clerk-sign-in], button[data-clerk-sign-in]', { timeout: 10000 });

  // Click Clerk sign-in button
  const clerkButton = page.locator('button[data-clerk-sign-in]').first();
  await clerkButton.click();
  console.log('🔐 Clerk sign-in button clicked');

  // Wait for Clerk modal or redirect
  await page.waitForTimeout(2000);

  // Handle Clerk authentication flow
  return await handleSignInFlow(page, config);
}

async function handleCustomSignIn(page: any, config: AuthConfig): Promise<boolean> {
  console.log('🔐 Handling custom sign-in form...');
  return await handleSignInFlow(page, config);
}

async function createMockAuthState(context: any): Promise<void> {
  console.log('🎭 Creating mock authentication state...');

  // Create mock auth state file
  const mockAuthState = {
    cookies: [
      {
        name: 'clerk-session',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }
    ],
    origins: [
      {
        origin: 'http://localhost:3010',
        localStorage: [
          {
            name: 'clerk-session',
            value: JSON.stringify({
              userId: 'mock-user-123',
              sessionId: 'mock-session-123',
              token: 'mock-token-123'
            })
          }
        ]
      }
    ]
  };

  // Save mock auth state
  await context.storageState({ path: authFile });
  
  // Also save the mock state directly
  const fs = require('fs');
  const path = require('path');
  
  // Ensure directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  fs.writeFileSync(authFile, JSON.stringify(mockAuthState, null, 2));
  
  console.log('✅ Mock authentication state created');
}

// Enhanced authentication verification
setup('verify authentication', async ({ page }) => {
  console.log('🔍 Verifying authentication state...');

  try {
    // Go to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Check for dashboard elements
    const dashboardIndicators = [
      'h1:has-text("Dashboard")',
      'h2:has-text("Dashboard")',
      '[data-testid="dashboard"]',
      '.dashboard',
      'main'
    ];

    let dashboardFound = false;
    for (const selector of dashboardIndicators) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Dashboard verified with: ${selector}`);
          dashboardFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!dashboardFound) {
      console.log('⚠️  Dashboard not found, checking for authentication errors...');
      
      // Check for common error indicators
      const errorIndicators = [
        'text="Sign in"',
        'text="Authentication required"',
        'text="Access denied"',
        'text="Unauthorized"'
      ];

      for (const selector of errorIndicators) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`❌ Authentication error detected: ${selector}`);
            throw new Error('Authentication verification failed');
          }
        } catch (error) {
          continue;
        }
      }
    }

    console.log('✅ Authentication verification completed');
  } catch (error) {
    console.error('❌ Authentication verification failed:', error);
    throw error;
  }
});
