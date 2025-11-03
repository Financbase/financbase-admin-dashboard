# Feature Flags Implementation Guide

## Overview

Feature flags enable dynamic feature control without code deployment. This guide documents the feature flags system implementation in the Financbase Admin Dashboard.

## Architecture

### Database Schema

Feature flags are stored in the `feature_flags` table with the following capabilities:

- **Global Enablement**: Enable/disable for all users
- **User-Level**: Enable for specific users
- **Organization-Level**: Enable for specific organizations
- **Percentage Rollout**: Gradually roll out to a percentage of users
- **Environment-Specific**: Different settings for dev/staging/production

### Service Layer

The `FeatureFlagsService` provides:

- `isEnabled()` - Check if feature is enabled for user/org
- `getFlag()` - Get flag configuration
- `createFlag()` - Create new feature flag
- `updateFlag()` - Update flag configuration
- `enableFlag()` / `disableFlag()` - Toggle flags

## Usage

### Checking Feature Flags

```typescript
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';

// In API route
const isNewDashboardEnabled = await FeatureFlagsService.isEnabled('new-dashboard', {
  userId: user.id,
  organizationId: user.organizationId,
  environment: 'production',
});

if (isNewDashboardEnabled) {
  // Show new dashboard
} else {
  // Show old dashboard
}
```

### In React Components

```typescript
'use client';

import { useEffect, useState } from 'react';

export function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    async function checkFeature() {
      const response = await fetch('/api/feature-flags/new-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIsEnabled(data.enabled);
    }
    checkFeature();
  }, []);

  if (isEnabled) {
    return <NewDashboard />;
  }
  return <OldDashboard />;
}
```

## API Routes (To Be Created)

### GET /api/feature-flags
List all feature flags (admin only)

### GET /api/feature-flags/:name
Check if feature flag is enabled for current user

### POST /api/feature-flags
Create new feature flag (admin only)

### PATCH /api/feature-flags/:name
Update feature flag (admin only)

### POST /api/feature-flags/:name/enable
Enable feature flag (admin only)

### POST /api/feature-flags/:name/disable
Disable feature flag (admin only)

## Database Migration

Run the following to create the feature flags tables:

```sql
-- Create feature_flags table
-- (See lib/db/schemas/feature-flags.schema.ts for full schema)

-- Create feature_flag_history table
-- (See lib/db/schemas/feature-flags.schema.ts for full schema)
```

Or use Drizzle:

```bash
npm run db:generate
npm run db:push
```

## Admin UI (To Be Created)

An admin interface should be created at `/admin/feature-flags` to:

1. List all feature flags
2. Create new flags
3. Enable/disable flags
4. Configure rollouts
5. View flag history
6. Set environment-specific settings

## Best Practices

1. **Naming**: Use kebab-case for flag names (`new-dashboard`, `ai-insights`)
2. **Default to Disabled**: New features should default to disabled
3. **Gradual Rollout**: Use percentage rollouts for major features
4. **Clean Up**: Remove flags after features are fully deployed
5. **Documentation**: Document each flag's purpose and rollout plan

## Examples

### Simple Enable/Disable

```typescript
// Enable for all users
await FeatureFlagsService.enableFlag('new-checkout-flow');

// Disable
await FeatureFlagsService.disableFlag('new-checkout-flow');
```

### User-Level Rollout

```typescript
// Enable for specific users
await FeatureFlagsService.updateFlag('beta-feature', {
  enabled: true,
  enabledForUsers: ['user_123', 'user_456'],
});
```

### Percentage Rollout

```typescript
// Roll out to 25% of users
await FeatureFlagsService.updateFlag('new-ui', {
  enabled: true,
  rolloutPercentage: 25,
});
```

### Environment-Specific

```typescript
// Enable in production, disable in dev
await FeatureFlagsService.updateFlag('analytics', {
  enabled: true,
  enabledInProduction: true,
  enabledInDevelopment: false,
});
```

## Monitoring

Track feature flag usage:

- Flag enable/disable events
- User exposure to flags
- Performance impact of flags
- Error rates with new features

## Migration from Environment Variables

If you're currently using environment variables for feature flags:

```typescript
// Old way
const isEnabled = process.env.NEW_FEATURE === 'true';

// New way
const isEnabled = await FeatureFlagsService.isEnabled('new-feature', {
  userId: user.id,
});
```

## Related Documentation

- [Database Schema](../../lib/db/schemas/feature-flags.schema.ts)
- [Feature Flags Service](../../lib/services/feature-flags-service.ts)
