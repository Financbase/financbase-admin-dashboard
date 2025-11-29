/**
 * Organization API Tests
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
import { GET, POST } from '@/app/api/organizations/route';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
	currentUser: vi.fn().mockResolvedValue({
		id: 'user-123',
		emailAddresses: [{ emailAddress: 'test@example.com' }],
	}),
}));

// Mock organization service
vi.mock('@/lib/services/organization.service', () => ({
	getUserOrganizations: vi.fn(),
	createOrganization: vi.fn(),
	switchOrganization: vi.fn(),
	getOrganizationById: vi.fn(),
	getOrganizationMembers: vi.fn(),
	updateMemberRole: vi.fn(),
	removeMember: vi.fn(),
	createInvitation: vi.fn(),
	acceptInvitation: vi.fn(),
	declineInvitation: vi.fn(),
}));

// Mock RLS context
vi.mock('@/lib/api/with-rls', async () => {
	const { vi } = await import('vitest');
	const getCurrentUserIdMock = vi.fn().mockResolvedValue('user-123');
	return {
		withRLS: vi.fn((handler, options) => {
			return handler('user-123', { id: 'user-123' }, options?.request);
		}),
		getCurrentUserId: getCurrentUserIdMock,
	};
});

// Mock logger
vi.mock('@/lib/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}));

import { getUserOrganizations, createOrganization } from '@/lib/services/organization.service';
import { getCurrentUserId } from '@/lib/api/with-rls';

describe('Organization API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Ensure getCurrentUserId returns a user ID by default
		vi.mocked(getCurrentUserId).mockResolvedValue('user-123');
	});

	describe('GET /api/organizations', () => {
		it('should return list of user organizations', async () => {
			const mockOrganizations = [
				{
					organization: {
						id: 'org-1',
						name: 'Test Org 1',
						slug: 'test-org-1',
						isActive: true,
					},
					role: 'owner',
				},
				{
					organization: {
						id: 'org-2',
						name: 'Test Org 2',
						slug: 'test-org-2',
						isActive: true,
					},
					role: 'member',
				},
			];

			vi.mocked(getUserOrganizations).mockResolvedValue(mockOrganizations);

			const request = new NextRequest('http://localhost:3000/api/organizations');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
			expect(data.data.length).toBe(2);
			expect(getUserOrganizations).toHaveBeenCalledWith('user-123');
		});

		it('should return 404 if user not found', async () => {
			const { getCurrentUserId } = await import('@/lib/api/with-rls');
			vi.mocked(getCurrentUserId).mockResolvedValue(null);

			const request = new NextRequest('http://localhost:3000/api/organizations');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('User not found in database');
		});

		it('should handle errors gracefully', async () => {
			vi.mocked(getUserOrganizations).mockRejectedValue(new Error('Database error'));

			const request = new NextRequest('http://localhost:3000/api/organizations');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Failed to fetch organizations');
		});
	});

	describe('POST /api/organizations', () => {
		it('should create a new organization', async () => {
			const mockOrganization = {
				id: 'org-123',
				name: 'New Organization',
				description: 'Test organization',
				slug: 'new-organization',
				ownerId: 'user-123',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(createOrganization).mockResolvedValue(mockOrganization);

			const request = new NextRequest('http://localhost:3000/api/organizations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'New Organization',
					description: 'Test organization',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data.id).toBe('org-123');
			expect(data.data.name).toBe('New Organization');
			expect(createOrganization).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'New Organization',
					description: 'Test organization',
				}),
				'user-123'
			);
		});

		it('should validate required fields', async () => {
			const request = new NextRequest('http://localhost:3000/api/organizations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					description: 'Test organization without name',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Organization name is required');
		});

		it('should reject empty name', async () => {
			const request = new NextRequest('http://localhost:3000/api/organizations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: '   ',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Organization name is required');
		});

		it('should handle creation errors', async () => {
			vi.mocked(createOrganization).mockRejectedValue(new Error('Slug already exists'));

			const request = new NextRequest('http://localhost:3000/api/organizations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'New Organization',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Slug already exists');
		});
	});
});
