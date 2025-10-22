/**
 * Clients API Integration Tests
 * Tests for client API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/clients/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock ClientService
vi.mock('@/lib/services/client-service', () => ({
  ClientService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

describe('/api/clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/clients', () => {
    it('should return paginated clients successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { ClientService } = await import('@/lib/services/client-service');
      const mockClients = [
        {
          id: 'client-1',
          companyName: 'Test Company 1',
          email: 'test1@company.com',
        },
        {
          id: 'client-2',
          companyName: 'Test Company 2',
          email: 'test2@company.com',
        },
      ];

      vi.mocked(ClientService.getAll).mockResolvedValue(mockClients);

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.clients).toEqual(mockClients);
      expect(ClientService.getAll).toHaveBeenCalledWith('user-123', {
        search: undefined,
        isActive: undefined,
        limit: 50,
        offset: 0,
      });
    });

    it('should handle search parameters', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { ClientService } = await import('@/lib/services/client-service');
      vi.mocked(ClientService.getAll).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/clients?search=test&limit=10&offset=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(ClientService.getAll).toHaveBeenCalledWith('user-123', {
        search: 'test',
        isActive: undefined,
        limit: 10,
        offset: 10,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { ClientService } = await import('@/lib/services/client-service');
      vi.mocked(ClientService.getAll).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/clients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch clients');
    });
  });

  describe('POST /api/clients', () => {
    it('should create a new client successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { ClientService } = await import('@/lib/services/client-service');
      const mockClient = {
        id: 'client-123',
        companyName: 'New Company',
        email: 'new@company.com',
        createdAt: new Date(),
      };

      vi.mocked(ClientService.create).mockResolvedValue(mockClient);

      const requestBody = {
        companyName: 'New Company',
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
      vi.spyOn(request, 'json').mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.client).toEqual(mockClient);
      expect(ClientService.create).toHaveBeenCalledWith({
        ...requestBody,
        userId: 'user-123',
      });
    });

    it('should return 400 for invalid request data', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const invalidRequestBody = {
        // Missing required fields
        companyName: '',
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
      vi.spyOn(request, 'json').mockResolvedValue(invalidRequestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      // Check if details exists and is an array with at least one error
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
      expect(data.details.length).toBeGreaterThan(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const requestBody = {
        companyName: 'Test Company',
        email: 'test@company.com',
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { ClientService } = await import('@/lib/services/client-service');
      vi.mocked(ClientService.create).mockRejectedValue(new Error('Database error'));

      const requestBody = {
        companyName: 'Test Company',
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
      vi.spyOn(request, 'json').mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create client');
    });
  });
});
