/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Tests for token validation API endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/validate-token/route';
import { clerkClient } from '@clerk/nextjs/server';

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
	clerkClient: vi.fn(),
}));

describe('POST /api/auth/validate-token', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should reject request without token', async () => {
		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({}),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Token is required');
	});

	it('should reject invalid token format', async () => {
		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: 'invalid-token' }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Invalid token format');
	});

	it('should reject expired token', async () => {
		// Create an expired JWT token (simplified - just for testing structure)
		const expiredPayload = {
			sub: 'user_123',
			exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
		};
		const expiredToken = `header.${Buffer.from(JSON.stringify(expiredPayload)).toString('base64url')}.signature`;

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: expiredToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Token expired');
	});

	it('should validate token and return user info', async () => {
		const userId = 'user_123';
		const validPayload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
		};
		const validToken = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`;

		// Mock Clerk client
		const mockGetUser = vi.fn().mockResolvedValue({
			id: userId,
			emailAddresses: [{ emailAddress: 'test@example.com' }],
			banned: false,
			locked: false,
		});

		vi.mocked(clerkClient).mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
		} as any);

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: validToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.valid).toBe(true);
		expect(data.userId).toBe(userId);
		expect(mockGetUser).toHaveBeenCalledWith(userId);
	});

	it('should reject token for banned user', async () => {
		const userId = 'user_123';
		const validPayload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
		const validToken = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`;

		const mockGetUser = vi.fn().mockResolvedValue({
			id: userId,
			emailAddresses: [],
			banned: true,
			locked: false,
		});

		vi.mocked(clerkClient).mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
		} as any);

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: validToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('User account is inactive');
	});

	it('should reject token for locked user', async () => {
		const userId = 'user_123';
		const validPayload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
		const validToken = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`;

		const mockGetUser = vi.fn().mockResolvedValue({
			id: userId,
			emailAddresses: [],
			banned: false,
			locked: true,
		});

		vi.mocked(clerkClient).mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
		} as any);

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: validToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('User account is inactive');
	});

	it('should accept token from Authorization header', async () => {
		const userId = 'user_123';
		const validPayload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
		const validToken = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`;

		const mockGetUser = vi.fn().mockResolvedValue({
			id: userId,
			emailAddresses: [{ emailAddress: 'test@example.com' }],
			banned: false,
			locked: false,
		});

		vi.mocked(clerkClient).mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
		} as any);

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${validToken}`,
			},
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.valid).toBe(true);
		expect(data.userId).toBe(userId);
	});

	it('should reject token with invalid payload', async () => {
		const invalidToken = 'header.invalid-payload.signature';

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: invalidToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Invalid token payload');
	});

	it('should reject token missing user ID', async () => {
		const payloadWithoutSub = {
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
		const token = `header.${Buffer.from(JSON.stringify(payloadWithoutSub)).toString('base64url')}.signature`;

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Token missing user ID');
	});

	it('should handle Clerk API errors', async () => {
		const userId = 'user_123';
		const validPayload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
		const validToken = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`;

		const mockGetUser = vi.fn().mockRejectedValue(new Error('Clerk API error'));

		vi.mocked(clerkClient).mockResolvedValue({
			users: {
				getUser: mockGetUser,
			},
		} as any);

		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: validToken }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.valid).toBe(false);
		expect(data.error).toBe('Token verification failed - user not found');
	});

	it('should handle invalid JSON in request body', async () => {
		const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: 'invalid json',
		});

		const response = await POST(request);
		const data = await response.json();

		// Should fall back to checking Authorization header
		expect(response.status).toBe(400);
		expect(data.valid).toBe(false);
	});
});

