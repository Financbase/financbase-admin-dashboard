/**
 * Bills Process API Tests
 * Tests for document processing endpoint
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
import { POST } from '@/app/api/bills/process/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock billPayService
vi.mock('@/lib/services/bill-pay/bill-pay-service', () => {
  const mockBillPayService = {
    processDocument: vi.fn(),
  };
  return {
    billPayService: mockBillPayService,
  };
});

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
    badRequest: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
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

// Mock audit logger
vi.mock('@/lib/services/security/audit-logging-service', () => ({
  auditLogger: {
    logEvent: vi.fn(),
  },
  AuditEventType: {
    AI_CATEGORIZATION: 'ai_categorization',
    SECURITY_VIOLATION: 'security_violation',
  },
  RiskLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
  },
  ComplianceFramework: {
    SOC2: 'soc2',
  },
}));

const { auth } = await import('@clerk/nextjs/server');
const { billPayService } = await import('@/lib/services/bill-pay/bill-pay-service');

describe('POST /api/bills/process', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' } as any);
  });

  it('should process document for authenticated user', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockResult = {
      id: 'bill_123',
      confidence: 0.95,
      processingTime: 1500,
    };
    vi.mocked(billPayService.processDocument).mockResolvedValue(mockResult as any);

    const mockFormData = {
      get: vi.fn((name: string) => {
        if (name === 'file') return mockFile;
        if (name === 'documentType') return 'bill';
        return null;
      }),
    } as any;

    const request = {
      formData: vi.fn().mockResolvedValue(mockFormData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.result).toEqual(mockResult);
    expect(billPayService.processDocument).toHaveBeenCalledWith('user-123', mockFile, 'bill');
  });

  it('should return 400 if no file provided', async () => {
    // Create a mock FormData that returns null for file
    const mockFormData = {
      get: vi.fn((name: string) => {
        if (name === 'file') return null;
        return null;
      }),
    } as any;

    // Mock the request.formData() method
    const request = {
      formData: vi.fn().mockResolvedValue(mockFormData),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid file type', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const mockFormData = {
      get: vi.fn((name: string) => {
        if (name === 'file') return mockFile;
        if (name === 'documentType') return 'auto';
        return null;
      }),
    } as any;

    const request = {
      formData: vi.fn().mockResolvedValue(mockFormData),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 401 if unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockFormData = {
      get: vi.fn((name: string) => {
        if (name === 'file') return mockFile;
        return null;
      }),
    } as any;

    const request = {
      formData: vi.fn().mockResolvedValue(mockFormData),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});

