/**
 * Test Utilities for Next.js 16 Compatibility
 * 
 * Provides reusable mocks and helpers for testing Next.js 16 API routes
 */

import { vi } from 'vitest';
import type { NextResponse } from 'next/server';

/**
 * Standard mock for withRLS wrapper
 * Use this in tests that need to mock the withRLS function
 */
export const mockWithRLS = (mockUserId: string = 'user-123') => {
  return vi.fn(async (handler: (userId: string) => Promise<NextResponse>) => {
    return await handler(mockUserId);
  });
};

/**
 * Standard mock for Clerk auth
 * Use this in tests that need to mock Clerk authentication
 */
export const mockClerkAuth = (mockUserId: string = 'user-123') => {
  return {
    auth: vi.fn().mockResolvedValue({ userId: mockUserId }),
    currentUser: vi.fn().mockResolvedValue({
      id: mockUserId,
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    }),
  };
};

/**
 * Standard API response format
 * Use this to ensure consistent response formats across tests
 */
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp?: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper to create a standard success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<StandardApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Helper to create a standard error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  requestId?: string
): NextResponse<StandardApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  );
}

/**
 * Setup function for Next.js 16 API route tests
 * Call this in beforeEach to set up standard mocks
 */
export function setupNextJs16TestMocks(mockUserId: string = 'user-123') {
  // Mock withRLS
  vi.mock('@/lib/api/with-rls', () => ({
    withRLS: mockWithRLS(mockUserId),
  }));

  // Mock Clerk auth
  vi.mock('@clerk/nextjs/server', () => mockClerkAuth(mockUserId));
}

