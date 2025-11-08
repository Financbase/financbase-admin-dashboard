# IRS Direct File - Browser Testing Guide

## Prerequisites

Before testing in the browser, ensure all services are running:

```bash
cd lib/irs-direct-file/direct-file
./scripts/health-check.sh
```

All services should show "Running" status.

## Browser Testing Steps

### 1. Access the Integration Page

1. Open your browser
2. Navigate to: **http://localhost:3000/tax/direct-file**
3. You should be redirected to Clerk authentication if not logged in

### 2. Authentication

1. Log in with your Clerk account
2. After successful login, you should be redirected back to `/tax/direct-file`
3. Verify the page loads correctly

### 3. Verify Page Load

**What to check:**
- [ ] Page title: "File Your Federal Taxes"
- [ ] Legal disclosures are displayed
- [ ] Loading indicator appears briefly
- [ ] Direct File app container is visible
- [ ] No error messages displayed

### 4. Check Browser Console

Open browser DevTools (F12) and check the Console tab:

**Expected:**
- ✅ No critical errors (red errors)
- ✅ Direct File app initialization messages
- ✅ Fact graph loading messages
- ✅ API calls being made

**Watch for:**
- ❌ Module not found errors
- ❌ Network errors (404, 500, etc.)
- ❌ CORS errors
- ❌ Authentication errors

### 5. Verify Direct File App Initialization

**In Console, check for:**
```javascript
// Should see Direct File app initialization
// Fact graph should be loaded
// No errors related to routing or state management
```

**Visual Check:**
- [ ] Direct File interface appears
- [ ] No blank/white screen
- [ ] UI elements are rendered
- [ ] No loading spinner stuck

### 6. Test API Integration

**In Network tab (DevTools):**
- [ ] Requests to `/api/direct-file/*` are made
- [ ] Requests return 200 status (not 401, 502, etc.)
- [ ] CORS headers are present in responses
- [ ] No CORS errors in console

### 7. Test Basic Functionality

**Try:**
- [ ] Navigate through Direct File screens
- [ ] Fill out form fields
- [ ] Verify data is saved (check Network tab for API calls)
- [ ] Test any interactive elements

### 8. Test Export Functionality

**When ready to test export:**
- [ ] Complete tax filing flow (or use test data)
- [ ] Click export button
- [ ] Select format (MeF XML or JSON)
- [ ] Verify export completes
- [ ] Check for success toast notification
- [ ] Verify metadata is stored (check database or API)

## Common Issues & Solutions

### Issue: Page Shows Error Message

**Possible Causes:**
- Services not running
- Authentication failed
- API proxy error
- Direct File app failed to initialize

**Solutions:**
1. Check all services are running: `./scripts/health-check.sh`
2. Verify you're logged in
3. Check browser console for specific errors
4. Check Network tab for failed requests

### Issue: Direct File App Doesn't Load

**Possible Causes:**
- Fact graph not compiled
- Missing dependencies
- Routing conflict
- JavaScript errors

**Solutions:**
1. Verify fact graph files exist:
   ```bash
   ls -lh lib/irs-direct-file/df-client/js-factgraph-scala/src/main.js
   ```
2. Check browser console for specific errors
3. Verify all client dependencies installed:
   ```bash
   cd lib/irs-direct-file/df-client/df-client-app
   npm list
   ```

### Issue: API Calls Return 401 Unauthorized

**Possible Causes:**
- Not authenticated
- Session expired
- Clerk configuration issue

**Solutions:**
1. Log out and log back in
2. Check Clerk dashboard for configuration
3. Verify authentication is working on other pages

### Issue: API Calls Return 502 Bad Gateway

**Possible Causes:**
- Backend services not running
- Services crashed
- Port conflicts

**Solutions:**
1. Check services are running: `./scripts/health-check.sh`
2. Check service logs:
   ```bash
   tail -f /tmp/state-api.log
   tail -f /tmp/email-service.log
   ```
3. Restart services if needed

### Issue: CORS Errors

**Possible Causes:**
- CORS headers not set correctly
- Origin mismatch

**Solutions:**
1. Verify CORS headers in API proxy routes
2. Check that requests are going through proxy
3. Verify backend services allow CORS

## Network Tab Checklist

When testing, monitor the Network tab for:

- ✅ Requests to `/api/direct-file/*` succeed (200 status)
- ✅ Requests to `/api/direct-file/state-api/*` succeed (200 status)
- ✅ No 401 Unauthorized errors (unless testing auth)
- ✅ No 502 Bad Gateway errors
- ✅ No CORS errors
- ✅ Response times are reasonable (< 1 second)

## Console Checklist

Check browser console for:

- ✅ No red errors
- ✅ Direct File initialization messages
- ✅ Fact graph loaded successfully
- ✅ API calls completing successfully
- ⚠️ Warnings are acceptable (review individually)

## Performance Checklist

- [ ] Page loads in < 3 seconds
- [ ] Direct File app initializes in < 5 seconds
- [ ] API calls complete in < 1 second
- [ ] No memory leaks (check Memory tab in DevTools)
- [ ] No excessive network requests

## Security Checklist

- [ ] No PII/FTI in browser console
- [ ] No sensitive data in localStorage
- [ ] Session data cleared on unmount
- [ ] Authentication required for all API calls
- [ ] CORS properly configured

## E2E Test Scenarios

### Scenario 1: Basic Page Load
1. Navigate to `/tax/direct-file`
2. Verify page loads
3. Verify Direct File app initializes
4. Verify no errors

### Scenario 2: Authentication Flow
1. Navigate to `/tax/direct-file` (not logged in)
2. Verify redirect to login
3. Log in
4. Verify redirect back to `/tax/direct-file`
5. Verify page loads correctly

### Scenario 3: Direct File Navigation
1. Load Direct File app
2. Navigate through screens
3. Fill out forms
4. Verify data persists
5. Verify no routing conflicts

### Scenario 4: Export Functionality
1. Complete tax filing (or use test data)
2. Export to MeF XML
3. Verify export completes
4. Verify success notification
5. Verify metadata stored (no PII/FTI)

## Test Results Template

```
Date: [Date]
Tester: [Name]
Browser: [Browser/Version]

Services Status:
- Docker: [Running/Not Running]
- Backend API: [Running/Not Running]
- State API: [Running/Not Running]
- Email Service: [Running/Not Running]
- Next.js: [Running/Not Running]

Test Results:
- Page Load: [Pass/Fail]
- Authentication: [Pass/Fail]
- Direct File App: [Pass/Fail]
- API Integration: [Pass/Fail]
- Export: [Pass/Fail]

Issues Found:
- [List any issues]

Notes:
- [Additional notes]
```

## Next Steps After Testing

1. **Document Issues**: Record any issues found during testing
2. **Fix Critical Issues**: Address any blocking issues
3. **Performance Optimization**: Address any performance concerns
4. **Security Review**: Verify all security requirements met
5. **Production Readiness**: Assess readiness for production deployment

---

**Last Updated**: 2025-11-08

