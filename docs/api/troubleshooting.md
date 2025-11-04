# API Troubleshooting Guide

This guide helps you troubleshoot common issues when working with the Financbase API.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Rate Limiting](#rate-limiting)
3. [Validation Errors](#validation-errors)
4. [Server Errors](#server-errors)
5. [Timeout Issues](#timeout-issues)
6. [Response Format Issues](#response-format-issues)

## Authentication Issues

### Error: 401 Unauthorized

**Symptoms:**

- API requests return `401 Unauthorized`
- Error message: "Authentication required"

**Solutions:**

1. **Check Authorization Header**

   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.financbase.com/api/v1/health
   ```

2. **Verify Token Validity**
   - Ensure your Clerk session token is not expired
   - Refresh the token if it's expired

3. **Check Token Format**
   - Token should be in format: `Bearer <token>`
   - Ensure no extra spaces or quotes

### Error: 403 Forbidden

**Symptoms:**

- API requests return `403 Forbidden`
- Error message: "Forbidden access"

**Solutions:**

1. **Check User Permissions**
   - Verify your user account has the required permissions
   - Contact your administrator to grant access

2. **Verify Resource Ownership**
   - Ensure you're accessing resources you own or have permission to access
   - Check Row Level Security (RLS) policies

## Rate Limiting

### Error: 429 Too Many Requests

**Symptoms:**

- API requests return `429 Too Many Requests`
- Response includes `Retry-After` header

**Solutions:**

1. **Respect Rate Limits**
   - Standard tier: 100 requests per minute
   - Pro tier: 1000 requests per minute
   - Enterprise: Custom limits

2. **Implement Exponential Backoff**

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

3. **Check Rate Limit Headers**
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Remaining requests
   - `X-RateLimit-Reset`: Time when limit resets

## Validation Errors

### Error: 400 Bad Request

**Symptoms:**

- API requests return `400 Bad Request`
- Error includes `details` array with validation errors

**Solutions:**

1. **Check Request Body**

   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid request data",
       "details": [
         {
           "path": ["email"],
           "message": "Invalid email format"
         }
       ]
     }
   }
   ```

2. **Verify Required Fields**
   - Check that all required fields are present
   - Ensure field types match the expected format

3. **Review Field Constraints**
   - Check min/max length requirements
   - Verify allowed values for enums
   - Ensure date formats are correct

## Server Errors

### Error: 500 Internal Server Error

**Symptoms:**

- API requests return `500 Internal Server Error`
- Error includes `requestId` for tracking

**Solutions:**

1. **Check Request ID**
   - Use the `requestId` from the error response to contact support
   - Include request ID in bug reports

2. **Retry the Request**
   - Some errors may be transient
   - Implement retry logic with exponential backoff

3. **Verify Request Format**
   - Ensure request body matches API documentation
   - Check for any malformed data

## Timeout Issues

### Error: Request Timeout

**Symptoms:**

- Requests hang or timeout after 30 seconds
- No response received

**Solutions:**

1. **Check Request Size**
   - Large requests may timeout
   - Consider pagination or chunking data

2. **Verify Network Connectivity**
   - Check internet connection
   - Verify firewall/proxy settings

3. **Implement Timeout Handling**

   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000);
   
   try {
     const response = await fetch(url, { signal: controller.signal });
     clearTimeout(timeoutId);
     return response;
   } catch (error) {
     if (error.name === 'AbortError') {
       throw new Error('Request timeout');
     }
     throw error;
   }
   ```

## Response Format Issues

### Unexpected Response Structure

**Symptoms:**

- Response doesn't match expected format
- Missing expected fields

**Solutions:**

1. **Check API Version**
   - Verify you're using the correct API version
   - Check `X-API-Version` header in response

2. **Review Documentation**
   - Ensure you're using the latest API documentation
   - Check for breaking changes in API version updates

3. **Handle Deprecated Endpoints**
   - Check `X-API-Deprecated` header
   - Migrate to new endpoints before deprecation date

## Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `UNAUTHORIZED` | Authentication required | Include valid auth token |
| `FORBIDDEN` | Insufficient permissions | Check user permissions |
| `NOT_FOUND` | Resource not found | Verify resource ID exists |
| `VALIDATION_ERROR` | Invalid request data | Check request format |
| `INTERNAL_SERVER_ERROR` | Server error | Retry or contact support |

## Getting Help

If you continue to experience issues:

1. **Check Documentation**
   - Review [API Documentation](./README.md)
   - Check [API Versioning Guide](./API_VERSIONING.md)

2. **Contact Support**
   - Email: <support@financbase.com>
   - Include request ID from error response
   - Provide request details and error messages

3. **Check Status**
   - Visit [System Status Page](/status) for real-time system health monitoring
   - Check for known issues or maintenance

## Related Documentation

- [API Documentation](./README.md) - Complete API reference
- [API Versioning](./API_VERSIONING.md) - Version management
- [Error Handling](../architecture/BACKEND_ARCHITECTURE.md#error-handling) - Error handling patterns
