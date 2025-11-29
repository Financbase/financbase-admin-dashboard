import React, { ReactElement } from 'react'
import { render, RenderOptions, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0, // Use gcTime instead of cacheTime (React Query v5)
			},
			mutations: {
				retry: false,
			},
		},
	})

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }

// Test utilities
export const createMockRouter = (overrides = {}) => ({
	push: vi.fn(),
	prefetch: vi.fn(),
	replace: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	refresh: vi.fn(),
	pathname: '/',
	query: {},
	...overrides,
})

export const createMockUser = (overrides = {}) => ({
	id: 'test-user-id',
	email: 'test@example.com',
	firstName: 'Test',
	lastName: 'User',
	...overrides,
})

export const createMockFinancialData = () => ({
	revenue: [10000, 12000, 15000, 18000],
	expenses: [8000, 9000, 10000, 11000],
	transactions: [
		{
			id: '1',
			description: 'Office Supplies',
			amount: 150.50,
			category: 'Office',
			date: new Date().toISOString(),
		},
		{
			id: '2',
			description: 'Software License',
			amount: 299.99,
			category: 'Software',
			date: new Date().toISOString(),
		},
	],
	budget: {
		total: 20000,
		categories: [
			{ name: 'Office', budgeted: 2000, spent: 1800 },
			{ name: 'Marketing', budgeted: 5000, spent: 4500 },
		],
	},
})

export const waitForLoadingToFinish = () =>
	new Promise(resolve => setTimeout(resolve, 0))

// Helper to create a complete UseQueryResult mock
export const createMockUseQueryResult = (overrides: any = {}) => {
	const defaults = {
		data: undefined,
		dataUpdatedAt: Date.now(),
		error: null,
		errorUpdatedAt: 0,
		failureCount: 0,
		failureReason: null,
		fetchStatus: 'idle' as const,
		isError: false,
		isFetched: true,
		isFetchedAfterMount: true,
		isFetching: false,
		isInitialLoading: false,
		isLoading: false,
		isLoadingError: false,
		isPaused: false,
		isPending: false,
		isPlaceholderData: false,
		isRefetchError: false,
		isRefetching: false,
		isStale: false,
		isSuccess: false,
		refetch: vi.fn(),
		status: 'success' as const,
	}

	const result = { ...defaults, ...overrides }
	
	// Ensure status matches the state
	if (result.isLoading || result.isPending) {
		result.status = 'pending'
	} else if (result.isError) {
		result.status = 'error'
	} else if (result.isSuccess) {
		result.status = 'success'
	}

	return result
}

// Helper to create a complete UseMutationResult mock
export const createMockUseMutationResult = (overrides: any = {}) => {
	const defaults = {
		data: undefined,
		error: null,
		failureCount: 0,
		failureReason: null,
		isError: false,
		isIdle: true,
		isPaused: false,
		isPending: false,
		isSuccess: false,
		mutate: vi.fn(),
		mutateAsync: vi.fn(),
		reset: vi.fn(),
		status: 'idle' as const,
		submittedAt: 0,
		variables: undefined,
	}

	const result = { ...defaults, ...overrides }
	
	// Ensure status matches the state
	if (result.isPending) {
		result.status = 'pending'
		result.isIdle = false
	} else if (result.isError) {
		result.status = 'error'
		result.isIdle = false
	} else if (result.isSuccess) {
		result.status = 'success'
		result.isIdle = false
	}

	return result
}

// Helper to wait for async state updates
export const waitForStateUpdate = async (timeout = 1000) => {
	await waitFor(() => {
		// Just wait for next tick
	}, { timeout })
}

// Helper to create mock query response based on query key
export const createMockQueryResponse = (queryKey: string | string[], data: any) => {
	return createMockUseQueryResult({
		data,
		isSuccess: true,
		status: 'success',
		isLoading: false,
		isPending: false,
	})
}
