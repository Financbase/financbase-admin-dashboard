# Cloudflare Workers Deployment Status

**Last Updated:** 2025-11-04  
**Status:** ✅ All Environments Deployed

---

## Quick Reference

### Worker URLs

| Environment | Worker Name | URL |
|------------|-------------|-----|
| **Production** | `financbase-websocket` | `https://financbase-websocket.tight-queen-09af.workers.dev` |
| **Staging** | `financbase-websocket-staging` | `https://financbase-websocket-staging.tight-queen-09af.workers.dev` |
| **Development** | `financbase-websocket-dev` | `https://financbase-websocket-dev.tight-queen-09af.workers.dev` |

### WebSocket URLs (for environment variables)

```env
# Development
NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL=wss://financbase-websocket-dev.tight-queen-09af.workers.dev

# Staging
NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL=wss://financbase-websocket-staging.tight-queen-09af.workers.dev

# Production
NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL=wss://financbase-websocket.tight-queen-09af.workers.dev
```

---

## Health Check Endpoints

All environments respond to health checks:

```bash
# Production
curl https://financbase-websocket.tight-queen-09af.workers.dev/health

# Staging
curl https://financbase-websocket-staging.tight-queen-09af.workers.dev/health

# Development
curl https://financbase-websocket-dev.tight-queen-09af.workers.dev/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "environment": "production|staging|development",
  "connections": 0,
  "timestamp": "2025-11-04T22:38:47.093Z"
}
```

---

## Deployment Commands

```bash
# Deploy to development
pnpm worker:deploy:dev

# Deploy to staging
pnpm worker:deploy:staging

# Deploy to production
pnpm worker:deploy

# View logs
pnpm worker:tail

# Run locally
pnpm worker:dev
```

---

## Version IDs

- **Production:** `486b8ada-556f-4392-8c92-b5933e488797`
- **Staging:** `f6cdd8ee-1a93-4ab4-8003-6dc7f2eee578`
- **Development:** `b74a1c64-e1d9-4eea-a3e3-b0161e506871`

---

## Status

✅ **All workers deployed and operational**  
✅ **Health endpoints responding correctly**  
⚠️ **Token validation needs implementation before production use**  
⚠️ **Rate limiting not yet implemented**

For detailed information, see [WRANGLER_SETUP_VERIFICATION.md](./WRANGLER_SETUP_VERIFICATION.md).
