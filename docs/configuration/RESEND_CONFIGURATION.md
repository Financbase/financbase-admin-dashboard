# Resend Configuration for Email Sending

## 1. Get Resend API Key

1. Go to [Resend Dashboard](https://resend.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Create a new API key with the following permissions:
   - **Send emails**
   - **Read domains**
5. Copy the API key (starts with `re_`)

## 2. Configure Environment Variables

Add to your `.env.local` file:
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important**: 
- Replace `yourdomain.com` with your actual domain
- The domain must be verified in Resend
- For development, you can use `onboarding@resend.dev` (Resend's test domain)

## 3. Verify Your Domain (Production)

### In Resend Dashboard:
1. Go to **Domains** section
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow the DNS verification steps
5. Wait for verification to complete

### DNS Records to Add:
```
Type: TXT
Name: @
Value: resend._domainkey.yourdomain.com
```

## 4. Test Email Sending

### Development Testing:
```bash
# Test with Resend's test domain
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Production Testing:
```bash
# Test with your verified domain
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 5. Email Templates

The onboarding system includes these email templates:

### Persona-Specific Welcome Emails:
- **Digital Agency**: `sendPersonaWelcomeEmail('digital_agency')`
- **Real Estate**: `sendPersonaWelcomeEmail('real_estate')`
- **Tech Startup**: `sendPersonaWelcomeEmail('tech_startup')`
- **Freelancer**: `sendPersonaWelcomeEmail('freelancer')`

### Milestone Emails:
- Sent when users complete key onboarding steps
- Configurable milestone triggers in `onboarding-flows.ts`

## 6. Testing Email Functionality

### Manual Test:
```typescript
import { EmailService } from '@/lib/email/service';

// Test persona welcome email
await EmailService.sendPersonaWelcomeEmail(
  'test@example.com',
  'Test User',
  'digital_agency'
);

// Test milestone email
await EmailService.sendMilestoneEmail(
  'test@example.com',
  'Test User',
  'first_invoice',
  'digital_agency'
);
```

### API Test:
```bash
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "persona": "digital_agency",
    "userName": "Test User",
    "userEmail": "test@example.com"
  }'
```

## 7. Production Checklist

- [ ] Domain verified in Resend
- [ ] API key configured in environment variables
- [ ] `RESEND_FROM_EMAIL` set to verified domain
- [ ] Test emails sent successfully
- [ ] Email templates render correctly
- [ ] Onboarding flow triggers emails properly

## 8. Troubleshooting

### Common Issues:

**"Invalid API key"**:
- Check that `RESEND_API_KEY` is correctly set
- Verify the API key is active in Resend dashboard

**"Domain not verified"**:
- Ensure your domain is verified in Resend
- Check DNS records are correctly configured
- Wait for DNS propagation (can take up to 24 hours)

**"Email not received"**:
- Check spam folder
- Verify recipient email address
- Check Resend dashboard for delivery status
- Ensure `RESEND_FROM_EMAIL` is from verified domain

**"Rate limit exceeded"**:
- Resend has rate limits based on your plan
- Check your usage in Resend dashboard
- Consider upgrading your plan if needed

## 9. Monitoring

### In Resend Dashboard:
1. Go to **Logs** to see email delivery status
2. Check **Analytics** for delivery rates
3. Monitor **Bounces** and **Complaints**

### Recommended Monitoring:
- Set up alerts for high bounce rates
- Monitor email delivery success rates
- Track email engagement metrics
