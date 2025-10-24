# Financbase Developer Guide

Welcome to the Financbase Developer Guide! This comprehensive guide will help you understand the platform architecture, integrate with our APIs, and develop custom plugins.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Platform Architecture](#platform-architecture)
3. [API Reference](#api-reference)
4. [Plugin Development](#plugin-development)
5. [Integration Patterns](#integration-patterns)
6. [Security Best Practices](#security-best-practices)
7. [Testing and Debugging](#testing-and-debugging)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin developing with Financbase, ensure you have:

- **Node.js 18+** and npm/yarn
- **TypeScript 5.0+** for type safety
- **Git** for version control
- **PostgreSQL 14+** for local development
- **Redis** for caching (optional for development)

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/financbase/financbase-admin-dashboard.git
   cd financbase-admin-dashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set Up Database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Platform Architecture

### System Overview

Financbase is built on a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Services      │    │   Redis Cache   │
│   (React)       │    │   (Business)    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### 1. Frontend Layer
- **Framework**: Next.js 14 with App Router
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Authentication**: Clerk for user management

#### 2. Backend Layer
- **API Routes**: Next.js API routes with TypeScript
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Clerk integration
- **File Storage**: Local/Cloud storage for documents

#### 3. Database Layer
- **Primary Database**: PostgreSQL with Neon
- **Caching**: Redis (optional)
- **Migrations**: Drizzle Kit for schema management

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend | Next.js | 14.2.3 | React framework |
| Language | TypeScript | 5.4.5 | Type safety |
| Database | PostgreSQL | 14+ | Primary database |
| ORM | Drizzle | 0.30.9 | Database operations |
| UI | Radix UI | Latest | Component library |
| Styling | Tailwind CSS | 3.4.3 | Utility-first CSS |
| Auth | Clerk | 5.0.12 | Authentication |
| Testing | Jest | 29.7.0 | Unit testing |
| E2E | Playwright | 1.44.0 | End-to-end testing |

## API Reference

### Authentication

All API endpoints require authentication. Include the authorization header:

```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Base URL

- **Development**: `http://localhost:3010/api`
- **Production**: `https://your-domain.com/api`

### Core Endpoints

#### Workflows API

```typescript
// List workflows
GET /api/workflows?page=1&limit=10&status=active

// Create workflow
POST /api/workflows
{
  "name": "Invoice Automation",
  "description": "Automated invoice processing",
  "trigger": { "type": "webhook", "config": {} },
  "steps": [
    { "type": "log", "config": { "message": "Processing invoice" } }
  ]
}

// Execute workflow
POST /api/workflows/{id}/execute
{
  "payload": { "invoiceId": "inv_123" }
}

// Test workflow
POST /api/workflows/{id}/test
{
  "payload": { "testData": "value" }
}
```

#### Webhooks API

```typescript
// List webhooks
GET /api/webhooks

// Create webhook
POST /api/webhooks
{
  "name": "Invoice Webhook",
  "url": "https://your-app.com/webhook",
  "eventType": "invoice.created",
  "secret": "your-secret-key"
}

// Test webhook
POST /api/webhooks/{id}/test
{
  "payload": { "test": "data" }
}
```

#### Integrations API

```typescript
// List available integrations
GET /api/integrations

// Create connection
POST /api/integrations/connections
{
  "service": "stripe",
  "config": { "apiKey": "sk_test_..." }
}

// Trigger sync
POST /api/integrations/connections/{id}/sync
{
  "entity": "customers",
  "direction": "import"
}
```

### Response Format

All API responses follow a consistent format:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

## Plugin Development

### Plugin Architecture

Plugins extend Financbase functionality through a standardized interface:

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  hooks: PluginHook[];
  settings: PluginSetting[];
  dependencies: string[];
}
```

### Creating Your First Plugin

1. **Initialize Plugin Structure**
   ```bash
   mkdir plugins/my-custom-plugin
   cd plugins/my-custom-plugin
   npm init -y
   ```

2. **Install Plugin SDK**
   ```bash
   npm install @financbase/plugin-sdk
   ```

3. **Create Plugin Entry Point**
   ```typescript
   // src/index.ts
   import { Plugin, PluginSDK } from '@financbase/plugin-sdk';

   class MyCustomPlugin extends Plugin {
     constructor() {
       super({
         id: 'my-custom-plugin',
         name: 'My Custom Plugin',
         version: '1.0.0',
         description: 'A custom plugin for Financbase',
         author: 'Your Name',
         hooks: [],
         settings: [],
         dependencies: []
       });
     }

     async onInstall() {
       console.log('Plugin installed successfully');
     }

     async onUninstall() {
       console.log('Plugin uninstalled');
     }
   }

   export default MyCustomPlugin;
   ```

### Plugin Hooks

Hooks allow plugins to interact with Financbase events:

```typescript
// Workflow execution hook
const workflowHook: PluginHook = {
  name: 'workflow.beforeExecute',
  handler: async (context) => {
    // Modify workflow context before execution
    context.data.customField = 'plugin value';
    return context;
  }
};

// Webhook delivery hook
const webhookHook: PluginHook = {
  name: 'webhook.afterDelivery',
  handler: async (context) => {
    // Log webhook delivery
    console.log('Webhook delivered:', context.deliveryId);
  }
};
```

### Plugin Settings

Define configurable settings for your plugin:

```typescript
const settings: PluginSetting[] = [
  {
    key: 'apiKey',
    name: 'API Key',
    type: 'string',
    required: true,
    description: 'Your API key for external service'
  },
  {
    key: 'timeout',
    name: 'Request Timeout',
    type: 'number',
    default: 5000,
    description: 'Request timeout in milliseconds'
  }
];
```

### Plugin Development Best Practices

1. **Error Handling**
   ```typescript
   try {
     await pluginMethod();
   } catch (error) {
     console.error('Plugin error:', error);
     // Don't throw errors that could crash the main app
   }
   ```

2. **Async Operations**
   ```typescript
   // Use async/await for better error handling
   async function processData(data: any) {
     const result = await externalAPI.process(data);
     return result;
   }
   ```

3. **Testing**
   ```typescript
   // Write unit tests for your plugin
   describe('MyCustomPlugin', () => {
     it('should process data correctly', async () => {
       const plugin = new MyCustomPlugin();
       const result = await plugin.processData({ test: 'value' });
       expect(result).toBeDefined();
     });
   });
   ```

## Integration Patterns

### OAuth Integration

Implement OAuth 2.0 flow for third-party services:

```typescript
// OAuth handler
class OAuthHandler {
  async getAuthorizationUrl(service: string, userId: string): Promise<string> {
    const state = this.generateState(userId, service);
    const config = this.getServiceConfig(service);
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: state
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleCallback(service: string, code: string, state: string) {
    // Verify state
    if (!this.verifyState(state)) {
      throw new Error('Invalid OAuth state');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(service, code);
    
    // Store connection
    return await this.storeConnection(service, tokens);
  }
}
```

### Webhook Integration

Set up webhook endpoints to receive external events:

```typescript
// Webhook endpoint
export async function POST(request: Request) {
  const signature = request.headers.get('X-Webhook-Signature');
  const payload = await request.json();

  // Verify signature
  if (!verifyWebhookSignature(payload, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Process webhook
  await processWebhookEvent(payload);

  return new Response('OK', { status: 200 });
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

### Data Synchronization

Implement bidirectional data sync:

```typescript
class DataSyncService {
  async syncData(connectionId: string, entity: string, direction: 'import' | 'export') {
    const connection = await this.getConnection(connectionId);
    const mappings = await this.getMappings(connectionId, entity);

    if (direction === 'import') {
      return await this.importData(connection, entity, mappings);
    } else {
      return await this.exportData(connection, entity, mappings);
    }
  }

  private async importData(connection: any, entity: string, mappings: any[]) {
    const externalData = await this.fetchExternalData(connection, entity);
    const transformedData = this.transformData(externalData, mappings);
    
    return await this.saveData(entity, transformedData);
  }
}
```

## Security Best Practices

### Authentication

1. **Use HTTPS Always**
   ```typescript
   // Force HTTPS in production
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       } else {
         next();
       }
     });
   }
   ```

2. **Validate All Inputs**
   ```typescript
   import { z } from 'zod';

   const workflowSchema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().optional(),
     steps: z.array(z.object({
       type: z.string(),
       config: z.record(z.any())
     }))
   });

   export async function POST(request: Request) {
     const body = await request.json();
     const validatedData = workflowSchema.parse(body);
     // Process validated data
   }
   ```

3. **Implement Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });

   app.use('/api/', limiter);
   ```

### Data Protection

1. **Encrypt Sensitive Data**
   ```typescript
   import crypto from 'crypto';

   function encrypt(text: string, secretKey: string): string {
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipher('aes-256-cbc', secretKey);
     let encrypted = cipher.update(text, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     return iv.toString('hex') + ':' + encrypted;
   }
   ```

2. **Sanitize User Input**
   ```typescript
   import DOMPurify from 'isomorphic-dompurify';

   function sanitizeInput(input: string): string {
     return DOMPurify.sanitize(input, { 
       ALLOWED_TAGS: [],
       ALLOWED_ATTR: []
     });
   }
   ```

### API Security

1. **Use CORS Properly**
   ```typescript
   const corsOptions = {
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
     credentials: true,
     optionsSuccessStatus: 200
   };
   ```

2. **Implement Request Validation**
   ```typescript
   function validateRequest(request: Request, schema: z.ZodSchema) {
     try {
       return schema.parse(request.body);
     } catch (error) {
       throw new Error('Invalid request data');
     }
   }
   ```

## Testing and Debugging

### Unit Testing

Write comprehensive unit tests for your code:

```typescript
// __tests__/services/workflow-engine.test.ts
import { WorkflowEngine } from '@/lib/services/workflow-engine';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  it('should execute workflow successfully', async () => {
    const workflow = {
      id: 'test-workflow',
      steps: [
        { type: 'log', config: { message: 'Test' } }
      ]
    };

    const result = await engine.executeWorkflow(workflow, {});
    expect(result.status).toBe('completed');
  });
});
```

### Integration Testing

Test API endpoints and database interactions:

```typescript
// __tests__/integration/workflows.test.ts
import { GET, POST } from '@/app/api/workflows/route';

describe('Workflows API', () => {
  it('should create workflow', async () => {
    const request = new Request('http://localhost/api/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Workflow',
        description: 'Test description'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### End-to-End Testing

Use Playwright for E2E testing:

```typescript
// e2e/workflows.spec.ts
import { test, expect } from '@playwright/test';

test('should create and execute workflow', async ({ page }) => {
  await page.goto('/workflows');
  await page.click('button:has-text("Create Workflow")');
  
  await page.fill('input[name="name"]', 'Test Workflow');
  await page.click('button:has-text("Save")');
  
  await expect(page.locator('text=Test Workflow')).toBeVisible();
});
```

### Debugging

1. **Use Console Logging**
   ```typescript
   console.log('Debug info:', { workflowId, stepId, data });
   ```

2. **Implement Error Tracking**
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   try {
     await riskyOperation();
   } catch (error) {
     Sentry.captureException(error);
     throw error;
   }
   ```

3. **Database Query Logging**
   ```typescript
   // Enable query logging in development
   if (process.env.NODE_ENV === 'development') {
     console.log('SQL Query:', query);
   }
   ```

## Deployment Guide

### Environment Setup

1. **Production Environment Variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # Authentication
   CLERK_SECRET_KEY=your-secret-key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
   
   # External Services
   STRIPE_SECRET_KEY=sk_live_...
   SLACK_BOT_TOKEN=xoxb-...
   ```

2. **Database Migration**
   ```bash
   npm run db:migrate
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

### Deployment Options

#### Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Set all required environment variables in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t financbase .
   docker run -p 3000:3000 financbase
   ```

### Monitoring and Maintenance

1. **Health Checks**
   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     const health = {
       status: 'healthy',
       timestamp: new Date().toISOString(),
       database: await checkDatabase(),
       services: await checkServices()
     };
     
     return Response.json(health);
   }
   ```

2. **Logging**
   ```typescript
   import winston from 'winston';

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

## Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem**: Database connection fails
**Solution**: Check connection string and network access

```typescript
// Test database connection
async function testConnection() {
  try {
    await db.select().from(users).limit(1);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
```

#### Authentication Issues

**Problem**: Users can't log in
**Solution**: Verify Clerk configuration

```typescript
// Check Clerk configuration
console.log('Clerk config:', {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not set'
});
```

#### Workflow Execution Issues

**Problem**: Workflows fail to execute
**Solution**: Check workflow configuration and logs

```typescript
// Debug workflow execution
async function debugWorkflow(workflowId: string) {
  const workflow = await getWorkflow(workflowId);
  console.log('Workflow config:', workflow);
  
  const logs = await getWorkflowLogs(workflowId);
  console.log('Execution logs:', logs);
}
```

### Performance Issues

#### Slow Database Queries

**Problem**: Database queries are slow
**Solution**: Add indexes and optimize queries

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
```

#### Memory Leaks

**Problem**: Application memory usage increases over time
**Solution**: Check for memory leaks in event listeners and timers

```typescript
// Clean up event listeners
useEffect(() => {
  const handler = () => { /* handle event */ };
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

### Getting Help

1. **Documentation**: Check the [API Documentation](https://docs.financbase.com)
2. **Community**: Join our [Discord Community](https://discord.gg/financbase)
3. **Support**: Contact [support@financbase.com](mailto:support@financbase.com)
4. **GitHub Issues**: Report bugs on [GitHub](https://github.com/financbase/financbase-admin-dashboard/issues)

---

**Happy Coding!** 🚀

For more information, visit our [Developer Portal](https://developers.financbase.com) or check out our [API Reference](https://api.financbase.com/docs).
