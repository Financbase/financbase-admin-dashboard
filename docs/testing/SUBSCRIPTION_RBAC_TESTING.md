# Subscription RBAC Testing Guide

## Overview

This guide provides instructions for testing the subscription-based RBAC system to ensure it's working correctly.

## Prerequisites

- Database migration `0036_subscription_rbac_mapping.sql` has been applied
- RBAC mappings have been seeded (run `scripts/seed-rbac-mappings.sql`)
- Clerk authentication is configured
- Environment variables are set (`DATABASE_URL`, `CLERK_SECRET_KEY`)

## Test 1: Verify Database Setup

### Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plan_rbac_mappings',
    'subscription_status_history',
    'subscription_plans',
    'user_subscriptions'
);
```

### Verify RBAC Mappings

```sql
SELECT 
    sp.name,
    sprm.role,
    sprm.is_trial_mapping,
    jsonb_array_length(sprm.permissions) as permission_count
FROM subscription_plan_rbac_mappings sprm
JOIN subscription_plans sp ON sp.id = sprm.plan_id
ORDER BY sp.name, sprm.is_trial_mapping;
```

**Expected Result**: 6 mappings (3 plans × 2 types: regular + trial)

## Test 2: Subscription Creation and Clerk Sync

### Create a Test Subscription

```bash
# Replace USER_ID and PLAN_ID with actual values
curl -X POST http://localhost:3000/api/settings/billing/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN" \
  -d '{
    "planId": "PLAN_UUID_HERE"
  }'
```

### Verify Clerk Metadata Updated

1. Check Clerk Dashboard → Users → Select user → Metadata
2. Verify `publicMetadata` contains:
   - `role`: Should match plan mapping (viewer/user/manager)
   - `permissions`: Array of permission strings
   - `financialAccess`: Object with boolean flags

### Manual Verification Query

```typescript
import { clerkClient } from "@clerk/nextjs/server";

const clerk = await clerkClient();
const user = await clerk.users.getUser("user_id_here");
console.log(user.publicMetadata);
```

## Test 3: Webhook Handlers

### Stripe Webhook Test

#### Test Subscription Created Event

```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -H "x-service: stripe" \
  -H "x-user-id: USER_ID" \
  -d '{
    "type": "customer.subscription.created",
    "data": {
      "object": {
        "id": "sub_test123",
        "status": "active",
        "customer": "cus_test123"
      }
    }
  }'
```

#### Test Subscription Updated Event

```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -H "x-service: stripe" \
  -H "x-user-id: USER_ID" \
  -d '{
    "type": "customer.subscription.updated",
    "data": {
      "object": {
        "id": "sub_test123",
        "status": "active"
      }
    }
  }'
```

#### Test Subscription Deleted Event (Grace Period)

```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -H "x-service: stripe" \
  -H "x-user-id: USER_ID" \
  -d '{
    "type": "customer.subscription.deleted",
    "data": {
      "object": {
        "id": "sub_test123",
        "status": "canceled"
      }
    }
  }'
```

**Expected Behavior**:
- Subscription status updated to "cancelled"
- Grace period started in `subscription_status_history`
- User retains permissions during grace period
- After grace period expires, user reverted to Free plan

### PayPal Webhook Test

```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -H "x-service: paypal" \
  -H "x-user-id: USER_ID" \
  -d '{
    "event_type": "BILLING.SUBSCRIPTION.UPDATED",
    "resource": {
      "id": "I-BW452GLLEP1G",
      "status": "ACTIVE"
    }
  }'
```

## Test 4: Grace Period Management

### Create Test Cancelled Subscription

```sql
-- Update a subscription to cancelled status
UPDATE user_subscriptions 
SET status = 'cancelled', 
    cancelled_at = NOW() - INTERVAL '1 day'
WHERE user_id = 'USER_UUID_HERE'
RETURNING *;
```

### Check Grace Period Status

```sql
SELECT 
    us.user_id,
    us.status,
    us.cancelled_at,
    sprm.grace_period_days,
    (us.cancelled_at + (sprm.grace_period_days || ' days')::interval) as grace_period_end,
    CASE 
        WHEN NOW() <= (us.cancelled_at + (sprm.grace_period_days || ' days')::interval) 
        THEN 'Active' 
        ELSE 'Expired' 
    END as grace_status
FROM user_subscriptions us
JOIN subscription_plan_rbac_mappings sprm ON sprm.plan_id = us.plan_id 
    AND sprm.is_trial_mapping = false
WHERE us.status = 'cancelled';
```

### Test Grace Period Cron Job

```bash
# Manual trigger (requires CRON_SECRET)
curl -X POST http://localhost:3000/api/cron/subscription-grace-period \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "processed": 1,
  "errors": 0,
  "message": "Processed 1 expired grace periods with 0 errors"
}
```

## Test 5: Admin API Endpoints

### List All Mappings

```bash
curl -X GET http://localhost:3000/api/admin/subscription-rbac-mappings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Create New Mapping

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

### Update Mapping

```bash
curl -X PUT http://localhost:3000/api/admin/subscription-rbac-mappings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "MAPPING_UUID",
    "role": "manager",
    "permissions": ["invoices:view", "invoices:create", "invoices:edit"]
  }'
```

### Delete Mapping

```bash
curl -X DELETE "http://localhost:3000/api/admin/subscription-rbac-mappings?id=MAPPING_UUID" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Test 6: Permission Checks

### Test Permission Check Function

```typescript
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';

// In a server component or API route
const canEdit = await checkPermission(FINANCIAL_PERMISSIONS.INVOICES_EDIT);
console.log('Can edit invoices:', canEdit);
```

### Test Subscription Status Utility

```typescript
import { getSubscriptionStatus } from '@/lib/utils/subscription-rbac-utils';

const status = await getSubscriptionStatus(userId);
console.log('Effective role:', status?.effectiveRole);
console.log('Permissions:', status?.effectivePermissions);
console.log('Is trial:', status?.isTrial);
```

## Test 7: Trial Permissions

### Create Trial Subscription

```sql
INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
VALUES (
    'USER_UUID',
    'PRO_PLAN_UUID',
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days'
);
```

### Verify Trial Permissions Applied

```typescript
import { getEffectiveRoleAndPermissions } from '@/lib/services/subscription-rbac.service';

const effective = await getEffectiveRoleAndPermissions(userId);
console.log('Is trial:', effective?.isTrial);
console.log('Trial permissions:', effective?.permissions);
// Should have fewer permissions than regular plan
```

## Troubleshooting

### Issue: Clerk Metadata Not Syncing

**Check**:
1. Verify `CLERK_SECRET_KEY` is set correctly
2. Check server logs for sync errors
3. Verify subscription exists in database
4. Manually trigger sync: `syncCurrentSubscriptionToClerk(userId)`

### Issue: Grace Period Not Working

**Check**:
1. Verify cron job is configured in `vercel.json`
2. Check `CRON_SECRET` environment variable
3. Verify `subscription_status_history` records exist
4. Check grace period calculation logic

### Issue: Webhooks Not Processing

**Check**:
1. Verify webhook endpoint is accessible
2. Check webhook signature verification
3. Review integration service logs
4. Verify subscription IDs match between systems

## Automated Testing

Run the test script:

```bash
npx tsx scripts/test-subscription-rbac-simple.ts
```

Or use the SQL verification:

```bash
psql $DATABASE_URL -f scripts/seed-rbac-mappings.sql
```

## Success Criteria

✅ All 4 database tables exist  
✅ 6 RBAC mappings created (3 plans × 2 types)  
✅ Subscription creation syncs to Clerk  
✅ Webhook handlers process events correctly  
✅ Grace periods are tracked and enforced  
✅ Admin API endpoints work correctly  
✅ Permission checks consider subscription status  
✅ Trial permissions are limited correctly  

## Next Steps

After successful testing:

1. **Monitor Production**: Set up logging and alerts for sync failures
2. **Document Edge Cases**: Note any special scenarios discovered
3. **Performance Testing**: Test with high volume of subscriptions
4. **Security Audit**: Verify RBAC policies are correctly enforced

