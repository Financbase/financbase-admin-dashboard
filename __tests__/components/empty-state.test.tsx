import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@/src/test/test-utils'
import EmptyState, { EmptyStates } from '@/components/core/empty-state'
import { BarChart3 } from 'lucide-react'

describe('EmptyState', () => {
	it('renders with required props', () => {
		render(
			<EmptyState
				title="Test Title"
				description="Test description"
			/>
		)

		expect(screen.getByText('Test Title')).toBeInTheDocument()
		expect(screen.getByText('Test description')).toBeInTheDocument()
	})

	it('renders with icon', () => {
		render(
			<EmptyState
				icon={BarChart3}
				title="Chart Empty"
				description="No chart data available"
			/>
		)

		expect(screen.getByText('Chart Empty')).toBeInTheDocument()
		// Check for the icon container instead of specific lucide class
		expect(document.querySelector('.mb-4.p-3')).toBeInTheDocument()
	})

	it('renders with action button', () => {
		const mockAction = vi.fn()

		render(
			<EmptyState
				title="Action Required"
				description="Click the button"
				action={{
					label: "Click Me",
					onClick: mockAction
				}}
			/>
		)

		const button = screen.getByRole('button', { name: /click me/i })
		expect(button).toBeInTheDocument()

		fireEvent.click(button)
		expect(mockAction).toHaveBeenCalledTimes(1)
	})

	it('applies custom className', () => {
		render(
			<EmptyState
				title="Custom Class"
				description="Test"
				className="custom-empty-state"
			/>
		)

		const container = document.querySelector('.custom-empty-state')
		expect(container).toBeInTheDocument()
	})

	it('has correct default styling', () => {
		render(
			<EmptyState
				title="Styling Test"
				description="Test description"
			/>
		)

		const container = document.querySelector('.flex-col.items-center.justify-center')
		expect(container).toBeInTheDocument()
		expect(container).toHaveClass('py-12', 'px-4', 'text-center')
	})

	it('icon container has correct styling when icon is provided', () => {
		render(
			<EmptyState
				icon={BarChart3}
				title="Icon Test"
				description="Test"
			/>
		)

		const iconContainer = document.querySelector('.rounded-full.bg-gray-100')
		expect(iconContainer).toBeInTheDocument()
		expect(iconContainer).toHaveClass('mb-4', 'p-3')
	})

	it('title has correct styling', () => {
		render(
			<EmptyState
				title="Title Test"
				description="Test"
			/>
		)

		const title = screen.getByText('Title Test')
		expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900', 'mb-2')
	})

	it('description has correct styling', () => {
		render(
			<EmptyState
				title="Test"
				description="Description Test"
			/>
		)

		const description = screen.getByText('Description Test')
		expect(description).toHaveClass('text-sm', 'text-gray-500', 'mb-4', 'max-w-sm')
	})

	it('action button has correct size', () => {
		const mockAction = vi.fn()

		render(
			<EmptyState
				title="Test"
				description="Test"
				action={{
					label: "Action",
					onClick: mockAction
				}}
			/>
		)

		const button = screen.getByRole('button', { name: /action/i })
		expect(button).toHaveClass('h-9') // sm size
	})

	it('renders predefined empty states correctly', () => {
		// Test orders empty state
		render(<EmptyState {...EmptyStates.orders} />)

		expect(screen.getByText('No orders yet')).toBeInTheDocument()
		expect(screen.getByText('Orders will appear here once customers start placing them.')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /view all orders/i })).toBeInTheDocument()

		// Test products empty state
		render(<EmptyState {...EmptyStates.products} />)

		expect(screen.getByText('No products found')).toBeInTheDocument()
		expect(screen.getByText('Add some products to see them in your dashboard.')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument()
	})

	it('predefined empty states have correct navigation actions', () => {
		// Mock window.location.href
		const originalLocation = window.location
		delete (window as any).location
		window.location = { href: '' } as any

		render(<EmptyState {...EmptyStates.customers} />)

		const button = screen.getByRole('button', { name: /view customers/i })
		fireEvent.click(button)

		expect(window.location.href).toBe('/customers')

		// Restore window.location
		window.location = originalLocation
	})
})