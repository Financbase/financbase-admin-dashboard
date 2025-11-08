/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTransaction } from './db-transaction';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Mock the database
vi.mock('@/lib/db', () => {
	const mockTransaction = vi.fn();
	return {
		db: {
			transaction: mockTransaction,
		},
	};
});

describe('withTransaction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should execute operation successfully within transaction', async () => {
		const mockOperation = vi.fn().mockResolvedValue('success');
		const mockTx = {
			execute: vi.fn(),
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};

		(db.transaction as any).mockImplementation(async (callback: any) => {
			return await callback(mockTx);
		});

		const result = await withTransaction(mockOperation);

		expect(result).toBe('success');
		expect(mockOperation).toHaveBeenCalledWith(mockTx);
		expect(db.transaction).toHaveBeenCalledTimes(1);
	});

	it('should rollback transaction on error', async () => {
		const error = new Error('Operation failed');
		const mockOperation = vi.fn().mockRejectedValue(error);
		const mockTx = {
			execute: vi.fn(),
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};

		let rollbackCalled = false;
		(db.transaction as any).mockImplementation(async (callback: any) => {
			try {
				return await callback(mockTx);
			} catch (e) {
				rollbackCalled = true;
				throw e;
			}
		});

		await expect(withTransaction(mockOperation)).rejects.toThrow('Operation failed');
		expect(mockOperation).toHaveBeenCalledWith(mockTx);
		expect(rollbackCalled).toBe(true);
	});

	it('should pass transaction context to operation', async () => {
		const mockOperation = vi.fn().mockImplementation(async (tx: any) => {
			expect(tx).toBeDefined();
			expect(tx.execute).toBeDefined();
			return 'result';
		});

		const mockTx = {
			execute: vi.fn(),
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};

		(db.transaction as any).mockImplementation(async (callback: any) => {
			return await callback(mockTx);
		});

		await withTransaction(mockOperation);

		expect(mockOperation).toHaveBeenCalledWith(mockTx);
	});

	it('should handle database errors properly', async () => {
		const dbError = new Error('Database connection failed');
		const mockOperation = vi.fn().mockResolvedValue('success');
		const mockTx = {
			execute: vi.fn(),
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};

		(db.transaction as any).mockImplementation(async () => {
			throw dbError;
		});

		await expect(withTransaction(mockOperation)).rejects.toThrow('Database connection failed');
	});

	it('should support nested operations', async () => {
		const innerOperation = vi.fn().mockResolvedValue('inner');
		const outerOperation = vi.fn().mockImplementation(async (tx: any) => {
			const innerResult = await innerOperation(tx);
			return `outer-${innerResult}`;
		});

		const mockTx = {
			execute: vi.fn(),
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};

		(db.transaction as any).mockImplementation(async (callback: any) => {
			return await callback(mockTx);
		});

		const result = await withTransaction(outerOperation);

		expect(result).toBe('outer-inner');
		expect(outerOperation).toHaveBeenCalledWith(mockTx);
		expect(innerOperation).toHaveBeenCalledWith(mockTx);
	});
});

