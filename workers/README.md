# Cloudflare Workers

This directory contains Cloudflare Workers for the Financbase platform.

## WebSocket Worker

The `websocket.ts` worker handles real-time WebSocket connections for support tickets and notifications.

### Features

- WebSocket connections for real-time communication
- Token-based authentication
- Room-based message broadcasting (by ticket ID)
- Typing indicators
- Connection management
- Health check endpoint

### Configuration

The worker is configured via `wrangler.toml` in the project root.

### Environment Variables

Set these in your Cloudflare dashboard or via wrangler:

- `ENVIRONMENT` - Environment name (production, staging, development)
- `LOG_LEVEL` - Logging level (info, debug, error)

### Deployment

#### First Time Setup

1. **Install Wrangler CLI** (if not already installed):
   ```bash
   npm install -g wrangler
   # or
   pnpm add -D wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Set up your account ID** (if not already set):
   ```bash
   wrangler whoami
   ```
   Update `wrangler.toml` with your account ID if needed.

#### Development

Run the worker locally:

```bash
wrangler dev workers/websocket.ts
```

This will start the worker on `localhost:8787` by default.

#### Deploy to Production

```bash
# Deploy to production
wrangler deploy --env production

# Deploy to staging
wrangler deploy --env staging

# Deploy to development
wrangler deploy --env development
```

### Testing

Test the WebSocket connection:

```bash
# Health check
curl https://your-worker.workers.dev/health

# WebSocket connection (use a WebSocket client)
wss://your-worker.workers.dev/ws?ticketId=123&token=your-token
```

### Security Notes

⚠️ **IMPORTANT**: The current implementation includes placeholder token validation. Before deploying to production:

1. Implement proper JWT token validation
2. Add rate limiting
3. Add connection limits per user/ticket
4. Implement proper error handling
5. Add monitoring and logging
6. Consider using Durable Objects for state management across multiple worker instances

### Future Enhancements

- [ ] Implement Durable Objects for state management
- [ ] Add R2 storage for message history
- [ ] Add KV namespace for connection state
- [ ] Implement proper authentication with Clerk or your auth service
- [ ] Add rate limiting per connection
- [ ] Add connection limits
- [ ] Add message persistence
- [ ] Add metrics and monitoring

