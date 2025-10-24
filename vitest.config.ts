import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'json',
        'html',
        'json-summary',
        'lcov',
        'text-summary'
      ],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/scripts/**',
        '**/docs/**',
        '**/performance-tests/**',
        '**/e2e/**',
        '**/playwright/**',
        '**/node_modules/**'
      ],
      include: [
        'app/**/*.{js,ts,jsx,tsx}',
        'components/**/*.{js,ts,jsx,tsx}',
        'lib/**/*.{js,ts,jsx,tsx}',
        'hooks/**/*.{js,ts,jsx,tsx}',
        'contexts/**/*.{js,ts,jsx,tsx}',
        'types/**/*.{js,ts,jsx,tsx}',
        'config/**/*.{js,ts,jsx,tsx}',
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      all: true,
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        },
        // More lenient thresholds for different file types
        '**/*.test.{js,ts,jsx,tsx}': {
          branches: 0,
          functions: 0,
          lines: 0,
          statements: 0
        },
        '**/lib/**/*.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        '**/components/**/*.tsx': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        '**/hooks/**/*.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      // Enable coverage for specific file patterns
      extension: ['.js', '.ts', '.jsx', '.tsx'],
      // Generate coverage for unused files as well
      ignoreEmptyLines: false,
      // Include branch coverage
      branches: true,
      // Include function coverage
      functions: true,
      // Include line coverage
      lines: true,
      // Include statement coverage
      statements: true,
      // Skip full flag for better performance
      skipFull: false
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Retry failed tests
    retry: process.env.CI ? 2 : 0,
    // Run tests in sequence for better debugging
    threads: false,
    // Enable verbose output for debugging
    logHeapUsage: true,
    // Clear mocks between tests
    clearMocks: true,
    // Restore mocks after each test
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/src': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './types'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/contexts': path.resolve(__dirname, './contexts')
    }
  }
});