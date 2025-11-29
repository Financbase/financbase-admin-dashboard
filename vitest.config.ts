import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'mock-react-grid-layout',
      enforce: 'pre', // Run before other plugins
      resolveId(id, importer) {
        // Handle react-grid-layout imports
        if (id === 'react-grid-layout') {
          return path.resolve(__dirname, './__tests__/mocks/react-grid-layout.ts');
        }
        // Handle CSS imports - return virtual module ID with null prefix
        // This tells Vite to treat it as an external module
        if (id === 'react-grid-layout/css/styles.css' || id.includes('react-grid-layout/css/styles.css')) {
          return '\0virtual:react-grid-layout-css';
        }
        if (id === 'react-resizable/css/styles.css' || id.includes('react-resizable/css/styles.css')) {
          return '\0virtual:react-resizable-css';
        }
        return null;
      },
      load(id) {
        // Return empty module for CSS imports (Vite expects a module, not just empty string)
        if (id === '\0virtual:react-grid-layout-css' || id === '\0virtual:react-resizable-css') {
          return 'export default {};';
        }
        return null;
      },
      // Also handle in transform phase as fallback
      transform(code, id) {
        // If the file imports CSS from react-grid-layout, remove the import
        if (id.includes('dashboard-builder.tsx') && code.includes('react-grid-layout/css/styles.css')) {
          return {
            code: code.replace(/import\s+['"]react-grid-layout\/css\/styles\.css['"];?\s*/g, ''),
            map: null,
          };
        }
        if (id.includes('dashboard-builder.tsx') && code.includes('react-resizable/css/styles.css')) {
          return {
            code: code.replace(/import\s+['"]react-resizable\/css\/styles\.css['"];?\s*/g, ''),
            map: null,
          };
        }
        return null;
      },
    },
  ],
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
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Exclude IRS Direct File tests from main suite (they have long timeouts)
      '**/lib/irs-direct-file/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
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
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
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
    testTimeout: 30000, // Increased for complex tests
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Retry failed tests
    retry: process.env.CI ? 2 : 0,
    // Pool configuration for Vitest 4.x
    // Use vmThreads which is more reliable for complex setups
    pool: 'vmThreads',
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
      '@/contexts': path.resolve(__dirname, './contexts'),
      // Add alias for react-grid-layout to handle missing dependency in tests
      'react-grid-layout': path.resolve(__dirname, './__tests__/mocks/react-grid-layout.ts'),
    },
    // Ensure proper module resolution
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['@radix-ui/react-slot'],
  },
  ssr: {
    noExternal: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
    exclude: ['react-grid-layout'],
  },
  // Ensure proper handling of React components
  esbuild: {
    jsx: 'automatic',
  },
});