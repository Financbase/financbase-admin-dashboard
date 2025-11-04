# Backend Architecture

## Overview

The Financbase Admin Dashboard backend is built using Next.js 15.4.7 App Router with Route Handlers, providing a unified full-stack framework. The backend implements RESTful API patterns, comprehensive error handling, API versioning, and Row Level Security (RLS) integration.

## Core Architecture

### Next.js Route Handlers

All API endpoints are implemented as Route Handlers in the `app/api/` directory:

```plaintext
app/api/
├── v1/                    # Versioned API routes
│   └── health/
│       └── route.ts
├── accounts/              # Account management
├── invoices/              # Invoice operations
├── transactions/          # Transaction processing
├── ai/                    # AI services
├── workflows/             # Workflow automation
├── marketplace/           # Plugin marketplace
└── ...
```

### Route Handler Structure

Each API route follows a consistent pattern:

```6:27:app/api/dashboard/overview/route.ts
export async function GET(request: Request) {
 const requestId = generateRequestId();
 try {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
   return ApiErrorHandler.unauthorized();
  }

  // Get overview data from database
  const overview = await DashboardService.getOverview(userId);

  return NextResponse.json({
   message: 'Dashboard API with real database data works!',
   overview,
   userId,
   timestamp: new Date().toISOString()
  });
 } catch (error) {
  return ApiErrorHandler.handle(error, requestId);
 }
}
```

## Middleware Architecture

### Request Flow

```plaintext
Request → Middleware → Route Handler → Service Layer → Database → Response

### Middleware Implementation

```48:139:middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Explicitly exclude Next.js internal files and static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/manifest.json') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Handle API versioning - prepare headers for all API routes
  let versioningHeaders: NextResponse | null = null;
  if (pathname.startsWith('/api/')) {
    versioningHeaders = handleApiVersioning(req);
  }

  // Handle root route - always redirect
  if (pathname === '/') {
    try {
      const { userId } = await auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      console.warn('Auth check failed for root route, redirecting to home:', error);
    }
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Get userId only when needed
  const { userId } = await auth();

  // Redirect authenticated users away from auth pages
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      // For API routes, return 401 JSON response
      if (pathname.startsWith('/api/')) {
        const errorResponse = NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
        
        // Ensure version headers are added even to error responses
        if (versioningHeaders) {
          versioningHeaders.headers.forEach((value, key) => {
            errorResponse.headers.set(key, value);
          });
        }
        
        return errorResponse;
      }
      // For page routes, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }
  }

  // Final response - ensure version headers are included
  const finalResponse = NextResponse.next();
  if (versioningHeaders) {
    versioningHeaders.headers.forEach((value, key) => {
      finalResponse.headers.set(key, value);
    });
  }

  return finalResponse;
});
```

### Route Classification

**Public Routes:**

- `/auth/sign-in`, `/auth/sign-up`
- `/api/health`, `/api/contact`
- `/api/webhooks/*` (webhook endpoints)

**Protected Routes:**

- `/dashboard/*`
- `/api/accounts/*`, `/api/invoices/*`, `/api/transactions/*`
- `/api/ai/*`, `/api/workflows/*`
- `/api/platform/*`, `/api/marketplace/*`

## API Versioning

### Versioning System

The application supports multiple API versions with deprecation warnings:

```16:54:lib/api/versioning.ts
export function extractApiVersion(pathname: string): ApiVersion | null {
  const versionMatch = pathname.match(/^\/api\/(v\d+)\//);
  if (versionMatch) {
    const version = versionMatch[1] as ApiVersion;
    return version;
  }
  return null;
}

export function getApiVersion(request: NextRequest): ApiVersion {
  const version = extractApiVersion(request.nextUrl.pathname);
  return version || 'v1'; // Default to v1 for backward compatibility
}

export function createVersionedPath(version: ApiVersion, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/api/${version}/${cleanPath}`;
}
```

### Version Configuration

```137:152:lib/api/versioning.ts
export const API_VERSIONS = {
  v1: {
    version: 'v1' as ApiVersion,
    status: 'stable' as const,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    description: 'Stable API version - recommended for production use',
  },
  v2: {
    version: 'v2' as ApiVersion,
    status: 'beta' as const,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    description: 'Next-generation API with improved features and performance',
  },
} as const;
```

### Version Headers

All API responses include version information:

```102:132:lib/api/versioning.ts
export function addVersionHeader(response: NextResponse, version: ApiVersion): NextResponse {
  response.headers.set('X-API-Version', version);
  return response;
}

export function addDeprecationWarning(
  response: NextResponse,
  deprecatedVersion: ApiVersion | 'unversioned',
  sunsetDate: string
): NextResponse {
  response.headers.set('X-API-Deprecated', 'true');
  response.headers.set('X-API-Deprecated-Version', deprecatedVersion);
  response.headers.set('Sunset', sunsetDate);
  response.headers.set(
    'Link',
    `<${response.headers.get('X-API-Version') || 'v1'}>; rel="successor-version"`
  );
  response.headers.set(
    'Warning',
    `299 - "Using unversioned API endpoints is deprecated. Migrate to versioned endpoints (e.g., /api/v1/...) before ${sunsetDate}"`
  );
  return response;
}
```

### Example Versioned Route

```10:43:app/api/v1/health/route.ts
export async function GET(request: Request) {
 try {
  const versionContext = getApiVersionContext(request as any);
  const healthStatus = await HealthCheckService.performHealthCheck();
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
        healthStatus.status === 'degraded' ? 200 : 503;
  
  const response = NextResponse.json(healthStatus, { status: statusCode });
  
  // Set version headers
  const headers = new Headers(response.headers);
  setVersionHeaders(headers as any, versionContext.version);
  
  return new NextResponse(response.body, {
   status: statusCode,
   headers,
  });
 } catch (error) {
  const response = NextResponse.json({
   status: 'unhealthy',
   timestamp: new Date().toISOString(),
   error: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 503 });
  
  const headers = new Headers(response.headers);
  setVersionHeaders(headers as any, 'v1');
  
  return new NextResponse(response.body, {
   status: 503,
   headers,
  });
 }
}
```

## Error Handling

### Centralized Error Handler

```12:94:lib/api-error-handler.ts
export class ApiErrorHandler {
  static handle(error: unknown, requestId?: string): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
      return this.validationError(error, requestId);
    }

    if (error instanceof Error) {
      return this.serverError(error.message, error.stack, requestId);
    }

    return this.serverError('An unexpected error occurred', undefined, requestId);
  }

  static unauthorized(message = 'Unauthorized access'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 401 }
    );
  }

  static forbidden(message = 'Forbidden access'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 403 }
    );
  }

  static notFound(message = 'Resource not found'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 404 }
    );
  }

  static validationError(error: ZodError, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          requestId,
        }
      },
      { status: 400 }
    );
  }

  static serverError(message: string, stack?: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
          timestamp: new Date().toISOString(),
          requestId,
          ...(process.env.NODE_ENV === 'development' && { stack }),
        }
      },
      { status: 500 }
    );
  }
```

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}, // Optional additional details
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "unique-request-id"
  }
}
```

### Request ID Generation

Each request gets a unique ID for tracing:

```typescript
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

## Row Level Security Integration

### withRLS Helper

Automatic RLS context setting for API routes:

```36:69:lib/api/with-rls.ts
export async function withRLS<T = unknown>(
  handler: (userId: string, clerkUser?: Awaited<ReturnType<typeof currentUser>>) => Promise<NextResponse<T>>,
  options: WithRLSOptions = {}
): Promise<NextResponse<T | { error: string }>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Fetch Clerk user for additional context
    const clerkUser = await currentUser();

    // Set RLS context using Clerk user ID
    const userFound = await setRLSContextFromClerkId(userId);
    
    if (options.requireDatabaseUser && !userFound) {
      return NextResponse.json(
        { 
          error: options.userNotFoundMessage || 'User not found in database. Please complete your profile setup.',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Execute the handler with RLS context already set
    return await handler(userId, clerkUser || undefined);
  } catch (error) {
    console.error('[withRLS] Error:', error);
    return ApiErrorHandler.handle(error);
  }
}
```

### Usage Example

```63:102:app/api/blog/route.ts
export async function POST(req: NextRequest) {
 const requestId = generateRequestId();
 return withRLS(async (clerkUserId) => {
  // Check if user is admin
  const isAdmin = await checkAdminStatus();
  if (!isAdmin) {
   return ApiErrorHandler.forbidden('Only administrators can create blog posts');
  }

  // Parse JSON body with proper error handling
  let body;
  try {
   body = await req.json();
  } catch (error) {
   // Handle JSON parse errors (malformed JSON)
   if (error instanceof SyntaxError || error instanceof TypeError) {
    return ApiErrorHandler.badRequest('Invalid JSON in request body');
   }
   // Re-throw other errors to be handled by outer catch
   throw error;
  }

  try {
   const validatedData = createBlogPostSchema.parse({
    ...body,
    userId: clerkUserId, // Ensure userId comes from auth, not request body
   });

   const newPost = await blogService.createPost(validatedData);

   return NextResponse.json({
    success: true,
    message: 'Blog post created successfully',
    data: newPost,
   }, { status: 201 });
  } catch (error) {
   return ApiErrorHandler.handle(error, requestId);
  }
 });
}
```

## Request Validation

### Zod Schema Validation

All request bodies are validated using Zod:

```typescript
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  message: z.string().min(10).max(5000),
  website: z.string().optional(), // Honeypot field
});

// In route handler
const validationResult = contactFormSchema.safeParse(body);
if (!validationResult.success) {
  return ApiErrorHandler.validationError(validationResult.error, requestId);
}
```

## Security Features

### Rate Limiting

Implemented via middleware and Arcjet:

```68:99:app/api/contact/route.ts
export async function POST(request: NextRequest) {
 const requestId = generateRequestId();
 try {
  // Apply security checks (rate limiting, bot detection, threat protection)
  const securityCheck = await SecurityService.securityCheck(
   request,
   '/api/contact'
  );

  if (securityCheck.denied) {
   // Keep security-specific response format for rate limiting
   if (securityCheck.status === 429) {
    return ApiErrorHandler.rateLimitExceeded(
     securityCheck.reasons?.join(', ') || 'Too many requests'
    );
   }
   return NextResponse.json(
    {
     error: 'Request denied for security reasons',
     details: securityCheck.reasons,
     requestId,
    },
    {
     status: securityCheck.status || 403,
     headers: {
      'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
       ? String(securityCheck.rateLimitRemaining)
       : '0',
     },
    }
   );
  }
```

### Input Sanitization

All user inputs are sanitized before processing:

```127:131:app/api/contact/route.ts
  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = email.toLowerCase().trim();
  const sanitizedCompany = company ? sanitizeInput(company) : null;
  const sanitizedMessage = sanitizeInput(message);
```

### Honeypot Fields

Spam protection using hidden form fields:

```117:120:app/api/contact/route.ts
  // Additional honeypot check (should be empty)
  if (website && website.length > 0) {
   return ApiErrorHandler.badRequest('Spam detected');
  }
```

## Service Layer Pattern

### Service Organization

Business logic is separated into service classes:

```plaintext
lib/services/
├── dashboard-service.ts      # Dashboard data aggregation
├── blog-service.ts           # Blog post management
├── lead-management-service.ts # Lead CRUD operations
├── invoice-service.ts        # Invoice processing
└── ...
```

### Service Example

```typescript
// lib/services/dashboard-service.ts
export class DashboardService {
  static async getOverview(userId: string) {
    // RLS context is already set by withRLS
    const transactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .limit(10);
    
    // Aggregate data
    return {
      totalTransactions: transactions.length,
      recentTransactions: transactions,
      // ... more aggregations
    };
  }
}
```

## Response Formatting

### Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response payload
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response Format

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Timeout Handling

### Search Operation Timeout

```46:65:app/api/search/route.ts
  // Add timeout wrapper for entire search operation
  const searchPromise = (async () => {
   const searchService = new AlgoliaSearchService();

   let results: unknown[];
   if (index === 'all') {
    results = await searchService.searchAll(query, { page, hitsPerPage });
   } else {
    results = [await searchService.search(index, query, { page, hitsPerPage })];
   }

   return results;
  })();

  // Race against timeout (15 seconds max)
  const timeoutPromise = new Promise<never>((_, reject) =>
   setTimeout(() => reject(new Error('Search operation timed out')), 15000)
  );

  const results = await Promise.race([searchPromise, timeoutPromise]);
```

## Best Practices

### Route Handler Guidelines

1. **Always generate request ID** at the start
2. **Validate authentication** before processing
3. **Use withRLS** for database operations
4. **Validate input** with Zod schemas
5. **Handle errors** with ApiErrorHandler
6. **Set appropriate status codes**
7. **Include timestamps** in responses

### Security Guidelines

1. **Never trust client input** - always validate
2. **Use RLS** for all database queries
3. **Sanitize** all user inputs
4. **Implement rate limiting** on public endpoints
5. **Log security events** for auditing
6. **Use HTTPS** in production (enforced by Vercel)

### Performance Guidelines

1. **Implement timeouts** for long-running operations
2. **Use database indexes** for queries
3. **Cache frequently accessed data**
4. **Optimize query patterns** (avoid N+1 queries)
5. **Monitor API response times**

## Related Documentation

- [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
- [Database Architecture](./DATABASE_ARCHITECTURE.md)
- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [API Documentation](../api/API.md)
- [API Versioning Guide](../api/API_VERSIONING.md)
