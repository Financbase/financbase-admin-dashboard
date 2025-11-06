/**
 * Budget API Tests
 * Tests for budget details API endpoint
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/budgets/[id]/route';
import { auth } from '@clerk/nextjs/server';
import { getBudgetById } from '@/lib/services/budget-service';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@clerk/nextjs/server');
vi.mock('@/lib/services/budget-service');

describe('Budget Details API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return budget details for valid budget ID', async () => {
		const mockUserId = 'user_123';
		const mockBudgetId = '1';
		const mockBudget = {
			id: 1,
			userId: mockUserId,
			name: 'Test Budget',
			category: 'Marketing',
			budgetedAmount: '10000.00',
			spentAmount: 5000,
			remainingAmount: 5000,
			spendingPercentage: 50,
			status: 'good',
			transactionCount: 10,
			startDate: new Date('2025-01-01'),
			endDate: new Date('2025-12-31'),
		};

		vi.mocked(auth).mockResolvedValue({
			userId: mockUserId,
		} as any);

		vi.mocked(getBudgetById).mockResolvedValue(mockBudget as any);

		const request = new NextRequest(
			`http://localhost:3000/api/budgets/${mockBudgetId}`
		);
		const params = { id: mockBudgetId };

		const response = await GET(request, { params: Promise.resolve(params) });
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.data).toEqual(mockBudget);
		expect(getBudgetById).toHaveBeenCalledWith(parseInt(mockBudgetId), mockUserId);
	});

	it('should return 401 if user is not authenticated', async () => {
		vi.mocked(auth).mockResolvedValue({
			userId: null,
		} as any);

		const request = new NextRequest('http://localhost:3000/api/budgets/1');
		const params = { id: '1' };

		const response = await GET(request, { params: Promise.resolve(params) });

		expect(response.status).toBe(401);
		expect(getBudgetById).not.toHaveBeenCalled();
	});

	it('should return 400 for invalid budget ID', async () => {
		const mockUserId = 'user_123';

		vi.mocked(auth).mockResolvedValue({
			userId: mockUserId,
		} as any);

		const request = new NextRequest('http://localhost:3000/api/budgets/invalid');
		const params = { id: 'invalid' };

		const response = await GET(request, { params: Promise.resolve(params) });
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.success).toBe(false);
		expect(data.error).toBe('Invalid budget ID');
		expect(getBudgetById).not.toHaveBeenCalled();
	});

	it('should return 404 if budget not found', async () => {
		const mockUserId = 'user_123';
		const mockBudgetId = '999';

		vi.mocked(auth).mockResolvedValue({
			userId: mockUserId,
		} as any);

		vi.mocked(getBudgetById).mockResolvedValue(null);

		const request = new NextRequest(
			`http://localhost:3000/api/budgets/${mockBudgetId}`
		);
		const params = { id: mockBudgetId };

		const response = await GET(request, { params: Promise.resolve(params) });
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data.success).toBe(false);
		expect(data.error).toBe('Budget not found');
	});
});

