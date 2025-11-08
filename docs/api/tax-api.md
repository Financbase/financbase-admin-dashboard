# Tax API Documentation

## Overview

The Tax API provides endpoints for managing tax obligations, deductions, documents, and payments. All endpoints require authentication via Clerk.

## Base URL

```
/api/tax
```

## Authentication

All endpoints require authentication. Include the authentication token in the request headers.

## Endpoints

### Tax Obligations

#### GET /api/tax/obligations

Get list of tax obligations with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `paid`, `overdue`, `cancelled`)
- `year` (optional): Filter by year
- `quarter` (optional): Filter by quarter (e.g., "Q1 2025")
- `type` (optional): Filter by type
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page (max 100, default 50)

**Response (Paginated):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-id",
      "name": "Federal Income Tax",
      "type": "federal_income",
      "amount": "1000.00",
      "paid": "500.00",
      "status": "pending",
      "dueDate": "2025-04-15T00:00:00Z",
      "year": 2025,
      "quarter": null,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Response (Non-paginated):**
```json
{
  "success": true,
  "data": [...]
}
```

#### POST /api/tax/obligations

Create a new tax obligation.

**Request Body:**
```json
{
  "name": "Federal Income Tax",
  "type": "federal_income",
  "amount": 1000,
  "dueDate": "2025-04-15",
  "status": "pending",
  "year": 2025,
  "quarter": null,
  "notes": "Annual tax obligation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tax obligation created successfully",
  "data": {
    "id": "uuid",
    ...
  }
}
```

#### PATCH /api/tax/obligations/:id

Update a tax obligation.

**Request Body:**
```json
{
  "name": "Updated Name",
  "amount": 1200,
  "status": "paid"
}
```

#### DELETE /api/tax/obligations/:id

Soft delete a tax obligation.

**Response:**
```json
{
  "success": true,
  "message": "Tax obligation deleted successfully"
}
```

#### POST /api/tax/obligations/:id/payment

Record a payment for a tax obligation.

**Request Body:**
```json
{
  "amount": 500,
  "paymentDate": "2025-01-15",
  "paymentMethod": "bank_transfer",
  "reference": "TXN-12345",
  "notes": "Quarterly payment"
}
```

### Tax Deductions

#### GET /api/tax/deductions

Get list of tax deductions with optional filtering and pagination.

**Query Parameters:**
- `year` (optional): Filter by year
- `category` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** Similar to obligations endpoint

#### POST /api/tax/deductions

Create a new tax deduction.

**Request Body:**
```json
{
  "category": "Business Expenses",
  "amount": 5000,
  "year": 2025,
  "description": "Office supplies and equipment"
}
```

#### PATCH /api/tax/deductions/:id

Update a tax deduction.

#### DELETE /api/tax/deductions/:id

Soft delete a tax deduction.

### Tax Documents

#### GET /api/tax/documents

Get list of tax documents with optional filtering and pagination.

**Query Parameters:**
- `year` (optional): Filter by year
- `type` (optional): Filter by document type
- `page` (optional): Page number
- `limit` (optional): Items per page

#### POST /api/tax/documents

Create a new tax document record.

**Request Body:**
```json
{
  "name": "2024 Tax Return",
  "type": "tax_return",
  "year": 2024,
  "fileUrl": "https://...",
  "fileSize": 1024000,
  "fileName": "tax-return-2024.pdf",
  "mimeType": "application/pdf"
}
```

#### DELETE /api/tax/documents/:id

Soft delete a tax document.

### Tax Summary

#### GET /api/tax/summary

Get tax summary and statistics for a year.

**Query Parameters:**
- `year` (optional): Year to get summary for (default: current year)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalObligations": 5000,
    "totalPaid": 2500,
    "totalPending": 2500,
    "totalDeductions": 3000,
    "obligationsByStatus": {
      "pending": 2,
      "paid": 1,
      "overdue": 0
    },
    "obligationsByType": {
      "federal_income": 2,
      "state_income": 1
    }
  }
}
```

### Tax Alerts

#### GET /api/tax/alerts

Get tax alerts for overdue/pending taxes.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "danger",
      "message": "Federal Income Tax is overdue by 5 days",
      "action": "Pay Now",
      "amount": "$1000",
      "obligationId": "uuid"
    }
  ]
}
```

### Tax Payments

#### GET /api/tax/payments

Get payment history.

**Query Parameters:**
- `year` (optional): Filter by year
- `obligationId` (optional): Filter by obligation ID

#### GET /api/tax/payments/:obligationId

Get payments for a specific obligation.

### Export

#### GET /api/tax/export

Export tax data in CSV or PDF format.

**Query Parameters:**
- `format`: `csv` | `pdf` (default: `csv`)
- `type`: `obligations` | `summary` (default: `obligations`)
- `year` (optional): Year filter

**Response:** CSV file download or PDF (when implemented)

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {}
  }
}
```

## Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Unauthorized access
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

- Tax calculation endpoints: 100 requests per minute per user
- Tax payment endpoints: 100 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)
- `Retry-After`: Seconds until retry allowed

## Pagination

When pagination is requested, responses include pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## Soft Deletes

All delete operations are soft deletes. Deleted resources can be restored using restore endpoints (when implemented).

## Audit Logging

All create, update, and delete operations are automatically logged for compliance and security purposes.

