# Financbase API Documentation

## Overview

Financbase is a comprehensive financial management platform that provides enterprise-grade bill pay automation, vendor management, approval workflows, and real-time collaboration features. This API documentation covers all the core services and endpoints.

## Authentication

All API endpoints require authentication using Clerk. Include the session token in the Authorization header:

```text
Authorization: Bearer <clerk_session_token>
```

## Base URL

```url
https://financbase.com/api/v1
```

## API Services

### 1. Bills API

Manage bills, invoices, and payment requests.

#### Get Bills

**GET** `/api/bills`

Query parameters:

- `status` (optional): Filter by bill status (draft, received, pending_approval, approved, paid, etc.)
- `vendorId` (optional): Filter by vendor ID
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

Response:

```json
{
  "bills": [
    {
      "id": "uuid",
      "userId": "uuid",
      "vendorId": "uuid",
      "billNumber": "string",
      "vendorBillNumber": "string",
      "amount": "string",
      "currency": "string",
      "dueDate": "timestamp",
      "status": "string",
      "priority": "string",
      "description": "string",
      "category": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

#### Create Bill

**POST** `/api/bills`

Request body:

```json
{
  "vendorId": "uuid",
  "amount": "number",
  "currency": "string",
  "dueDate": "timestamp",
  "issueDate": "timestamp",
  "invoiceNumber": "string",
  "description": "string",
  "category": "string",
  "priority": "string"
}
```

Response:

```json
{
  "bill": {
    "id": "uuid",
    "userId": "uuid",
    "vendorId": "uuid",
    "billNumber": "string",
    "amount": "string",
    "currency": "string",
    "dueDate": "timestamp",
    "status": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### 2. Vendors API

Manage vendor relationships and payment preferences.

#### Get Vendors

**GET** `/api/vendors`

Query parameters:

- `status` (optional): Filter by vendor status (active, inactive, suspended)
- `category` (optional): Filter by vendor category
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

Response:

```json
{
  "vendors": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "taxId": "string",
      "industry": "string",
      "preferredPaymentMethod": "string",
      "paymentTerms": "string",
      "autoPay": "boolean",
      "approvalRequired": "boolean",
      "approvalThreshold": "string",
      "category": "string",
      "status": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

#### Create Vendor

**POST** `/api/vendors`

Request body:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "taxId": "string",
  "paymentTerms": "number",
  "category": "string",
  "paymentMethods": [
    {
      "type": "string",
      "details": "object"
    }
  ],
  "autoPay": "boolean",
  "approvalRequired": "boolean",
  "approvalThreshold": "number"
}
```

### 3. Approval Workflows API

Manage approval processes and decision making.

#### Get Approval Workflows

**GET** `/api/approval-workflows`

Query parameters:

- `status` (optional): Filter by workflow status
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

#### Create Approval Workflow

**POST** `/api/approval-workflows`

Request body:

```json
{
  "name": "string",
  "description": "string",
  "amountThreshold": "number",
  "vendorCategories": ["string"],
  "steps": [
    {
      "name": "string",
      "type": "user|role|amount_threshold|auto_approve",
      "approverId": "string",
      "role": "string",
      "threshold": "number",
      "order": "number"
    }
  ]
}
```

#### Process Approval Decision

**PATCH** `/api/approvals/{id}/decide`

Request body:

```json
{
  "decision": "approve|reject",
  "comments": "string"
}
```

### 4. OCR Processing API

Process documents with AI-powered OCR and data extraction.

#### Process Document

**POST** `/api/bills/process-document`

Content-Type: `multipart/form-data`

Form data:

- `file`: The document file (PDF, JPG, PNG, WebP)
- `documentType`: Type of document (invoice, receipt, bill, statement)

Response:

```json
{
  "id": "uuid",
  "documentType": "string",
  "extractedData": {
    "vendor": "string",
    "amount": "number",
    "currency": "string",
    "dueDate": "timestamp",
    "issueDate": "timestamp",
    "invoiceNumber": "string",
    "description": "string",
    "confidence": "number"
  },
  "confidence": "number",
  "aiExplanation": {
    "reasoning": "string",
    "evidence": ["string"],
    "confidence": "number"
  },
  "processingTime": "number"
}
```

### 5. Payment Processing API

Handle payment scheduling and processing.

#### Schedule Payment

**POST** `/api/bills/{billId}/schedule-payment`

Request body:

```json
{
  "paymentMethod": "string",
  "scheduledDate": "timestamp",
  "amount": "number",
  "notes": "string"
}
```

#### Process Payment

**POST** `/api/bills/{billId}/process-payment`

Request body:

```json
{
  "paymentMethod": "string"
}
```

### 6. Real-time Collaboration API

WebSocket endpoints for real-time collaboration features.

#### Connect to Workspace

**WebSocket** `/api/collaboration/ws`

Messages:

```json
{
  "type": "join_workspace",
  "data": {
    "workspaceId": "uuid",
    "userId": "uuid"
  }
}
```

#### Send Message

```json
{
  "type": "send_message",
  "data": {
    "channelId": "uuid",
    "content": "string",
    "messageType": "text|file|system"
  }
}
```

#### Update Approval Status

```json
{
  "type": "approval_update",
  "data": {
    "billId": "uuid",
    "approvalId": "uuid",
    "status": "approved|rejected",
    "comments": "string"
  }
}
```

## Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **500**: Internal Server Error

## Error Response Format

```json
{
  "error": "string",
  "message": "string",
  "details": "object"
}
```

## Rate Limiting

- **Standard API**: 100 requests per minute
- **Upload endpoints**: 50 requests per minute
- **Real-time endpoints**: 1000 messages per minute

## Webhooks

Configure webhooks to receive real-time notifications about bill status changes, payment processing, and approval decisions.

### Webhook Events

- `bill.created`
- `bill.updated`
- `bill.approved`
- `bill.rejected`
- `payment.scheduled`
- `payment.processed`
- `payment.failed`
- `vendor.added`
- `approval.requested`
- `approval.decided`

### Webhook Payload

```json
{
  "event": "bill.approved",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "billId": "uuid",
    "userId": "uuid",
    "status": "approved",
    "approvedBy": "uuid",
    "approvedAt": "timestamp",
    "amount": "string",
    "vendorName": "string"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install financbase-sdk
```

```typescript
import { FinancbaseClient } from 'financbase-sdk';

const client = new FinancbaseClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://financbase.com/api/v1'
});

// Create a bill
const bill = await client.bills.create({
  vendorId: 'vendor-uuid',
  amount: 1000,
  currency: 'USD',
  dueDate: new Date('2024-02-15'),
  description: 'Office supplies'
});

console.log('Created bill:', bill.id);
```

### Python SDK

```bash
pip install financbase-python
```

```python
from financbase import FinancbaseClient

client = FinancbaseClient(api_key='your_api_key')

# Get bills
bills = client.get_bills(status='pending_approval')
for bill in bills:
    print(f"Bill {bill['bill_number']}: ${bill['amount']}")
```

## Best Practices

### 1. Error Handling

Always handle API errors gracefully:

```typescript
try {
  const bills = await client.bills.get();
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    await refreshToken();
  } else if (error.status === 429) {
    // Handle rate limiting
    await delay(1000);
    retry();
  }
}
```

### 2. Pagination

Handle large result sets with pagination:

```typescript
let allBills = [];
let offset = 0;
const limit = 100;

while (true) {
  const response = await client.bills.get({ limit, offset });
  allBills = allBills.concat(response.bills);

  if (response.bills.length < limit) break;
  offset += limit;
}
```

### 3. Webhook Security

Verify webhook signatures:

```typescript
const isValidSignature = verifySignature(
  payload,
  signature,
  webhookSecret
);

if (!isValidSignature) {
  throw new Error('Invalid webhook signature');
}
```

## Support

For API support and questions:

- **Documentation**: [Documentation Index](../README.md) (see [External Resources](../EXTERNAL_RESOURCES.md) for external docs)
- **Support Email**: <support@financbase.com>
- **Community Forum**: See [External Resources](../EXTERNAL_RESOURCES.md) (community.financbase.com - not yet deployed)
- **Status Page**: [System Status Page](/status) - Real-time system health monitoring

## Changelog

### v1.0.0 (2024-01-15)

- Initial API release
- Bill management endpoints
- Vendor management
- Approval workflows
- OCR processing
- Real-time collaboration

---

**Financbase API v1.0.0** - Enterprise Financial Management Platform
