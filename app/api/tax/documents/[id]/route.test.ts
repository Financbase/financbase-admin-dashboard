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
import { TaxService } from '@/lib/services/business/tax-service';

const mockUserId = 'user-123';
const mockDocumentId = 'doc-123';

// Mock dependencies
const mockDeleteDocument = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		deleteDocument = mockDeleteDocument;
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

describe('Tax Documents [id] API', () => {
	const mockParams = Promise.resolve({ id: mockDocumentId });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('DELETE /api/tax/documents/[id]', () => {
		it('should delete document successfully', async () => {
			mockDeleteDocument.mockResolvedValue(undefined);

			const request = new NextRequest(
				`http://localhost/api/tax/documents/${mockDocumentId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('message');
			expect(mockDeleteDocument).toHaveBeenCalledWith(
				mockDocumentId,
				mockUserId
			);
		});

		it('should handle service errors', async () => {
			mockDeleteDocument.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/tax/documents/${mockDocumentId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, { params: mockParams });
			expect(response.status).toBe(500);
		});
	});
});
