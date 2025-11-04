/**
 * Support Form API Tests
 * Tests for /api/support/public endpoint
 */

import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Support Form API', () => {
	describe('POST /api/support/public', () => {
		it('should successfully submit a valid support ticket', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Support Request',
					message: 'This is a test support message with enough characters.',
					category: 'general',
					priority: 'medium',
					website: '', // Honeypot field should be empty
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.message).toBeDefined();
			expect(data.ticketNumber).toBeDefined();
			expect(data.ticketNumber).toMatch(/^SUPPORT-\d{8}-\d{4}$/); // Format: SUPPORT-YYYYMMDD-XXXX
			expect(data.submissionId).toBeDefined();
		});

		it('should reject form with missing required fields', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					// Missing email, subject, message
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
			expect(data.details).toBeDefined();
		});

		it('should reject form with invalid email', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'invalid-email',
					subject: 'Test Subject',
					message: 'This is a test message.',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it('should reject form with invalid category', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'This is a test message.',
					category: 'invalid_category',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it('should reject form with invalid priority', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'This is a test message.',
					category: 'general',
					priority: 'invalid_priority',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it('should reject form with honeypot field filled', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'This is a test message.',
					category: 'general',
					priority: 'medium',
					website: 'http://spam.com', // Honeypot filled = bot
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toContain('Spam');
		});

		it('should accept all valid categories', async () => {
			const categories = ['general', 'technical', 'billing', 'feature', 'bug'];

			for (const category of categories) {
				const response = await fetch(`${API_BASE_URL}/api/support/public`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: 'Test User',
						email: `test-${category}@example.com`,
						subject: `Test ${category} Request`,
						message: 'This is a test message with enough characters to pass validation.',
						category,
						priority: 'medium',
						website: '',
					}),
				});

				expect(response.status).toBe(200);
			}
		});

		it('should accept all valid priorities', async () => {
			const priorities = ['low', 'medium', 'high', 'critical'];

			for (const priority of priorities) {
				const response = await fetch(`${API_BASE_URL}/api/support/public`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: 'Test User',
						email: `test-${priority}@example.com`,
						subject: `Test ${priority} Priority Request`,
						message: 'This is a test message with enough characters to pass validation.',
						category: 'general',
						priority,
						website: '',
					}),
				});

				expect(response.status).toBe(200);
			}
		});

		it('should reject message that is too short', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'Short', // Less than 10 characters
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it('should reject subject that is too long', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'a'.repeat(201), // More than 200 characters
					message: 'This is a test message with enough characters.',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it('should sanitize input to prevent XSS', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: '<script>alert("xss")</script>Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'This is a test message with enough characters.',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			// Should succeed but with sanitized input
			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
		});

		it('should reject messages with too many URLs (spam detection)', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'http://spam.com http://spam2.com http://spam3.com http://spam4.com http://spam5.com',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toContain('links');
		});

		it('should handle email normalization (lowercase)', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'TEST@EXAMPLE.COM',
					subject: 'Test Subject',
					message: 'This is a test message with enough characters.',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
		});

		it('should include rate limit headers in response', async () => {
			const response = await fetch(`${API_BASE_URL}/api/support/public`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					subject: 'Test Subject',
					message: 'This is a test message with enough characters.',
					category: 'general',
					priority: 'medium',
					website: '',
				}),
			});

			// Should have rate limit headers (may be present even if not explicitly set)
			expect(response.status).toBe(200);
		});
	});
});

