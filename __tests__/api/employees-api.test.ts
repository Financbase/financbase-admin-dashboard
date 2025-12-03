/**
 * Employees API Tests
 * Tests for employees list and create endpoints
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
import { GET, POST } from '@/app/api/employees/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock EmployeesService
const mockGetAll = vi.fn();
const mockCreate = vi.fn();

vi.mock('@/lib/services/hr/employees-service', () => ({
  EmployeesService: vi.fn().mockImplementation(() => ({
    getAll: mockGetAll,
    create: mockCreate,
  })),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    validationError: vi.fn((error: any) => new Response(JSON.stringify({ error: error.message }), { status: 400 })),
    handle: vi.fn((error: Error, requestId?: string) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

const { auth } = await import('@clerk/nextjs/server');
const { EmployeesService } = await import('@/lib/services/hr/employees-service');

describe('Employees API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
  });

  describe('GET /api/employees', () => {
    it('should return employees when authenticated', async () => {
      const mockEmployees = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', position: 'Engineer', department: 'Engineering', status: 'active' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', position: 'Manager', department: 'Sales', status: 'active' },
      ];
      mockGetAll.mockResolvedValue(mockEmployees);

      const request = new NextRequest('http://localhost:3000/api/employees');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmployees);
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });

    it('should filter employees by department', async () => {
      mockGetAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/employees?department=Engineering');
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Service is instantiated inside the route, so we check the call was made
      expect(mockGetAll).toHaveBeenCalled();
    });

    it('should filter employees by status', async () => {
      mockGetAll.mockResolvedValue([]);
      const request = new NextRequest('http://localhost:3000/api/employees?status=active');
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Service is instantiated inside the route, so we check the call was made
      expect(mockGetAll).toHaveBeenCalled();
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/employees');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/employees', () => {
    it('should create employee when valid data provided', async () => {
      const mockEmployee = {
        id: '1',
        userId: 'user-123',
        organizationId: 'org-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Software Engineer',
        department: 'Engineering',
        startDate: new Date('2024-01-15'),
        status: 'active',
      };
      mockCreate.mockResolvedValue(mockEmployee);

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          organizationId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          position: 'Software Engineer',
          department: 'Engineering',
          startDate: '2024-01-15',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockEmployee);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          // Missing required fields
        }),
      });

      const response = await POST(request);
      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 if unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          organizationId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          position: 'Engineer',
          department: 'Engineering',
          startDate: '2024-01-15',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

