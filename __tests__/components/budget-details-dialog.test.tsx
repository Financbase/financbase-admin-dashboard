/**
 * Budget Details Dialog Component Tests
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
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetDetailsDialog } from '@/components/budgets/budget-details-dialog';

// Mock fetch
global.fetch = vi.fn();

// Create a test query client
const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

describe('BudgetDetailsDialog', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = createTestQueryClient();
		vi.clearAllMocks();
	});

	it('should render loading state when fetching budget details', () => {
		vi.mocked(fetch).mockImplementation(
			() =>
				new Promise(() => {
					// Never resolves to keep loading state
				})
		);

		render(
			<QueryClientProvider client={queryClient}>
				<BudgetDetailsDialog
					budgetId={1}
					open={true}
					onOpenChange={vi.fn()}
				/>
			</QueryClientProvider>
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it('should display budget details when data is loaded', async () => {
		const mockBudget = {
			success: true,
			data: {
				id: 1,
				name: 'Marketing Budget',
				category: 'Marketing',
				budgetedAmount: '10000.00',
				spentAmount: 5000,
				remainingAmount: 5000,
				spendingPercentage: 50,
				status: 'good',
				transactionCount: 10,
				startDate: '2025-01-01',
				endDate: '2025-12-31',
			},
		};

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockBudget,
		} as Response);

		render(
			<QueryClientProvider client={queryClient}>
				<BudgetDetailsDialog
					budgetId={1}
					open={true}
					onOpenChange={vi.fn()}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByText('Marketing Budget')).toBeInTheDocument();
			expect(screen.getByText('Marketing')).toBeInTheDocument();
		});
	});

	it('should display error message when fetch fails', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

		render(
			<QueryClientProvider client={queryClient}>
				<BudgetDetailsDialog
					budgetId={1}
					open={true}
					onOpenChange={vi.fn()}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByText(/failed to load budget details/i)).toBeInTheDocument();
		});
	});

	it('should not render when closed', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<BudgetDetailsDialog
					budgetId={1}
					open={false}
					onOpenChange={vi.fn()}
				/>
			</QueryClientProvider>
		);

		expect(screen.queryByText('Budget Details')).not.toBeInTheDocument();
	});
});

