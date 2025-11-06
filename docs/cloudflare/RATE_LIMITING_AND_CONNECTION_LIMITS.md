# Rate Limiting and Connection Limits

**Last Updated:** 2025-11-04  
**Status:** ✅ Implemented and Deployed

---

## Overview

The WebSocket worker now includes comprehensive rate limiting and connection limits to prevent abuse and ensure fair resource usage.

---

## Rate Limiting

### Message Rate Limits

- **Limit:** 60 messages per minute per user
- **Window:** 60 seconds (rolling window)
- **Scope:** Per user across all connections
- **Exemptions:** `ping` messages are exempt from rate limiting

### Implementation Details

- Rate limiting is tracked per user ID
- Counter resets when the time window expires
- Rate limit data is cleaned up when a user has no active connections
- Error messages include reset time for client feedback

### Rate Limit Response

When rate limit is exceeded, the client receives:
```json
{
  "type": "error",
  "message": "Rate limit exceeded. Please slow down.",
  "code": "RATE_LIMIT_EXCEEDED",
  "resetAt": "2025-11-04T22:45:00.000Z"
}
```

---

## Connection Limits

### Per-User Connection Limit

- **Limit:** 5 connections per user
- **Scope:** All connections for a user across all tickets
- **Response:** HTTP 429 (Too Many Requests)

### Per-Ticket Connection Limit

- **Limit:** 20 connections per ticket
- **Scope:** All connections for a specific ticket
- **Response:** HTTP 429 (Too Many Requests)

### Connection Limit Responses

**User Limit Exceeded:**
```
Connection limit exceeded: Maximum 5 connections per user
```

**Ticket Limit Exceeded:**
```
Connection limit exceeded: Maximum 20 connections per ticket
```

---

## Message Validation

### Content Validation

- **Type:** Must be a string
- **Length:** Maximum 10KB per message
- **Validation:** Performed before rate limit check

### Invalid Message Responses

**Invalid Content:**
```json
{
  "type": "error",
  "message": "Invalid message content"
}
```

**Message Too Long:**
```json
{
  "type": "error",
  "message": "Message too long. Maximum 10KB allowed."
}
```

---

## Health Endpoint

The health endpoint now includes limit information:

```bash
curl https://financbase-websocket-dev.tight-queen-09af.workers.dev/health
```

**Response:**
```json
{
  "status": "ok",
  "environment": "development",
  "connections": 0,
  "uniqueUsers": 0,
  "uniqueTickets": 0,
  "limits": {
    "maxConnectionsPerUser": 5,
    "maxConnectionsPerTicket": 20,
    "maxMessagesPerMinute": 60
  },
  "timestamp": "2025-11-04T22:42:18.313Z"
}
```

---

## Configuration

Limits are configured as constants in `workers/websocket.ts`:

```typescript
const MAX_CONNECTIONS_PER_USER = 5;
const MAX_CONNECTIONS_PER_TICKET = 20;
const MAX_MESSAGES_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
```

To adjust limits, modify these constants and redeploy.

---

## Testing

### Test Rate Limiting

1. Connect to the WebSocket
2. Send 60+ messages within 1 minute
3. Verify rate limit error is returned

### Test Connection Limits

1. Open 5 connections with the same user
2. Attempt to open a 6th connection
3. Verify connection limit error (HTTP 429)

### Test Tools

1. **Browser Test:** Open `public/test-websocket.html` in your browser
2. **Node.js Test:** Run `node scripts/test-websocket.js dev test-ticket-123 test-token`

---

## Monitoring

### Debug Logging

In development/staging environments with `LOG_LEVEL=debug`:
- Rate limit checks are logged with remaining count
- Connection limit violations are logged with user/ticket IDs

### Metrics to Monitor

- Total connections
- Unique users
- Unique tickets
- Rate limit violations
- Connection limit rejections

---

## Best Practices

1. **Client-Side Rate Limiting:**
   - Implement client-side throttling to avoid hitting server limits
   - Show rate limit warnings to users before they hit the limit

2. **Error Handling:**
   - Handle `RATE_LIMIT_EXCEEDED` errors gracefully
   - Display reset time to users
   - Implement exponential backoff for retries

3. **Connection Management:**
   - Close unused connections promptly
   - Implement connection pooling if needed
   - Monitor connection counts per user

---

## Future Enhancements

- [ ] Configurable limits via environment variables
- [ ] Per-ticket rate limits
- [ ] IP-based rate limiting
- [ ] Durable Objects for distributed rate limiting
- [ ] Metrics export to Cloudflare Analytics

---

## Deployment Status

✅ **Development:** Deployed with rate limiting and connection limits  
✅ **Staging:** Deployed with rate limiting and connection limits  
✅ **Production:** Deployed with rate limiting and connection limits

---

## Related Documentation

- [WRANGLER_SETUP_VERIFICATION.md](./WRANGLER_SETUP_VERIFICATION.md)
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)
- [workers/README.md](../../workers/README.md)

