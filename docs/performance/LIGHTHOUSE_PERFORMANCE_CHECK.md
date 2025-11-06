# Lighthouse Performance Check

## Overview

This document describes how to run Lighthouse performance audits on the Financbase Admin Dashboard.

## Quick Start

### Basic Usage

```bash
# Run Lighthouse on the default URL (http://localhost:3000/home)
npm run lighthouse

# Run Lighthouse on a specific URL
npm run lighthouse http://localhost:3000/dashboard

# Or use the script directly
node scripts/lighthouse-performance-check.js <URL>
```

## Prerequisites

1. **Development Server Running**: Ensure your Next.js dev server is running on port 3000

   ```bash
   npm run dev
   ```

2. **Dependencies**: Lighthouse and Chrome Launcher are installed as dev dependencies

## Output

Reports are generated in the `reports/lighthouse/` directory:

- **HTML Report**: `lighthouse-performance-<timestamp>.html` - Interactive report you can open in a browser
- **JSON Report**: `lighthouse-performance-<timestamp>.json` - Machine-readable data for analysis

## Performance Metrics

Lighthouse measures the following Core Web Vitals:

- **First Contentful Paint (FCP)**: Time until first content is painted
- **Largest Contentful Paint (LCP)**: Time until largest content element is visible
- **Total Blocking Time (TBT)**: Sum of blocking time for all tasks
- **Cumulative Layout Shift (CLS)**: Visual stability metric
- **Speed Index**: How quickly content is visually displayed
- **Time to Interactive (TTI)**: Time until page is fully interactive

## Troubleshooting

### Issue: Page Not Loading / NO_FCP Error

If you encounter "The page did not paint any content" errors:

1. **Check Server Status**: Ensure the dev server is running and responsive

   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check Authentication**: Some pages may require authentication. Try:
   - Public pages: `/home`, `/auth/sign-in`
   - Or disable authentication for testing

3. **Increase Timeouts**: The script already uses extended timeouts (90s), but if pages are very slow:
   - Check database connection
   - Review server logs for errors
   - Ensure no blocking operations

4. **Test with Production Build**: Production builds are typically faster:

   ```bash
   npm run build
   npm run start
   # Then run lighthouse against http://localhost:3000
   ```

### Issue: Chrome/Headless Issues

If Chrome fails to launch:

1. **Install Chrome**: Ensure Chrome/Chromium is installed
2. **Check Permissions**: On macOS, Chrome may need accessibility permissions
3. **Try Different Flags**: The script uses `--no-sandbox` which may not work in all environments

### Alternative: Use Lighthouse CI

For more advanced testing, use Lighthouse CI:

```bash
npx @lhci/cli autorun
```

This uses the configuration in `.lighthouserc.js`.

## Performance Targets

Based on the configuration in `.lighthouserc.js`:

- **First Contentful Paint**: < 2000ms (warn)
- **Largest Contentful Paint**: < 4000ms (warn)
- **Cumulative Layout Shift**: < 0.1 (warn)
- **Speed Index**: < 4500ms (warn)
- **Time to Interactive**: < 5000ms (warn)
- **Total Blocking Time**: < 500ms (warn)

## Best Practices

1. **Run Regular Audits**: Include performance checks in your CI/CD pipeline
2. **Test Multiple Pages**: Don't just test the homepage - test critical user flows
3. **Compare Results**: Track performance over time to identify regressions
4. **Production Testing**: Always test against production builds for accurate results
5. **Network Throttling**: Lighthouse simulates slow 3G by default - this is intentional

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Lighthouse
  run: |
    npm run dev &
    sleep 10
    npm run lighthouse
```

## Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/learn-web-vitals/)
