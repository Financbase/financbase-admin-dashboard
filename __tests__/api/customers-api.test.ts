/**
 * Customers API Tests
 * Tests for customers list and create endpoints
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/customers/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock CustomersService
vi.mock('@/lib/services/business/customers-service', () => ({
  CustomersService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
  })),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    validationError: vi.fn((error: any, requestId: string) => new Response(JSON.stringify({ error: 'Validation error', details: error.issues }), { status: 400 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { CustomersService } = await import('@/lib/services/business/customers-service');
const { z } = await import('zod');

describe('Customers API', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
    };
    vi.mocked(CustomersService).mockImplementation(() => mockService);
  });

  describe('GET /api/customers', () => {
    it('should return customers when authenticated', async () => {
      const mockCustomers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
      ];
      mockService.getAll.mockResolvedValue(mockCustomers);

      const request = new NextRequest('http://localhost:3000/api/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCustomers);
      expect(mockService.getAll).toHaveBeenCalledWith({});
    });

    it('should filter customers by search term', async () => {
      mockService.getAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/customers?search=john');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockService.getAll).toHaveBeenCalledWith({ search: 'john' });
    });

    it('should filter customers by status', async () => {
      mockService.getAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/customers?status=active');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockService.getAll).toHaveBeenCalledWith({ status: 'active' });
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/customers');
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(mockService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/customers', () => {
    it('should create customer when valid data provided', async () => {
      const mockCustomer = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
      };
      mockService.create.mockResolvedValue(mockCustomer);

      const request = new NextRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCustomer);
      expect(mockService.create).toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

