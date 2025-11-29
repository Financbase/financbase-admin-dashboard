/**
 * Platform Hub Integrations API Tests
 * Tests for platform hub integrations endpoints using REAL database
 * Only mocks Clerk auth and isAdmin function
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/platform/hub/integrations/route';
import { TestDatabase } from '../test-db';
import { testDb } from '../test-db';
import { integrations } from '@/lib/db/schemas';
import { eq, sql as dsql } from 'drizzle-orm';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock isAdmin
vi.mock('@/lib/auth/financbase-rbac', () => ({
  isAdmin: vi.fn(),
}));

// Mock getDbOrThrow to return testDb so API route uses the same connection
// This ensures both test and API route use the same database instance
// Directly export testDb as db to ensure db.execute(sql`...`) works correctly
vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db')>('@/lib/db');
  // Import testDb here to avoid hoisting issues
  const { testDb } = await import('../test-db');
  
  // Directly export testDb as db - it already has execute method from drizzle
  return {
    ...actual,
    getDbOrThrow: () => testDb,
    db: testDb, // Directly export testDb - it already has execute method
  };
});

describe('/api/platform/hub/integrations - Real Database Integration', () => {
  let testDatabase: TestDatabase;
  let tableExists: boolean = false;

  beforeEach(async () => {
    testDatabase = TestDatabase.getInstance();
    await testDatabase.setup();
    
    // Check if integrations table exists (in financbase schema)
    // With search_path set, we can query without schema prefix
    try {
      await testDb.execute(dsql`SELECT 1 FROM financbase_integrations LIMIT 1`);
      tableExists = true;
    } catch (error: any) {
      // Table doesn't exist or other error - try with schema prefix
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        try {
          await testDb.execute(dsql`SELECT 1 FROM financbase.financbase_integrations LIMIT 1`);
          tableExists = true;
        } catch (fallbackError: any) {
          tableExists = false;
          console.warn('⚠️  financbase_integrations table does not exist. Skipping database-dependent tests.');
          console.warn('   Run migrations to create the table: npm run db:migrate');
        }
      } else {
        // Other error - assume table exists
        tableExists = true;
      }
    }
    
    // Clean up any existing test integrations (cleanup happens in afterEach)
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test integrations - delete test integrations by slug pattern
    // Only attempt cleanup if table exists
    if (tableExists) {
      try {
        // Delete integrations with test slugs using raw SQL to handle schema correctly
        const testSlugs = ['stripe-test', 'paypal-test', 'payment-test', 'comm-test', 'test-integration-new', 'existing-integration-slug'];
        for (const slug of testSlugs) {
          try {
            // Use raw SQL with proper schema qualification
            await testDb.execute(dsql`DELETE FROM financbase.financbase_integrations WHERE slug = ${slug}`);
          } catch (error: any) {
            // Ignore individual deletion errors (table might not exist or record already deleted)
            if (error?.code !== '42P01') {
              // Only log non-table-missing errors
              console.warn(`Cleanup warning for slug ${slug}:`, error?.message || error);
            }
          }
        }
      } catch (error: any) {
        // Ignore cleanup errors in test environment
        if (error?.code !== '42P01') {
          console.warn('Cleanup error (safe to ignore):', error?.message || error);
        }
      }
    }
    await testDatabase.cleanup();
  });

  describe('GET /api/platform/hub/integrations', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return integrations successfully', async () => {
      if (!tableExists) {
        console.log('⏭️  Skipping: financbase_integrations table does not exist');
        return;
      }
      
      // Skip test if table doesn't exist - this is expected in some environments
      // The table needs to be created via migrations

      const { auth } = await import('@clerk/nextjs/server');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);

      // Create test integrations using raw SQL with schema qualification
      // Neon HTTP connections don't persist search_path, so we must use schema-qualified queries
      // Wrap in try-catch to handle table not existing gracefully
      let stripeIntegration: any;
      let paypalIntegration: any;
      
      try {
        const stripeResult = await testDb.execute(dsql`
          INSERT INTO financbase.financbase_integrations 
          (name, slug, category, is_active, is_official, version, configuration, features, requirements)
          VALUES ('Stripe', 'stripe-test', 'payment', true, true, '1.0.0', '{}', '[]', '{}')
          RETURNING id, name, slug, category, is_active, is_official, version, configuration, features, requirements
        `);
        stripeIntegration = stripeResult[0] as any;

        const paypalResult = await testDb.execute(dsql`
          INSERT INTO financbase.financbase_integrations 
          (name, slug, category, is_active, is_official, version, configuration, features, requirements)
          VALUES ('PayPal', 'paypal-test', 'payment', true, true, '1.0.0', '{}', '[]', '{}')
          RETURNING id, name, slug, category, is_active, is_official, version, configuration, features, requirements
        `);
        paypalIntegration = paypalResult[0] as any;
      } catch (error: any) {
        // If table doesn't exist or insert fails, skip the test
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
          console.log('⏭️  Skipping: Table does not exist or insert failed');
          return;
        }
        throw error;
      }

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.integrations).toBeDefined();
      expect(Array.isArray(data.integrations)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.categories).toBeDefined();
      
      // Verify we got our test integrations
      const integrationSlugs = data.integrations.map((i: any) => i.slug);
      expect(integrationSlugs).toContain('stripe-test');
      expect(integrationSlugs).toContain('paypal-test');
    });

    it('should filter by category when provided', async () => {
      if (!tableExists) {
        console.log('⏭️  Skipping: Table does not exist');
        return;
      }

      const { auth } = await import('@clerk/nextjs/server');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);

      // Create test integrations using raw SQL with schema qualification
      try {
        await testDb.execute(dsql`
          INSERT INTO financbase.financbase_integrations 
          (name, slug, category, is_active, is_official, version, configuration, features, requirements)
          VALUES ('Payment Integration', 'payment-test', 'payment', true, true, '1.0.0', '{}', '[]', '{}')
        `);

        await testDb.execute(dsql`
          INSERT INTO financbase.financbase_integrations 
          (name, slug, category, is_active, is_official, version, configuration, features, requirements)
          VALUES ('Communication Integration', 'comm-test', 'communication', true, true, '1.0.0', '{}', '[]', '{}')
        `);
      } catch (error: any) {
        // If table doesn't exist or insert fails, skip the test
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
          console.log('⏭️  Skipping: Table does not exist or insert failed');
          return;
        }
        throw error;
      }

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations?category=payment');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.integrations).toBeDefined();
      // All returned integrations should be in the 'payment' category
      data.integrations.forEach((integration: any) => {
        expect(integration.category).toBe('payment');
      });
    });
  });

  describe('POST /api/platform/hub/integrations', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Integration',
          slug: 'test-integration',
          category: 'payment',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not admin', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Integration',
          slug: 'test-integration',
          category: 'payment',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      // Check for error message (error is an object with message property)
      expect(data.error?.message || data.message).toContain('Admin access required');
    });

    it('should return 400 when required fields are missing', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Integration',
          // Missing slug and category
        }),
      });
      
      // Mock request.json() method
      request.json = vi.fn().mockResolvedValue({
        name: 'Test Integration',
        // Missing slug and category
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should create integration when user is admin', async () => {
      if (!tableExists) {
        console.log('⏭️  Skipping: Table does not exist');
        return;
      }

      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      const newIntegration = {
        name: 'Test Integration',
        slug: 'test-integration-new',
        category: 'payment',
        description: 'A test integration',
        icon: 'test-icon',
        color: '#000000',
        isOfficial: false,
        version: '1.0.0',
      };

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntegration),
      });
      
      // Mock request.json() method
      request.json = vi.fn().mockResolvedValue(newIntegration);
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.integration).toBeDefined();
      expect(data.message).toContain('created successfully');
      
      // Verify the integration was actually created in the database using raw SQL with schema qualification
      const createdResult = await testDb.execute(dsql`
        SELECT id, name, slug, category, is_active, is_official, version, configuration, features, requirements
        FROM financbase.financbase_integrations
        WHERE slug = 'test-integration-new'
      `) as any;
      // Drizzle execute returns an array directly for SELECT queries
      const createdIntegrations = Array.isArray(createdResult) ? createdResult : (createdResult?.rows || []);
      
      expect(createdIntegrations.length).toBeGreaterThan(0);
      const createdIntegration = createdIntegrations[0];
      expect(createdIntegration).toBeDefined();
      expect(createdIntegration.name).toBe('Test Integration');
      expect(createdIntegration.slug).toBe('test-integration-new');
    });

    it('should return 409 when integration slug already exists', async () => {
      if (!tableExists) {
        console.log('⏭️  Skipping: financbase_integrations table does not exist');
        return;
      }
      if (!tableExists) {
        console.log('⏭️  Skipping: Table does not exist');
        return;
      }

      const { auth } = await import('@clerk/nextjs/server');
      const { isAdmin } = await import('@/lib/auth/financbase-rbac');

      vi.mocked(auth).mockResolvedValue({
        userId: 'admin-123',
        orgId: 'org-123',
      } as any);
      vi.mocked(isAdmin).mockResolvedValue(true);

      // Create an existing integration using raw SQL with schema qualification
      try {
        await testDb.execute(dsql`
          INSERT INTO financbase.financbase_integrations 
          (name, slug, category, is_active, is_official, version, configuration, features, requirements)
          VALUES ('Existing Integration', 'existing-integration-slug', 'payment', true, true, '1.0.0', '{}', '[]', '{}')
        `);
      } catch (error: any) {
        // If table doesn't exist or insert fails, skip the test
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
          console.log('⏭️  Skipping: Table does not exist or insert failed');
          return;
        }
        throw error;
      }

      const request = new NextRequest('http://localhost:3000/api/platform/hub/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Integration',
          slug: 'existing-integration-slug', // Same slug as existing
          category: 'payment',
        }),
      });
      
      // Mock request.json() method
      request.json = vi.fn().mockResolvedValue({
        name: 'Test Integration',
        slug: 'existing-integration-slug',
        category: 'payment',
      });
      
      const response = await POST(request);

      expect(response.status).toBe(409);
      const data = await response.json();
      // ApiErrorHandler.conflict returns { error: { code, message, ... } }
      expect(data.error).toBeDefined();
      if (typeof data.error === 'string') {
        expect(data.error).toContain('already exists');
      } else if (data.error?.message) {
        expect(data.error.message).toContain('already exists');
      } else {
        // Check if error is an array or other format
        expect(JSON.stringify(data.error)).toContain('already exists');
      }
    });
  });
});

