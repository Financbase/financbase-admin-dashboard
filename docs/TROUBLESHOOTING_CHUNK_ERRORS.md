# Troubleshooting Next.js Chunk Loading Errors

## Error Overview

When you see errors like:
```
GET http://localhost:3000/_next/static/chunks/main-app.js?v=1761940412526 net::ERR_ABORTED 404 (Not Found)
Refused to execute script from 'http://localhost:3000/_next/static/chunks/main-app.js' because its MIME type ('text/html') is not executable
```

This indicates that:
1. **Missing JavaScript chunks**: Next.js can't find the required JavaScript chunk files
2. **Wrong MIME type**: The server is returning HTML (likely a 404 error page) instead of JavaScript
3. **Middleware interference**: Middleware might be intercepting requests to Next.js internal files

## Root Causes

### 1. Multiple Dev Servers Running
Having multiple Next.js development servers running simultaneously can cause:
- Port conflicts
- Cache corruption
- Chunk generation issues

### 2. Corrupted Build Cache
The `.next` directory contains cached build artifacts. If corrupted:
- Chunks may not be generated properly
- References to non-existent files persist
- Build state becomes inconsistent

### 3. Middleware Interference
Middleware that doesn't properly exclude `_next` static files can:
- Intercept chunk requests
- Return redirects or error pages instead of JavaScript
- Cause MIME type mismatches

### 4. Browser Cache Issues
Stale browser cache can:
- Reference old chunk filenames that no longer exist
- Cache 404 responses as HTML
- Prevent fresh chunk loading

## Automatic Error Recovery

The application now includes automatic chunk error recovery mechanisms:

### Built-in Error Handling

1. **Global Chunk Error Handler** (`lib/utils/chunk-error-handler.ts`)
   - Automatically detects ChunkLoadError
   - Implements retry with exponential backoff (3 attempts)
   - Automatically reloads the page if recovery fails
   - Handles both unhandled promise rejections and regular errors

2. **Chunk Error Boundary** (`components/errors/chunk-error-boundary.tsx`)
   - React error boundary specifically for chunk errors
   - Displays user-friendly error messages
   - Provides manual recovery options
   - Automatically attempts recovery when enabled

3. **Automatic Integration**
   - Error handler is automatically set up in `app/providers.tsx`
   - ChunkErrorBoundary wraps the application
   - No manual intervention required in most cases

### How It Works

When a ChunkLoadError occurs:
1. The global error handler catches it
2. Attempts to retry loading the chunk (with delays)
3. If retries fail, automatically reloads the page with cache busting
4. If automatic recovery fails, the error boundary displays a user-friendly message

### Manual Recovery Options

If automatic recovery doesn't work, users can:
- Click "Reload Page" to force a full page reload
- Click "Try Again" to retry without reloading
- Hard refresh the browser (Cmd/Ctrl + Shift + R)

## Solutions

### Solution 1: Clean Build & Restart (Recommended First Step)

```bash
# Stop all running Next.js processes
pkill -f "next dev" || true

# Remove build cache
rm -rf .next

# Clear node_modules cache (if persistent issues)
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

### Solution 2: Verify Middleware Configuration

Ensure middleware explicitly excludes Next.js internal files:

```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Explicitly exclude Next.js internal files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // ... rest of middleware logic
});
```

### Solution 3: Check for Port Conflicts

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill any conflicting processes
kill -9 <PID>
```

### Solution 4: Clear Browser Cache

1. **Hard Refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. **Clear Cache**: Open DevTools → Application → Clear Storage → Clear site data
3. **Incognito Mode**: Test in a private/incognito window to rule out cache issues

### Solution 5: Verify Next.js Configuration

Check `next.config.mjs` for issues:

```javascript
// Ensure webpack config doesn't interfere
webpack: (config, { dev, isServer }) => {
  // Don't override chunk splitting in dev mode
  return config;
}
```

## Browser Extension Errors

Errors like:
```
Unchecked runtime.lastError: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
```

These are **browser extension errors**, not application errors. They occur when:
- Chrome/Edge extensions interfere with page loading
- Extensions have compatibility issues with the site
- Extension message handlers timeout

**Solutions:**
1. Test in Incognito mode (extensions disabled)
2. Disable extensions one by one to identify the culprit
3. These errors don't affect your application functionality

## Prevention

### 1. Development Best Practices
- Always stop dev server before restarting
- Use `npm run dev` from a single terminal
- Don't run multiple dev instances simultaneously

### 2. Git Ignore Configuration
Ensure `.next` is in `.gitignore`:
```
.next/
node_modules/
```

### 3. CI/CD Pipeline
- Always clean build cache between builds
- Use fresh environments for each deployment

## Debugging Steps

1. **Check Server Logs**: Look for build errors in terminal
2. **Network Tab**: Inspect the failed request in DevTools
3. **Verify File Exists**: Check if chunk file actually exists in `.next/static/chunks/`
4. **Test Direct Access**: Try accessing chunk URL directly in browser
5. **Compare with Fresh Build**: Run `npm run build` and compare output

## Quick Fix Script

Create a `fix-chunks.sh` script:

```bash
#!/bin/bash
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🛑 Stopping any running Next.js processes..."
pkill -f "next dev" || true
sleep 2

echo "🚀 Starting fresh dev server..."
npm run dev
```

Make it executable:
```bash
chmod +x fix-chunks.sh
./fix-chunks.sh
```

## Still Having Issues?

If problems persist after trying all solutions:

1. **Check Node.js Version**: Ensure Node.js 18+ is installed
2. **Update Dependencies**: Run `npm update` or `pnpm update`
3. **Reinstall Dependencies**: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. **Check for TypeScript Errors**: Run `npm run type-check`
5. **Review Recent Changes**: Check git history for recent middleware/config changes

## Implementation Details

### Error Handler Configuration

The chunk error handler is configured in `app/providers.tsx`:

```typescript
setupChunkErrorHandler({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  autoReload: true,
});
```

### Error Boundary Usage

The ChunkErrorBoundary is automatically wrapping the application:

```typescript
<ChunkErrorBoundary autoRecover={true}>
  <DashboardProvider>
    {children}
  </DashboardProvider>
</ChunkErrorBoundary>
```

### Webpack Configuration

Enhanced chunk loading in `next.config.mjs`:
- Consistent chunk IDs for better loading
- Named chunks in development for debugging
- Deterministic chunks in production for stable hashes
- Proper chunk loading global variable configuration

### Middleware Exclusions

The middleware (`middleware.ts`) now explicitly excludes:
- All `/_next/` paths
- Webpack chunks (`/_next/static/chunks/`)
- All static file extensions
- Webpack runtime files

## Related Files

- `lib/utils/chunk-error-handler.ts` - Chunk error handler utility
- `components/errors/chunk-error-boundary.tsx` - React error boundary for chunks
- `app/providers.tsx` - Error handler integration
- `middleware.ts` - Authentication middleware with chunk exclusions
- `next.config.mjs` - Next.js configuration with enhanced chunk loading
- `package.json` - Dependencies and scripts
- `.next/` - Build output directory (should be gitignored)

