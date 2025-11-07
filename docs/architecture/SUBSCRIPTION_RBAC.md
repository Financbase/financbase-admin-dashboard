# Subscription-Based RBAC System

## Overview

The subscription-based RBAC system automatically maps subscription plans to Clerk roles and permissions, ensuring users have appropriate access based on their subscription tier. The system includes grace period management, trial permission handling, and automatic synchronization with Clerk metadata.

## Architecture

### Components

1. **Database Schema**
   - `subscription_plan_rbac_mappings` - Maps plans to roles/permissions
   - `subscription_status_history` - Tracks subscription status changes

2. **Services**
   - `subscription-rbac.service.ts` - Core RBAC mapping logic
   - `clerk-metadata-sync.service.ts` - Syncs subscription changes to Clerk
   - `subscription-grace-period.service.ts` - Manages grace periods

3. **API Endpoints**
   - `/api/settings/billing/subscription` - Subscription management
   - `/api/admin/subscription-rbac-mappings` - Admin mapping management
   - `/api/cron/subscription-grace-period` - Grace period cron job

4. **Webhook Handlers**
   - Stripe webhooks for subscription events
   - PayPal webhooks for subscription changes

## Plan-to-Role Mappings

### Default Mappings

- **Free Plan** → `viewer` role
  - Permissions: View-only (invoices, expenses, reports)
  
- **Pro Plan** → `user` role
  - Permissions: View + Create + Edit (invoices, expenses, reports)
  
- **Enterprise Plan** → `manager` role
  - Permissions: Full access (view, create, edit, delete, approve, manage settings)

### Trial Permissions

Trial subscriptions receive a limited subset of permissions (approximately 50%):
- View operations are included
- Limited create operations
- Edit/Delete operations are excluded

## Grace Period Management

### How It Works

1. When a subscription is cancelled or expires, a grace period starts
2. Default grace period: 7 days (configurable per plan)
3. During grace period, users retain their subscription permissions
4. After grace period expires, users are automatically reverted to Free plan

### Grace Period Flow

```
Subscription Cancelled/Expired
    ↓
Grace Period Starts (7 days)
    ↓
User retains subscription permissions
    ↓
Grace Period Expires
    ↓
Cron Job Reverts to Free Plan
    ↓
Clerk Metadata Updated
```

## Clerk Metadata Synchronization

### Automatic Sync

The system automatically syncs subscription changes to Clerk's `publicMetadata`:

1. **Subscription Created/Updated**
   - Role and permissions updated in Clerk
   - Financial access flags updated

2. **Subscription Cancelled/Expired**
   - Grace period started
   - After grace period: Reverted to Free plan

3. **Trial Subscriptions**
   - Limited permissions applied
   - Full permissions after trial converts to active

### Metadata Structure

```typescript
{
  role: "admin" | "manager" | "user" | "viewer",
  permissions: string[],
  financialAccess: {
    viewRevenue: boolean,
    editInvoices: boolean,
    approveExpenses: boolean,
    manageReports: boolean,
    accessAuditLogs: boolean
  }
}
```

## Webhook Integration

### Stripe Webhooks

Handled events:
- `customer.subscription.created` → Sync to Clerk
- `customer.subscription.updated` → Sync to Clerk
- `customer.subscription.deleted` → Start grace period
- `invoice.payment_succeeded` → Ensure sync
- `invoice.payment_failed` → Handle grace period

### PayPal Webhooks

Handled events:
- `BILLING.SUBSCRIPTION.CREATED` → Sync to Clerk
- `BILLING.SUBSCRIPTION.UPDATED` → Sync to Clerk
- `BILLING.SUBSCRIPTION.CANCELLED` → Start grace period
- `BILLING.SUBSCRIPTION.EXPIRED` → Start grace period

## Cron Jobs

### Grace Period Check

- **Schedule**: Daily at 3 AM UTC
- **Endpoint**: `/api/cron/subscription-grace-period`
- **Function**: Checks and reverts expired grace periods

### Setup

For Vercel, add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-grace-period",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Admin API

### Endpoints

- `GET /api/admin/subscription-rbac-mappings` - List all mappings
- `POST /api/admin/subscription-rbac-mappings` - Create mapping
- `PUT /api/admin/subscription-rbac-mappings` - Update mapping
- `DELETE /api/admin/subscription-rbac-mappings?id={id}` - Delete mapping

### Permissions Required

All admin endpoints require `ROLES_MANAGE permission.

## Usage Examples

### Check User Permission

```typescript
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';

const canEdit = await checkPermission(FINANCIAL_PERMISSIONS.INVOICES_EDIT);
```

### Get Subscription Status

```typescript
import { getSubscriptionStatus } from '@/lib/utils/subscription-rbac-utils';

const status = await getSubscriptionStatus(userId);
console.log(status.effectiveRole); // "user"
console.log(status.effectivePermissions); // ["invoices:view", ...]
```

### Check Subscription Feature

```typescript
import { hasSubscriptionFeature } from '@/lib/utils/subscription-rbac-utils';

const hasAdvancedFeatures = await hasSubscriptionFeature(userId, 'advanced_features');
```

## Configuration

### Seeding Default Mappings

Run the seed script to create default mappings:

```bash
npx tsx scripts/seed-subscription-rbac-mappings.ts
```

### Customizing Mappings

Use the admin API to customize mappings:

```typescript
POST /api/admin/subscription-rbac-mappings
{
  "planId": "uuid",
  "role": "user",
  "permissions": ["invoices:view", "invoices:create"],
  "isTrialMapping": false,
  "gracePeriodDays": 7
}
```

## Error Handling

- Subscription sync failures are logged but don't fail subscription creation
- Grace period checks run daily with error recovery
- Webhook failures are stored for manual review

## Testing

Run tests:

```bash
npm test -- subscription-rbac.service.test.ts
```

## Troubleshooting

### User Not Getting Correct Permissions

1. Check subscription status in database
2. Verify RBAC mapping exists for plan
3. Check Clerk metadata sync logs
4. Manually sync: `syncCurrentSubscriptionToClerk(userId)`

### Grace Period Not Working

1. Verify cron job is running
2. Check `subscription_status_history` table
3. Verify grace period days in mapping
4. Check cron job logs

### Webhook Not Syncing

1. Verify webhook endpoint is accessible
2. Check webhook signature verification
3. Review webhook event logs
4. Test webhook manually

## Future Enhancements

- Custom permission sets per organization
- Subscription upgrade/downgrade workflows
- Permission inheritance from organization
- Advanced grace period rules

