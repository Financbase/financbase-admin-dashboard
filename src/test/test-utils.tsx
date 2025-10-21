import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
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

import { vi } from 'vitest'

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
