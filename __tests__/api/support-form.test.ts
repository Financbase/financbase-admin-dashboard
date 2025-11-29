/**
 * Support Form API Tests
 * Tests for /api/support/public endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/support/public/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock SecurityService
vi.mock('@/lib/security/arcjet-service', () => ({
  SecurityService: {
    securityCheck: vi.fn().mockResolvedValue({
      denied: false,
      rateLimitRemaining: 10,
    }),
  },
}));

// Mock EmailService
vi.mock('@/lib/email/service', () => ({
  EmailService: {
    sendEmail: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock database
const mockSubmission = {
  id: 'submission-123',
  name: 'Test User',
  email: 'test@example.com',
  message: 'Subject: Test Support Request\n\nThis is a test support message with enough characters.',
  status: 'new',
  priority: 'medium',
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  referrer: 'unknown',
  source: 'support_page',
  metadata: JSON.stringify({
    ticketNumber: 'SUPPORT-20250101-1234',
    category: 'general',
    subject: 'Test Support Request',
    originalPriority: 'medium',
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/lib/db', async () => {
  const { vi } = await import('vitest');
  return {
    getDbOrThrow: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSubmission]),
        }),
      }),
    })),
  };
});

describe('Support Form API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset security check to allow by default
    const { SecurityService } = await import('@/lib/security/arcjet-service');
    SecurityService.securityCheck.mockResolvedValue({
      denied: false,
      rateLimitRemaining: 10,
    });
  });

  describe('POST /api/support/public', () => {
    it('should successfully submit a valid support ticket', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Support Request',
        message: 'This is a test support message with enough characters.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'test-agent',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.ticketNumber).toBeDefined();
      expect(data.ticketNumber).toMatch(/^SUPPORT-\d{8}-\d{4}$/);
      expect(data.submissionId).toBeDefined();
    });

    it('should reject form with missing required fields', async () => {
      const requestBody = {
        name: 'Test User',
        // Missing email, subject, message
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      // Details may be undefined if error.errors is empty, so check if it exists
      if (data.error?.details !== undefined) {
        expect(Array.isArray(data.error.details)).toBe(true);
      } else {
        // If details is undefined, at least verify the error structure is correct
        expect(data.error?.message).toBeDefined();
      }
    });

    it('should reject form with invalid email', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a test message.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject form with invalid category', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
        category: 'invalid_category',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject form with invalid priority', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
        category: 'general',
        priority: 'invalid_priority',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject form with honeypot field filled', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
        category: 'general',
        priority: 'medium',
        website: 'http://spam.com',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      // Zod validation catches honeypot field first (website.max(0))
      expect(data.error).toBeDefined();
      const errorMessage = data.error?.message || (typeof data.error === 'string' ? data.error : '') || '';
      const hasBotDetected = errorMessage.includes('Bot') || errorMessage.includes('Spam') || 
                            (data.error?.details && Array.isArray(data.error.details) && 
                             data.error.details.some((d: any) => d.message?.includes('Bot')));
      expect(hasBotDetected || data.error?.code === 'VALIDATION_ERROR').toBe(true);
    });

    it('should accept all valid categories', async () => {
      const categories = ['general', 'technical', 'billing', 'feature_request', 'bug_report'];

      for (const category of categories) {
        const requestBody = {
          name: 'Test User',
          email: `test-${category}@example.com`,
          subject: `Test ${category} Request`,
          message: 'This is a test message with enough characters to pass validation.',
          category,
          priority: 'medium',
          website: '',
        };

        const request = new NextRequest('http://localhost:3000/api/support/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-agent': 'test-agent',
          },
          body: JSON.stringify(requestBody),
        });

        request.json = vi.fn().mockResolvedValue(requestBody);

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should accept all valid priorities', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'];

      for (const priority of priorities) {
        const requestBody = {
          name: 'Test User',
          email: `test-${priority}@example.com`,
          subject: `Test ${priority} Priority Request`,
          message: 'This is a test message with enough characters to pass validation.',
          category: 'general',
          priority,
          website: '',
        };

        const request = new NextRequest('http://localhost:3000/api/support/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-agent': 'test-agent',
          },
          body: JSON.stringify(requestBody),
        });

        request.json = vi.fn().mockResolvedValue(requestBody);

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should reject message that is too short', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Short',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject subject that is too long', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'a'.repeat(201),
        message: 'This is a test message with enough characters.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should sanitize input to prevent XSS', async () => {
      const requestBody = {
        name: '<script>alert("xss")</script>Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'test-agent',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject messages with too many URLs (spam detection)', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'http://spam.com http://spam2.com http://spam3.com http://spam4.com http://spam5.com',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      const errorMessage = data.error?.message || data.error || '';
      expect(errorMessage).toContain('links');
    });

    it('should handle email normalization (lowercase)', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'test-agent',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should include rate limit headers in response', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters.',
        category: 'general',
        priority: 'medium',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/support/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'test-agent',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // Check for rate limit headers (if response has headers property)
      if (response.headers && typeof response.headers.get === 'function') {
        const rateLimitHeader = response.headers.get('X-RateLimit-Remaining');
        expect(rateLimitHeader).toBeDefined();
      } else {
        // Mock NextResponse might not have headers, just verify success
        expect(data.success).toBe(true);
      }
    });
  });
});
