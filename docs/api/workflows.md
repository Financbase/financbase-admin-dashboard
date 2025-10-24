# Workflows API Documentation

## Overview

The Workflows API provides endpoints for managing automated workflows, including creation, execution, monitoring, and template management.

## Base URL

```
https://api.financbase.com/api/workflows
```

## Authentication

All endpoints require authentication via Clerk session tokens.

```http
Authorization: Bearer <session-token>
```

## Endpoints

### List Workflows

Get a list of all workflows for the authenticated user.

```http
GET /api/workflows
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string | Filter by workflow status (`active`, `inactive`) | - |
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Number of workflows per page | 20 |
| `search` | string | Search workflows by name or description | - |

#### Response

```json
{
  "success": true,
  "workflows": [
    {
      "id": "workflow-123",
      "name": "Invoice Reminder",
      "description": "Send reminder emails for overdue invoices",
      "isActive": true,
      "triggerType": "schedule",
      "triggerConfig": {
        "schedule": "0 9 * * 1",
        "timezone": "UTC"
      },
      "steps": [
        {
          "id": "step-1",
          "type": "email",
          "config": {
            "to": "{{customerEmail}}",
            "subject": "Invoice {{invoiceNumber}} Overdue",
            "body": "Your invoice is overdue. Please pay {{amount}}."
          },
          "order": 1
        }
      ],
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

### Create Workflow

Create a new workflow.

```http
POST /api/workflows
```

#### Request Body

```json
{
  "name": "Payment Confirmation",
  "description": "Send confirmation emails for received payments",
  "triggerType": "event",
  "triggerConfig": {
    "event": "payment.received"
  },
  "steps": [
    {
      "type": "email",
      "config": {
        "to": "{{customerEmail}}",
        "subject": "Payment Received - {{invoiceNumber}}",
        "body": "Thank you for your payment of {{amount}}."
      },
      "order": 1
    },
    {
      "type": "webhook",
      "config": {
        "url": "https://api.example.com/payment-notification",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{apiKey}}"
        }
      },
      "order": 2
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "workflowId": "workflow-456",
  "workflow": {
    "id": "workflow-456",
    "name": "Payment Confirmation",
    "description": "Send confirmation emails for received payments",
    "isActive": true,
    "triggerType": "event",
    "triggerConfig": {
      "event": "payment.received"
    },
    "steps": [
      {
        "id": "step-1",
        "type": "email",
        "config": {
          "to": "{{customerEmail}}",
          "subject": "Payment Received - {{invoiceNumber}}",
          "body": "Thank you for your payment of {{amount}}."
        },
        "order": 1
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Workflow

Get a specific workflow by ID.

```http
GET /api/workflows/{id}
```

#### Response

```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "name": "Invoice Reminder",
    "description": "Send reminder emails for overdue invoices",
    "isActive": true,
    "triggerType": "schedule",
    "triggerConfig": {
      "schedule": "0 9 * * 1",
      "timezone": "UTC"
    },
    "steps": [
      {
        "id": "step-1",
        "type": "email",
        "config": {
          "to": "{{customerEmail}}",
          "subject": "Invoice {{invoiceNumber}} Overdue",
          "body": "Your invoice is overdue. Please pay {{amount}}."
        },
        "order": 1
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Workflow

Update an existing workflow.

```http
PATCH /api/workflows/{id}
```

#### Request Body

```json
{
  "name": "Updated Invoice Reminder",
  "description": "Updated description",
  "isActive": false,
  "steps": [
    {
      "id": "step-1",
      "type": "email",
      "config": {
        "to": "{{customerEmail}}",
        "subject": "Updated Subject",
        "body": "Updated body content."
      },
      "order": 1
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "name": "Updated Invoice Reminder",
    "description": "Updated description",
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Workflow

Delete a workflow.

```http
DELETE /api/workflows/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

### Execute Workflow

Manually execute a workflow.

```http
POST /api/workflows/{id}/execute
```

#### Request Body

```json
{
  "variables": {
    "customerEmail": "customer@example.com",
    "invoiceNumber": "INV-001",
    "amount": "$1,000.00"
  }
}
```

#### Response

```json
{
  "success": true,
  "executionId": "exec-789",
  "status": "running",
  "startedAt": "2024-01-01T00:00:00Z"
}
```

### Test Workflow

Test a workflow without side effects (dry run).

```http
POST /api/workflows/{id}/test
```

#### Request Body

```json
{
  "variables": {
    "customerEmail": "test@example.com",
    "invoiceNumber": "TEST-001",
    "amount": "$100.00"
  }
}
```

#### Response

```json
{
  "success": true,
  "dryRun": true,
  "steps": [
    {
      "id": "step-1",
      "type": "email",
      "status": "would_send",
      "config": {
        "to": "test@example.com",
        "subject": "Invoice TEST-001 Overdue",
        "body": "Your invoice is overdue. Please pay $100.00."
      }
    }
  ]
}
```

### Get Execution History

Get execution history for a workflow.

```http
GET /api/workflows/{id}/executions
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Number of executions per page | 20 |
| `status` | string | Filter by execution status | - |

#### Response

```json
{
  "success": true,
  "executions": [
    {
      "id": "exec-789",
      "workflowId": "workflow-123",
      "status": "completed",
      "startedAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:05:00Z",
      "stepsExecuted": 2,
      "stepsSucceeded": 2,
      "stepsFailed": 0,
      "variables": {
        "customerEmail": "customer@example.com",
        "invoiceNumber": "INV-001"
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

### Get Workflow Logs

Get detailed logs for a workflow execution.

```http
GET /api/workflows/{id}/logs
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `executionId` | string | Filter by execution ID | - |
| `level` | string | Filter by log level (`info`, `warn`, `error`) | - |

#### Response

```json
{
  "success": true,
  "logs": [
    {
      "id": "log-1",
      "executionId": "exec-789",
      "stepId": "step-1",
      "level": "info",
      "message": "Email sent successfully",
      "timestamp": "2024-01-01T00:01:00Z",
      "data": {
        "to": "customer@example.com",
        "subject": "Invoice INV-001 Overdue"
      }
    }
  ]
}
```

## Workflow Templates

### List Templates

Get available workflow templates.

```http
GET /api/workflows/templates
```

#### Response

```json
{
  "success": true,
  "templates": [
    {
      "id": "template-1",
      "name": "Invoice Approval",
      "description": "Automated invoice approval workflow",
      "category": "Finance",
      "steps": 3,
      "estimatedTime": "5 minutes",
      "tags": ["invoice", "approval", "finance"]
    }
  ]
}
```

### Create Template

Create a new workflow template.

```http
POST /api/workflows/templates
```

#### Request Body

```json
{
  "name": "Custom Template",
  "description": "A custom workflow template",
  "category": "Custom",
  "steps": [
    {
      "type": "email",
      "config": {
        "to": "{{recipient}}",
        "subject": "{{subject}}",
        "body": "{{message}}"
      },
      "order": 1
    }
  ],
  "tags": ["custom", "email"]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid workflow configuration",
  "details": {
    "field": "steps[0].config.to",
    "message": "Email address is required"
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
  "error": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Workflow not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "requestId": "req-123"
}
```

## Rate Limits

- **Standard**: 100 requests per minute
- **Burst**: 200 requests per minute
- **Execution**: 10 concurrent executions per user

## Webhooks

Workflow events are sent via webhooks when configured:

- `workflow.created` - New workflow created
- `workflow.updated` - Workflow updated
- `workflow.deleted` - Workflow deleted
- `workflow.executed` - Workflow execution started
- `workflow.completed` - Workflow execution completed
- `workflow.failed` - Workflow execution failed

## Examples

### Creating an Invoice Reminder Workflow

```bash
curl -X POST https://api.financbase.com/api/workflows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invoice Reminder",
    "description": "Send reminder emails for overdue invoices",
    "triggerType": "schedule",
    "triggerConfig": {
      "schedule": "0 9 * * 1",
      "timezone": "UTC"
    },
    "steps": [
      {
        "type": "email",
        "config": {
          "to": "{{customerEmail}}",
          "subject": "Invoice {{invoiceNumber}} Overdue",
          "body": "Your invoice is overdue. Please pay {{amount}}."
        },
        "order": 1
      }
    ]
  }'
```

### Testing a Workflow

```bash
curl -X POST https://api.financbase.com/api/workflows/workflow-123/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "customerEmail": "test@example.com",
      "invoiceNumber": "TEST-001",
      "amount": "$100.00"
    }
  }'
```
