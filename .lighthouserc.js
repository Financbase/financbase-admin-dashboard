module.exports = {
  ci: {
    collect: {
      // Run Lighthouse tests against the local development server
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000, // 60 seconds
      url: [
        'http://localhost:3002',
        'http://localhost:3002/about',
        'http://localhost:3002/pricing',
        'http://localhost:3002/features',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      assertions: {
        // Performance thresholds
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 3000 }],
        'speed-index': ['warn', { maxNumericValue: 4500 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        
        // Accessibility thresholds (must be at least 90%)
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Best practices thresholds (must be at least 80%)
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        // SEO thresholds (must be at least 80%)
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './reports/lighthouse',
      reportFilenamePattern: '%%HOSTNAME%%-%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
