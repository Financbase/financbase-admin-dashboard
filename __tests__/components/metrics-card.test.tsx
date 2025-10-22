import { describe, it, expect } from 'vitest'
import { render, screen } from '@/src/test/test-utils'
import { MetricsCard, MetricData } from '@/components/core/metrics-card'

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

	it('renders the card with title and metrics', () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} />)

		expect(screen.getByText('Test Metrics')).toBeInTheDocument()
		expect(screen.getByText('Revenue')).toBeInTheDocument()
		expect(screen.getByText('Users')).toBeInTheDocument()
		expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
	})

	it('formats currency values correctly', () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[0]]} />)

		expect(screen.getByText('$45,231.89')).toBeInTheDocument()
	})

	it('formats number values correctly', () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[1]]} />)

		expect(screen.getByText('1,234')).toBeInTheDocument()
	})

	it('formats percentage values correctly', () => {
		render(<MetricsCard title="Test Metrics" metrics={[mockMetrics[2]]} />)

		expect(screen.getByText('3.5%')).toBeInTheDocument()
	})

	it('displays change indicators correctly', () => {
		render(<MetricsCard title="Test Metrics" metrics={mockMetrics} />)

		// Check for increase indicator
		expect(screen.getByText('20.1%')).toBeInTheDocument()

		// Check for decrease indicator
		expect(screen.getByText('5.2%')).toBeInTheDocument()
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

	it('displays previous values when provided', () => {
		const metricWithPrevious: MetricData = {
			title: 'Revenue',
			value: 45231.89,
			previousValue: 38000,
			format: 'currency',
		}

		render(<MetricsCard title="Test Metrics" metrics={[metricWithPrevious]} />)

		expect(screen.getByText('Previous: $38,000.00')).toBeInTheDocument()
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