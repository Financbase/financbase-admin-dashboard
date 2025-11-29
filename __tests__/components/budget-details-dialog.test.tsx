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
import { BudgetDetailsDialog } from '@/components/budgets/budget-details-dialog';
import { useQuery } from '@tanstack/react-query';
import { createMockUseQueryResult } from '@/src/test/test-utils';

// Mock fetch
global.fetch = vi.fn();

// Mock useQuery to return proper structure
vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query');
	return {
		...actual,
		useQuery: vi.fn(),
	};
});

describe('BudgetDetailsDialog', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render loading state when fetching budget details', async () => {
		// Mock useQuery to return loading state
		vi.mocked(useQuery).mockReturnValue(
			createMockUseQueryResult({
				data: undefined,
				isLoading: true,
				isPending: true,
				isSuccess: false,
				error: null,
			})
		);

		render(
			<BudgetDetailsDialog
				budgetId={1}
				open={true}
				onOpenChange={vi.fn()}
			/>
		);

		// The component uses Skeleton components for loading, not text
		// Check that the dialog is open and contains skeleton elements
		await waitFor(() => {
			expect(screen.getByText('Budget Details')).toBeInTheDocument();
		}, { timeout: 3000 });
		// Skeleton components render as divs with "animate-pulse" class
		await waitFor(() => {
			const skeletons = document.querySelectorAll('.animate-pulse');
			expect(skeletons.length).toBeGreaterThan(0);
		}, { timeout: 3000 });
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

		// Mock useQuery to return success state with data
		vi.mocked(useQuery).mockReturnValue({
			data: mockBudget,
			isLoading: false,
			error: null,
			dataUpdatedAt: Date.now(),
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle' as const,
			isError: false,
			isFetched: true,
			isFetchedAfterMount: true,
			isFetching: false,
			isInitialLoading: false,
			isLoadingError: false,
			isPaused: false,
			isPlaceholderData: false,
			isRefetching: false,
			isRefetchError: false,
			isStale: false,
			isSuccess: true,
			refetch: vi.fn(),
			status: 'success' as const,
		} as any);

		render(
			<BudgetDetailsDialog
				budgetId={1}
				open={true}
				onOpenChange={vi.fn()}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText('Marketing Budget')).toBeInTheDocument();
			expect(screen.getByText('Marketing')).toBeInTheDocument();
		});
	});

	it('should display error message when fetch fails', async () => {
		// Mock useQuery to return error state
		vi.mocked(useQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			error: new Error('Failed to fetch budget details'),
			dataUpdatedAt: 0,
			errorUpdatedAt: Date.now(),
			failureCount: 1,
			failureReason: new Error('Failed to fetch budget details'),
			fetchStatus: 'idle' as const,
			isError: true,
			isFetched: true,
			isFetchedAfterMount: true,
			isFetching: false,
			isInitialLoading: false,
			isLoadingError: true,
			isPaused: false,
			isPlaceholderData: false,
			isRefetching: false,
			isRefetchError: false,
			isStale: false,
			isSuccess: false,
			refetch: vi.fn(),
			status: 'error' as const,
		} as any);

		render(
			<BudgetDetailsDialog
				budgetId={1}
				open={true}
				onOpenChange={vi.fn()}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText(/failed to load budget details/i)).toBeInTheDocument();
		});
	});

	it('should not render when closed', () => {
		// Mock useQuery to return idle state when closed
		vi.mocked(useQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
			dataUpdatedAt: 0,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle' as const,
			isError: false,
			isFetched: false,
			isFetchedAfterMount: false,
			isFetching: false,
			isInitialLoading: false,
			isLoadingError: false,
			isPaused: false,
			isPlaceholderData: false,
			isRefetching: false,
			isRefetchError: false,
			isStale: false,
			isSuccess: false,
			refetch: vi.fn(),
			status: 'idle' as const,
		} as any);

		render(
			<BudgetDetailsDialog
				budgetId={1}
				open={false}
				onOpenChange={vi.fn()}
			/>
		);

		expect(screen.queryByText('Budget Details')).not.toBeInTheDocument();
	});
});

