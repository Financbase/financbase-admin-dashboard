/**
 * Security Review Checklist
 * Final security audit of all API endpoints
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

# Security Review Checklist

## Authentication & Authorization

### Clerk Authentication
- [ ] All API routes require authentication via `auth()` from `@clerk/nextjs/server`
- [ ] Unauthenticated requests return 401 Unauthorized
- [ ] User ID is extracted from Clerk token correctly
- [ ] Organization context is extracted where needed

### Authorization Checks
- [ ] User can only access their own data (userId filtering)
- [ ] Admin-only endpoints check for admin role
- [ ] Organization-level access is properly scoped
- [ ] Resource ownership is verified before operations

## Input Validation

### API Endpoints
- [ ] All POST/PUT/PATCH endpoints validate request body
- [ ] All query parameters are validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] Type validation (Zod schemas or similar)
- [ ] Length limits on string inputs
- [ ] File upload size limits

### Common Vulnerabilities
- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in error messages
- [ ] Proper error handling without information leakage
- [ ] CORS is configured correctly
- [ ] CSRF protection where needed

## Rate Limiting

- [ ] Rate limiting is implemented on public endpoints
- [ ] Contact/support forms have rate limiting (Arcjet)
- [ ] API endpoints have appropriate rate limits
- [ ] Rate limit headers are returned to clients
- [ ] Rate limit errors are handled gracefully

## Security Headers

- [ ] Content-Security-Policy is set
- [ ] X-Frame-Options is set
- [ ] X-Content-Type-Options is set
- [ ] Strict-Transport-Security is set (HTTPS only)
- [ ] Referrer-Policy is set
- [ ] Permissions-Policy is set

## Data Protection

- [ ] Sensitive data is encrypted at rest
- [ ] Sensitive data is encrypted in transit (TLS)
- [ ] Passwords are never stored in plain text
- [ ] API keys are stored securely
- [ ] Database credentials are not exposed
- [ ] Environment variables are not logged

## API Security

### Endpoints to Review

#### Critical Endpoints
- [ ] `/api/auth/*` - Authentication endpoints
- [ ] `/api/users/*` - User management
- [ ] `/api/admin/*` - Admin operations
- [ ] `/api/webhooks/*` - Webhook management
- [ ] `/api/developer/*` - Developer API keys

#### Financial Endpoints
- [ ] `/api/invoices/*` - Invoice operations
- [ ] `/api/transactions/*` - Transaction operations
- [ ] `/api/expenses/*` - Expense operations
- [ ] `/api/budgets/*` - Budget operations

#### Data Endpoints
- [ ] `/api/clients/*` - Client data
- [ ] `/api/accounts/*` - Account data
- [ ] `/api/reconciliation/*` - Reconciliation data

### Security Checks per Endpoint

For each endpoint, verify:

1. **Authentication**: Requires valid Clerk token
2. **Authorization**: User can only access their own data
3. **Input Validation**: All inputs are validated
4. **SQL Injection**: Uses parameterized queries
5. **Error Handling**: Errors don't leak sensitive info
6. **Rate Limiting**: Appropriate limits are set
7. **Logging**: Security events are logged

## Review Process

1. **Automated Scanning**
   ```bash
   npm run test:security
   ```

2. **Manual Review**
   - Review each API route file
   - Check authentication/authorization
   - Verify input validation
   - Test error handling

3. **Penetration Testing**
   - Test for SQL injection
   - Test for XSS vulnerabilities
   - Test authentication bypass
   - Test authorization bypass

4. **Dependency Audit**
   ```bash
   npm audit
   ```

## Common Issues to Check

### SQL Injection
- [ ] No string concatenation in SQL queries
- [ ] All queries use parameterized statements
- [ ] User input is never directly in SQL

### XSS
- [ ] User input is sanitized before display
- [ ] React automatically escapes content
- [ ] No `dangerouslySetInnerHTML` with user input

### Authentication Bypass
- [ ] No endpoints skip authentication
- [ ] Token validation is always performed
- [ ] Session management is secure

### Authorization Bypass
- [ ] User ID is always verified
- [ ] Organization ID is always verified
- [ ] Admin checks are performed correctly

## Production Security Checklist

Before production deployment:

- [ ] All security headers are configured
- [ ] Rate limiting is active
- [ ] Error tracking is configured (Sentry)
- [ ] Security monitoring is enabled
- [ ] Dependencies are up to date
- [ ] No secrets in code or logs
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

## Incident Response

- [ ] Security incident response plan is documented
- [ ] Contact information for security issues
- [ ] Logging and monitoring for security events
- [ ] Backup and recovery procedures

