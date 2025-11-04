# Launch Readiness - New API Endpoints Documentation

## Overview

This document lists the new API endpoints that have been secured and documented as part of the launch readiness completion.

## Feature Flags API Endpoints

### GET /api/feature-flags
**Description**: List all feature flags (admin only)

**Authentication**: Required (Admin role)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "key": "feature-key",
      "name": "Feature Name",
      "description": "Feature description",
      "enabled": true,
      "rolloutPercentage": 100,
      "targetOrganizations": [],
      "targetUsers": [],
      "conditions": {},
      "metadata": {}
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User is not an admin

### POST /api/feature-flags
**Description**: Create a new feature flag (admin only)

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "key": "feature-key",
  "name": "Feature Name",
  "description": "Optional description",
  "enabled": false,
  "rolloutPercentage": 0,
  "targetOrganizations": [],
  "targetUsers": [],
  "conditions": {},
  "metadata": {}
}
```

**Response**: `201 Created` with created feature flag

### GET /api/feature-flags/[key]
**Description**: Get a specific feature flag and check if enabled for current user

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "key": "feature-key",
    "name": "Feature Name",
    "enabled": true,
    "enabledForUser": true
  }
}
```

### PATCH /api/feature-flags/[key]
**Description**: Update a feature flag (admin only)

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "enabled": true,
  "rolloutPercentage": 50,
  "targetOrganizations": ["org-123"]
}
```

### DELETE /api/feature-flags/[key]
**Description**: Delete a feature flag (admin only)

**Authentication**: Required (Admin role)

**Response**: `200 OK` with success message

### POST /api/feature-flags/[key]/enable
**Description**: Enable a feature flag (admin only)

**Authentication**: Required (Admin role)

### POST /api/feature-flags/[key]/disable
**Description**: Disable a feature flag (admin only)

**Authentication**: Required (Admin role)

### GET /api/feature-flags/check?key=[key]
**Description**: Check if a feature flag is enabled for the current user/organization

**Authentication**: Optional (recommended for accurate results)

**Query Parameters**:
- `key` (required): Feature flag key

**Response**:
```json
{
  "key": "feature-key",
  "enabled": true
}
```

## Platform Hub Integrations API Endpoints

### GET /api/platform/hub/integrations
**Description**: Get available integrations for Platform Hub

**Authentication**: Required

**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Search term
- `isOfficial` (optional): Filter by official status
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "integrations": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  },
  "categories": [...],
  "metadata": {
    "totalIntegrations": 100,
    "officialIntegrations": 50,
    "communityIntegrations": 50
  }
}
```

### POST /api/platform/hub/integrations
**Description**: Create a new integration (admin only)

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "name": "Integration Name",
  "slug": "integration-slug",
  "category": "payment",
  "description": "Integration description",
  "icon": "icon-url",
  "color": "#000000",
  "isOfficial": false,
  "version": "1.0.0",
  "configuration": {},
  "features": [],
  "requirements": {},
  "documentation": "docs-url",
  "supportUrl": "support-url"
}
```

**Response**: `201 Created` with created integration

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `403 Forbidden`: User is not an admin
- `409 Conflict`: Integration slug already exists

## Security Notes

All admin-protected endpoints now properly validate admin role using the `isAdmin()` function from `@/lib/auth/financbase-rbac`.

Organization context is properly extracted from Clerk auth for feature flag checks, allowing organization-level feature targeting to work correctly.

## Testing

All endpoints have been tested with:
- Unit tests for API route handlers
- Integration tests for admin role validation
- Component tests for UI components
- E2E tests for critical user flows

See `__tests__/api/` and `e2e/` directories for test implementations.

