/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Tests for dashboard export API endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/dashboard/export/route';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}));

vi.mock('@/lib/services/dashboard-service', () => ({
	DashboardService: {
		getOverview: vi.fn(),
		getRecentActivity: vi.fn(),
	},
}));

describe('GET /api/dashboard/export', () => {
	const mockUserId = 'user_123';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue({
			userId: mockUserId,
		} as any);
	});

	it('should require authentication', async () => {
		vi.mocked(auth).mockResolvedValue({
			userId: null,
		} as any);

		const request = new NextRequest('http://localhost:3000/api/dashboard/export', {
			method: 'GET',
		});

		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.error).toBeDefined();
	});

	it('should export dashboard data as CSV', async () => {
		// The route expects overview.revenue.total, not totalRevenue
		const mockOverview = {
			revenue: { total: 10000 },
			expenses: { total: 5000 },
			netIncome: { thisMonth: 5000 },
			clients: { total: 10, active: 5 },
		};

		const mockActivity = [
			{
				id: '1',
				type: 'invoice' as const,
				description: 'Invoice #123',
				amount: 1000,
				status: 'paid',
				createdAt: new Date('2025-01-01').toISOString(),
			},
		];

		vi.mocked(DashboardService.getOverview).mockResolvedValue(mockOverview as any);
		vi.mocked(DashboardService.getRecentActivity).mockResolvedValue(mockActivity as any);

		const request = new NextRequest('http://localhost:3000/api/dashboard/export', {
			method: 'GET',
		});

		const response = await GET(request);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('text/csv');
		expect(response.headers.get('Content-Disposition')).toContain('attachment');
		expect(response.headers.get('Content-Disposition')).toContain('.csv');

		const csvContent = await response.text();
		expect(csvContent).toContain('Dashboard Export');
		expect(csvContent).toContain('Total Revenue');
		expect(csvContent).toContain('10000');
		expect(csvContent).toContain('Recent Activity');
		expect(csvContent).toContain('Invoice #123');
	});

	it('should handle service errors gracefully', async () => {
		vi.mocked(DashboardService.getOverview).mockRejectedValue(new Error('Service error'));

		const request = new NextRequest('http://localhost:3000/api/dashboard/export', {
			method: 'GET',
		});

		const response = await GET(request);
		
		expect(response.status).toBe(500);
	});
});

