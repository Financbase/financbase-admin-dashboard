# Build and Deployment Issues Runbook

**Severity**: High (P1)  
**Status**: Active

## Overview

This runbook provides procedures for diagnosing and resolving build and deployment issues in the Financbase Admin Dashboard.

## Symptoms

- Build failures in CI/CD pipeline
- Deployment timeouts
- Application not starting after deployment
- Environment variable errors
- Missing dependencies
- TypeScript compilation errors
- Build cache issues

## Root Causes

1. **Environment Configuration**
   - Missing environment variables
   - Incorrect environment variable values
   - Environment-specific configuration issues

2. **Dependency Issues**
   - Missing or outdated dependencies
   - Dependency conflicts
   - Lock file out of sync

3. **Build Configuration**
   - TypeScript configuration errors
   - Next.js configuration issues
   - Build script failures

4. **Infrastructure Issues**
   - Deployment platform issues
   - Resource constraints
   - Network connectivity problems

## Resolution Steps

### Step 1: Verify Build Environment

1. **Check Environment Variables**

   ```bash
   # Verify required environment variables
   echo $DATABASE_URL
   echo $CLERK_SECRET_KEY
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```

2. **Review Build Logs**

   ```bash
   # Check CI/CD logs for errors
   # Look for:
   # - Missing environment variables
   # - Dependency installation failures
   # - TypeScript errors
   # - Build timeout errors
   ```

### Step 2: Resolve Dependency Issues

1. **Clean and Reinstall Dependencies**

   ```bash
   # Remove node_modules and lock file
   rm -rf node_modules pnpm-lock.yaml
   
   # Reinstall dependencies
   pnpm install
   ```

2. **Verify Lock File**

   ```bash
   # Ensure lock file is up to date
   pnpm install --frozen-lockfile
   ```

3. **Check for Dependency Conflicts**

   ```bash
   # Check for peer dependency issues
   pnpm ls --depth=0
   ```

### Step 3: Fix Build Configuration

1. **TypeScript Errors**

   ```bash
   # Run type check
   pnpm run type-check
   
   # Fix type errors
   # Review tsconfig.json for configuration issues
   ```

2. **Next.js Configuration**

   ```bash
   # Check next.config.mjs
   # Verify all required configuration is present
   # Check for syntax errors
   ```

3. **Build Script**

   ```bash
   # Test build locally
   pnpm run build
   
   # Check for build errors
   # Review build output for warnings
   ```

### Step 4: Resolve Deployment Issues

1. **Vercel Deployment**

   ```bash
   # Check deployment logs
   vercel logs [deployment-url]
   
   # Verify environment variables in Vercel dashboard
   # Check build settings
   ```

2. **Check Build Output**

   ```bash
   # Verify .next directory is generated
   ls -la .next
   
   # Check for build artifacts
   ```

3. **Verify Application Startup**

   ```bash
   # Test application locally
   pnpm run build
   pnpm run start
   
   # Check for runtime errors
   ```

### Step 5: Common Build Errors

#### Missing Environment Variables

**Error**: `Missing required environment variable: DATABASE_URL`

**Solution**:

```bash
# Add to .env.local
DATABASE_URL=postgresql://...

# For Vercel, add in dashboard
# Settings > Environment Variables
```

#### TypeScript Errors

**Error**: `Type error: Property 'x' does not exist on type 'Y'`

**Solution**:

- Fix type definitions
- Update TypeScript configuration if needed
- Add type assertions where appropriate

#### Next.js Build Errors

**Error**: `Error: Failed to compile`

**Solution**:

- Check for syntax errors
- Verify all imports are correct
- Check for missing dependencies
- Review Next.js configuration

#### Build Timeout

**Error**: `Build timeout after X seconds`

**Solution**:

- Optimize build process
- Reduce bundle size
- Check for circular dependencies
- Review build configuration

## Prevention

### Best Practices

1. **Environment Configuration**
   - Document all required environment variables
   - Use environment variable validation
   - Test builds with production-like environment

2. **Dependency Management**
   - Keep dependencies up to date
   - Use lock files consistently
   - Review dependency updates regularly

3. **Build Optimization**
   - Monitor build times
   - Optimize bundle size
   - Use build caching effectively

4. **CI/CD Configuration**
   - Test builds before deployment
   - Use staging environment
   - Implement rollback procedures

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Dependencies installed successfully
- [ ] TypeScript compilation passes
- [ ] Build completes without errors
- [ ] Application starts successfully
- [ ] Health check endpoint responds
- [ ] Database connection works

## Related Runbooks

- [Database Connection Issues](./database-connection.md)
- [Database Performance](./database-performance.md)

## References

- [Deployment Guide](../deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

## Emergency Contacts

- **DevOps Team**: [Contact Info]
- **On-Call Engineer**: [Contact Info]
- **Build Team**: [Contact Info]
