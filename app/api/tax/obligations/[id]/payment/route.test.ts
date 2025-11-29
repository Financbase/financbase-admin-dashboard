/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';
const mockObligationId = 'obligation-123';

// Mock dependencies
const mockRecordPayment = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		recordPayment = mockRecordPayment;
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
		recordTaxPaymentSchema: {
			parse: vi.fn((data: any) => {
				if (!data.obligationId || !data.amount || !data.paymentDate) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['amount'],
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

describe('Tax Obligations Payment API', () => {
	const mockParams = Promise.resolve({ id: mockObligationId });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST /api/tax/obligations/[id]/payment', () => {
		it('should record payment successfully', async () => {
			const mockObligation = {
				id: mockObligationId,
				userId: mockUserId,
				name: 'Federal Income Tax',
				amount: '1000.00',
				paid: '500.00',
				status: 'pending',
			};

			mockRecordPayment.mockResolvedValue(mockObligation);

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}/payment`,
				{
					method: 'POST',
					body: JSON.stringify({
						amount: 500,
						paymentDate: '2025-01-15T00:00:00.000Z',
					}),
				}
			);

			const response = await POST(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockObligation);
			expect(mockRecordPayment).toHaveBeenCalled();
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}/payment`,
				{
					method: 'POST',
					body: JSON.stringify({ invalid: 'data' }),
				}
			);

			const response = await POST(request, { params: mockParams });
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}/payment`,
				{
					method: 'POST',
					body: 'invalid json',
				}
			);

			const response = await POST(request, { params: mockParams });
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockRecordPayment.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/tax/obligations/${mockObligationId}/payment`,
				{
					method: 'POST',
					body: JSON.stringify({
						amount: 500,
						paymentDate: '2025-01-15T00:00:00.000Z',
					}),
				}
			);

			const response = await POST(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});
});
