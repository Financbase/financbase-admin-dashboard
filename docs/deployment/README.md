# 🚀 Financbase Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Financbase to various environments, from development to production.

## 🏗️ Deployment Architecture

Financbase supports multiple deployment strategies:

- **Development**: Local development with hot reload
- **Docker**: Containerized deployment for consistency
- **CI/CD**: Automated deployment via GitHub Actions
- **Cloud Platforms**: Ready for Vercel, Netlify, Railway, etc.

## 🚀 Quick Deployment

### Using Docker (Recommended)

#### Development Deployment

```bash
# Clone and navigate to project
git clone https://github.com/your-org/financbase-admin-dashboard.git
cd financbase-admin-dashboard

# Start development environment
docker-compose up

# Access at http://localhost:3000
```

#### Production Deployment

```bash
# Start production environment with monitoring
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f financbase
```

### Using Deployment Script

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Deploy to different environments
./deploy.sh development  # Local development
./deploy.sh staging     # Staging environment
./deploy.sh production  # Production environment
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file (development) or `.env.production` file (production):

```bash
# Copy template
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

#### Critical Variables

```env
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Authentication (Clerk) - REQUIRED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Neon) - REQUIRED
DATABASE_URL=postgresql://username:password@hostname/database

# AI Services (OpenAI) - REQUIRED for AI features
OPENAI_API_KEY=sk-...

# Email (Resend) - REQUIRED for email features
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-domain.com
```

#### Optional but Recommended

```env
# Search (Algolia)
NEXT_PUBLIC_ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_KEY=...

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Sentry)
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Security (Arcjet)
ARCJET_KEY=ajkey_...

# File Storage (UploadThing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f financbase

# Stop services
docker-compose down
```

### Production with Docker

```bash
# Start production stack
docker-compose -f docker-compose.production.yml up -d

# Start with backups enabled
docker-compose -f docker-compose.production.yml --profile backup up -d

# Check service health
curl http://localhost:3000/api/health

# Monitor with Grafana
open http://localhost:3001
```

### Docker Commands Reference

```bash
# Build images
docker-compose build

# Rebuild specific service
docker-compose build financbase

# Scale services
docker-compose up -d --scale financbase=3

# Update containers
docker-compose pull
docker-compose up -d

# Backup database
docker exec financbase_postgres_1 pg_dump -U financbase_user financbase > backup.sql
```

## ☁️ Cloud Platform Deployment

### Vercel (Recommended for Production)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link project
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables from `.env.production.template`

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod

   # Deploy to preview
   vercel
   ```

### Netlify Deployment

1. **Build Configuration**
   ```bash
   # Create netlify.toml
   cp netlify.toml.example netlify.toml
   # Edit with your configuration
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli

   # Deploy
   netlify deploy --prod --dir=.next
   ```

### Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Add PostgreSQL service
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
# ... add other variables

# Deploy
railway up
```

## 🔄 CI/CD Pipeline

### GitHub Actions

The project includes a complete CI/CD pipeline that:

1. **Runs Tests** - Unit, integration, and E2E tests
2. **Security Scanning** - Vulnerability checks and audits
3. **Performance Testing** - Lighthouse CI for performance
4. **Build Validation** - TypeScript and linting checks
5. **Automated Deployment** - Deploy to staging/production

### Manual Deployment

```bash
# Trigger deployment manually
gh workflow run "CI/CD Pipeline"

# Check deployment status
gh run list
```

## 📊 Monitoring Setup

### Health Monitoring

```bash
# Check application health
curl https://your-domain.com/api/health

# Should return:
# {"status":"healthy","overall":"healthy",...}
```

### Grafana Dashboards

1. **Access Grafana** (in production Docker stack)
   ```
   http://your-server:3001
   ```

2. **Default Credentials**
   - Username: `admin`
   - Password: Set in `GRAFANA_ADMIN_PASSWORD` environment variable

3. **Available Dashboards**
   - Financbase Application Dashboard
   - Database Performance
   - System Metrics

### Prometheus Metrics

Access Prometheus at `http://your-server:9090` for:
- Application metrics
- Database statistics
- System performance data

## 🔒 SSL/TLS Setup

### Automatic (with Reverse Proxy)

The Docker production stack includes Nginx with SSL termination:

```bash
# Generate SSL certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to Nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

### Manual SSL Configuration

For custom SSL setup, update `nginx/production.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # SSL Security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
}
```

## 🗄️ Database Management

### Migrations

```bash
# Generate new migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push

# Check migration status
npx drizzle-kit check
```

### Backup and Recovery

#### Automated Backups (Docker)

```bash
# Enable backup service
docker-compose -f docker-compose.production.yml --profile backup up -d

# List backups
ls -la backups/

# Restore from backup
docker exec financbase_postgres_1 psql -U financbase_user -d financbase < backup.sql
```

#### Manual Backup

```bash
# Create backup
pg_dump -h localhost -U financbase_user -d financbase > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U financbase_user -d financbase < backup.sql
```

## 🚨 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Database Connection Issues

```bash
# Check database connectivity
npx drizzle-kit check

# Verify environment variables
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### Performance Issues

```bash
# Check memory usage
docker stats

# Monitor database performance
docker exec financbase_postgres_1 psql -c "SELECT * FROM pg_stat_activity;"

# Check application logs
docker-compose logs -f financbase
```

### Logs and Debugging

#### Application Logs

```bash
# View application logs
docker-compose logs -f financbase

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

#### Error Tracking

- **Sentry Dashboard**: Monitor errors in real-time
- **Application Logs**: Check container logs for detailed errors
- **Database Logs**: PostgreSQL logs for query issues

### Performance Monitoring

#### Key Metrics to Monitor

1. **Response Time** - Should be < 200ms for most requests
2. **Error Rate** - Should be < 1% in production
3. **Database Connections** - Monitor connection pool usage
4. **Memory Usage** - Should not exceed 80% of allocated memory
5. **CPU Usage** - Should not exceed 70% consistently

#### Performance Optimization

```bash
# Enable performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Enable query logging (development only)
NEXT_PUBLIC_ENABLE_QUERY_LOGGING=true

# Bundle analysis
ANALYZE=true npm run build
```

## 🔧 Maintenance

### Regular Tasks

#### Daily
- Monitor error rates and response times
- Check database performance and connection counts
- Review application logs for issues

#### Weekly
- Review analytics and user engagement metrics
- Check backup integrity and rotation
- Update dependencies for security patches

#### Monthly
- Performance testing and optimization
- Security audit and vulnerability scanning
- Database maintenance and optimization

### Update Procedures

#### Application Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run tests
npm run test:run

# Build and deploy
npm run build
./deploy.sh production
```

#### Database Schema Updates

```bash
# Generate new migration
npx drizzle-kit generate

# Review migration file
cat drizzle/migrations/$(ls -t drizzle/migrations/ | head -1)

# Apply migration
npx drizzle-kit push
```

## 📞 Support & Contact

### Getting Help

1. **Documentation**: Check this deployment guide first
2. **GitHub Issues**: Report bugs and request features
3. **Discussions**: Ask questions in GitHub Discussions
4. **Email Support**: support@financbase.com for enterprise customers

### Emergency Contacts

- **Critical Issues**: Immediately contact technical lead
- **Security Incidents**: Follow security incident response plan
- **Data Loss**: Check automated backups and restore procedures

---

*Last updated: January 2024*
