# Deployment & DevOps

## Overview

The Financbase Admin Dashboard is deployed on Vercel with automated CI/CD, environment management, Docker support, and comprehensive monitoring.

## Deployment Platform

### Vercel

- **Hosting**: Vercel Edge Network
- **CDN**: Automatic global CDN distribution
- **SSL**: Automatic HTTPS certificates
- **Edge Functions**: Serverless function execution
- **Analytics**: Built-in performance monitoring

### Deployment Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## Environment Management

### Environment Variables

**Production:**

- `DATABASE_URL`: Neon PostgreSQL connection
- `CLERK_SECRET_KEY`: Clerk authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public Clerk key
- AI provider API keys (OpenAI, Claude, Google)
- Other service credentials

**Development:**

- `.env.local`: Local development variables
- `.env.test.local`: Test environment variables

### Environment Configuration

See [Environment Variables Guide](../configuration/ENVIRONMENT_VARIABLES.md) for complete list.

## CI/CD Pipeline

### GitHub Actions

**Workflows:**

1. **PR Checks**: Lint, type check, unit tests
2. **Deployment**: Automatic deployment on merge
3. **Schema Validation**: Database schema checks
4. **Security Scanning**: SAST/SCA scans

### Deployment Stages

1. **Development**: Auto-deploy from `develop` branch
2. **Staging**: Auto-deploy from `staging` branch
3. **Production**: Manual approval for `main` branch

## Database Migrations

### Migration Strategy

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:push  # Direct push
# OR
pnpm db:migrate  # Run migration files
```

### Deployment Script

```59:75:deploy.sh
# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Use production database URL
        DATABASE_URL=$(grep "DATABASE_URL=" "$PROJECT_ROOT/.env.$ENVIRONMENT" | cut -d '=' -f2)
    else
        # Use local database for development/staging
        DATABASE_URL="postgresql://financbase_user:financbase_password@localhost:5432/financbase"
    fi

    # Run migrations using Drizzle
    npx drizzle-kit push --config ./drizzle.config.ts

    print_success "Database migrations completed"
}
```

## Docker Support

### Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
```

### Dockerfiles

- **Dockerfile**: Production container
- **docker-compose.yml**: Development setup
- **docker-compose.production.yml**: Production setup

## Monitoring & Observability

### Sentry Integration

```typescript
// config/sentry/sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Features:**

- Error tracking
- Performance monitoring
- Release tracking
- User context

### Vercel Analytics

- Real-time performance metrics
- Web Vitals tracking
- Traffic analytics
- Error monitoring

### Health Checks

```10:43:app/api/v1/health/route.ts
export async function GET(request: Request) {
 try {
  const versionContext = getApiVersionContext(request as any);
  const healthStatus = await HealthCheckService.performHealthCheck();
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
        healthStatus.status === 'degraded' ? 200 : 503;
  
  const response = NextResponse.json(healthStatus, { status: statusCode });
  
  // Set version headers
  const headers = new Headers(response.headers);
  setVersionHeaders(headers as any, versionContext.version);
  
  return new NextResponse(response.body, {
   status: statusCode,
   headers,
  });
 } catch (error) {
  const response = NextResponse.json({
   status: 'unhealthy',
   timestamp: new Date().toISOString(),
   error: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 503 });
  
  const headers = new Headers(response.headers);
  setVersionHeaders(headers as any, 'v1');
  
  return new NextResponse(response.body, {
   status: 503,
   headers,
  });
 }
}
```

## Build Process

### Next.js Build

```typescript
// next.config.mjs
output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
```

**Build Output:**

- Standalone production build
- Optimized bundles
- Static page generation
- Server component optimization

### Build Commands

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true next build"
  }
}
```

## Backup & Recovery

### Database Backups

**Neon Serverless:**

- Automatic point-in-time recovery
- 7-day retention
- Manual snapshots
- Branch-based backups

### Backup Strategy

1. **Automatic**: Neon handles continuous backups
2. **Point-in-Time**: Restore to any point (last 7 days)
3. **Manual Snapshots**: Before major migrations
4. **Branch Testing**: Use branches for safe testing

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests
- [ ] Check code coverage
- [ ] Review security scan results
- [ ] Update environment variables
- [ ] Review migration scripts
- [ ] Check dependencies for vulnerabilities

### Deployment

- [ ] Run database migrations
- [ ] Deploy application
- [ ] Verify health endpoint
- [ ] Test critical flows
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-Deployment

- [ ] Monitor error tracking
- [ ] Check performance dashboards
- [ ] Verify analytics
- [ ] Review logs
- [ ] Confirm backups

## Rollback Procedures

### Application Rollback

1. **Vercel**: Use previous deployment in dashboard
2. **Git**: Revert commit and redeploy
3. **Database**: Use point-in-time recovery if needed

### Database Rollback

1. **Use Neon branches** for safe testing
2. **Point-in-time recovery** for production issues
3. **Migration rollback scripts** (if created)

## Scaling

### Horizontal Scaling

- **Vercel**: Automatic scaling
- **Edge Network**: Global distribution
- **Database**: Neon automatic scaling

### Performance Scaling

- **CDN Caching**: Static asset caching
- **Edge Functions**: Regional execution
- **Database Indexing**: Query optimization

## Security in Deployment

### Secrets Management

- **Vercel Environment Variables**: Encrypted storage
- **No secrets in code**: All via environment
- **Rotation**: Regular key rotation

### Security Headers

```121:152:next.config.mjs
 headers: async () => {
  return [
   {
    source: '/(.*)',
    headers: [
     {
      key: 'X-Frame-Options',
      value: 'DENY',
     },
     {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
     },
     {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
     },
     {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
     },
     {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
     },
     {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.financbase.com https://js.clerk.com https://clerk.com https://content-alien-33.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.financbase.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.financbase.com wss://ws.financbase.com https://clerk.com https://content-alien-33.clerk.accounts.dev https://clerk-telemetry.com; frame-src https://clerk.com https://js.clerk.com https://content-alien-33.clerk.accounts.dev; worker-src 'self' blob:;",
     },
    ],
   },
  ];
 },
```

## Best Practices

### Deployment

1. **Test in staging** before production
2. **Use feature flags** for gradual rollouts
3. **Monitor during deployment**
4. **Have rollback plan** ready
5. **Communicate deployments** to team

### Monitoring

1. **Set up alerts** for critical metrics
2. **Monitor error rates** continuously
3. **Track performance** metrics
4. **Review logs** regularly
5. **Update dependencies** regularly

## Related Documentation

- [Production Deployment Guide](../deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Schema Migration Guide](../deployment/SCHEMA_MIGRATION_GUIDE.md)
- [Deployment Readiness Checklist](../deployment/DEPLOYMENT_READINESS_CHECKLIST.md)
