/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextRequest } from 'next/server';

const mockUserId = 'user-123';
const mockExportId = 'export-123';

// Mock database - use vi.hoisted to avoid hoisting issues
const { mockSelect, mockFrom, mockWhere, mockLimit, mockDelete, mockWhereDelete } = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockLimit = vi.fn();
	const mockDelete = vi.fn();
	const mockWhereDelete = vi.fn();
	return { mockSelect, mockFrom, mockWhere, mockLimit, mockDelete, mockWhereDelete };
});

vi.mock('@/lib/db', () => ({
	db: {
		select: mockSelect,
		delete: mockDelete,
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
	and: vi.fn((...conditions: any[]) => ({ conditions })),
}));

describe('Direct File Exports [id] API', () => {
	const mockParams = Promise.resolve({ id: mockExportId });

	beforeEach(() => {
		vi.clearAllMocks();
		// Setup database mock chain for select: select().from().where().limit()
		mockSelect.mockReturnValue({
			from: mockFrom,
		});
		mockFrom.mockReturnValue({
			where: mockWhere,
		});
		mockWhere.mockReturnValue({
			limit: mockLimit,
		});
		// Setup database mock chain for delete: delete().where()
		mockDelete.mockReturnValue({
			where: mockWhereDelete,
		});
		mockWhereDelete.mockResolvedValue(undefined);
	});

	describe('DELETE /api/tax/direct-file/exports/[id]', () => {
		it('should delete export successfully', async () => {
			// Mock that export exists and belongs to user
			mockLimit.mockResolvedValue([
				{
					id: mockExportId,
					userId: mockUserId,
					filename: 'tax-export-2025.mef-xml',
				},
			]);

			const request = new NextRequest(
				`http://localhost/api/tax/direct-file/exports/${mockExportId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('message');
		});

		it('should return 404 when export not found', async () => {
			// Mock that export doesn't exist
			mockLimit.mockResolvedValue([]);

			const request = new NextRequest(
				`http://localhost/api/tax/direct-file/exports/${mockExportId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			expect(response.status).toBe(404);
		});

		it('should handle database errors', async () => {
			mockLimit.mockRejectedValue(new Error('Database error'));

			const request = new NextRequest(
				`http://localhost/api/tax/direct-file/exports/${mockExportId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});
});
