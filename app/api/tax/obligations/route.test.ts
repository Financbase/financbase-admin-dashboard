/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';

// Mock dependencies
const mockGetObligations = vi.fn();
const mockCreateObligation = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getObligations = mockGetObligations;
		createObligation = mockCreateObligation;
	},
}));
vi.mock('@/lib/api/with-rls', () => ({
	withRLS: async (fn: any) => {
		return await fn(mockUserId);
	},
}));
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn().mockResolvedValue({ userId: mockUserId }),
	currentUser: vi.fn().mockResolvedValue({
		id: mockUserId,
		emailAddresses: [{ emailAddress: 'test@example.com' }],
	}),
}));
vi.mock('@/lib/validation-schemas', async () => {
	const actual = await vi.importActual<typeof import('@/lib/validation-schemas')>('@/lib/validation-schemas');
	const { z } = await import('zod');
	return {
		...actual,
		createTaxObligationSchema: {
			parse: vi.fn((data: any) => {
				// Basic validation - throw ZodError for invalid data
				if (!data.name || !data.type || !data.amount || !data.dueDate || !data.year) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['name'],
							message: 'Validation failed',
						},
					]);
					throw error;
				}
				return data;
			}),
		},
	};
});

describe('Tax Obligations API', () => {
	const mockUserId = 'user-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/obligations', () => {
		it('should return paginated obligations', async () => {
			const mockObligations = {
				data: [
					{
						id: 'obligation-1',
						userId: mockUserId,
						name: 'Federal Income Tax',
						amount: '1000.00',
						status: 'pending',
					},
				],
				total: 1,
				page: 1,
				limit: 50,
				totalPages: 1,
			};

			mockGetObligations.mockResolvedValue(mockObligations);

			const request = new NextRequest(
				'http://localhost/api/tax/obligations?page=1&limit=50'
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveLength(1);
			expect(data.pagination).toBeDefined();
		});

		it('should return non-paginated obligations when pagination not requested', async () => {
			const mockObligations = [
				{
					id: 'obligation-1',
					userId: mockUserId,
					name: 'Federal Income Tax',
					amount: '1000.00',
					status: 'pending',
				},
			];

			mockGetObligations.mockResolvedValue(mockObligations);

			const request = new NextRequest('http://localhost/api/tax/obligations');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});

		it('should filter by status', async () => {
			mockGetObligations.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/obligations?status=pending'
			);
			await GET(request);

			expect(mockGetObligations).toHaveBeenCalledWith(
				mockUserId,
				expect.objectContaining({ status: 'pending' })
			);
		});
	});

	describe('POST /api/tax/obligations', () => {
		it('should create obligation successfully', async () => {
			const mockObligation = {
				id: 'obligation-1',
				userId: mockUserId,
				name: 'Federal Income Tax',
				amount: '1000.00',
				status: 'pending',
			};

			mockCreateObligation.mockResolvedValue(mockObligation);

			const request = new NextRequest('http://localhost/api/tax/obligations', {
				method: 'POST',
				body: JSON.stringify({
					name: 'Federal Income Tax',
					type: 'federal_income',
					amount: 1000,
					dueDate: '2025-04-15T00:00:00.000Z', // ISO datetime string
					status: 'pending',
					year: 2025,
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockObligation);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest('http://localhost/api/tax/obligations', {
				method: 'POST',
				body: JSON.stringify({ invalid: 'data' }),
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});
	});
});

