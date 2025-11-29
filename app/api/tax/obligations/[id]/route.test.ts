/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';
const mockObligationId = 'obligation-123';

// Mock dependencies
const mockGetObligationById = vi.fn();
const mockUpdateObligation = vi.fn();
const mockDeleteObligation = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getObligationById = mockGetObligationById;
		updateObligation = mockUpdateObligation;
		deleteObligation = mockDeleteObligation;
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
		updateTaxObligationSchema: {
			parse: vi.fn((data: any) => {
				// Fail validation if data contains invalid fields or is missing required fields
				// The route adds id from params, so we check for invalid data structure
				if (data.invalid || !data.id) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['invalid'],
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

describe('Tax Obligations [id] API', () => {
	const mockParams = Promise.resolve({ id: mockObligationId });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/obligations/[id]', () => {
		it('should return obligation by ID', async () => {
			const mockObligation = {
				id: mockObligationId,
				userId: mockUserId,
				name: 'Federal Income Tax',
				amount: '1000.00',
				status: 'pending',
			};

			mockGetObligationById.mockResolvedValue(mockObligation);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`
			);
			const response = await GET(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockObligation);
			expect(mockGetObligationById).toHaveBeenCalledWith(
				mockObligationId,
				mockUserId
			);
		});

		it('should handle not found errors', async () => {
			mockGetObligationById.mockRejectedValue(
				new Error('Obligation not found')
			);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`
			);
			const response = await GET(request, { params: mockParams });

			expect(response.status).toBe(500);
		});
	});

	describe('PATCH /api/tax/obligations/[id]', () => {
		it('should update obligation successfully', async () => {
			const mockUpdatedObligation = {
				id: mockObligationId,
				userId: mockUserId,
				name: 'Updated Tax',
				amount: '1500.00',
				status: 'paid',
			};

			mockUpdateObligation.mockResolvedValue(mockUpdatedObligation);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({
						name: 'Updated Tax',
						status: 'paid',
					}),
				}
			);

			const response = await PATCH(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockUpdatedObligation);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ invalid: 'data' }),
				}
			);

			const response = await PATCH(request, { params: mockParams });
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'PATCH',
					body: 'invalid json',
				}
			);

			const response = await PATCH(request, { params: mockParams });
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockUpdateObligation.mockRejectedValue(
				new Error('Service error')
			);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ status: 'paid' }),
				}
			);

			const response = await PATCH(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});

	describe('DELETE /api/tax/obligations/[id]', () => {
		it('should delete obligation successfully', async () => {
			mockDeleteObligation.mockResolvedValue(undefined);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('message');
			expect(mockDeleteObligation).toHaveBeenCalledWith(
				mockObligationId,
				mockUserId
			);
		});

		it('should handle service errors', async () => {
			mockDeleteObligation.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});
});
