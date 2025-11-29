/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Critical Authentication API Tests
 * Tests authentication flows and user management endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GET as getMe } from '@/app/api/auth/me/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db/rls-context', () => ({
  getUserFromDatabase: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Critical Authentication API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/me');
      const response = await getMe(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user data when authenticated', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_user_123',
        clerk_id: mockUserId,
        organization_id: 'org_123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      };

      vi.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);
      
      const { getUserFromDatabase } = await import('@/lib/db/rls-context');
      vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any);

      const request = new NextRequest('http://localhost:3000/api/auth/me');
      const response = await getMe(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(mockUser.id);
      expect(data.clerkId).toBe(mockUser.clerk_id);
      expect(data.organizationId).toBe(mockUser.organization_id);
      expect(data.email).toBe(mockUser.email);
    });

    it('should handle database errors gracefully', async () => {
      const mockUserId = 'user_123';
      vi.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);
      
      const { getUserFromDatabase } = await import('@/lib/db/rls-context');
      vi.mocked(getUserFromDatabase).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/me');
      const response = await getMe(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Authentication Flow', () => {
    it('should validate Clerk session token', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/me');
      const response = await getMe(request);

      expect(auth).toHaveBeenCalled();
      expect(response.status).not.toBe(401);
    });

    it('should handle missing organization context', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_user_123',
        clerk_id: mockUserId,
        organization_id: null,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      };

      vi.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);
      
      const { getUserFromDatabase } = await import('@/lib/db/rls-context');
      vi.mocked(getUserFromDatabase).mockResolvedValue(mockUser as any);

      const request = new NextRequest('http://localhost:3000/api/auth/me');
      const response = await getMe(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.organizationId).toBeNull();
    });
  });
});

