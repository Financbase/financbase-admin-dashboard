# Webhooks API Documentation

## Overview

The Webhooks API provides endpoints for managing webhook endpoints, event delivery, and monitoring webhook performance.

## Base URL

```
https://api.financbase.com/api/webhooks
```

## Authentication

All endpoints require authentication via Clerk session tokens.

```http
Authorization: Bearer <session-token>
```

## Endpoints

### List Webhooks

Get a list of all webhooks for the authenticated user.

```http
GET /api/webhooks
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string | Filter by webhook status (`active`, `inactive`) | - |
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Number of webhooks per page | 20 |

#### Response

```json
{
  "success": true,
  "webhooks": [
    {
      "id": "webhook-123",
      "name": "Invoice Notifications",
      "url": "https://api.example.com/webhooks/invoice",
      "events": ["invoice.created", "invoice.paid"],
      "isActive": true,
      "secret": "whsec_...",
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
```

### Create Webhook

Create a new webhook endpoint.

```http
POST /api/webhooks
```

#### Request Body

```json
{
  "name": "Payment Notifications",
  "url": "https://api.example.com/webhooks/payment",
  "events": ["payment.received", "payment.failed"],
  "isActive": true,
  "secret": "your-webhook-secret"
}
```

#### Response

```json
{
  "success": true,
  "webhookId": "webhook-456",
  "webhook": {
    "id": "webhook-456",
    "name": "Payment Notifications",
    "url": "https://api.example.com/webhooks/payment",
    "events": ["payment.received", "payment.failed"],
    "isActive": true,
    "secret": "whsec_...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Webhook

Get a specific webhook by ID.

```http
GET /api/webhooks/{id}
```

#### Response

```json
{
  "success": true,
  "webhook": {
    "id": "webhook-123",
    "name": "Invoice Notifications",
    "url": "https://api.example.com/webhooks/invoice",
    "events": ["invoice.created", "invoice.paid"],
    "isActive": true,
    "secret": "whsec_...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Webhook

Update an existing webhook.

```http
PATCH /api/webhooks/{id}
```

#### Request Body

```json
{
  "name": "Updated Invoice Notifications",
  "url": "https://api.example.com/webhooks/invoice-updated",
  "events": ["invoice.created", "invoice.updated", "invoice.paid"],
  "isActive": true
}
```

#### Response

```json
{
  "success": true,
  "webhook": {
    "id": "webhook-123",
    "name": "Updated Invoice Notifications",
    "url": "https://api.example.com/webhooks/invoice-updated",
    "events": ["invoice.created", "invoice.updated", "invoice.paid"],
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Webhook

Delete a webhook.

```http
DELETE /api/webhooks/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

### Test Webhook

Test a webhook endpoint.

```http
POST /api/webhooks/{id}/test
```

#### Request Body

```json
{
  "payload": {
    "test": true,
    "message": "Test webhook delivery"
  }
}
```

#### Response

```json
{
  "success": true,
  "responseTime": 150,
  "statusCode": 200,
  "response": {
    "message": "Webhook received successfully"
  }
}
```

### Get Delivery History

Get delivery history for a webhook.

```http
GET /api/webhooks/{id}/deliveries
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Number of deliveries per page | 20 |
| `status` | string | Filter by delivery status | - |
| `startDate` | string | Filter by start date (ISO 8601) | - |
| `endDate` | string | Filter by end date (ISO 8601) | - |

#### Response

```json
{
  "success": true,
  "deliveries": [
    {
      "id": "delivery-789",
      "webhookId": "webhook-123",
      "eventType": "invoice.created",
      "status": "delivered",
      "attempts": 1,
      "responseTime": 150,
      "statusCode": 200,
      "deliveredAt": "2024-01-01T00:00:00Z",
      "payload": {
        "id": "invoice-123",
        "amount": 1000,
        "status": "created"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Retry Failed Delivery

Retry a failed webhook delivery.

```http
POST /api/webhooks/{id}/retry
```

#### Request Body

```json
{
  "deliveryId": "delivery-789"
}
```

#### Response

```json
{
  "success": true,
  "deliveryId": "delivery-790",
  "status": "retrying"
}
```

## Webhook Events

### Available Events

| Event | Description | Payload |
|-------|-------------|---------|
| `invoice.created` | Invoice created | `{id, amount, customer, status}` |
| `invoice.updated` | Invoice updated | `{id, amount, customer, status, changes}` |
| `invoice.paid` | Invoice paid | `{id, amount, customer, paymentId}` |
| `payment.received` | Payment received | `{id, amount, invoiceId, method}` |
| `payment.failed` | Payment failed | `{id, amount, invoiceId, reason}` |
| `expense.created` | Expense created | `{id, amount, category, description}` |
| `expense.approved` | Expense approved | `{id, amount, approver, approvedAt}` |
| `client.created` | Client created | `{id, name, email, company}` |
| `report.generated` | Report generated | `{id, type, period, url}` |

### Event Payload Structure

```json
{
  "id": "evt_123",
  "type": "invoice.created",
  "created": "2024-01-01T00:00:00Z",
  "data": {
    "id": "invoice-123",
    "amount": 1000,
    "currency": "USD",
    "customer": {
      "id": "customer-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "created"
  }
}
```

## Webhook Security

### Signature Verification

All webhook deliveries include a signature header for verification:

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

## Delivery Retry Logic

### Retry Schedule

| Attempt | Delay | Max Attempts |
|---------|-------|--------------|
| 1 | Immediate | 3 |
| 2 | 1 minute | 3 |
| 3 | 5 minutes | 3 |

### Retry Conditions

- HTTP status codes: 408, 429, 500, 502, 503, 504
- Network timeouts
- Connection errors

### Final Failure

After maximum retries, the delivery is marked as failed and no further attempts are made.

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid webhook configuration",
  "details": {
    "field": "url",
    "message": "URL must be HTTPS"
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

### 404 Not Found

```json
{
  "success": false,
  "error": "Webhook not found"
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

- **Webhook Creation**: 10 per minute
- **Webhook Testing**: 20 per minute
- **Delivery Retries**: 5 per minute per webhook

## Examples

### Creating a Webhook

```bash
curl -X POST https://api.financbase.com/api/webhooks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invoice Notifications",
    "url": "https://api.example.com/webhooks/invoice",
    "events": ["invoice.created", "invoice.paid"],
    "isActive": true,
    "secret": "your-webhook-secret"
  }'
```

### Testing a Webhook

```bash
curl -X POST https://api.financbase.com/api/webhooks/webhook-123/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": true,
      "message": "Test webhook delivery"
    }
  }'
```

### Webhook Endpoint Implementation

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = 'your-webhook-secret';

app.post('/webhooks/invoice', express.raw({type: 'application/json'}), (req, res) => {
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
    case 'invoice.created':
      console.log('Invoice created:', event.data);
      break;
    case 'invoice.paid':
      console.log('Invoice paid:', event.data);
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
  
  res.json({ received: true });
});
```
