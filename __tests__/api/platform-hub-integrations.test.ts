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

describe('/api/platform/hub/integrations - Real Database Integration', () => {
  let testDatabase: TestDatabase;
  let tableExists: boolean = false;

  beforeEach(async () => {
    testDatabase = TestDatabase.getInstance();
    await testDatabase.setup();
    
    // Check if integrations table exists
    try {
      await testDb.execute(dsql`SELECT 1 FROM financbase_integrations LIMIT 1`);
      tableExists = true;
    } catch (error: any) {
      // Table doesn't exist or other error
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        tableExists = false;
        console.warn('⚠️  financbase_integrations table does not exist. Skipping database-dependent tests.');
        console.warn('   Run migrations to create the table: npm run db:migrate');
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
    try {
      // Delete integrations with test slugs
      const testSlugs = ['stripe-test', 'paypal-test', 'payment-test', 'comm-test', 'test-integration-new', 'existing-integration-slug'];
      for (const slug of testSlugs) {
        try {
          await testDb.delete(integrations).where(eq(integrations.slug, slug));
        } catch (error) {
          // Ignore individual deletion errors
        }
      }
    } catch (error) {
      // Ignore cleanup errors in test environment
      console.warn('Cleanup error (safe to ignore):', error);
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
        console.log('⏭️  Skipping: Table does not exist');
        return;
      }

      const { auth } = await import('@clerk/nextjs/server');

      vi.mocked(auth).mockResolvedValue({
        userId: 'user-123',
        orgId: 'org-123',
      } as any);

      // Create test integrations in the real database
      const [stripeIntegration] = await testDb.insert(integrations).values({
        name: 'Stripe',
        slug: 'stripe-test',
        category: 'payment',
        isActive: true,
        isOfficial: true,
        version: '1.0.0',
        configuration: {},
        features: [],
        requirements: {},
      }).returning();

      const [paypalIntegration] = await testDb.insert(integrations).values({
        name: 'PayPal',
        slug: 'paypal-test',
        category: 'payment',
        isActive: true,
        isOfficial: true,
        version: '1.0.0',
        configuration: {},
        features: [],
        requirements: {},
      }).returning();

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

      // Create test integrations in different categories
      await testDb.insert(integrations).values({
        name: 'Payment Integration',
        slug: 'payment-test',
        category: 'payment',
        isActive: true,
        isOfficial: true,
        version: '1.0.0',
        configuration: {},
        features: [],
        requirements: {},
      });

      await testDb.insert(integrations).values({
        name: 'Communication Integration',
        slug: 'comm-test',
        category: 'communication',
        isActive: true,
        isOfficial: true,
        version: '1.0.0',
        configuration: {},
        features: [],
        requirements: {},
      });

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
      
      // Verify the integration was actually created in the database
      const createdIntegrations = await testDb
        .select()
        .from(integrations)
        .where(eq(integrations.slug, 'test-integration-new'));
      
      expect(createdIntegrations.length).toBeGreaterThan(0);
      const createdIntegration = createdIntegrations[0];
      expect(createdIntegration).toBeDefined();
      expect(createdIntegration.name).toBe('Test Integration');
      expect(createdIntegration.slug).toBe('test-integration-new');
    });

    it('should return 409 when integration slug already exists', async () => {
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

      // Create an existing integration in the real database
      await testDb.insert(integrations).values({
        name: 'Existing Integration',
        slug: 'existing-integration-slug',
        category: 'payment',
        isActive: true,
        isOfficial: true,
        version: '1.0.0',
        configuration: {},
        features: [],
        requirements: {},
      });

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
      expect(data.error).toContain('already exists');
    });
  });
});

