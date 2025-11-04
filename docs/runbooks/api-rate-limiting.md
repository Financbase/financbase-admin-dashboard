# API Rate Limiting Runbook

**Severity**: High (P1)  
**Status**: Active

## Overview

This runbook provides procedures for handling API rate limiting issues in the Financbase Admin Dashboard.

## Symptoms

- API requests return `429 Too Many Requests`
- Response includes `Retry-After` header
- `X-RateLimit-Remaining` header shows 0
- Client applications fail with rate limit errors
- Users unable to make API requests

## Root Causes

1. **High Request Volume**
   - Legitimate high traffic from users
   - Automated scripts making too many requests
   - Background jobs making excessive API calls

2. **Misconfigured Rate Limits**
   - Rate limits set too low for expected traffic
   - Missing rate limit configuration

3. **Client Implementation Issues**
   - Clients not implementing exponential backoff
   - Clients making requests too frequently
   - Missing rate limit header handling

4. **DDoS or Malicious Traffic**
   - Coordinated attack
   - Bot traffic
   - Scraping attempts

## Resolution Steps

### Step 1: Verify Rate Limit Status

1. Check rate limit headers in response:

   ```bash
   curl -I https://api.financbase.com/api/v1/health
   ```

   Look for:
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Remaining requests
   - `X-RateLimit-Reset`: Time when limit resets
   - `Retry-After`: Seconds to wait before retry

2. Check application logs for rate limit errors:

   ```bash
   grep "429" /var/log/app.log
   ```

### Step 2: Identify Affected Users/Endpoints

1. Check monitoring dashboard for:
   - Rate limit error frequency
   - Affected API endpoints
   - User IDs or IP addresses hitting limits

2. Review rate limit logs:

   ```sql
   SELECT user_id, endpoint, COUNT(*) 
   FROM rate_limit_logs 
   WHERE status = 429 
   GROUP BY user_id, endpoint
   ORDER BY COUNT(*) DESC;
   ```

### Step 3: Temporary Mitigation

1. **Increase Rate Limits (Emergency)**
   - For specific users: Update rate limit configuration
   - For specific endpoints: Adjust endpoint-specific limits
   - Monitor for abuse

2. **Whitelist IP Addresses (If Legitimate)**
   - Only for verified legitimate high-volume users
   - Document whitelist reason
   - Set expiration date

3. **Implement Circuit Breaker**
   - Temporarily disable non-critical endpoints
   - Reduce rate limit impact

### Step 4: Fix Root Cause

1. **For Legitimate High Traffic:**
   - Review rate limit configuration
   - Adjust limits based on actual usage patterns
   - Consider tiered rate limits per user plan

2. **For Client Issues:**
   - Contact client developers
   - Provide rate limit documentation
   - Share best practices for exponential backoff

3. **For Malicious Traffic:**
   - Block offending IP addresses
   - Enable additional security measures
   - Review security logs

### Step 5: Verify Resolution

1. Monitor rate limit errors:

   ```bash
   watch -n 5 'curl -s https://api.financbase.com/api/v1/health | grep -i rate'
   ```

2. Check application metrics:
   - Rate limit error rate should decrease
   - Normal API traffic should resume
   - No false positives

## Prevention

### Configuration

1. **Set Appropriate Rate Limits**
   - Standard tier: 100 requests/minute
   - Pro tier: 1000 requests/minute
   - Enterprise: Custom limits based on usage

2. **Monitor Rate Limit Usage**
   - Set up alerts for high rate limit usage
   - Monitor rate limit error trends
   - Review rate limit configuration regularly

3. **Client Documentation**
   - Provide clear rate limit documentation
   - Include examples of exponential backoff
   - Share best practices

### Best Practices

1. **Implement Exponential Backoff**

   ```typescript
   async function requestWithRetry(url: string, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch(url);
         if (response.status === 429) {
           const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
           await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
           continue;
         }
         return response;
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
       }
     }
   }
   ```

2. **Respect Rate Limit Headers**
   - Always check `X-RateLimit-Remaining`
   - Implement request queuing when limit is low
   - Use `Retry-After` header for retry timing

3. **Cache Responses**
   - Cache GET requests when possible
   - Reduce API call frequency
   - Use ETags for conditional requests

## Related Runbooks

- [Database Performance](./database-performance.md) - Performance troubleshooting
- [Build and Deployment](./build-deployment.md) - Deployment issues

## References

- [API Rate Limiting Documentation](../api/README.md#rate-limits)
- [Rate Limiting Best Practices](https://stripe.com/docs/rate-limits)

## Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **API Team**: <api@financbase.com>
- **Security Team**: <security@financbase.com>
