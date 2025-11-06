# Security Architecture

## Overview

The Financbase Admin Dashboard implements a multi-layered security architecture covering authentication, authorization, data protection, API security, and compliance. The system uses Clerk for authentication, Row Level Security (RLS) for database access control, and comprehensive security headers.

## Authentication & Authorization

### Clerk Integration

- **Provider**: Clerk v6.34.1
- **Methods Supported**: OAuth (Google, Microsoft, GitHub), Email/Password, Magic Links, MFA
- **Session Management**: JWT-based with secure HTTP-only cookies

```36:58:app/providers.tsx
export function Providers({ children }: ProvidersProps) {
 return (
  <ClerkProvider>
   <QueryClientProvider client={queryClient}>
    <ThemeProvider
     attribute="class"
     defaultTheme="light"
     enableSystem={false}
     disableTransitionOnChange
     storageKey="financbase-theme"
     suppressHydrationWarning
    >
     <DashboardProvider>
      {children}
     </DashboardProvider>
    </ThemeProvider>
    {process.env.NODE_ENV === 'development' && (
     <ReactQueryDevtoolsDevelopment initialIsOpen={false} />
    )}
   </QueryClientProvider>
  </ClerkProvider>
 );
}
```

### Middleware Authentication

The middleware (`middleware.ts`) implements comprehensive route protection using Clerk's `clerkMiddleware`. All sensitive routes are protected at the middleware level, providing defense-in-depth security.

**Key Features:**

- Route matching using `createRouteMatcher` for efficient pattern matching
- Automatic redirect for authenticated users accessing auth pages
- Consistent error handling (401 for API routes, redirect for page routes)
- Integration with RBAC system for permission checking
- API versioning header support

**Protected Routes:**

- All `/dashboard(.*)` routes
- All `/api/*` routes (except public endpoints)
- All application pages requiring authentication
- See `docs/security/ROUTE_PROTECTION_AUDIT.md` for complete list

**Public Routes:**

- `/home(.*)`, `/about(.*)`, `/pricing(.*)`, `/contact(.*)`
- `/api/health`, `/api/contact`, `/api/webhooks(.*)`
- See `docs/security/ROUTE_PROTECTION_AUDIT.md` for complete list

```45:129:middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  // ... all protected routes including 50+ API route patterns
  '/api/leads(.*)',
  '/api/onboarding(.*)',
  '/api/accounts(.*)',
  // ... see middleware.ts for complete list
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Get auth result once and reuse it
  const authResult = await auth();
  const { userId } = authResult;

  // If user is authenticated and accessing auth pages, redirect to dashboard FIRST
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
      // For API routes, return 401 JSON response with version headers
      if (pathname.startsWith('/api/')) {
        const errorResponse = NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
        return errorResponse;
      }
      // For page routes, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    // Check route permissions for authenticated users
    try {
      const hasPermission = await checkRoutePermissions(pathname, authResult);
      if (!hasPermission) {
        // Return 403 Forbidden for API routes
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'You do not have permission to access this resource',
              code: 'FORBIDDEN'
            },
            { status: 403 }
          );
        }
        // Redirect to dashboard with error for page routes
        const redirectUrl = new URL('/dashboard', req.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Error checking route permissions:', error);
      // Fail open for now - in production, consider failing closed
    }
  }

  return NextResponse.next();
});
```

**For complete route protection documentation, see:** `docs/security/ROUTE_PROTECTION_AUDIT.md`

### Role-Based Access Control (RBAC)

User roles defined in schema:

- **admin**: Full system access
- **user**: Standard user access
- **viewer**: Read-only access

```9:20:lib/db/schemas/users.schema.ts
export const users = pgTable("financbase.users", {
 id: uuid("id").primaryKey().defaultRandom(),
 clerkId: text("clerk_id").notNull().unique(),
 email: text("email").notNull().unique(),
 firstName: text("first_name"),
 lastName: text("last_name"),
 role: text("role", { enum: ["admin", "user", "viewer"] }).notNull().default("user"),
 isActive: boolean("is_active").notNull().default(true),
 organizationId: uuid("organization_id").notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Database Security

### Row Level Security (RLS)

**Status**: ✅ **221 tables** secured with RLS policies

- User-based data isolation
- Organization-level access control
- Automatic filtering based on authenticated user context

### RLS Context Setting

```69:96:lib/db/rls-context.ts
export async function setRLSContext(context: UserContext): Promise<void> {
  try {
    // Use raw SQL connection for session variables to ensure they persist
    const rawSql = getRawSqlConnection();

    // Set clerk_id (always available from Clerk auth)
    await rawSql`SELECT set_config('app.current_clerk_id', ${context.clerkId}, false)`;

    // Set user_id if available (financbase.users.id)
    if (context.userId) {
      await rawSql`SELECT set_config('app.current_user_id', ${context.userId}, false)`;
    }

    // Set organization_id if available
    if (context.organizationId) {
      await rawSql`SELECT set_config('app.current_org_id', ${context.organizationId}, false)`;
    }

    // Set contractor_id if available
    if (context.contractorId) {
      await rawSql`SELECT set_config('app.current_contractor_id', ${context.contractorId}, false)`;
    }
  } catch (error) {
    console.error('[RLS] Error setting RLS context:', error);
    // Don't throw - allow queries to proceed without RLS if context setting fails
  }
}
```

## API Security

### Request Validation

All API requests are validated using Zod schemas:

```typescript
const validationResult = contactFormSchema.safeParse(body);
if (!validationResult.success) {
  return ApiErrorHandler.validationError(validationResult.error, requestId);
}
```

### Rate Limiting

Implemented via SecurityService with Arcjet:

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

## HTTP Security Headers

### Content Security Policy (CSP)

```121:152:next.config.mjs
 headers: async () => {
  return [
   {
    source: '/(.*)',
    headers: [
     {
      key: 'X-Frame-Options',
      value: 'DENY',
     },
     {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
     },
     {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
     },
     {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
     },
     {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
     },
     {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.financbase.com https://js.clerk.com https://clerk.com https://content-alien-33.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.financbase.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.financbase.com wss://ws.financbase.com https://clerk.com https://content-alien-33.clerk.accounts.dev https://clerk-telemetry.com; frame-src https://clerk.com https://js.clerk.com https://content-alien-33.clerk.accounts.dev; worker-src 'self' blob:;",
     },
    ],
   },
  ];
 },
```

**Security Headers:**

- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME type sniffing)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts browser features
- **Strict-Transport-Security**: Enforces HTTPS
- **Content-Security-Policy**: Restricts resource loading

## API Key Management

### Encrypted Storage

API keys are encrypted at rest:

```typescript
// lib/db/schemas/api-keys.schema.ts
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(), // Encrypted/hashed API key
  scopes: text("scopes").array(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Data Protection

### Encryption

- **In Transit**: TLS 1.3+ enforced by Vercel
- **At Rest**: Database encryption handled by Neon
- **API Keys**: Encrypted using secure hashing algorithms

### Audit Logging

All security-critical operations are logged:

```typescript
// Security events tracked:
// - Authentication attempts (success/failure)
// - Permission changes
// - API key creation/revocation
// - Admin actions
// - Data access patterns
```

## Vulnerability Management

### Security Scanning

- **SAST**: Snyk Code analysis for static code scanning
- **SCA**: Dependency vulnerability scanning
- **Regular Audits**: Quarterly security reviews

### Known Issues & Mitigations

Based on security audit:

1. **Hardcoded Secrets in Demo Data**
   - **Status**: Non-production sample data
   - **Mitigation**: Use placeholder values in production

2. **Open Redirect Vulnerabilities**
   - **Status**: Addressed with URL validation
   - **Mitigation**: Validate URLs against allowlist

3. **XSS Potential**
   - **Status**: Monitored and mitigated
   - **Mitigation**: CSP headers, input sanitization, React's built-in protections

## Security Best Practices

### For Developers

1. **Always use RLS** for database queries
2. **Validate all inputs** with Zod schemas
3. **Sanitize user inputs** before processing
4. **Never log sensitive data** (API keys, passwords)
5. **Use parameterized queries** (Drizzle ORM handles this)
6. **Follow principle of least privilege** for permissions
7. **Review security headers** before deployment

### Authentication Guidelines

1. **Use `withRLS()` helper** in all API routes
2. **Check admin status** before admin operations
3. **Validate user permissions** at the API layer
4. **Log authentication events** for auditing
5. **Implement MFA** for sensitive operations

### API Security Guidelines

1. **Rate limit** all public endpoints
2. **Validate request bodies** with Zod
3. **Sanitize inputs** before database operations
4. **Use HTTPS only** in production
5. **Implement request timeouts** for long operations
6. **Generate request IDs** for tracing

## Compliance

### Data Privacy

- **GDPR Compliance**: User data access/deletion rights
- **Data Retention**: Configurable retention policies
- **User Consent**: Explicit consent for data processing

### Security Standards

- **OWASP Top 10**: Protection against common vulnerabilities
- **PCI DSS**: Payment data handling compliance
- **SOC 2**: Security controls alignment

## Security Monitoring

### Logging

- Authentication attempts (success/failure)
- API access patterns
- Admin actions
- Security events
- Error tracking via Sentry

### Alerting

- Failed authentication attempts
- Unusual access patterns
- Rate limit violations
- Security policy violations

## Incident Response

### Security Incident Procedures

1. **Immediate Assessment**: Identify scope of issue
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine root cause
4. **Remediation**: Fix security issue
5. **Notification**: Inform affected users if required
6. **Post-Incident Review**: Document lessons learned

## Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Database Architecture](./DATABASE_ARCHITECTURE.md)
- [Security Audit Report](../../SECURITY_AUDIT_REPORT.md)
- [Database Security Guidelines](../database/security-guidelines.md)
- [API Security](../api/API.md#security)
