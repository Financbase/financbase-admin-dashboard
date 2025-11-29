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
const mockGetTaxSummary = vi.fn();
const mockGetTaxAlerts = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getTaxSummary = mockGetTaxSummary;
		getTaxAlerts = mockGetTaxAlerts;
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

describe('Tax Summary API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/summary', () => {
		it('should return tax summary and alerts', async () => {
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

			const mockAlerts = [
				{
					id: 'alert-1',
					type: 'overdue',
					message: 'Payment overdue',
				},
			];

			mockGetTaxSummary.mockResolvedValue(mockSummary);
			mockGetTaxAlerts.mockResolvedValue(mockAlerts);

			const request = new NextRequest('http://localhost/api/tax/summary');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('summary');
			expect(data.data).toHaveProperty('alerts');
			expect(data.data.summary).toEqual(mockSummary);
			expect(data.data.alerts).toEqual(mockAlerts);
		});

		it('should filter by year when provided', async () => {
			mockGetTaxSummary.mockResolvedValue({});
			mockGetTaxAlerts.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/summary?year=2025'
			);
			await GET(request);

			expect(mockGetTaxSummary).toHaveBeenCalledWith(mockUserId, 2025);
		});

		it('should handle service errors', async () => {
			mockGetTaxSummary.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/tax/summary');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});

		it('should handle alerts service errors', async () => {
			mockGetTaxSummary.mockResolvedValue({});
			mockGetTaxAlerts.mockRejectedValue(new Error('Alerts service error'));

			const request = new NextRequest('http://localhost/api/tax/summary');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});
});
