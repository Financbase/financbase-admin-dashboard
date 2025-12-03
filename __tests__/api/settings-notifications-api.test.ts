/**
 * Settings Notifications API Tests
 * Tests for notification preferences endpoints
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
import { GET, PUT } from '@/app/api/settings/notifications/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      notificationPreferences: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    handle: vi.fn((error: Error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { db } = await import('@/lib/db');

describe('Settings Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  describe('GET /api/settings/notifications', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return default preferences when none exist', async () => {
      vi.mocked(db.query.notificationPreferences.findFirst).mockResolvedValue(null as any);
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('emailInvoices');
      expect(data).toHaveProperty('emailExpenses');
      expect(data).toHaveProperty('pushRealtime');
    });

    it('should return user preferences when they exist', async () => {
      const mockPrefs = {
        userId: 'user-123',
        emailInvoices: true,
        emailExpenses: false,
        pushRealtime: true,
      };
      vi.mocked(db.query.notificationPreferences.findFirst).mockResolvedValue(mockPrefs as any);
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.emailInvoices).toBe(true);
      expect(data.emailExpenses).toBe(false);
    });
  });

  describe('PUT /api/settings/notifications', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      const request = new NextRequest('http://localhost:3000/api/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify({ emailInvoices: true }),
      });
      const response = await PUT(request);
      expect(response.status).toBe(401);
    });

    it('should update notification preferences', async () => {
      const mockUpdated = {
        userId: 'user-123',
        emailInvoices: false,
        emailExpenses: true,
      };
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          onConflictDoUpdate: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([mockUpdated]),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify({
          emailInvoices: false,
          emailExpenses: true,
        }),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.emailInvoices).toBe(false);
      expect(data.emailExpenses).toBe(true);
    });
  });
});

