/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';

// Mock dependencies
const mockGetObligations = vi.fn();
const mockGetTaxSummary = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getObligations = mockGetObligations;
		getTaxSummary = mockGetTaxSummary;
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
vi.mock('@/lib/utils/tax-utils', () => ({
	formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

describe('Tax Export API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/export', () => {
		it('should export obligations as CSV', async () => {
			const mockObligations = [
				{
					id: 'obligation-1',
					name: 'Federal Income Tax',
					type: 'federal_income',
					amount: '1000.00',
					paid: '500.00',
					status: 'pending',
					dueDate: '2025-04-15T00:00:00.000Z',
					year: 2025,
					quarter: 'Q1',
				},
			];

			mockGetObligations.mockResolvedValue(mockObligations);

			const request = new NextRequest(
				'http://localhost/api/tax/export?format=csv&type=obligations'
			);
			const response = await GET(request);
			const text = await response.text();

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('text/csv');
			expect(text).toContain('Federal Income Tax');
			expect(text).toContain('Name,Type,Amount');
		});

		it('should export summary as CSV', async () => {
			const mockSummary = {
				totalObligations: 5000,
				totalPaid: 3000,
				totalPending: 2000,
				totalDeductions: 1000,
				obligationsByStatus: {
					pending: 2,
					paid: 1,
					overdue: 0,
				},
			};

			mockGetTaxSummary.mockResolvedValue(mockSummary);

			const request = new NextRequest(
				'http://localhost/api/tax/export?format=csv&type=summary&year=2025'
			);
			const response = await GET(request);
			const text = await response.text();

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('text/csv');
			expect(text).toContain('Tax Summary');
			expect(text).toContain('Year: 2025');
		});

		it('should return 501 for PDF format (not implemented)', async () => {
			const request = new NextRequest(
				'http://localhost/api/tax/export?format=pdf&type=obligations'
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(501);
			expect(data.error).toBeDefined();
			expect(data.error.message).toContain('not yet implemented');
		});

		it('should return 400 for invalid format', async () => {
			const request = new NextRequest(
				'http://localhost/api/tax/export?format=invalid&type=obligations'
			);
			const response = await GET(request);

			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockGetObligations.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				'http://localhost/api/tax/export?format=csv&type=obligations'
			);
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});
});
