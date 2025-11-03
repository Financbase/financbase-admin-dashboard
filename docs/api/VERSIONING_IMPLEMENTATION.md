# API Versioning Implementation Guide

## Overview

The API versioning system has been implemented to ensure backward compatibility and provide a clear migration path for API consumers.

## Features

### 1. URL-Based Versioning

- **Versioned routes**: `/api/v1/...`, `/api/v2/...`
- **Legacy routes**: `/api/...` (automatically treated as v1 with deprecation warning)
- **Special routes**: Routes like `/api/health`, `/api/webhooks` are excluded from versioning

### 2. Version Headers

All API responses include version information:

```http
X-API-Version: v1
```

For unversioned (legacy) routes:

```http
X-API-Version: v1
X-API-Deprecated: true
X-API-Deprecated-Version: unversioned
Sunset: 2025-12-31
Warning: 299 - "Using unversioned API endpoints is deprecated..."
Link: <v1>; rel="successor-version"
```

### 3. Version Context

Route handlers can access version information:

```typescript
import { getApiVersionContext } from '@/lib/api/version-context';

export async function GET(request: NextRequest) {
  const versionContext = getApiVersionContext(request);
  
  // versionContext.version - 'v1' | 'v2'
  // versionContext.isVersioned - boolean
  // versionContext.isLegacy - boolean
  // versionContext.isV1 - boolean
  // versionContext.isV2 - boolean
}
```

## Implementation Details

### Middleware Integration

The versioning middleware:
1. Detects API version from URL path
2. Adds appropriate version headers to all responses
3. Adds deprecation warnings for unversioned routes
4. Preserves existing route functionality (no breaking changes)

### Current Versions

- **v1**: Stable, recommended for production
- **v2**: Beta, available for testing (when implemented)

## Migration Path

### For API Consumers

1. **Update URLs**: Change `/api/invoices` to `/api/v1/invoices`
2. **Monitor headers**: Check `X-API-Deprecated` header
3. **Plan migration**: Migrate before sunset date (2025-12-31 for unversioned routes)

### For Route Handlers

Routes can be versioned by:
1. Creating routes in `/app/api/v1/...` directories
2. Using version context to implement version-specific logic
3. Adding version headers using `setVersionHeaders()`

## Example Usage

### Versioned Route Handler

```typescript
// app/api/v1/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getApiVersionContext } from '@/lib/api/version-context';

export async function GET(request: NextRequest) {
  const versionContext = getApiVersionContext(request);
  
  // Version-specific logic can be implemented here
  if (versionContext.isV2) {
    // v2-specific implementation
  } else {
    // v1 implementation
  }
  
  return NextResponse.json({ data: '...' });
}
```

## Testing

Test version headers with:

```bash
# Versioned route
curl -I http://localhost:3000/api/v1/invoices

# Legacy route (should show deprecation warning)
curl -I http://localhost:3000/api/invoices
```

## Next Steps

1. Gradually migrate high-traffic routes to explicit v1 paths
2. Create v2 implementations for improved endpoints
3. Update API documentation to use versioned URLs
4. Monitor deprecation header usage in production

