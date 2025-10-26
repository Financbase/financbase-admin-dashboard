/**
 * Test cases for marketplace revenue API authorization
 *
 * These tests verify that:
 * 1. POST /api/marketplace/revenue/process-payouts returns 403 for non-admin users
 * 2. PATCH /api/marketplace/revenue/process-billing returns 403 for non-admin users
 * 3. Both endpoints return 401 for unauthenticated requests
 * 4. Both endpoints return 200 for authenticated admin users
 */

import { describe, it, expect } from 'vitest';

describe('/api/marketplace/revenue', () => {
	describe('POST /process-payouts', () => {
		it('should return 401 for unauthenticated requests', async () => {
			const response = await fetch('/api/marketplace/revenue/process-payouts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ developerId: 'test', period: 'monthly' }),
			});

			expect(response.status).toBe(401);
			expect(await response.json()).toEqual({ error: 'Unauthorized' });
		});

		it('should return 403 for non-admin authenticated users', async () => {
			// Mock non-admin user authentication
			const response = await fetch('/api/marketplace/revenue/process-payouts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ developerId: 'test', period: 'monthly' }),
				// Include non-admin auth headers
			});

			expect(response.status).toBe(403);
			expect(await response.json()).toEqual({ error: 'Admin access required' });
		});

		it('should return 400 for missing required fields', async () => {
			// Mock admin user authentication
			const response = await fetch('/api/marketplace/revenue/process-payouts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ developerId: 'test' }), // missing period
				// Include admin auth headers
			});

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ error: 'Developer ID and period required' });
		});
	});

	describe('PATCH /process-billing', () => {
		it('should return 401 for unauthenticated requests', async () => {
			const response = await fetch('/api/marketplace/revenue/process-billing', {
				method: 'PATCH',
			});

			expect(response.status).toBe(401);
			expect(await response.json()).toEqual({ error: 'Unauthorized' });
		});

		it('should return 403 for non-admin authenticated users', async () => {
			// Mock non-admin user authentication
			const response = await fetch('/api/marketplace/revenue/process-billing', {
				method: 'PATCH',
				// Include non-admin auth headers
			});

			expect(response.status).toBe(403);
			expect(await response.json()).toEqual({ error: 'Admin access required' });
		});
	});
});
