# Email Delivery Issues Runbook

**Severity**: Medium (P2)  
**Status**: Active

## Overview

This runbook provides procedures for diagnosing and resolving email delivery issues in the Financbase Admin Dashboard.

## Symptoms

- Emails not being sent
- Emails not being received
- Email delivery delays
- Email bounce errors
- SMTP authentication failures
- Email service API errors

## Root Causes

1. **Email Service Configuration**
   - Incorrect SMTP credentials
   - Missing API keys
   - Wrong service endpoint

2. **Email Service Provider Issues**
   - Service outage
   - Rate limiting
   - Account suspension

3. **Email Content Issues**
   - Invalid email addresses
   - Spam filtering
   - Content policy violations

4. **Network/Firewall Issues**
   - SMTP port blocked
   - API endpoint inaccessible
   - DNS resolution problems

## Resolution Steps

### Step 1: Verify Email Service Configuration

1. **Check Environment Variables**

   ```bash
   # Resend configuration
   echo $RESEND_API_KEY
   
   # SMTP configuration (if used)
   echo $SMTP_HOST
   echo $SMTP_PORT
   echo $SMTP_USER
   echo $SMTP_PASSWORD
   ```

2. **Verify API Keys**
   - Check Resend dashboard for API key status
   - Verify API key permissions
   - Ensure API key is not expired

### Step 2: Test Email Service

1. **Test Resend API**

   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test email</p>"
     }'
   ```

2. **Check Application Logs**

   ```bash
   grep "email" /var/log/app.log
   grep "resend" /var/log/app.log
   grep "smtp" /var/log/app.log
   ```

### Step 3: Diagnose Specific Issues

#### Issue: Emails Not Being Sent

1. **Check Application Code**

   ```typescript
   // Verify email service is being called
   // Check for error handling
   try {
     await emailService.sendEmail({...});
   } catch (error) {
     console.error('Email send error:', error);
   }
   ```

2. **Verify Email Service Status**
   - Check Resend status page
   - Verify account is not suspended
   - Check rate limits

#### Issue: Emails Not Being Received

1. **Check Email Addresses**
   - Verify recipient email is valid
   - Check for typos in email addresses
   - Verify email domain is active

2. **Check Spam Filters**
   - Check spam/junk folders
   - Verify sender reputation
   - Check SPF/DKIM records

3. **Check Email Bounces**

   ```bash
   # Review bounce logs
   # Check Resend dashboard for bounce reports
   ```

#### Issue: Authentication Failures

1. **SMTP Authentication**

   ```bash
   # Test SMTP connection
   telnet smtp.example.com 587
   
   # Test authentication
   # Verify credentials are correct
   ```

2. **API Authentication**
   - Verify API key is correct
   - Check API key permissions
   - Ensure API key is not revoked

### Step 4: Resolve Email Service Issues

1. **Update Configuration**

   ```bash
   # Update environment variables
   # Restart application
   # Test email sending
   ```

2. **Handle Rate Limiting**
   - Implement retry logic with exponential backoff
   - Queue emails if rate limit exceeded
   - Upgrade service tier if needed

3. **Fix Email Content**
   - Review email templates
   - Ensure proper formatting
   - Verify sender address is authorized

### Step 5: Verify Resolution

1. **Send Test Email**

   ```bash
   # Use application test endpoint
   curl -X POST https://api.financbase.com/api/test-email
   ```

2. **Monitor Email Delivery**
   - Check email service dashboard
   - Review delivery logs
   - Verify emails are being received

## Prevention

### Best Practices

1. **Email Service Configuration**
   - Use environment variables for credentials
   - Rotate API keys regularly
   - Monitor API key usage

2. **Error Handling**

   ```typescript
   try {
     await emailService.sendEmail({
       to: recipient,
       subject: subject,
       html: content
     });
   } catch (error) {
     // Log error
     console.error('Email send failed:', error);
     
     // Retry with exponential backoff
     await retryWithBackoff(() => emailService.sendEmail({...}));
     
     // Queue for later if persistent failure
     if (error.isPersistent) {
       await emailQueue.add({...});
     }
   }
   ```

3. **Email Validation**
   - Validate email addresses before sending
   - Check for invalid domains
   - Verify email format

4. **Monitoring**
   - Track email delivery rates
   - Monitor bounce rates
   - Set up alerts for delivery failures

### Email Service Setup

1. **Resend Configuration**

   ```typescript
   // lib/services/email-service.ts
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendEmail({
     to,
     subject,
     html
   }) {
     return await resend.emails.send({
       from: 'noreply@financbase.com',
       to,
       subject,
       html
     });
   }
   ```

2. **Environment Variables**

   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@financbase.com
   ```

## Related Runbooks

- [API Rate Limiting](./api-rate-limiting.md)
- [Database Performance](./database-performance.md)

## References

- [Resend Documentation](https://resend.com/docs)
- [Email Configuration Guide](../configuration/RESEND_CONFIGURATION.md)
- [SMTP Best Practices](https://www.ietf.org/rfc/rfc5321.txt)

## Emergency Contacts

- **Email Service Provider**: <support@resend.com>
- **On-Call Engineer**: [Contact Info]
- **DevOps Team**: [Contact Info]
