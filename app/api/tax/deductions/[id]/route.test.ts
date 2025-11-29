/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';
const mockDeductionId = 'deduction-123';

// Mock dependencies
const mockUpdateDeduction = vi.fn();
const mockDeleteDeduction = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		updateDeduction = mockUpdateDeduction;
		deleteDeduction = mockDeleteDeduction;
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
		updateTaxDeductionSchema: {
			parse: vi.fn((data: any) => {
				// Check for invalid fields (fields that shouldn't be in the schema)
				if (data.invalid !== undefined || (data.id && !data.amount && !data.category && !data.year && !data.description)) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: data.invalid !== undefined ? ['invalid'] : ['amount'],
							message: 'Validation failed',
						},
					]);
					throw error;
				}
				// If valid, return the data
				return data;
			}),
		},
	};
});

describe('Tax Deductions [id] API', () => {
	const mockParams = Promise.resolve({ id: mockDeductionId });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('PATCH /api/tax/deductions/[id]', () => {
		it('should update deduction successfully', async () => {
			const mockUpdatedDeduction = {
				id: mockDeductionId,
				userId: mockUserId,
				category: 'home_office',
				amount: 1500,
				year: 2025,
			};

			mockUpdateDeduction.mockResolvedValue(mockUpdatedDeduction);

			const request = new NextRequest(
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({
						amount: 1500,
					}),
				}
			);

			const response = await PATCH(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockUpdatedDeduction);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest(
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
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
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
				{
					method: 'PATCH',
					body: 'invalid json',
				}
			);

			const response = await PATCH(request, { params: mockParams });
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockUpdateDeduction.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ amount: 1500 }),
				}
			);

			const response = await PATCH(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});

	describe('DELETE /api/tax/deductions/[id]', () => {
		it('should delete deduction successfully', async () => {
			mockDeleteDeduction.mockResolvedValue(undefined);

			const request = new NextRequest(
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('message');
			expect(mockDeleteDeduction).toHaveBeenCalledWith(
				mockDeductionId,
				mockUserId
			);
		});

		it('should handle service errors', async () => {
			mockDeleteDeduction.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/tax/deductions/${mockDeductionId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});
});
