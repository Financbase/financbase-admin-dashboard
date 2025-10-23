import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.BASE_URL || 'http://127.0.0.1:3010',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		
		/* Take screenshot on failure */
		screenshot: 'only-on-failure',
		
		/* Video on first retry */
		video: 'retain-on-failure',
	},

	/* Configure projects for major browsers */
	projects: [
		// Setup project - runs first to authenticate
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/,
		},

		{
			name: 'chromium',
			use: { 
				...devices['Desktop Chrome'],
				// Use signed-in state for all tests
				storageState: process.env.TEST_USER_EMAIL ? 'playwright/.auth/user.json' : undefined,
			},
			dependencies: process.env.TEST_USER_EMAIL ? ['setup'] : [],
		},

		{
			name: 'firefox',
			use: { 
				...devices['Desktop Firefox'],
				storageState: process.env.TEST_USER_EMAIL ? 'playwright/.auth/user.json' : undefined,
			},
			dependencies: process.env.TEST_USER_EMAIL ? ['setup'] : [],
		},

		{
			name: 'smoke',
			testMatch: 'smoke.spec.ts',
			use: {
				...devices['Desktop Chrome'],
				storageState: process.env.TEST_USER_EMAIL ? 'playwright/.auth/user.json' : undefined,
			},
			dependencies: process.env.TEST_USER_EMAIL ? ['setup'] : [],
		},

		/* Test against mobile viewports. */
		{
			name: 'Mobile Chrome',
			use: { 
				...devices['Pixel 5'],
				storageState: process.env.TEST_USER_EMAIL ? 'playwright/.auth/user.json' : undefined,
			},
			dependencies: process.env.TEST_USER_EMAIL ? ['setup'] : [],
		},
		{
			name: 'Mobile Safari',
			use: { 
				...devices['iPhone 12'],
				storageState: process.env.TEST_USER_EMAIL ? 'playwright/.auth/user.json' : undefined,
			},
			dependencies: process.env.TEST_USER_EMAIL ? ['setup'] : [],
		},

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	/* Run your local dev server before starting the tests */
	webServer: process.env.CI ? undefined : {
		command: 'pnpm dev',
		url: 'http://127.0.0.1:3010',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
