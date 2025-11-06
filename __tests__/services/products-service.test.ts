/**
 * Products Service Tests
 * Tests for organization context extraction in products service
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductsService } from '@/lib/services/business/products-service';
import { auth } from '@clerk/nextjs/server';
import { getUserFromDatabase } from '@/lib/db/rls-context';

// Mock dependencies
vi.mock('@clerk/nextjs/server');
vi.mock('@/lib/db/rls-context');
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('ProductsService - Organization Context', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should extract organization ID from user context when creating product', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockUserId = 'user_uuid_123';
		const mockOrganizationId = 'org_uuid_456';

		// Mock auth
		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		// Mock getUserFromDatabase
		vi.mocked(getUserFromDatabase).mockResolvedValue({
			id: mockUserId,
			clerk_id: mockClerkId,
			organization_id: mockOrganizationId,
			email: 'test@example.com',
			first_name: 'Test',
			last_name: 'User',
		} as any);

		const productsService = new ProductsService();
		const mockInput = {
			name: 'Test Product',
			sku: 'TEST-001',
			category: 'Electronics',
			price: '100.00',
		};

		// Mock database operations
		const { db } = await import('@/lib/db');
		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([
					{
						id: 'prod_123',
						userId: mockUserId,
						organizationId: mockOrganizationId,
						...mockInput,
					},
				]),
			}),
		} as any);

		const result = await productsService.create(mockInput);

		// Verify getUserFromDatabase was called with correct clerk ID
		expect(getUserFromDatabase).toHaveBeenCalledWith(mockClerkId);
		
		// Verify organization ID was used in the product creation
		expect(result.organizationId).toBe(mockOrganizationId);
	});

	it('should throw error if user not found in database', async () => {
		const mockClerkId = 'clerk_user_123';

		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		vi.mocked(getUserFromDatabase).mockResolvedValue(null);

		const productsService = new ProductsService();
		const mockInput = {
			name: 'Test Product',
			sku: 'TEST-001',
			category: 'Electronics',
			price: '100.00',
		};

		await expect(productsService.create(mockInput)).rejects.toThrow(
			'User not found in database'
		);
	});

	it('should throw error if organization ID not found', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockUserId = 'user_uuid_123';

		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		vi.mocked(getUserFromDatabase).mockResolvedValue({
			id: mockUserId,
			clerk_id: mockClerkId,
			organization_id: null,
			email: 'test@example.com',
		} as any);

		const productsService = new ProductsService();
		const mockInput = {
			name: 'Test Product',
			sku: 'TEST-001',
			category: 'Electronics',
			price: '100.00',
		};

		await expect(productsService.create(mockInput)).rejects.toThrow(
			'User organization not found'
		);
	});
});

