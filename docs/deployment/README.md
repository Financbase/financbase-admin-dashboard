# Financbase Deployment Guide

This guide provides comprehensive instructions for deploying the Financbase platform across different environments and hosting providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Redis**: 6.0 or higher (optional)
- **Memory**: 2GB RAM minimum
- **Storage**: 10GB available space

#### Recommended Requirements
- **Node.js**: 20.0.0 or higher
- **npm**: 9.0.0 or higher
- **PostgreSQL**: 15.0 or higher
- **Redis**: 7.0 or higher
- **Memory**: 4GB RAM or higher
- **Storage**: 50GB available space

### Required Services

#### Database
- **PostgreSQL**: Primary database
- **Neon**: Recommended cloud PostgreSQL provider
- **Alternative**: AWS RDS, Google Cloud SQL, or Azure Database

#### Authentication
- **Clerk**: User authentication and management
- **Alternative**: Auth0, Firebase Auth, or custom JWT implementation

#### External Services
- **Stripe**: Payment processing
- **Slack**: Team notifications
- **QuickBooks**: Accounting integration
- **Xero**: Accounting integration

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/financbase/financbase-admin-dashboard.git
cd financbase-admin-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/financbase"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
SLACK_BOT_TOKEN="xoxb-..."
QUICKBOOKS_CLIENT_ID="your-client-id"
QUICKBOOKS_CLIENT_SECRET="your-client-secret"
XERO_CLIENT_ID="your-client-id"
XERO_CLIENT_SECRET="your-client-secret"

# Security
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3010"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# OAuth State Secret
OAUTH_STATE_SECRET="your-oauth-state-secret"
```

### 4. Database Setup

#### Local Development

```bash
# Install PostgreSQL locally
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb financbase
```

#### Cloud Database (Neon)

1. **Create Neon Account**
   - Visit [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Connection String**
   - Copy the connection string from Neon dashboard
   - Update `DATABASE_URL` in `.env.local`

#### Database Migration

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

#### Deployment Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy to Vercel
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Navigate to your project
   - Go to Settings → Environment Variables
   - Add all required environment variables

3. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

4. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json` in the root directory:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "CLERK_SECRET_KEY": "@clerk_secret_key",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk_publishable_key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. Docker Deployment

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=financbase
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:migrate

# Seed database
docker-compose exec app npm run db:seed
```

### 3. AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify console
   - Connect your GitHub repository
   - Select the main branch

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add all required environment variables in Amplify console
   - Configure build environment variables

#### Using AWS ECS

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name financbase
   ```

2. **Create Task Definition**
   ```json
   {
     "family": "financbase",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "financbase",
         "image": "your-account.dkr.ecr.region.amazonaws.com/financbase:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "postgresql://username:password@host:5432/database"
           }
         ]
       }
     ]
   }
   ```

### 4. Google Cloud Deployment

#### Using Cloud Run

1. **Build and Push Image**
   ```bash
   # Build image
   docker build -t gcr.io/PROJECT_ID/financbase .
   
   # Push to Google Container Registry
   docker push gcr.io/PROJECT_ID/financbase
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy financbase \
     --image gcr.io/PROJECT_ID/financbase \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### 5. Self-Hosted Deployment

#### Using PM2

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   ```json
   {
     "apps": [
       {
         "name": "financbase",
         "script": "npm",
         "args": "start",
         "cwd": "/path/to/financbase",
         "instances": "max",
         "exec_mode": "cluster",
         "env": {
           "NODE_ENV": "production",
           "PORT": 3000
         }
       }
     ]
   }
   ```

3. **Start Application**
   ```bash
   pm2 start ecosystem.config.json
   pm2 save
   pm2 startup
   ```

#### Using Nginx

1. **Install Nginx**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install nginx
   
   # macOS
   brew install nginx
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Configuration

### 1. Development Environment

```bash
# .env.local
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/financbase_dev"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 2. Staging Environment

```bash
# .env.staging
NODE_ENV=staging
DATABASE_URL="postgresql://staging-db:5432/financbase_staging"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 3. Production Environment

```bash
# .env.production
NODE_ENV=production
DATABASE_URL="postgresql://prod-db:5432/financbase_prod"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

## Monitoring and Maintenance

### 1. Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.select().from(users).limit(1);
    
    // Check external services
    const services = await checkExternalServices();
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: services
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
```

### 2. Logging Configuration

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### 3. Performance Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

export { Sentry };
```

### 4. Database Maintenance

```bash
# Regular database maintenance
npm run db:generate  # Generate new migrations
npm run db:migrate  # Apply migrations
npm run db:seed     # Seed data (if needed)

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Database restore
psql $DATABASE_URL < backup_20240101_120000.sql
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Problem**: Cannot connect to database
**Solution**: Check connection string and network access

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. Authentication Issues

**Problem**: Users cannot log in
**Solution**: Verify Clerk configuration

```bash
# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY
```

#### 3. Build Issues

**Problem**: Build fails
**Solution**: Check dependencies and environment

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 4. Performance Issues

**Problem**: Slow response times
**Solution**: Check database queries and caching

```bash
# Check database performance
npm run db:analyze

# Check application performance
npm run performance:test
```

### Debugging

#### 1. Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=financbase:*
npm run dev
```

#### 2. Database Debugging

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('financbase'));
```

#### 3. Application Debugging

```typescript
// Add debug logging
console.log('Debug info:', { 
  workflowId, 
  stepId, 
  data: JSON.stringify(data, null, 2) 
});
```

### Support

#### 1. Documentation
- [API Documentation](../api/README.md) (external: docs.financbase.com/api - see [External Resources](../EXTERNAL_RESOURCES.md))
- [Component Documentation](../architecture/README.md) (external: docs.financbase.com/components - see [External Resources](../EXTERNAL_RESOURCES.md))
- [Deployment Guide](./README.md) (external: docs.financbase.com/deployment - see [External Resources](../EXTERNAL_RESOURCES.md))

#### 2. Community
- [Discord Community](https://discord.gg/financbase)
- [GitHub Discussions](https://github.com/financbase/financbase-admin-dashboard/discussions) (see [External Resources](../EXTERNAL_RESOURCES.md) for repository status)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/financbase)

#### 3. Professional Support
- [Enterprise Support](/enterprise) - Enterprise solutions and sales contact
- [Consulting Services](/consulting) - Consulting services and offerings
- [Training Programs](/training) - Comprehensive training materials

---

**Need Help?** Contact our support team at [support@financbase.com](mailto:support@financbase.com) or visit our [Help Center](../user-guides/) (external: help.financbase.com - see [External Resources](../EXTERNAL_RESOURCES.md)).