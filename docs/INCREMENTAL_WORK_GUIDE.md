# Incremental Work Guide

**Last Updated:** 2025-11-29  
**Purpose:** Quick reference for completing remaining short-term improvements incrementally

## Quick Status

| Area | Current | Target | Remaining |
|------|---------|--------|-----------|
| API Documentation | 44 paths (10.8%) | 407 paths (100%) | 363 paths |
| Test Coverage | 63 routes (15.5%) | 407 routes (100%) | 344 routes |
| High-Risk Routes | 9 optimized (31%) | 29 routes (100%) | 20 routes |
| Bundle Analysis | Ready | Complete | Run analysis |

## 1. Adding Swagger Annotations

### Pattern Template

```typescript
/**
 * @swagger
 * /api/route-name:
 *   get:
 *     summary: Brief description
 *     description: Detailed description of what this endpoint does
 *     tags:
 *       - TagName
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  // ... implementation
}
```

### Steps

1. Open the route file in `app/api/**/route.ts`
2. Add the `@swagger` annotation block above the function
3. Update summary, description, tags, parameters, and responses
4. Run `npm run openapi:generate` to regenerate spec
5. Verify in Swagger UI at `/api-docs`

### Priority Order

1. **High Priority:** Financial routes (bills, budgets, payments, invoices)
2. **Medium Priority:** Core features (projects, workflows, vendors)
3. **Lower Priority:** Admin, analytics, integrations

### Common Tags

- `Accounts`, `Transactions`, `Expenses`, `Bills`, `Budgets`, `Payments`, `Invoices`
- `Clients`, `Vendors`, `Projects`, `Workflows`
- `Analytics`, `Dashboard`, `Reports`
- `Admin`, `Settings`, `Integrations`

## 2. Generating Tests

### Pattern Template

Use the template from `__tests__/api/_template.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/your-route/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Service
vi.mock('@/lib/services/your-service', () => ({
  YourService: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    notFound: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 404 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { YourService } = await import('@/lib/services/your-service');

describe('Your Route API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/your-route', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);
      const request = new NextRequest('http://localhost:3000/api/your-route');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return data when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
      vi.mocked(YourService.get).mockResolvedValue([{ id: '1' }] as any);
      const request = new NextRequest('http://localhost:3000/api/your-route');
      const response = await GET(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toBeDefined();
    });
  });

  // Add tests for POST, PUT, DELETE as needed
});
```

### Steps

1. Copy `__tests__/api/_template.test.ts` to `__tests__/api/your-route-api.test.ts`
2. Update imports to match your route
3. Update service mocks
4. Write tests for all HTTP methods (GET, POST, PUT, DELETE)
5. Test cases:
   - ✅ Authentication (401)
   - ✅ Success cases (200, 201)
   - ✅ Validation errors (400)
   - ✅ Not found (404)
   - ✅ Error handling (500)
6. Run `npm test` to verify

### Test File Naming

- Route: `app/api/accounts/route.ts` → Test: `__tests__/api/accounts-api.test.ts`
- Route: `app/api/accounts/[id]/route.ts` → Test: `__tests__/api/accounts-id-api.test.ts`
- Route: `app/api/accounts/balances/route.ts` → Test: `__tests__/api/accounts-balances-api.test.ts`

## 3. Performance Optimization

### Adding Pagination

**Pattern:**

```typescript
export async function GET(request: NextRequest) {
  // Parse pagination parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(tableName)
    .where(/* your conditions */);
  const total = totalCountResult[0]?.count || 0;

  // Get paginated results
  const results = await db
    .select()
    .from(tableName)
    .where(/* your conditions */)
    .orderBy(desc(tableName.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

**When to Add:**
- Routes that return lists/arrays
- Routes marked as "Missing pagination" in performance audit
- Routes that could return large datasets

### Adding Caching

**Pattern:**

```typescript
export async function GET(request: NextRequest) {
  // ... fetch data ...
  
  const response = NextResponse.json(data);
  
  // Cache for 5 minutes (300 seconds) - for stable data
  response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600');
  
  // OR Cache for 2 minutes (120 seconds) - for frequently changing data
  response.headers.set('Cache-Control', 'private, s-maxage=120, stale-while-revalidate=300');
  
  return response;
}
```

**Cache Duration Guidelines:**
- **5 minutes:** Stable data (accounts, clients, products, employees)
- **2 minutes:** Frequently changing data (transactions, expenses, orders)
- **1 minute:** Real-time data (analytics, stats)

**When to Add:**
- GET routes that return single resources
- Routes marked as "No caching" in performance audit
- Routes with complex queries or database operations

### High-Risk Routes Remaining

From `docs/performance/api-performance-audit.md`:

1. `/admin/careers` - Add pagination
2. `/admin/feature-flags/{key}` - Add caching
3. `/analytics` - Add pagination + caching
4. `/careers` - Add pagination
5. `/compliance/incident-response/communication-templates` - Add pagination
6. `/gallery/{id}` - Add caching
7. `/hr/contractors/{id}` - Add caching
8. `/hr/payroll/benefits` - Add pagination
9. `/hr/payroll/deductions` - Add pagination
10. `/hr/payroll/taxes` - Add pagination
11. `/marketplace/stats` - Add caching
12. `/real-estate/buyer/stats` - Add caching
13. `/real-estate/investor/cash-flow` - Add caching
14. `/real-estate/realtor/stats` - Add caching
15. `/real-estate/stats` - Add caching
16. `/reconciliation/match` - Add pagination
17. `/reports/{id}` - Add caching
18. `/settings/billing/payment-methods` - Add pagination
19. `/settings/notifications` - Add caching
20. `/tax/direct-file/exports` - Add pagination

## 4. Bundle Analysis

### Running Analysis

```bash
npm run analyze
```

This will:
1. Build the application in production mode
2. Generate bundle analysis reports
3. Open interactive HTML reports in your browser
4. Show bundle composition and sizes

### What to Look For

1. **Large Dependencies:** Identify packages > 100KB
2. **Duplicate Dependencies:** Check for multiple versions of same package
3. **Unused Dependencies:** Identify packages not being used
4. **Code Splitting Opportunities:** Large components that could be lazy-loaded
5. **Import Optimization:** Replace default imports with named imports

### Optimization Strategies

1. **Remove Unused Dependencies:**
   ```bash
   npm uninstall unused-package
   ```

2. **Dynamic Imports (Lazy Loading):**
   ```typescript
   // Instead of:
   import HeavyComponent from '@/components/HeavyComponent';
   
   // Use:
   const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
     loading: () => <div>Loading...</div>,
   });
   ```

3. **Tree Shaking:**
   ```typescript
   // Instead of:
   import * as utils from '@/utils';
   
   // Use:
   import { specificFunction } from '@/utils';
   ```

4. **Optimize Images:**
   - Use Next.js Image component
   - Convert to WebP format
   - Implement lazy loading

## Workflow Tips

### Daily Incremental Work

1. **Pick 5-10 routes** to document/test/optimize
2. **Follow the patterns** established in this guide
3. **Run tests** after each batch: `npm test`
4. **Regenerate OpenAPI spec:** `npm run openapi:generate`
5. **Commit frequently** with clear messages

### Batch Processing

**Documentation:**
- Focus on one category at a time (e.g., all financial routes)
- Use find/replace for common patterns
- Verify with `npm run openapi:generate`

**Tests:**
- Copy template for each route
- Update service mocks
- Run tests after each file

**Performance:**
- Start with high-risk routes
- Add pagination to list endpoints
- Add caching to detail endpoints

## Verification

After completing work:

1. **Documentation:**
   ```bash
   npm run openapi:generate
   # Check output for total paths documented
   ```

2. **Tests:**
   ```bash
   npm test
   # Ensure all tests pass
   ```

3. **Performance:**
   ```bash
   # Re-run audit script
   node scripts/audit-api-performance.js
   # Check for reduced high-risk routes
   ```

4. **Bundle:**
   ```bash
   npm run analyze
   # Review bundle size and composition
   ```

## Resources

- **Template:** `__tests__/api/_template.test.ts`
- **Audit Scripts:** `scripts/audit-*.js`
- **Reports:** `docs/api/`, `docs/testing/`, `docs/performance/`
- **OpenAPI Config:** `lib/openapi/config.ts`

## Questions?

Refer to:
- `docs/FINAL_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `docs/API_DOCUMENTATION.md` - API documentation guide
- `docs/performance/api-performance-audit.md` - Performance audit results

