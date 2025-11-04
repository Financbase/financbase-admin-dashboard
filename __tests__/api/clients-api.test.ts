/**
 * Clients API Integration Tests
 * Tests for client API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/clients/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/db', async () => {
  const { vi } = await import('vitest');
  
  const mockClients = [
    {
      id: 'client-1',
      userId: 'user-123',
      name: 'Test Company 1',
      email: 'test1@company.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      contactName: 'John Doe',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
      notes: 'Test client',
      tags: ['test'],
      contractorId: null,
      taxId: 'TAX123456',
      paymentTerms: 'Net 30',
      metadata: {},
    },
    {
      id: 'client-2',
      userId: 'user-123',
      name: 'Test Company 2',
      email: 'test2@company.com',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      contactName: 'Jane Smith',
      phone: '+1234567891',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      notes: 'Test client 2',
      tags: ['test'],
      contractorId: null,
      taxId: 'TAX789012',
      paymentTerms: 'Net 15',
      metadata: {},
    },
  ];
  
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockClients),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClients[0]]),
        }),
      }),
    },
  };
});

// Define mockClients for use in tests
      const mockClients = [
        {
          id: 'client-1',
          userId: 'user-123',
    name: 'Test Company 1',
          email: 'test1@company.com',
    status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          contactName: 'John Doe',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          currency: 'USD',
          timezone: 'America/New_York',
          notes: 'Test client',
          tags: ['test'],
          contractorId: null,
          taxId: 'TAX123456',
          paymentTerms: 'Net 30',
          metadata: {},
        },
        {
          id: 'client-2',
          userId: 'user-123',
    name: 'Test Company 2',
          email: 'test2@company.com',
    status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          contactName: 'Jane Smith',
          phone: '+1234567891',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'US',
          currency: 'USD',
          timezone: 'America/Los_Angeles',
          notes: 'Test client 2',
          tags: ['test'],
          contractorId: null,
          taxId: 'TAX789012',
          paymentTerms: 'Net 15',
          metadata: {},
        },
      ];

// Mock drizzle-orm count
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm');
  return {
    ...actual,
    count: vi.fn(() => ({ count: 2 })),
  };
});

describe('/api/clients', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset mock implementations
    const { db } = await import('@/lib/db');
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue(mockClients),
          }),
        }),
      }),
    });
  });

  describe('GET /api/clients', () => {
    it('should return paginated clients successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockClients);
      expect(data.pagination).toBeDefined();
    });

    it('should handle search parameters', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/clients?search=test&limit=10&page=2');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error?.code || data.error).toContain('UNAUTHORIZED');
    });

    it('should handle service errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      // Make database throw an error
      const { db } = await import('@/lib/db');
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockRejectedValue(new Error('Database error')),
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/clients', () => {
    it('should create a new client successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      const requestBody = {
        name: 'New Company',
        email: 'new@company.com',
        contactName: 'John Doe',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        currency: 'USD',
        paymentTerms: 'net30',
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock request.json() to return the expected data
      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 400 for invalid request data', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      const invalidRequestBody = {
        // Missing required fields
        name: '',
        email: 'invalid-email',
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock request.json() to return the expected data
      request.json = vi.fn().mockResolvedValue(invalidRequestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: null,
      } as any);

      const requestBody = {
        name: 'Test Company',
        email: 'test@company.com',
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error?.code || data.error).toContain('UNAUTHORIZED');
    });

    it('should handle service errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ 
        userId: 'user-123',
      } as any);

      // Make database throw an error
      const { db } = await import('@/lib/db');
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      const requestBody = {
        name: 'Test Company',
        email: 'test@company.com',
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Mock request.json() to return the expected data
      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
