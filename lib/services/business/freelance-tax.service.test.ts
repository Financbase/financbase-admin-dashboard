/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FreelanceTaxService } from './freelance-tax.service';
import { TaxService } from './tax-service';

// Mock dependencies
vi.mock('./tax-service');
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn(),
	},
}));

describe('FreelanceTaxService', () => {
	let service: FreelanceTaxService;
	let mockTaxService: any;

	beforeEach(() => {
		service = new FreelanceTaxService();
		mockTaxService = {
			getObligations: vi.fn(),
			createObligation: vi.fn(),
			recordPayment: vi.fn(),
		};
		(TaxService as any).mockImplementation(() => mockTaxService);
		vi.clearAllMocks();
	});

	describe('calculateTaxLiability', () => {
		it('should calculate tax liability correctly', async () => {
			const income = 100000;
			const deductions = 20000;
			const taxRate = 0.25;

			const result = await service.calculateTaxLiability(
				'user-123',
				income,
				deductions,
				taxRate
			);

			const expectedLiability = (income - deductions) * taxRate;
			expect(result.taxLiability).toBe(expectedLiability);
			expect(result.taxableIncome).toBe(income - deductions);
			expect(result.effectiveRate).toBe(taxRate);
		});

		it('should handle zero deductions', async () => {
			const income = 100000;
			const deductions = 0;
			const taxRate = 0.25;

			const result = await service.calculateTaxLiability(
				'user-123',
				income,
				deductions,
				taxRate
			);

			expect(result.taxLiability).toBe(income * taxRate);
			expect(result.taxableIncome).toBe(income);
		});

		it('should handle negative taxable income', async () => {
			const income = 10000;
			const deductions = 20000;
			const taxRate = 0.25;

			const result = await service.calculateTaxLiability(
				'user-123',
				income,
				deductions,
				taxRate
			);

			expect(result.taxLiability).toBe(0);
			expect(result.taxableIncome).toBe(0);
		});
	});

	describe('calculateQuarterlyEstimate', () => {
		it('should calculate quarterly estimate correctly', async () => {
			const annualLiability = 10000;
			const result = await service.calculateQuarterlyEstimate(annualLiability);

			expect(result.quarterlyAmount).toBe(2500); // 10000 / 4
			expect(result.annualLiability).toBe(annualLiability);
		});

		it('should handle zero liability', async () => {
			const result = await service.calculateQuarterlyEstimate(0);
			expect(result.quarterlyAmount).toBe(0);
		});
	});

	describe('recordQuarterlyPayment', () => {
		it('should record quarterly payment successfully', async () => {
			const userId = 'user-123';
			const quarter = 1;
			const year = 2025;
			const amount = 2500;
			const paymentDate = new Date('2025-04-15');

			mockTaxService.getObligations.mockResolvedValue([]);
			mockTaxService.createObligation.mockResolvedValue({
				id: 'obligation-123',
				userId,
				name: 'Q1 2025 Estimated Tax Payment',
			});
			mockTaxService.getObligations.mockResolvedValueOnce([]).mockResolvedValueOnce([
				{ id: 'obligation-123' },
			]);
			mockTaxService.recordPayment.mockResolvedValue({
				id: 'obligation-123',
				paid: '2500.00',
			});

			await service.recordQuarterlyPayment(
				userId,
				quarter,
				year,
				amount,
				paymentDate
			);

			expect(mockTaxService.createObligation).toHaveBeenCalled();
			expect(mockTaxService.recordPayment).toHaveBeenCalled();
		});

		it('should throw error for invalid quarter', async () => {
			await expect(
				service.recordQuarterlyPayment(
					'user-123',
					5, // Invalid quarter
					2025,
					2500,
					new Date()
				)
			).rejects.toThrow();
		});

		it('should throw error for invalid payment date', async () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			await expect(
				service.recordQuarterlyPayment(
					'user-123',
					1,
					2025,
					2500,
					futureDate
				)
			).rejects.toThrow();
		});
	});

	describe('getTaxOptimization', () => {
		it('should return tax optimization recommendations', async () => {
			const userId = 'user-123';
			const startDate = new Date('2025-01-01');
			const endDate = new Date('2025-12-31');

			mockTaxService.getDeductions = vi.fn().mockResolvedValue([]);
			mockTaxService.getObligations = vi.fn().mockResolvedValue([]);

			const result = await service.getTaxOptimization(
				userId,
				startDate,
				endDate
			);

			expect(result).toHaveProperty('recommendations');
			expect(result).toHaveProperty('quarterlyEstimates');
			expect(result).toHaveProperty('taxDeadlines');
		});
	});

	describe('getQuarterlyDueDate', () => {
		it('should return correct due date for Q1', () => {
			const date = service.getQuarterlyDueDate(1, 2025);
			expect(date.getMonth()).toBe(3); // April (0-indexed)
			expect(date.getDate()).toBe(15);
			expect(date.getFullYear()).toBe(2025);
		});

		it('should return correct due date for Q4 (next year)', () => {
			const date = service.getQuarterlyDueDate(4, 2025);
			expect(date.getMonth()).toBe(0); // January (0-indexed)
			expect(date.getDate()).toBe(15);
			expect(date.getFullYear()).toBe(2026);
		});
	});
});

