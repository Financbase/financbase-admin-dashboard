# API Versioning Guide

## Overview

The Financbase API uses URL-based versioning to ensure backward compatibility while allowing the API to evolve. All API endpoints are versioned to prevent breaking changes from affecting existing integrations.

## API Versions

### Current Versions

#### v1 (Stable) ✅

- **Status**: Stable - Recommended for production
- **Base URL**: `https://api.financbase.com/api/v1`
- **Description**: Current stable API with full feature support
- **Deprecation**: None planned

#### v2 (Beta) 🚧

- **Status**: Beta - Available for testing
- **Base URL**: `https://api.financbase.com/api/v2`
- **Description**: Next-generation API with improved features and performance
- **Deprecation**: None planned

## Versioning Strategy

### URL-Based Versioning

API versions are specified in the URL path:

```
/api/v1/accounts     # v1 API
/api/v2/accounts     # v2 API
/api/accounts        # Legacy (redirects to v1 with deprecation warning)
```

### Version Headers

All responses include version information in headers:

```http
X-API-Version: v1
```

### Deprecation Headers

When a version is deprecated, responses include:

```http
X-API-Deprecated: true
X-API-Deprecated-Version: v1
Sunset: 2025-12-31
Link: <v2>; rel="successor-version"
```

## Migration Guide

### For New Integrations

**Use v2 API** for new integrations:

```bash
# Use v2 for new projects
curl https://api.financbase.com/api/v2/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### For Existing Integrations

**Continue using v1** until you're ready to migrate:

```bash
# v1 continues to work
curl https://api.financbase.com/api/v2/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Migrating from Legacy (Unversioned) to v1

If you're using unversioned endpoints (`/api/accounts`):

1. **Update your base URL**:

   ```javascript
   // Before
   const API_BASE = 'https://api.financbase.com/api';
   
   // After
   const API_BASE = 'https://api.financbase.com/api/v1';
   ```

2. **Update endpoints**:

   ```javascript
   // Before
   fetch('/api/accounts')
   
   // After
   fetch('/api/v1/accounts')
   ```

3. **Handle deprecation warnings**:
   - Monitor `X-API-Deprecated` header
   - Plan migration before sunset date
   - Test with new version before migrating

## Version Differences

### v1 vs v2

| Feature | v1 | v2 |
|---------|----|----|
| Authentication | Clerk | Clerk (same) |
| Response Format | Consistent | Improved consistency |
| Error Format | Standard | Enhanced with more context |
| Pagination | Limit/Offset | Cursor-based (optional) |
| Rate Limiting | 100/15min | 200/15min |
| Webhooks | Supported | Enhanced with retry logic |

### Breaking Changes

v2 introduces **no breaking changes** from v1. All v1 endpoints work identically in v2. New features may only be available in v2.

## Version Selection

### Choosing a Version

**Use v1 if:**

- You need maximum stability
- You're migrating from legacy endpoints
- You don't need v2-specific features

**Use v2 if:**

- You're building new integrations
- You want access to latest features
- You can handle beta-status endpoints

### Version Detection

The API automatically detects the version from the URL:

```javascript
// Automatic version detection
const version = request.url.includes('/api/v2/') ? 'v2' : 'v1';
```

## Implementation Examples

### JavaScript/TypeScript

```typescript
const API_VERSION = 'v1'; // or 'v2'

const apiClient = {
  baseUrl: `https://api.financbase.com/api/${API_VERSION}`,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Check for deprecation
    const isDeprecated = response.headers.get('X-API-Deprecated') === 'true';
    if (isDeprecated) {
      console.warn('API version is deprecated:', {
        version: response.headers.get('X-API-Deprecated-Version'),
        sunset: response.headers.get('Sunset'),
      });
    }
    
    return response.json();
  },
};
```

### Python

```python
import requests
from datetime import datetime

API_VERSION = 'v1'  # or 'v2'
BASE_URL = f'https://api.financbase.com/api/{API_VERSION}'

def api_request(endpoint, token, **kwargs):
    url = f'{BASE_URL}{endpoint}'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    response = requests.get(url, headers=headers, **kwargs)
    
    # Check for deprecation
    if response.headers.get('X-API-Deprecated') == 'true':
        print(f"Warning: API version {response.headers.get('X-API-Deprecated-Version')} "
              f"is deprecated. Sunset: {response.headers.get('Sunset')}")
    
    return response.json()
```

## Version Lifecycle

### Version Statuses

1. **Beta**: New version in testing
2. **Stable**: Recommended for production
3. **Deprecated**: Still works but will be removed
4. **Sunset**: Version removed

### Timeline Example

```
v1 Launch: 2024-01-01
v2 Beta:   2024-06-01
v2 Stable: 2024-09-01
v1 Deprecated: 2025-01-01 (announced)
v1 Sunset: 2025-12-31 (removed)
```

## Best Practices

1. **Always specify version** in URLs
2. **Monitor deprecation headers** in production
3. **Test new versions** in staging before migrating
4. **Plan migrations** before sunset dates
5. **Use version headers** to track which version you're using

## Support

- **API Documentation**: [docs/api/README.md](./README.md)
- **Migration Help**: <support@financbase.com>
- **Version Status**: [docs/api/version-status.md](./version-status.md)

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for version-specific changes and deprecations.
