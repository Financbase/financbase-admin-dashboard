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
const mockGetDeductions = vi.fn();
const mockCreateDeduction = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getDeductions = mockGetDeductions;
		createDeduction = mockCreateDeduction;
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
		createTaxDeductionSchema: {
			parse: vi.fn((data: any) => {
				if (!data.category || !data.amount || !data.year) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['category'],
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

describe('Tax Deductions API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/deductions', () => {
		it('should return paginated deductions', async () => {
			const mockDeductions = {
				data: [
					{
						id: 'deduction-1',
						userId: mockUserId,
						category: 'home_office',
						amount: 1000,
						year: 2025,
					},
				],
				total: 1,
				page: 1,
				limit: 50,
				totalPages: 1,
			};

			mockGetDeductions.mockResolvedValue(mockDeductions);

			const request = new NextRequest(
				'http://localhost/api/tax/deductions?page=1&limit=50'
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveLength(1);
			expect(data.pagination).toBeDefined();
			expect(data.pagination.totalPages).toBe(1);
		});

		it('should return non-paginated deductions when pagination not requested', async () => {
			const mockDeductions = [
				{
					id: 'deduction-1',
					userId: mockUserId,
					category: 'home_office',
					amount: 1000,
					year: 2025,
				},
			];

			mockGetDeductions.mockResolvedValue(mockDeductions);

			const request = new NextRequest('http://localhost/api/tax/deductions');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});

		it('should filter by year', async () => {
			mockGetDeductions.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/deductions?year=2025'
			);
			await GET(request);

			expect(mockGetDeductions).toHaveBeenCalledWith(
				mockUserId,
				2025,
				expect.objectContaining({})
			);
		});

		it('should filter by category', async () => {
			mockGetDeductions.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/deductions?category=home_office'
			);
			await GET(request);

			expect(mockGetDeductions).toHaveBeenCalledWith(
				mockUserId,
				undefined,
				expect.objectContaining({ category: 'home_office' })
			);
		});

		it('should handle service errors', async () => {
			mockGetDeductions.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/tax/deductions');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});

	describe('POST /api/tax/deductions', () => {
		it('should create deduction successfully', async () => {
			const mockDeduction = {
				id: 'deduction-1',
				userId: mockUserId,
				category: 'home_office',
				amount: 1000,
				year: 2025,
			};

			mockCreateDeduction.mockResolvedValue(mockDeduction);

			const request = new NextRequest('http://localhost/api/tax/deductions', {
				method: 'POST',
				body: JSON.stringify({
					category: 'home_office',
					amount: 1000,
					year: 2025,
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockDeduction);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest('http://localhost/api/tax/deductions', {
				method: 'POST',
				body: JSON.stringify({ invalid: 'data' }),
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest('http://localhost/api/tax/deductions', {
				method: 'POST',
				body: 'invalid json',
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockCreateDeduction.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/tax/deductions', {
				method: 'POST',
				body: JSON.stringify({
					category: 'home_office',
					amount: 1000,
					year: 2025,
				}),
			});

			const response = await POST(request);
			expect(response.status).toBe(500);
		});
	});
});
