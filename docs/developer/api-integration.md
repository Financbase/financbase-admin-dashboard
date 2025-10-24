# API Integration Guide

Learn how to integrate with Financbase's API to build custom applications and automate business processes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [SDKs and Libraries](#sdks-and-libraries)
5. [Webhooks](#webhooks)
6. [Rate Limits](#rate-limits)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Getting Started

### Base URL

```
https://api.financbase.com/v2
```

### API Versioning

Financbase uses URL-based versioning. The current version is `v2`.

```
https://api.financbase.com/v2/workflows
```

### Content Type

All API requests must include the `Content-Type: application/json` header.

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}
```

## Authentication

### API Keys

Generate API keys in your Financbase dashboard:

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose permissions
4. Copy the key (it won't be shown again)

### Using API Keys

Include the API key in the `Authorization` header:

```http
Authorization: Bearer sk_live_1234567890abcdef
```

### OAuth 2.0

For third-party applications, use OAuth 2.0:

#### 1. Register Your Application

```http
POST /oauth/applications
```

```json
{
  "name": "My Application",
  "redirectUri": "https://myapp.com/callback",
  "scopes": ["workflows:read", "workflows:write"]
}
```

#### 2. Authorize Users

```http
GET /oauth/authorize?client_id=app_123&redirect_uri=https://myapp.com/callback&scope=workflows:read
```

#### 3. Exchange Code for Token

```http
POST /oauth/token
```

```json
{
  "grant_type": "authorization_code",
  "client_id": "app_123",
  "client_secret": "secret_456",
  "code": "auth_code_789",
  "redirect_uri": "https://myapp.com/callback"
}
```

#### 4. Use Access Token

```http
Authorization: Bearer access_token_123
```

### Scopes

| Scope | Description |
|-------|-------------|
| `workflows:read` | Read workflows and executions |
| `workflows:write` | Create and update workflows |
| `webhooks:read` | Read webhook configurations |
| `webhooks:write` | Create and update webhooks |
| `integrations:read` | Read integration connections |
| `integrations:write` | Create and update integrations |
| `data:read` | Read business data |
| `data:write` | Write business data |

## API Endpoints

### Workflows

#### List Workflows

```http
GET /workflows
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status
- `search` (string): Search by name or description

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_123",
        "name": "Invoice Reminder",
        "description": "Send reminder emails for overdue invoices",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Workflow

```http
POST /workflows
```

**Request Body:**
```json
{
  "name": "Payment Confirmation",
  "description": "Send confirmation emails for received payments",
  "trigger": {
    "type": "event",
    "event": "payment.received"
  },
  "actions": [
    {
      "type": "email",
      "config": {
        "to": "{{customerEmail}}",
        "subject": "Payment Received - {{invoiceNumber}}",
        "body": "Thank you for your payment of {{amount}}."
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "workflow_456",
    "name": "Payment Confirmation",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Execute Workflow

```http
POST /workflows/{id}/execute
```

**Request Body:**
```json
{
  "variables": {
    "customerEmail": "customer@example.com",
    "invoiceNumber": "INV-001",
    "amount": "$1,000.00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_789",
    "status": "running",
    "startedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Webhooks

#### List Webhooks

```http
GET /webhooks
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook_123",
        "name": "Invoice Notifications",
        "url": "https://api.example.com/webhooks/invoice",
        "events": ["invoice.created", "invoice.paid"],
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Create Webhook

```http
POST /webhooks
```

**Request Body:**
```json
{
  "name": "Payment Notifications",
  "url": "https://api.example.com/webhooks/payment",
  "events": ["payment.received", "payment.failed"],
  "secret": "your-webhook-secret"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook_456",
    "name": "Payment Notifications",
    "url": "https://api.example.com/webhooks/payment",
    "events": ["payment.received", "payment.failed"],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Integrations

#### List Available Integrations

```http
GET /integrations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "stripe",
        "name": "Stripe",
        "description": "Payment processing and subscription management",
        "category": "Payments",
        "features": ["payments", "subscriptions", "invoicing"],
        "isAvailable": true
      }
    ]
  }
}
```

#### List User Connections

```http
GET /integrations/connections
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "conn_123",
        "service": "stripe",
        "serviceName": "Stripe",
        "status": "connected",
        "connectedAt": "2024-01-01T00:00:00Z",
        "lastSyncAt": "2024-01-01T12:00:00Z",
        "syncStatus": "success"
      }
    ]
  }
}
```

#### Create Connection

```http
POST /integrations/connections
```

**Request Body:**
```json
{
  "service": "stripe",
  "permissions": ["read:payments", "write:invoices"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectionId": "conn_456",
    "authUrl": "https://connect.stripe.com/oauth/authorize?client_id=...",
    "state": "state-token"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

#### Installation

```bash
npm install @financbase/sdk
```

#### Usage

```typescript
import { FinancbaseAPI } from '@financbase/sdk';

const api = new FinancbaseAPI({
  apiKey: 'sk_live_1234567890abcdef',
  environment: 'production' // or 'sandbox'
});

// Create a workflow
const workflow = await api.workflows.create({
  name: 'Invoice Reminder',
  description: 'Send reminder emails for overdue invoices',
  trigger: {
    type: 'schedule',
    cron: '0 9 * * 1'
  },
  actions: [
    {
      type: 'email',
      config: {
        to: '{{customerEmail}}',
        subject: 'Invoice {{invoiceNumber}} Reminder',
        body: 'Your invoice is overdue. Please pay {{amount}}.'
      }
    }
  ]
});

// Execute a workflow
const execution = await api.workflows.execute(workflow.id, {
  variables: {
    customerEmail: 'customer@example.com',
    invoiceNumber: 'INV-001',
    amount: '$1,000.00'
  }
});

// Create a webhook
const webhook = await api.webhooks.create({
  name: 'Invoice Notifications',
  url: 'https://api.example.com/webhooks/invoice',
  events: ['invoice.created', 'invoice.paid']
});
```

### Python

#### Installation

```bash
pip install financbase-sdk
```

#### Usage

```python
from financbase import FinancbaseAPI

api = FinancbaseAPI(
    api_key='sk_live_1234567890abcdef',
    environment='production'
)

# Create a workflow
workflow = api.workflows.create({
    'name': 'Invoice Reminder',
    'description': 'Send reminder emails for overdue invoices',
    'trigger': {
        'type': 'schedule',
        'cron': '0 9 * * 1'
    },
    'actions': [
        {
            'type': 'email',
            'config': {
                'to': '{{customerEmail}}',
                'subject': 'Invoice {{invoiceNumber}} Reminder',
                'body': 'Your invoice is overdue. Please pay {{amount}}.'
            }
        }
    ]
})

# Execute a workflow
execution = api.workflows.execute(workflow['id'], {
    'variables': {
        'customerEmail': 'customer@example.com',
        'invoiceNumber': 'INV-001',
        'amount': '$1,000.00'
    }
})

# Create a webhook
webhook = api.webhooks.create({
    'name': 'Invoice Notifications',
    'url': 'https://api.example.com/webhooks/invoice',
    'events': ['invoice.created', 'invoice.paid']
})
```

### PHP

#### Installation

```bash
composer require financbase/financbase-sdk
```

#### Usage

```php
<?php
require_once 'vendor/autoload.php';

use Financbase\FinancbaseAPI;

$api = new FinancbaseAPI([
    'api_key' => 'sk_live_1234567890abcdef',
    'environment' => 'production'
]);

// Create a workflow
$workflow = $api->workflows->create([
    'name' => 'Invoice Reminder',
    'description' => 'Send reminder emails for overdue invoices',
    'trigger' => [
        'type' => 'schedule',
        'cron' => '0 9 * * 1'
    ],
    'actions' => [
        [
            'type' => 'email',
            'config' => [
                'to' => '{{customerEmail}}',
                'subject' => 'Invoice {{invoiceNumber}} Reminder',
                'body' => 'Your invoice is overdue. Please pay {{amount}}.'
            ]
        ]
    ]
]);

// Execute a workflow
$execution = $api->workflows->execute($workflow['id'], [
    'variables' => [
        'customerEmail' => 'customer@example.com',
        'invoiceNumber' => 'INV-001',
        'amount' => '$1,000.00'
    ]
]);

// Create a webhook
$webhook = $api->webhooks->create([
    'name' => 'Invoice Notifications',
    'url' => 'https://api.example.com/webhooks/invoice',
    'events' => ['invoice.created', 'invoice.paid']
]);
?>
```

## Webhooks

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `workflow.created` | Workflow created | `{id, name, status}` |
| `workflow.updated` | Workflow updated | `{id, name, status, changes}` |
| `workflow.deleted` | Workflow deleted | `{id, name}` |
| `workflow.executed` | Workflow execution started | `{id, executionId, status}` |
| `workflow.completed` | Workflow execution completed | `{id, executionId, status, result}` |
| `workflow.failed` | Workflow execution failed | `{id, executionId, status, error}` |
| `invoice.created` | Invoice created | `{id, amount, customer, status}` |
| `invoice.updated` | Invoice updated | `{id, amount, customer, status, changes}` |
| `invoice.paid` | Invoice paid | `{id, amount, customer, paymentId}` |
| `payment.received` | Payment received | `{id, amount, invoiceId, method}` |
| `payment.failed` | Payment failed | `{id, amount, invoiceId, reason}` |

### Webhook Payload Structure

```json
{
  "id": "evt_123",
  "type": "workflow.executed",
  "created": "2024-01-01T00:00:00Z",
  "data": {
    "id": "workflow_123",
    "executionId": "exec_456",
    "status": "running",
    "variables": {
      "customerEmail": "customer@example.com",
      "invoiceNumber": "INV-001"
    }
  }
}
```

### Webhook Security

#### Signature Verification

All webhook deliveries include a signature header:

```http
X-Webhook-Signature: sha256=signature
```

#### Verification Process

1. Extract the signature from the `X-Webhook-Signature` header
2. Create a signature using your webhook secret and the request body
3. Compare the signatures using a constant-time comparison

#### Example Implementation

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Endpoint Implementation

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = 'your-webhook-secret';

app.post('/webhooks/financbase', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(payload);
  
  // Handle the event
  switch (event.type) {
    case 'workflow.executed':
      console.log('Workflow executed:', event.data);
      break;
    case 'invoice.created':
      console.log('Invoice created:', event.data);
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
  
  res.json({ received: true });
});
```

## Rate Limits

### Standard Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Workflows | 100 requests | 1 minute |
| Webhooks | 50 requests | 1 minute |
| Integrations | 200 requests | 1 minute |
| General API | 1000 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

```javascript
async function makeAPICall() {
  try {
    const response = await fetch('/api/workflows', {
      headers: {
        'Authorization': 'Bearer ' + apiKey
      }
    });
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = (resetTime * 1000) - Date.now();
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return makeAPICall(); // Retry
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "invalid_request",
    "message": "Invalid request parameters",
    "details": {
      "field": "name",
      "reason": "required"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `invalid_request` | Invalid request parameters |
| `unauthorized` | Authentication required |
| `forbidden` | Insufficient permissions |
| `not_found` | Resource not found |
| `rate_limited` | Rate limit exceeded |
| `server_error` | Internal server error |

### Error Handling Example

```javascript
async function handleAPIError(response) {
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error.code) {
      case 'invalid_request':
        console.error('Invalid request:', error.error.details);
        break;
      case 'unauthorized':
        console.error('Authentication required');
        break;
      case 'rate_limited':
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('API error:', error.error.message);
    }
    
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## Best Practices

### 1. Authentication

- **Use Environment Variables**: Store API keys in environment variables
- **Rotate Keys**: Regularly rotate API keys
- **Scope Permissions**: Use minimal required permissions
- **Monitor Usage**: Track API key usage

### 2. Error Handling

- **Implement Retries**: Retry failed requests with exponential backoff
- **Handle Rate Limits**: Respect rate limits and implement backoff
- **Log Errors**: Log errors for debugging
- **User Feedback**: Provide clear error messages to users

### 3. Performance

- **Use Pagination**: Implement pagination for large datasets
- **Cache Data**: Cache frequently accessed data
- **Batch Operations**: Use batch operations when possible
- **Monitor Performance**: Track API response times

### 4. Security

- **Validate Input**: Validate all input data
- **Use HTTPS**: Always use HTTPS for API calls
- **Secure Storage**: Store credentials securely
- **Audit Logs**: Maintain audit logs

### 5. Testing

- **Unit Tests**: Write unit tests for API integration
- **Integration Tests**: Test API integration end-to-end
- **Mock Responses**: Mock API responses for testing
- **Error Scenarios**: Test error handling scenarios

## Examples

### Complete Integration Example

```javascript
class FinancbaseIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.financbase.com/v2';
  }
  
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return response.json();
  }
  
  async createWorkflow(workflow) {
    return this.makeRequest('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  }
  
  async executeWorkflow(workflowId, variables) {
    return this.makeRequest(`/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ variables })
    });
  }
  
  async createWebhook(webhook) {
    return this.makeRequest('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook)
    });
  }
  
  async getWorkflows(page = 1, limit = 20) {
    return this.makeRequest(`/workflows?page=${page}&limit=${limit}`);
  }
}

// Usage
const api = new FinancbaseIntegration('sk_live_1234567890abcdef');

// Create a workflow
const workflow = await api.createWorkflow({
  name: 'Invoice Reminder',
  description: 'Send reminder emails for overdue invoices',
  trigger: {
    type: 'schedule',
    cron: '0 9 * * 1'
  },
  actions: [
    {
      type: 'email',
      config: {
        to: '{{customerEmail}}',
        subject: 'Invoice {{invoiceNumber}} Reminder',
        body: 'Your invoice is overdue. Please pay {{amount}}.'
      }
    }
  ]
});

// Execute the workflow
const execution = await api.executeWorkflow(workflow.data.id, {
  customerEmail: 'customer@example.com',
  invoiceNumber: 'INV-001',
  amount: '$1,000.00'
});

// Create a webhook
const webhook = await api.createWebhook({
  name: 'Invoice Notifications',
  url: 'https://api.example.com/webhooks/invoice',
  events: ['invoice.created', 'invoice.paid']
});
```

## Conclusion

The Financbase API provides powerful tools for integrating with your business processes. Start with simple API calls and gradually add complexity as you become more familiar with the system.

For more information, check out our [API documentation](../api/workflows.md) and [SDK documentation](https://github.com/financbase/sdk).
