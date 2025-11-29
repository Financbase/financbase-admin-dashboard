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

const mockUserId = 'user-123';

// Mock database - use vi.hoisted to avoid hoisting issues
const { mockSelect, mockFrom, mockWhere, mockOrderBy, mockInsert, mockValues, mockReturning } = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockReturning = vi.fn();
	return { mockSelect, mockFrom, mockWhere, mockOrderBy, mockInsert, mockValues, mockReturning };
});

vi.mock('@/lib/db', () => ({
	db: {
		select: mockSelect,
		insert: mockInsert,
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
vi.mock('drizzle-orm', () => ({
	eq: vi.fn((column: any, value: any) => ({ column, value })),
	desc: vi.fn((column: any) => ({ column, direction: 'desc' })),
}));

describe('Direct File Exports API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup database mock chain for GET: select().from().where().orderBy()
		mockSelect.mockReturnValue({
			from: mockFrom,
		});
		mockFrom.mockReturnValue({
			where: mockWhere,
		});
		mockWhere.mockReturnValue({
			orderBy: mockOrderBy,
		});
		mockOrderBy.mockResolvedValue([]);
		// Setup database mock chain for POST: insert().values().returning()
		mockInsert.mockReturnValue({
			values: mockValues,
		});
		mockValues.mockReturnValue({
			returning: mockReturning,
		});
		mockReturning.mockResolvedValue([{ id: 'export-1' }]);
	});

	describe('GET /api/tax/direct-file/exports', () => {
		it('should return export history', async () => {
			const mockExports = [
				{
					id: 'export-1',
					userId: mockUserId,
					filename: 'tax-export-2025.mef-xml',
					format: 'mef-xml',
					exportDate: new Date(),
				},
			];

			// Reset and set up the chain for this test
			mockSelect.mockReturnValue({
				from: mockFrom,
			});
			mockFrom.mockReturnValue({
				where: mockWhere,
			});
			mockWhere.mockReturnValue({
				orderBy: mockOrderBy,
			});
			mockOrderBy.mockResolvedValue(mockExports);

			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports'
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});

		it('should handle database errors', async () => {
			mockOrderBy.mockRejectedValue(new Error('Database error'));

			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports'
			);
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});

	describe('POST /api/tax/direct-file/exports', () => {
		it('should create export metadata successfully', async () => {
			const mockExport = {
				id: 'export-1',
				userId: mockUserId,
				filename: 'tax-export-2025.mef-xml',
				format: 'mef-xml',
				fileSize: 1024,
				exportDate: new Date(),
			};

			mockReturning.mockResolvedValue([mockExport]);

			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports',
				{
					method: 'POST',
					body: JSON.stringify({
						filename: 'tax-export-2025.mef-xml',
						format: 'mef-xml',
						fileSize: 1024,
					}),
				}
			);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockExport);
		});

		it('should return 400 for missing required fields', async () => {
			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports',
				{
					method: 'POST',
					body: JSON.stringify({
						filename: 'tax-export-2025.mef-xml',
						// Missing format
					}),
				}
			);

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid format', async () => {
			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports',
				{
					method: 'POST',
					body: JSON.stringify({
						filename: 'tax-export-2025.txt',
						format: 'txt', // Invalid format
					}),
				}
			);

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports',
				{
					method: 'POST',
					body: 'invalid json',
				}
			);

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should handle database errors', async () => {
			mockReturning.mockRejectedValue(new Error('Database error'));

			const request = new NextRequest(
				'http://localhost/api/tax/direct-file/exports',
				{
					method: 'POST',
					body: JSON.stringify({
						filename: 'tax-export-2025.mef-xml',
						format: 'mef-xml',
					}),
				}
			);

			const response = await POST(request);
			expect(response.status).toBe(500);
		});
	});
});
