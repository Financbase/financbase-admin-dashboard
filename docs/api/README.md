# 📚 Financbase API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Financbase Admin Dashboard. All endpoints support JSON request/response format and include proper error handling.

## 🔐 Authentication

Most API endpoints require authentication via Clerk. Include the authentication token in the `Authorization` header:

```
Authorization: Bearer <clerk_session_token>
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

## 🚀 Endpoints

### AI Services

#### Financial Analysis
**POST** `/api/ai/financial-analysis`

Analyze financial data and provide AI-powered insights.

**Request Body:**
```json
{
  "revenue": [number],
  "expenses": [number],
  "transactions": [
    {
      "id": "string",
      "description": "string",
      "amount": "number",
      "category": "string",
      "date": "string"
    }
  ],
  "budget": {
    "total": "number",
    "categories": [
      {
        "name": "string",
        "budgeted": "number",
        "spent": "number"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": ["string"],
    "recommendations": ["string"],
    "riskAssessment": "string",
    "forecast": {
      "nextMonth": "number",
      "nextQuarter": "number",
      "nextYear": "number"
    }
  }
}
```

#### Transaction Categorization
**POST** `/api/ai/categorize`

Categorize a transaction using AI.

**Request Body:**
```json
{
  "description": "string",
  "amount": "number",
  "type": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "string",
    "confidence": "number",
    "suggestedBudget": "string"
  }
}
```

### Email Services

#### Send Invoice Email
**POST** `/api/email/send-invoice`

Send a professional invoice email to a client.

**Request Body:**
```json
{
  "clientEmail": "string",
  "invoiceData": {
    "invoiceNumber": "string",
    "amount": "number",
    "dueDate": "string",
    "description": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "string"
}
```

### Search Services

#### Universal Search
**GET** `/api/search?q=<query>&index=<index>&page=<page>&hitsPerPage=<hitsPerPage>`

Search across all financial data.

**Query Parameters:**
- `q` (string, required): Search query
- `index` (string, optional): Specific index to search (products, invoices, expenses, customers)
- `page` (number, optional): Page number (default: 0)
- `hitsPerPage` (number, optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "hits": [...],
      "nbHits": "number",
      "page": "number",
      "nbPages": "number",
      "hitsPerPage": "number",
      "processingTimeMS": "number",
      "query": "string",
      "params": "string"
    }
  ]
}
```

#### Search Suggestions
**GET** `/api/search/suggestions?q=<query>&index=<index>`

Get search suggestions/autocomplete.

**Query Parameters:**
- `q` (string, required): Search query
- `index` (string, optional): Index for suggestions (default: products)

**Response:**
```json
{
  "success": true,
  "data": ["suggestion1", "suggestion2", ...]
}
```

### File Upload

#### UploadThing File Upload
**POST** `/api/uploadthing`

Upload files using UploadThing service.

**Supported file types:**
- Invoice attachments (PDF, max 4MB)
- Receipt images (Images, max 2MB)
- Avatar images (Images, max 1MB)
- General documents (PDF, DOC, XLS, max 8MB)

**Response:**
```json
{
  "uploadedBy": "string",
  "url": "string"
}
```

### System Health

#### Health Check
**GET** `/api/health`

Get system health status and service availability.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "string",
  "uptime": "number",
  "version": "string",
  "environment": "string",
  "database": "connected|disconnected",
  "services": {
    "openai": "configured|not_configured",
    "resend": "configured|not_configured",
    "algolia": "configured|not_configured",
    "sentry": "configured|not_configured"
  },
  "overall": "healthy|degraded"
}
```

## 🔧 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## 📈 Rate Limits

API endpoints are protected by Arcjet rate limiting:

- **General API**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **File upload endpoints**: 50 requests per minute

## 🔒 Security Features

- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Bot Detection**: Advanced threat detection and blocking
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Protection**: Proper cross-origin resource sharing configuration

## 🚦 Status Codes

All endpoints return appropriate HTTP status codes:

- **2xx**: Success responses
- **4xx**: Client errors (bad request, unauthorized, etc.)
- **5xx**: Server errors

## 📝 Examples

### Financial Analysis Example

```bash
curl -X POST http://localhost:3000/api/ai/financial-analysis \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "revenue": [45000, 52000, 48000, 55000],
    "expenses": [32000, 35000, 31000, 36000],
    "transactions": [],
    "budget": {
      "total": 60000,
      "categories": [
        {"name": "Marketing", "budgeted": 15000, "spent": 12000},
        {"name": "Operations", "budgeted": 25000, "spent": 22000}
      ]
    }
  }'
```

### Search Example

```bash
curl "http://localhost:3000/api/search?q=office%20supplies&index=invoices&page=0&hitsPerPage=10"
```

### File Upload Example

```bash
curl -X POST http://localhost:3000/api/uploadthing \\
  -F "file=@invoice.pdf" \\
  -H "Authorization: Bearer <token>"
```

## 🔄 Webhooks

### Supported Webhook Events

- **Invoice Created**: Triggered when a new invoice is created
- **Payment Received**: Triggered when a payment is processed
- **Expense Added**: Triggered when a new expense is recorded
- **User Activity**: Triggered on significant user actions

Webhook payloads include:
```json
{
  "event": "invoice.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": { ... }
}
```

## 📞 Support

For API issues or questions:
- Check the [GitHub Issues](https://github.com/your-org/financbase-admin-dashboard/issues) page
- Review the [troubleshooting guide](./troubleshooting.md)
- Contact support@financbase.com for enterprise support

---

*Last updated: January 2024*
