/**
 * Contact Form API Tests
 * Tests for /api/contact endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';

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
  company: 'Test Company',
  message: 'This is a test message for the contact form.',
  status: 'new',
  priority: 'medium',
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  referrer: 'unknown',
  source: 'contact_page',
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

describe('Contact Form API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset security check to allow by default
    const { SecurityService } = require('@/lib/security/arcjet-service');
    SecurityService.securityCheck.mockResolvedValue({
      denied: false,
      rateLimitRemaining: 10,
    });
  });

  describe('POST /api/contact', () => {
    it('should successfully submit a valid contact form', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        message: 'This is a test message for the contact form.',
        website: '', // Honeypot field should be empty
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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
      expect(data.submissionId).toBeDefined();
    });

    it('should reject form with missing required fields', async () => {
      const requestBody = {
        name: 'Test User',
        // Missing email and message
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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
      expect(data.details).toBeDefined();
    });

    it('should reject form with invalid email', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'invalid-email',
        message: 'This is a test message.',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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
        message: 'This is a test message.',
        website: 'http://spam.com', // Honeypot filled = bot
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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
      expect(data.error).toContain('Spam');
    });

    it('should reject message that is too short', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Short', // Less than 10 characters
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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
        message: 'This is a test message.',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
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

      // Should succeed but with sanitized input
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle rate limiting', async () => {
      const { SecurityService } = await import('@/lib/security/arcjet-service');
      SecurityService.securityCheck.mockResolvedValue({
        denied: true,
        status: 429,
        reasons: ['Too many requests'],
        rateLimitRemaining: 0,
      });

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message.',
        website: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      request.json = vi.fn().mockResolvedValue(requestBody);

      const response = await POST(request);
      const data = await response.json();

      // Should be rate limited (429)
      expect(response.status).toBe(429);
      expect(data.error).toBeDefined();
    });
  });
});
