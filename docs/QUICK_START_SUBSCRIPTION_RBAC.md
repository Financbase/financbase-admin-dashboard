# Quick Start: Subscription RBAC Testing

## ✅ System Status

The subscription-based RBAC system is **fully implemented and ready for testing**.

### Current Status
- ✅ Database tables created (4/4)
- ✅ RBAC mappings seeded (6 mappings)
- ✅ Services implemented
- ✅ API endpoints ready
- ✅ Webhook handlers integrated
- ✅ Cron job configured

## 🧪 Quick Test Checklist

### 1. Test Subscription Creation

**API Endpoint**: `POST /api/settings/billing/subscription`

```bash
# Get a plan ID first
curl http://localhost:3000/api/settings/billing/plans

# Create subscription (replace PLAN_ID and add auth token)
curl -X POST http://localhost:3000/api/settings/billing/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"planId": "PLAN_UUID_HERE"}'
```

**What to Verify**:
- ✅ Subscription created in database
- ✅ Clerk metadata updated with role/permissions
- ✅ Check Clerk Dashboard → User → Metadata

### 2. Test Webhook Handlers

**Stripe Webhook**: `POST /api/integrations/webhooks`

```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -H "x-service: stripe" \
  -H "x-user-id: USER_ID" \
  -d '{
    "type": "customer.subscription.updated",
    "data": {
      "object": {
        "id": "sub_test",
        "status": "active"
      }
    }
  }'
```

**What to Verify**:
- ✅ Webhook processed successfully
- ✅ Subscription status updated
- ✅ Clerk metadata synced

### 3. Test Grace Period

**Manual Test**:
```sql
-- Create a cancelled subscription
UPDATE user_subscriptions 
SET status = 'cancelled', cancelled_at = NOW()
WHERE user_id = 'USER_UUID';

-- Check grace period
SELECT 
    us.user_id,
    us.status,
    sprm.grace_period_days,
    (us.cancelled_at + (sprm.grace_period_days || ' days')::interval) as grace_end
FROM user_subscriptions us
JOIN subscription_plan_rbac_mappings sprm ON sprm.plan_id = us.plan_id
WHERE us.status = 'cancelled';
```

**Cron Job Test**:
```bash
curl -X POST http://localhost:3000/api/cron/subscription-grace-period \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 4. Test Admin API

**List Mappings**:
```bash
curl http://localhost:3000/api/admin/subscription-rbac-mappings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Create Mapping**:
```bash
curl -X POST http://localhost:3000/api/admin/subscription-rbac-mappings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PLAN_UUID",
    "role": "user",
    "permissions": ["invoices:view", "invoices:create"],
    "isTrialMapping": false,
    "gracePeriodDays": 7
  }'
```

## 📊 Current Mappings

| Plan | Regular Role | Regular Perms | Trial Role | Trial Perms |
|------|--------------|---------------|------------|-------------|
| Free | viewer | 3 | viewer | 3 |
| Pro | user | 10 | user | 6 |
| Enterprise | manager | 14 | manager | 8 |

## 🔍 Verification Queries

### Check Mappings
```sql
SELECT sp.name, sprm.role, sprm.is_trial_mapping, 
       jsonb_array_length(sprm.permissions) as perms
FROM subscription_plan_rbac_mappings sprm
JOIN subscription_plans sp ON sp.id = sprm.plan_id;
```

### Check Subscriptions
```sql
SELECT us.*, sp.name as plan_name
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id;
```

### Check Status History
```sql
SELECT * FROM subscription_status_history 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚀 Production Checklist

Before going to production:

- [ ] Test subscription creation with real Clerk users
- [ ] Verify webhook endpoints are accessible from Stripe/PayPal
- [ ] Set up `CRON_SECRET` environment variable
- [ ] Configure Vercel cron job (or external cron service)
- [ ] Test grace period expiration
- [ ] Monitor Clerk API rate limits
- [ ] Set up error alerting for sync failures
- [ ] Document any custom mappings

## 📝 Notes

- **Grace Period**: Default 7 days (configurable per plan)
- **Trial Permissions**: ~50% of regular plan permissions
- **Sync Timing**: Happens automatically on subscription changes
- **Cron Schedule**: Daily at 3 AM UTC

## 🆘 Troubleshooting

**Issue**: Clerk metadata not updating
- Check `CLERK_SECRET_KEY` is set
- Verify subscription exists in database
- Check server logs for errors

**Issue**: Webhooks not working
- Verify endpoint is accessible
- Check webhook signature verification
- Review integration service logs

**Issue**: Grace period not expiring
- Verify cron job is running
- Check `CRON_SECRET` is configured
- Review `subscription_status_history` table

For detailed testing instructions, see: `docs/testing/SUBSCRIPTION_RBAC_TESTING.md`

