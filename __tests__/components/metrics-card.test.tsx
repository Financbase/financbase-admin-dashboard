import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/src/test/test-utils'
import { MetricsCard, MetricData } from '@/components/core/metrics-card'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	Activity: ({ className }: { className?: string }) => React.createElement('div', { className: `${className} lucide-activity` }, '📊'),
	TrendingUp: ({ className }: { className?: string }) => React.createElement('div', { className: `${className} lucide-trending-up` }, '↗'),
	TrendingDown: ({ className }: { className?: string }) => React.createElement('div', { className: `${className} lucide-trending-down` }, '↘'),
	Minus: ({ className }: { className?: string }) => React.createElement('div', { className: `${className} lucide-minus` }, '-'),
}))

describe('MetricsCard', () => {
	const mockMetrics: MetricData[] = [
		{
			title: 'Revenue',
			value: 45231.89,
			format: 'currency',
			change: 20.1,
			changeType: 'increase',
			color: 'green',
		},
		{
			title: 'Users',
			value: 1234,
			format: 'number',
			change: -5.2,
			changeType: 'decrease',
			color: 'blue',
		},
		{
			title: 'Conversion Rate',
			value: 3.45,
			format: 'percentage',
			changeType: 'neutral',
			color: 'yellow',
		},
	]

	it('renders the card with title and metrics', async () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} />)

		await waitFor(() => {
			expect(screen.getByText('Test Metrics')).toBeInTheDocument()
			expect(screen.getByText('Revenue')).toBeInTheDocument()
			expect(screen.getByText('Users')).toBeInTheDocument()
			expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('formats currency values correctly', async () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[0]]} />)

		await waitFor(() => {
			expect(screen.getByText('$45,231.89')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('formats number values correctly', async () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[1]]} />)

		await waitFor(() => {
			expect(screen.getByText('1,234')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('formats percentage values correctly', async () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[2]]} />)

		await waitFor(() => {
			expect(screen.getByText('3.5%')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('displays change indicators correctly', async () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} />)

		await waitFor(() => {
			// Check for increase indicator
			expect(screen.getByText('20.1%')).toBeInTheDocument()

			// Check for decrease indicator
			expect(screen.getByText('5.2%')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('applies correct color classes', () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} />)

		// Check that the metric cards have the correct background colors
		const metricCards = document.querySelectorAll('[class*="bg-green-50"], [class*="bg-blue-50"], [class*="bg-yellow-50"]')
		expect(metricCards.length).toBeGreaterThan(0)
	})

	it('supports different column layouts', () => {
		const { rerender } = render(<MetricsCard title="Test Metrics" metrics={mockMetrics} columns={1} />)

		// Check for single column layout
		let gridElement = document.querySelector('[class*="grid-cols-1"]')
		expect(gridElement).toBeInTheDocument()

		// Test 2 columns
		rerender(<MetricsCard title="Test Metrics" metrics={mockMetrics} columns={2} />)
		gridElement = document.querySelector('[class*="md:grid-cols-2"]')
		expect(gridElement).toBeInTheDocument()

		// Test 3 columns
		rerender(<MetricsCard title="Test Metrics" metrics={mockMetrics} columns={3} />)
		gridElement = document.querySelector('[class*="lg:grid-cols-3"]')
		expect(gridElement).toBeInTheDocument()
	})

	it('displays previous values when provided', async () => {
		const metricWithPrevious: MetricData = {
			title: 'Revenue',
			value: 45231.89,
			previousValue: 38000,
			format: 'currency',
		}

		render(<MetricsCard title="Test Metrics" metrics={[metricWithPrevious]} />)

		await waitFor(() => {
			expect(screen.getByText('Previous: $38,000.00')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('handles empty metrics array', () => {
		render(<MetricsCard title="Empty Metrics" metrics={[]} />)

		expect(screen.getByText('Empty Metrics')).toBeInTheDocument()
		// Should not crash and should still render the card structure
		expect(document.querySelector('.grid')).toBeInTheDocument()
	})

	it('applies custom className', () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} className="custom-class" />)

		const card = document.querySelector('.custom-class')
		expect(card).toBeInTheDocument()
	})
})