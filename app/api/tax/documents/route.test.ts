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
const mockGetDocuments = vi.fn();
const mockCreateDocument = vi.fn();

vi.mock('@/lib/services/business/tax-service', () => ({
	TaxService: class {
		getDocuments = mockGetDocuments;
		createDocument = mockCreateDocument;
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
		createTaxDocumentSchema: {
			parse: vi.fn((data: any) => {
				if (!data.name || !data.type || !data.year) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['name'],
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

describe('Tax Documents API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /api/tax/documents', () => {
		it('should return paginated documents', async () => {
			const mockDocuments = {
				data: [
					{
						id: 'doc-1',
						userId: mockUserId,
						name: 'W-2 Form',
						type: 'w2',
						year: 2025,
					},
				],
				total: 1,
				page: 1,
				limit: 50,
				totalPages: 1,
			};

			mockGetDocuments.mockResolvedValue(mockDocuments);

			const request = new NextRequest(
				'http://localhost/api/tax/documents?page=1&limit=50'
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveLength(1);
			expect(data.pagination).toBeDefined();
			expect(data.pagination.totalPages).toBe(1);
		});

		it('should return non-paginated documents when pagination not requested', async () => {
			const mockDocuments = [
				{
					id: 'doc-1',
					userId: mockUserId,
					name: 'W-2 Form',
					type: 'w2',
					year: 2025,
				},
			];

			mockGetDocuments.mockResolvedValue(mockDocuments);

			const request = new NextRequest('http://localhost/api/tax/documents');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});

		it('should filter by year', async () => {
			mockGetDocuments.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/documents?year=2025'
			);
			await GET(request);

			expect(mockGetDocuments).toHaveBeenCalledWith(
				mockUserId,
				2025,
				expect.objectContaining({})
			);
		});

		it('should filter by type', async () => {
			mockGetDocuments.mockResolvedValue([]);

			const request = new NextRequest(
				'http://localhost/api/tax/documents?type=w2'
			);
			await GET(request);

			expect(mockGetDocuments).toHaveBeenCalledWith(
				mockUserId,
				undefined,
				expect.objectContaining({ type: 'w2' })
			);
		});

		it('should handle service errors', async () => {
			mockGetDocuments.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/tax/documents');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});

	describe('POST /api/tax/documents', () => {
		it('should create document successfully', async () => {
			const mockDocument = {
				id: 'doc-1',
				userId: mockUserId,
				name: 'W-2 Form',
				type: 'w2',
				year: 2025,
			};

			mockCreateDocument.mockResolvedValue(mockDocument);

			const request = new NextRequest('http://localhost/api/tax/documents', {
				method: 'POST',
				body: JSON.stringify({
					name: 'W-2 Form',
					type: 'w2',
					year: 2025,
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockDocument);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest('http://localhost/api/tax/documents', {
				method: 'POST',
				body: JSON.stringify({ invalid: 'data' }),
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest('http://localhost/api/tax/documents', {
				method: 'POST',
				body: 'invalid json',
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			mockCreateDocument.mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/tax/documents', {
				method: 'POST',
				body: JSON.stringify({
					name: 'W-2 Form',
					type: 'w2',
					year: 2025,
				}),
			});

			const response = await POST(request);
			expect(response.status).toBe(500);
		});
	});
});
