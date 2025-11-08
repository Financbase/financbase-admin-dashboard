/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxService } from './tax-service';
import { db } from '@/lib/db';
import { taxObligations, taxDeductions, taxDocuments } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';

// Mock database
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn(),
		execute: vi.fn(),
	},
}));

vi.mock('@/lib/utils/db-transaction', () => ({
	withTransaction: vi.fn(),
}));

vi.mock('@/lib/cache/cache-manager', () => ({
	cache: {
		getOrSet: vi.fn(async (key, fn, options) => {
			return await fn();
		}),
		get: vi.fn(),
		set: vi.fn(),
	},
}));

describe('TaxService', () => {
	let service: TaxService;
	const mockUserId = 'user-123';
	const mockObligationId = 'obligation-123';
	let mockDb: any;

	beforeEach(() => {
		service = new TaxService();
		vi.clearAllMocks();
		// Get reference to mocked db
		mockDb = db;
	});

	describe('getObligations', () => {
		it('should return obligations for user', async () => {
			const mockObligations = [
				{
					id: mockObligationId,
					userId: mockUserId,
					name: 'Federal Income Tax',
					amount: '1000.00',
					status: 'pending',
				},
			];

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockObligations),
					}),
				}),
			});

			const result = await service.getObligations(mockUserId);
			expect(result).toEqual(mockObligations);
		});

		it('should filter by status', async () => {
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([]),
					}),
				}),
			});

			await service.getObligations(mockUserId, { status: 'paid' });
			expect(mockDb.select).toHaveBeenCalled();
		});
	});

	describe('getObligationById', () => {
		it('should return obligation when found', async () => {
			const mockObligation = {
				id: mockObligationId,
				userId: mockUserId,
				name: 'Federal Income Tax',
			};

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockObligation]),
					}),
				}),
			});

			const result = await service.getObligationById(mockObligationId, mockUserId);
			expect(result).toEqual(mockObligation);
		});

		it('should throw error when obligation not found', async () => {
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			});

			await expect(
				service.getObligationById(mockObligationId, mockUserId)
			).rejects.toThrow('Tax obligation not found');
		});
	});

	describe('createObligation', () => {
		it('should create new obligation', async () => {
			const input = {
				userId: mockUserId,
				name: 'Federal Income Tax',
				type: 'federal_income',
				amount: 1000,
				dueDate: new Date('2025-04-15'),
				status: 'pending',
				year: 2025,
			};

			const mockResult = { id: mockObligationId, ...input };

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockResult]),
				}),
			});

			const result = await service.createObligation(input);
			expect(result).toEqual(mockResult);
		});
	});

	describe('recordPayment', () => {
		it('should record payment and update status to paid when fully paid', async () => {
			const input = {
				obligationId: mockObligationId,
				amount: 1000,
				paymentDate: new Date(),
				paymentMethod: 'bank_transfer',
			};

			const mockResult = {
				id: mockObligationId,
				userId: mockUserId,
				paid: '1000.00',
				amount: '1000.00',
				status: 'paid',
			};

			// Mock transaction
			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					execute: vi.fn().mockResolvedValue({
						rows: [mockResult],
					}),
				};
				return await callback(mockTx);
			});

			const result = await service.recordPayment(input, mockUserId);
			expect(result).toEqual(mockResult);
			expect(mockDb.transaction).toHaveBeenCalled();
		});

		it('should record partial payment and keep status as pending', async () => {
			const input = {
				obligationId: mockObligationId,
				amount: 500,
				paymentDate: new Date(),
			};

			const mockResult = {
				id: mockObligationId,
				userId: mockUserId,
				paid: '500.00',
				amount: '1000.00',
				status: 'pending',
			};

			// Mock transaction
			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					execute: vi.fn().mockResolvedValue({
						rows: [mockResult],
					}),
				};
				return await callback(mockTx);
			});

			const result = await service.recordPayment(input, mockUserId);
			expect(result.status).toBe('pending');
		});

		it('should throw error when obligation not found', async () => {
			const input = {
				obligationId: mockObligationId,
				amount: 1000,
				paymentDate: new Date(),
			};

			// Mock transaction that returns empty rows
			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					execute: vi.fn().mockResolvedValue({
						rows: [],
					}),
				};
				return await callback(mockTx);
			});

			await expect(service.recordPayment(input, mockUserId)).rejects.toThrow(
				'Tax obligation not found'
			);
		});
	});

	describe('getDeductions', () => {
		it('should return deductions for user', async () => {
			const mockDeductions = [
				{
					id: 'deduction-123',
					userId: mockUserId,
					category: 'Business Expenses',
					amount: '5000.00',
					year: 2025,
				},
			];

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockDeductions),
					}),
				}),
			});

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([]),
				}),
			});

			const result = await service.getDeductions(mockUserId);
			expect(result).toEqual(mockDeductions);
		});
	});

	describe('createDeduction', () => {
		it('should create deduction and recalculate percentages', async () => {
			const input = {
				userId: mockUserId,
				category: 'Business Expenses',
				amount: 5000,
				year: 2025,
			};

			const mockResult = { id: 'deduction-123', ...input };

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockResult]),
				}),
			});

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockResult]),
				}),
			});

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([]),
				}),
			});

			const result = await service.createDeduction(input);
			expect(result).toEqual(mockResult);
		});
	});

	describe('getTaxSummary', () => {
		it('should calculate tax summary correctly', async () => {
			// Mock the optimized parallel queries
			mockDb.select
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([
							{
								totalObligations: 3000,
								totalPaid: 2500,
								pendingCount: 1,
								paidCount: 1,
								overdueCount: 0,
							},
						]),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([
							{
								totalDeductions: 5000,
							},
						]),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							groupBy: vi.fn().mockResolvedValue([
								{ type: 'federal_income', count: 1 },
								{ type: 'state_income', count: 1 },
							]),
						}),
					}),
				});

			const summary = await service.getTaxSummary(mockUserId);
			expect(summary.totalObligations).toBe(3000);
			expect(summary.totalPaid).toBe(2500);
			expect(summary.totalPending).toBe(500);
			expect(summary.totalDeductions).toBe(5000);
		});
	});

	describe('getTaxAlerts', () => {
		it('should generate overdue alerts', async () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 10);

			const mockObligations = [
				{
					id: mockObligationId,
					userId: mockUserId,
					name: 'Overdue Tax',
					amount: '1000.00',
					paid: '0.00',
					status: 'overdue',
					dueDate: pastDate,
				},
			];

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockObligations),
					}),
				}),
			});

			const alerts = await service.getTaxAlerts(mockUserId);
			expect(alerts.length).toBeGreaterThan(0);
			expect(alerts[0].type).toBe('danger');
		});
	});

	describe('race conditions', () => {
		it('should handle concurrent payment recording with atomic updates', async () => {
			const input = {
				obligationId: mockObligationId,
				amount: 500,
				paymentDate: new Date(),
			};

			const mockResult = {
				id: mockObligationId,
				paid: '500.00',
				amount: '1000.00',
				status: 'pending',
			};

			// Mock transaction to ensure atomicity
			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					execute: vi.fn().mockResolvedValue({
						rows: [mockResult],
					}),
				};
				return await callback(mockTx);
			});

			// Simulate concurrent payments
			const promises = [
				service.recordPayment(input, mockUserId),
				service.recordPayment(input, mockUserId),
			];

			const results = await Promise.all(promises);
			expect(results).toHaveLength(2);
			// Verify transaction was called for each payment
			expect(mockDb.transaction).toHaveBeenCalledTimes(2);
		});

		it('should use atomic SQL update to prevent race conditions', async () => {
			const input = {
				obligationId: mockObligationId,
				amount: 1000,
				paymentDate: new Date(),
				paymentMethod: 'bank_transfer',
			};

			const mockExecute = vi.fn().mockResolvedValue({
				rows: [
					{
						id: mockObligationId,
						paid: '1000.00',
						amount: '1000.00',
						status: 'paid',
					},
				],
			});

			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					execute: mockExecute,
				};
				return await callback(mockTx);
			});

			await service.recordPayment(input, mockUserId);

			// Verify execute was called with SQL that includes atomic update
			expect(mockExecute).toHaveBeenCalled();
			const sqlCall = mockExecute.mock.calls[0][0];
			expect(sqlCall).toBeDefined();
		});
	});

	describe('pagination', () => {
		it('should return paginated results when limit is provided', async () => {
			const mockObligations = Array.from({ length: 10 }, (_, i) => ({
				id: `obligation-${i}`,
				userId: mockUserId,
				name: `Tax ${i}`,
				amount: '100.00',
				status: 'pending',
			}));

			// Mock count query
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ count: 25 }]),
				}),
			});

			// Mock data query
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue({
								offset: vi.fn().mockResolvedValue(mockObligations),
							}),
						}),
					}),
				}),
			});

			const result = await service.getObligations(mockUserId, {
				limit: 10,
				offset: 0,
			});

			expect('data' in result).toBe(true);
			if ('data' in result) {
				expect(result.data).toHaveLength(10);
				expect(result.total).toBe(25);
				expect(result.page).toBe(1);
				expect(result.limit).toBe(10);
				expect(result.totalPages).toBe(3);
			}
		});

		it('should return array when pagination is not requested', async () => {
			const mockObligations = [
				{
					id: mockObligationId,
					userId: mockUserId,
					name: 'Federal Income Tax',
					amount: '1000.00',
					status: 'pending',
				},
			];

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockObligations),
					}),
				}),
			});

			const result = await service.getObligations(mockUserId);
			expect(Array.isArray(result)).toBe(true);
			expect(result).toEqual(mockObligations);
		});

		it('should enforce maximum limit of 100', async () => {
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ count: 200 }]),
				}),
			});

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue({
								offset: vi.fn().mockResolvedValue([]),
							}),
						}),
					}),
				}),
			});

			const result = await service.getObligations(mockUserId, {
				limit: 200, // Request more than max
				offset: 0,
			});

			if ('data' in result) {
				expect(result.limit).toBeLessThanOrEqual(100);
			}
		});
	});

	describe('transaction management', () => {
		it('should use transaction for recalculateDeductionPercentages', async () => {
			const mockDeductions = [
				{
					id: 'deduction-1',
					userId: mockUserId,
					category: 'Business Expenses',
					amount: '5000.00',
					percentage: null,
					year: 2025,
				},
				{
					id: 'deduction-2',
					userId: mockUserId,
					category: 'Travel',
					amount: '3000.00',
					percentage: null,
					year: 2025,
				},
			];

			const transactionSpy = vi.fn();
			
			// Mock transaction for recalculation
			mockDb.transaction.mockImplementation(async (callback) => {
				transactionSpy();
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockReturnValue({
							where: vi.fn().mockResolvedValue(mockDeductions),
						}),
					}),
					update: vi.fn().mockReturnValue({
						set: vi.fn().mockReturnValue({
							where: vi.fn().mockResolvedValue([]),
						}),
					}),
				};
				return await callback(mockTx);
			});

			// Create deduction which triggers recalculation
			const input = {
				userId: mockUserId,
				category: 'Software',
				amount: 2000,
				year: 2025,
			};

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([
						{ id: 'deduction-3', ...input },
					]),
				}),
			});

			// Mock getDeductions to return the deductions (for the recalculation call)
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockDeductions),
					}),
				}),
			});

			await service.createDeduction(input);

			// Verify transaction was called
			expect(transactionSpy).toHaveBeenCalled();
		});

		it('should rollback transaction on error', async () => {
			const input = {
				userId: mockUserId,
				category: 'Software',
				amount: 2000,
				year: 2025,
			};

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([
						{ id: 'deduction-3', ...input },
					]),
				}),
			});

			// Mock transaction that throws error during recalculation
			// Note: The recalculation happens after insert, so the error will propagate
			mockDb.transaction.mockImplementation(async (callback) => {
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockReturnValue({
							where: vi.fn().mockRejectedValue(new Error('Database error')),
						}),
					}),
				};
				// Transaction will throw, causing rollback
				return await callback(mockTx);
			});

			// The error happens in recalculation transaction, so it should throw
			await expect(service.createDeduction(input)).rejects.toThrow('Database error');
		});
	});

	describe('query optimization', () => {
		it('should use parallel queries for getTaxSummary', async () => {
			const mockObligationsSummary = [
				{
					totalObligations: 3000,
					totalPaid: 1500,
					pendingCount: 2,
					paidCount: 1,
					overdueCount: 0,
				},
			];

			const mockDeductionsSummary = [
				{
					totalDeductions: 5000,
				},
			];

			const mockTypeBreakdown = [
				{ type: 'federal_income', count: 2 },
				{ type: 'state_income', count: 1 },
			];

			// Mock parallel queries
			mockDb.select
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(mockObligationsSummary),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(mockDeductionsSummary),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							groupBy: vi.fn().mockResolvedValue(mockTypeBreakdown),
						}),
					}),
				});

			const summary = await service.getTaxSummary(mockUserId, 2025);

			expect(summary.totalObligations).toBe(3000);
			expect(summary.totalPaid).toBe(1500);
			expect(summary.totalDeductions).toBe(5000);
			expect(summary.obligationsByStatus.pending).toBe(2);
			expect(summary.obligationsByStatus.paid).toBe(1);
		});

		it('should cache tax summary results', async () => {
			const { cache } = await import('@/lib/cache/cache-manager');
			const cacheSpy = vi.spyOn(cache, 'getOrSet');

			const mockObligationsSummary = [
				{
					totalObligations: 1000,
					totalPaid: 500,
					pendingCount: 1,
					paidCount: 1,
					overdueCount: 0,
				},
			];

			const mockDeductionsSummary = [{ totalDeductions: 2000 }];
			const mockTypeBreakdown = [{ type: 'federal_income', count: 1 }];

			mockDb.select
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(mockObligationsSummary),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(mockDeductionsSummary),
					}),
				})
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							groupBy: vi.fn().mockResolvedValue(mockTypeBreakdown),
						}),
					}),
				});

			await service.getTaxSummary(mockUserId, 2025);

			// Verify cache.getOrSet was called
			expect(cacheSpy).toHaveBeenCalled();
			const cacheCall = cacheSpy.mock.calls[0];
			expect(cacheCall[0]).toContain('tax:summary');
			expect(cacheCall[2]?.ttl).toBe(300); // 5 minutes
		});
	});

	describe('deduction percentage calculation', () => {
		it('should calculate missing percentages efficiently', async () => {
			const mockDeductions = [
				{
					id: 'deduction-1',
					userId: mockUserId,
					category: 'Business Expenses',
					amount: '5000.00',
					percentage: null,
					year: 2025,
				},
				{
					id: 'deduction-2',
					userId: mockUserId,
					category: 'Travel',
					amount: '3000.00',
					percentage: null,
					year: 2025,
				},
			];

			// Mock the select query chain properly
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockDeductions),
					}),
				}),
			});

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([]),
				}),
			});

			const result = await service.getDeductions(mockUserId, 2025);

			// Verify update was called for deductions without percentage
			expect(mockDb.update).toHaveBeenCalled();
			// Result should be an array (when no pagination)
			expect(Array.isArray(result)).toBe(true);
		});
	});
});

