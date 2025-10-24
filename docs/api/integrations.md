# Integrations API Documentation

## Overview

The Integrations API provides endpoints for managing third-party service connections, OAuth flows, and data synchronization.

## Base URL

```
https://api.financbase.com/api/integrations
```

## Authentication

All endpoints require authentication via Clerk session tokens.

```http
Authorization: Bearer <session-token>
```

## Endpoints

### List Available Integrations

Get a list of all available integrations.

```http
GET /api/integrations
```

#### Response

```json
{
  "success": true,
  "integrations": [
    {
      "id": "stripe",
      "name": "Stripe",
      "description": "Payment processing and subscription management",
      "category": "Payments",
      "icon": "https://api.financbase.com/icons/stripe.svg",
      "features": ["payments", "subscriptions", "invoicing"],
      "isAvailable": true,
      "isConnected": false
    },
    {
      "id": "slack",
      "name": "Slack",
      "description": "Team communication and notifications",
      "category": "Communication",
      "icon": "https://api.financbase.com/icons/slack.svg",
      "features": ["notifications", "messaging", "alerts"],
      "isAvailable": true,
      "isConnected": true
    }
  ]
}
```

### List User Connections

Get a list of user's connected integrations.

```http
GET /api/integrations/connections
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `service` | string | Filter by service ID | - |
| `status` | string | Filter by connection status | - |

#### Response

```json
{
  "success": true,
  "connections": [
    {
      "id": "conn-123",
      "service": "stripe",
      "serviceName": "Stripe",
      "status": "connected",
      "connectedAt": "2024-01-01T00:00:00Z",
      "lastSyncAt": "2024-01-01T12:00:00Z",
      "syncStatus": "success",
      "permissions": ["read:payments", "write:invoices"],
      "expiresAt": "2024-02-01T00:00:00Z"
    }
  ]
}
```

### Create Connection

Create a new integration connection.

```http
POST /api/integrations/connections
```

#### Request Body

```json
{
  "service": "stripe",
  "permissions": ["read:payments", "write:invoices"]
}
```

#### Response

```json
{
  "success": true,
  "connectionId": "conn-456",
  "authUrl": "https://connect.stripe.com/oauth/authorize?client_id=...",
  "state": "state-token"
}
```

### Get Connection

Get a specific connection by ID.

```http
GET /api/integrations/connections/{id}
```

#### Response

```json
{
  "success": true,
  "connection": {
    "id": "conn-123",
    "service": "stripe",
    "serviceName": "Stripe",
    "status": "connected",
    "connectedAt": "2024-01-01T00:00:00Z",
    "lastSyncAt": "2024-01-01T12:00:00Z",
    "syncStatus": "success",
    "permissions": ["read:payments", "write:invoices"],
    "expiresAt": "2024-02-01T00:00:00Z",
    "settings": {
      "webhookUrl": "https://api.financbase.com/webhooks/stripe",
      "syncFrequency": "daily"
    }
  }
}
```

### Update Connection

Update connection settings.

```http
PATCH /api/integrations/connections/{id}
```

#### Request Body

```json
{
  "settings": {
    "syncFrequency": "hourly",
    "webhookUrl": "https://api.example.com/webhooks/stripe"
  },
  "permissions": ["read:payments", "write:invoices", "read:customers"]
}
```

#### Response

```json
{
  "success": true,
  "connection": {
    "id": "conn-123",
    "settings": {
      "syncFrequency": "hourly",
      "webhookUrl": "https://api.example.com/webhooks/stripe"
    },
    "permissions": ["read:payments", "write:invoices", "read:customers"],
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Connection

Delete a connection.

```http
DELETE /api/integrations/connections/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

### Trigger Sync

Manually trigger data synchronization.

```http
POST /api/integrations/connections/{id}/sync
```

#### Request Body

```json
{
  "syncType": "full",
  "dataTypes": ["payments", "invoices", "customers"]
}
```

#### Response

```json
{
  "success": true,
  "syncId": "sync-789",
  "status": "running",
  "startedAt": "2024-01-01T00:00:00Z"
}
```

### Get Sync Status

Get synchronization status for a connection.

```http
GET /api/integrations/connections/{id}/sync
```

#### Response

```json
{
  "success": true,
  "sync": {
    "id": "sync-789",
    "connectionId": "conn-123",
    "status": "completed",
    "syncType": "full",
    "startedAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z",
    "recordsProcessed": 100,
    "recordsSynced": 95,
    "errors": 5,
    "dataTypes": ["payments", "invoices", "customers"]
  }
}
```

## OAuth Endpoints

### Start OAuth Flow

Initiate OAuth authorization for a service.

```http
GET /api/integrations/oauth/{service}/authorize
```

#### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `redirectUri` | string | OAuth redirect URI | Yes |
| `scopes` | string | Comma-separated scopes | No |
| `state` | string | State parameter for security | No |

#### Response

```json
{
  "success": true,
  "authUrl": "https://connect.stripe.com/oauth/authorize?client_id=...",
  "state": "state-token"
}
```

### Handle OAuth Callback

Handle OAuth callback from service.

```http
GET /api/integrations/oauth/{service}/callback
```

#### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `code` | string | Authorization code | Yes |
| `state` | string | State parameter | Yes |
| `error` | string | Error code (if any) | No |

#### Response

```json
{
  "success": true,
  "connectionId": "conn-456",
  "message": "Integration connected successfully"
}
```

### Refresh Token

Refresh OAuth access token.

```http
POST /api/integrations/oauth/{service}/refresh
```

#### Request Body

```json
{
  "connectionId": "conn-123"
}
```

#### Response

```json
{
  "success": true,
  "connection": {
    "id": "conn-123",
    "status": "connected",
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

## Supported Integrations

### Stripe

**Service ID**: `stripe`

**Features**:
- Payment processing
- Subscription management
- Invoice creation
- Customer management

**OAuth Scopes**:
- `read:payments`
- `write:invoices`
- `read:customers`
- `write:subscriptions`

**Data Sync**:
- Payments
- Invoices
- Customers
- Subscriptions

### Slack

**Service ID**: `slack`

**Features**:
- Team notifications
- Channel messaging
- Alert delivery
- Status updates

**OAuth Scopes**:
- `chat:write`
- `channels:read`
- `users:read`

**Data Sync**:
- Messages
- Channels
- Users

### QuickBooks

**Service ID**: `quickbooks`

**Features**:
- Accounting sync
- Invoice management
- Expense tracking
- Financial reporting

**OAuth Scopes**:
- `accounting`
- `payments`
- `invoicing`

**Data Sync**:
- Invoices
- Expenses
- Customers
- Vendors

### Xero

**Service ID**: `xero`

**Features**:
- Accounting sync
- Invoice management
- Expense tracking
- Financial reporting

**OAuth Scopes**:
- `accounting.transactions`
- `accounting.contacts`
- `accounting.settings`

**Data Sync**:
- Invoices
- Expenses
- Contacts
- Bank transactions

## Data Mapping

### Stripe Payment Mapping

```json
{
  "stripe": {
    "id": "pi_123",
    "amount": 1000,
    "currency": "usd",
    "status": "succeeded"
  },
  "financbase": {
    "id": "payment-123",
    "amount": 10.00,
    "currency": "USD",
    "status": "completed"
  }
}
```

### QuickBooks Invoice Mapping

```json
{
  "quickbooks": {
    "Id": "123",
    "TotalAmt": 1000,
    "Balance": 0,
    "TxnDate": "2024-01-01"
  },
  "financbase": {
    "id": "invoice-123",
    "amount": 1000,
    "balance": 0,
    "date": "2024-01-01T00:00:00Z"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid integration configuration",
  "details": {
    "field": "service",
    "message": "Service not supported"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Insufficient permissions for this integration"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Integration not found"
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Rate Limits

- **Connection Creation**: 5 per minute
- **Sync Operations**: 10 per minute per connection
- **OAuth Flows**: 20 per minute

## Examples

### Creating a Stripe Connection

```bash
curl -X POST https://api.financbase.com/api/integrations/connections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "stripe",
    "permissions": ["read:payments", "write:invoices"]
  }'
```

### Triggering a Sync

```bash
curl -X POST https://api.financbase.com/api/integrations/connections/conn-123/sync \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "syncType": "full",
    "dataTypes": ["payments", "invoices"]
  }'
```

### OAuth Flow Implementation

```javascript
// Start OAuth flow
const response = await fetch('/api/integrations/oauth/stripe/authorize?redirectUri=https://app.example.com/callback');
const { authUrl } = await response.json();

// Redirect user to authUrl
window.location.href = authUrl;

// Handle callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (code && state) {
  const callbackResponse = await fetch(`/api/integrations/oauth/stripe/callback?code=${code}&state=${state}`);
  const result = await callbackResponse.json();
  
  if (result.success) {
    console.log('Integration connected:', result.connectionId);
  }
}
```
