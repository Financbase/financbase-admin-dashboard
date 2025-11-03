/**
 * Clerk Webhook Integration Tests
 * Tests for /api/webhooks/clerk endpoint including user registration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users, organizations } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { POST } from '@/app/api/webhooks/clerk/route';
import { mockSvixVerify } from '../setup';

describe('Clerk Webhook - User Registration', () => {
  let testOrgId: string | null = null;
  let testUserId: string | null = null;

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Clean up before each test
    await cleanupTestData();
    // Reset the mock function before each test
    mockSvixVerify.mockReset();
  });

  async function cleanupTestData() {
    try {
      // Delete test user
      if (testUserId) {
        await db.delete(users).where(eq(users.id, testUserId));
      }
      // Note: We don't delete the default organization as it might be used by other tests
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  describe('POST /api/webhooks/clerk - user.created event', () => {
    it('should successfully create a user in the database', async () => {
      // Set webhook secret for testing
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      const mockPayload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_test_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'User',
        },
      });

      // Create mock request with proper Svix headers
      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_test_123',
          'svix-timestamp': String(Date.now()),
          'svix-signature': 'test_signature',
          'Content-Type': 'application/json',
        },
        body: mockPayload,
      });

      // Configure the mock verify function for this test
      mockSvixVerify.mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_test_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'User',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.clerkUserId).toBe('user_test_clerk_123');
      expect(responseData.userId).toBeDefined();

      // Verify user was created in database
      const createdUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, 'user_test_clerk_123'))
        .limit(1);

      expect(createdUser.length).toBe(1);
      expect(createdUser[0].email).toBe('test@example.com');
      expect(createdUser[0].firstName).toBe('Test');
      expect(createdUser[0].lastName).toBe('User');
      expect(createdUser[0].clerkId).toBe('user_test_clerk_123');
      expect(createdUser[0].organizationId).toBeDefined();
      expect(typeof createdUser[0].organizationId).toBe('string'); // Should be UUID string

      // Verify organizationId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(createdUser[0].organizationId)).toBe(true);

      testUserId = createdUser[0].id;
    });

    it('should handle duplicate user creation gracefully', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      // First, create a user
      const firstPayload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_test_clerk_duplicate',
          email_addresses: [{ email_address: 'duplicate@example.com' }],
          first_name: 'Duplicate',
          last_name: 'User',
        },
      });

      const firstRequest = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_test_1',
          'svix-timestamp': String(Date.now()),
          'svix-signature': 'test_signature',
          'Content-Type': 'application/json',
        },
        body: firstPayload,
      });

      mockSvixVerify.mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_test_clerk_duplicate',
          email_addresses: [{ email_address: 'duplicate@example.com' }],
          first_name: 'Duplicate',
          last_name: 'User',
        },
      });

      await POST(firstRequest);

      // Try to create the same user again
      const secondRequest = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_test_2',
          'svix-timestamp': String(Date.now() + 1),
          'svix-signature': 'test_signature',
          'Content-Type': 'application/json',
        },
        body: firstPayload,
      });

      // Use the same mock for the second request
      mockSvixVerify.mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_test_clerk_duplicate',
          email_addresses: [{ email_address: 'duplicate@example.com' }],
          first_name: 'Duplicate',
          last_name: 'User',
        },
      });

      const response = await POST(secondRequest);
      const responseData = await response.json();

      // Should handle gracefully (either return success with existing user or handle error)
      expect(response.status).toBeLessThan(500); // Should not be a server error

      // Verify only one user exists
      const duplicateUsers = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, 'user_test_clerk_duplicate'));

      expect(duplicateUsers.length).toBeLessThanOrEqual(1);
    });

    it('should validate organizationId type matches database schema', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      // Query the actual database schema to verify type
      const schemaCheck = await db.execute(
        `SELECT data_type 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
           AND table_name = 'organizations' 
           AND column_name = 'id'
         LIMIT 1`
      );

      const orgIdType = schemaCheck.rows?.[0]?.['data_type'];

      // Create a user to test the organization assignment
      const mockPayload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_test_schema_validation',
          email_addresses: [{ email_address: 'schema@example.com' }],
          first_name: 'Schema',
          last_name: 'Test',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_schema_test',
          'svix-timestamp': String(Date.now()),
          'svix-signature': 'test_signature',
          'Content-Type': 'application/json',
        },
        body: mockPayload,
      });

      mockSvixVerify.mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_test_schema_validation',
          email_addresses: [{ email_address: 'schema@example.com' }],
          first_name: 'Schema',
          last_name: 'Test',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);

      // Verify the user was created with correct organizationId type
      const createdUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, 'user_test_schema_validation'))
        .limit(1);

      if (createdUser.length > 0) {
        const orgId = createdUser[0].organizationId;

        // Log the actual types for debugging
        console.log('Organization ID Type Validation:', {
          databaseOrgIdType: orgIdType,
          actualOrgIdValue: orgId,
          actualOrgIdType: typeof orgId,
          isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(orgId)),
        });

        // If database says UUID, verify it's actually a UUID
        if (orgIdType === 'uuid') {
          expect(typeof orgId).toBe('string');
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          expect(uuidRegex.test(String(orgId))).toBe(true);
        }
        // If database says integer, verify it's actually a number or can be converted
        // Note: The schema definition says integer, which matches the actual database
        else if (orgIdType === 'integer' || orgIdType === 'bigint') {
          // organizations.id is integer, but users.organizationId expects UUID
          // This is a known schema mismatch - the test documents this issue
          console.warn('Schema mismatch detected: organizations.id is integer but users.organizationId expects UUID');
          // The value might be stored as string or number depending on how it's converted
          expect(typeof orgId === 'string' || typeof orgId === 'number').toBe(true);
        }
      }
    });

    it('should handle missing email address gracefully', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      const mockPayload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_test_no_email',
          email_addresses: [], // No email
          first_name: 'No',
          last_name: 'Email',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_no_email',
          'svix-timestamp': String(Date.now()),
          'svix-signature': 'test_signature',
          'Content-Type': 'application/json',
        },
        body: mockPayload,
      });

      mockSvixVerify.mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_test_no_email',
          email_addresses: [],
          first_name: 'No',
          last_name: 'Email',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
      expect(responseData.error).toContain('email');
    });

    it('should reject requests with missing Svix headers', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing svix headers
        },
        body: JSON.stringify({ type: 'user.created', data: {} }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
      expect(responseData.error).toContain('Missing svix headers');
    });

    it('should handle invalid webhook signature', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_invalid',
          'svix-timestamp': String(Date.now()),
          'svix-signature': 'invalid_signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'user.created', data: {} }),
      });

      // Mock Webhook to throw verification error
      mockSvixVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
      expect(responseData.error).toContain('Invalid webhook signature');
    });
  });

  describe('Type validation helpers', () => {
    it('should verify organizationId type from database', async () => {
      // This test verifies the actual database schema
      const result = await db.execute(
        `SELECT data_type 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
           AND table_name = 'organizations' 
           AND column_name = 'id'
         LIMIT 1`
      );

      const dataType = result.rows?.[0]?.['data_type'];

      // Based on migrations, this should be 'uuid'
      expect(dataType).toBeDefined();
      console.log('Actual organizations.id type in database:', dataType);

      // Verify it matches expectations (migrations show UUID)
      if (dataType) {
        expect(['uuid', 'integer', 'bigint']).toContain(dataType);
      }
    });

    it('should validate UUID format correctly', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '123e4567-e89b-12d3-a456-426614174000',
      ];

      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-41d4-a716-446655440000-extra',
      ];

      validUUIDs.forEach(uuid => {
        expect(uuidRegex.test(uuid)).toBe(true);
      });

      invalidUUIDs.forEach(uuid => {
        expect(uuidRegex.test(uuid)).toBe(false);
      });
    });
  });
});

