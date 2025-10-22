import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@/src/test/test-utils'
import { FreelancerDashboardOverview } from '@/components/freelancer/dashboard-overview'

describe('FreelancerDashboardOverview', () => {
	it('renders freelancer dashboard', () => {
		render(<FreelancerDashboardOverview />)
		
		// Component should render without errors
		expect(document.body).toBeInTheDocument()
	})

	it('displays platform metrics', () => {
		render(<FreelancerDashboardOverview />)

		// Check for metric labels
		expect(screen.getByText('Total Users')).toBeInTheDocument()
		expect(screen.getByText('Active Jobs')).toBeInTheDocument()
		expect(screen.getByText('Completed Projects')).toBeInTheDocument()
		expect(screen.getByText('Platform Earnings')).toBeInTheDocument()
	})

	it('shows top freelancers section', () => {
		render(<FreelancerDashboardOverview />)

		expect(screen.getByText('Top Freelancers This Week')).toBeInTheDocument()
		// Use getAllByText since names appear multiple times in the UI
		expect(screen.getAllByText('Sarah Ahmed').length).toBeGreaterThan(0)
		expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
		expect(screen.getAllByText('Fatima Khan').length).toBeGreaterThan(0)
	})

	it('displays freelancer skills correctly', () => {
		render(<FreelancerDashboardOverview />)

		expect(screen.getByText('Web Development')).toBeInTheDocument()
		expect(screen.getByText('Mobile Development')).toBeInTheDocument()
		expect(screen.getByText('UI/UX Design')).toBeInTheDocument()
	})

	it('shows recent activities section', () => {
		render(<FreelancerDashboardOverview />)

		expect(screen.getByText('Recent Activities')).toBeInTheDocument()
	})
})
