# Wrangler Setup Guide

This guide explains how to set up and use Wrangler for deploying Cloudflare Workers.

## Prerequisites

✅ You're already logged in to Wrangler:
- Account: Admin@financbase.com
- Account ID: `f6d3a9509166b843e883145e262cb97a`

## Project Structure

```
├── wrangler.toml          # Wrangler configuration
├── workers/
│   ├── websocket.ts       # WebSocket Worker for support tickets
│   ├── tsconfig.json      # TypeScript config for workers
│   └── README.md          # Worker documentation
└── package.json           # Includes wrangler scripts
```

## Available Scripts

### Development

```bash
# Run worker locally for testing
pnpm worker:dev

# This starts the worker on localhost:8787
```

### Deployment

```bash
# Deploy to production
pnpm worker:deploy

# Deploy to staging
pnpm worker:deploy:staging

# Deploy to development
pnpm worker:deploy:dev
```

### Monitoring

```bash
# Tail production logs in real-time
pnpm worker:tail
```

## Configuration

### Environment Variables

Set environment variables via Wrangler CLI or Cloudflare Dashboard:

```bash
# Set a secret (encrypted, not visible in code)
wrangler secret put AUTH_API_KEY --env production

# Set a plain variable
wrangler secret put ENVIRONMENT=production --env production
```

Or use `.dev.vars` file for local development:

```bash
# .dev.vars (not committed to git)
ENVIRONMENT=development
LOG_LEVEL=debug
AUTH_API_KEY=your-dev-key
```

### Wrangler Configuration

The `wrangler.toml` file contains:

- **Worker name**: `financbase-websocket`
- **Main file**: `workers/websocket.ts`
- **Environments**: production, staging, development
- **Account ID**: Already configured

### Custom Domains

To use a custom domain (e.g., `websocket.financbase.com`):

1. Add your domain to Cloudflare
2. Uncomment and configure the routes in `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "websocket.financbase.com/*", zone_name = "financbase.com" }
]
```

3. Deploy: `pnpm worker:deploy`

## First Deployment

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Test locally**:
   ```bash
   pnpm worker:dev
   ```

3. **Deploy to development first**:
   ```bash
   pnpm worker:deploy:dev
   ```

4. **Update environment variable** in your Next.js app:
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL=wss://financbase-websocket-dev.your-subdomain.workers.dev
   ```

5. **Test the connection** from your app

6. **Deploy to production** when ready:
   ```bash
   pnpm worker:deploy
   ```

## Worker Features

### Current Implementation

- ✅ WebSocket connections
- ✅ Token-based authentication (placeholder - needs implementation)
- ✅ Room-based messaging (by ticket ID)
- ✅ Typing indicators
- ✅ Connection management
- ✅ Health check endpoint (`/health`)

### Security Requirements

⚠️ **Before production deployment**, implement:

1. **Proper Token Validation**
   - Replace placeholder in `workers/websocket.ts`
   - Validate against Clerk or your auth service
   - Example:
     ```typescript
     async function validateToken(token: string, env: Env) {
       const response = await fetch('https://your-api.com/auth/validate', {
         headers: { 'Authorization': `Bearer ${token}` }
       });
       return response.ok ? { valid: true, userId: '...' } : { valid: false };
     }
     ```

2. **Rate Limiting**
   - Add per-connection rate limits
   - Add per-user rate limits
   - Use Cloudflare Rate Limiting or implement in worker

3. **Connection Limits**
   - Limit connections per user
   - Limit connections per ticket

4. **Error Handling**
   - Improve error messages
   - Add error logging
   - Implement reconnection logic

5. **Monitoring**
   - Add metrics collection
   - Set up alerts
   - Monitor connection counts

### Future Enhancements

- [ ] Implement Durable Objects for state management
- [ ] Add R2 storage for message history
- [ ] Add KV namespace for connection state
- [ ] Implement message persistence
- [ ] Add metrics and monitoring
- [ ] Add support for multiple room types

## Troubleshooting

### Worker Not Starting

```bash
# Check wrangler installation
wrangler --version

# Check authentication
wrangler whoami

# Check configuration
wrangler deploy --dry-run
```

### Connection Issues

1. Check worker is deployed: `wrangler deployments list`
2. Check logs: `wrangler tail`
3. Test health endpoint: `curl https://your-worker.workers.dev/health`
4. Verify WebSocket URL in environment variables

### TypeScript Errors

Make sure `@cloudflare/workers-types` is installed (comes with wrangler):

```bash
pnpm add -D @cloudflare/workers-types
```

## Useful Commands

```bash
# List all deployments
wrangler deployments list

# View worker details
wrangler deployments describe <deployment-id>

# Delete a deployment
wrangler deployments delete <deployment-id>

# View logs
wrangler tail

# View logs with filters
wrangler tail --format pretty --status error

# Publish a worker without deploying
wrangler publish
```

## Resources

- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [WebSocket API Reference](https://developers.cloudflare.com/workers/runtime-apis/websockets/)

## Next Steps

1. ✅ Wrangler is configured
2. ✅ Worker code is ready
3. ⏳ Implement proper token validation
4. ⏳ Add rate limiting
5. ⏳ Deploy to development environment
6. ⏳ Test WebSocket connections
7. ⏳ Deploy to production

