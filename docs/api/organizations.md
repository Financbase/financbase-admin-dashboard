# Organizations API Documentation

## Overview

The Organizations API provides endpoints for managing multiple businesses/organizations under one Financbase account. This includes organization CRUD operations, member management, invitations, settings, and billing.

## Base URL

```
/api/organizations
```

## Authentication

All endpoints require authentication via Clerk session tokens.

## Endpoints

### List Organizations

Get all organizations the current user belongs to.

```http
GET /api/organizations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "organization": {
        "id": "uuid",
        "name": "My Business",
        "slug": "my-business",
        "description": "Description",
        "logo": "url",
        "role": "owner"
      },
      "membership": {
        "id": "uuid",
        "role": "owner",
        "joinedAt": "2025-01-01T00:00:00Z"
      }
    }
  ]
}
```

### Create Organization

Create a new organization.

```http
POST /api/organizations
```

**Request Body:**
```json
{
  "name": "My Business",
  "description": "Optional description",
  "slug": "optional-slug",
  "logo": "optional-logo-url",
  "billingEmail": "billing@example.com",
  "taxId": "optional-tax-id",
  "address": "optional-address",
  "phone": "optional-phone"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Business",
    ...
  }
}
```

### Get Organization

Get organization details.

```http
GET /api/organizations/[id]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Business",
    "membership": {...},
    "role": "owner",
    "memberCount": 5
  }
}
```

### Update Organization

Update organization details.

```http
PATCH /api/organizations/[id]
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  ...
}
```

### Delete Organization

Soft delete an organization (owner only).

```http
DELETE /api/organizations/[id]
```

### Switch Organization

Switch active organization (updates session and preference).

```http
POST /api/organizations/[id]/switch
```

**Response:** Sets `active_organization_id` cookie

### List Members

Get organization members.

```http
GET /api/organizations/[id]/members
```

### Update Member Role

Update a member's role.

```http
PATCH /api/organizations/[id]/members/[memberId]/role
```

**Request Body:**
```json
{
  "role": "admin"
}
```

### Remove Member

Remove a member from organization.

```http
DELETE /api/organizations/[id]/members/[memberId]/role
```

### Send Invitation

Send invitation to join organization.

```http
POST /api/organizations/[id]/invitations
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "member",
  "message": "Optional message"
}
```

### List Invitations

Get pending invitations.

```http
GET /api/organizations/[id]/invitations
```

### Accept/Decline Invitation

```http
PATCH /api/organizations/[id]/invitations/[invitationId]
```

**Request Body:**
```json
{
  "action": "accept" // or "decline"
}
```

### Get Settings

Get organization settings.

```http
GET /api/organizations/[id]/settings
```

### Update Settings

Update organization settings.

```http
PATCH /api/organizations/[id]/settings
```

**Request Body:**
```json
{
  "settings": {},
  "branding": {},
  "integrations": {},
  "features": {},
  "notifications": {},
  "security": {},
  "compliance": {}
}
```

### Get Billing

Get organization subscription/billing.

```http
GET /api/organizations/[id]/billing
```

### Update Billing

Create/update organization subscription.

```http
POST /api/organizations/[id]/billing
```

**Request Body:**
```json
{
  "planId": "uuid",
  "stripeSubscriptionId": "sub_xxx",
  "stripeCustomerId": "cus_xxx"
}
```

## Error Responses

All endpoints may return:

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message"
}
```

## Permission Levels

- **Owner**: Full access, can delete organization, manage all members
- **Admin**: Can manage members (except owners), update settings
- **Member**: Can view and create content
- **Viewer**: Read-only access

