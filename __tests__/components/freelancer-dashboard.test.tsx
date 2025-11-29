import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@/src/test/test-utils'
import { FreelancerDashboardOverview } from '@/components/freelancer/dashboard-overview'

// Note: lucide-react is mocked globally in __tests__/setup.ts
// No need for a local mock here

// Mock fetch
global.fetch = vi.fn()

describe('FreelancerDashboardOverview', () => {
	const mockDashboardData = {
		success: true,
		data: {
			topFreelancers: [
				{ id: '1', name: 'Sarah Ahmed', skill: 'Web Development', rating: 4.9, earnings: '$12,500', projects: 15, avatar: '/avatars/sarah.jpg' },
				{ id: '2', name: 'Rahul Sharma', skill: 'Mobile Development', rating: 4.8, earnings: '$10,200', projects: 12, avatar: '/avatars/rahul.jpg' },
				{ id: '3', name: 'Fatima Khan', skill: 'UI/UX Design', rating: 4.7, earnings: '$9,800', projects: 10, avatar: '/avatars/fatima.jpg' },
			],
			dashboardStats: {
				total_users: 1250,
				active_jobs: 45,
				completed_projects: 320,
				platform_earnings: 125000,
				total_revenue: 250000,
			},
			recentJobs: [],
			recentActivities: [],
		},
	}

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockDashboardData,
		} as Response)
	})

	it('renders freelancer dashboard', async () => {
		await act(async () => {
			render(<FreelancerDashboardOverview />)
		})
		
		// Component should render without errors
		await waitFor(() => {
			expect(document.body).toBeInTheDocument()
		})
	})

	it('displays platform metrics', async () => {
		await act(async () => {
			render(<FreelancerDashboardOverview />)
		})

		await waitFor(() => {
			// Check for metric labels
			expect(screen.getByText('Total Users')).toBeInTheDocument()
			expect(screen.getByText('Active Jobs')).toBeInTheDocument()
			expect(screen.getByText('Completed Projects')).toBeInTheDocument()
			expect(screen.getByText('Platform Earnings')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('shows top freelancers section', async () => {
		await act(async () => {
			render(<FreelancerDashboardOverview />)
		})

		await waitFor(() => {
			expect(screen.getByText('Top Freelancers This Week')).toBeInTheDocument()
			// Use getAllByText since names appear multiple times in the UI
			expect(screen.getAllByText('Sarah Ahmed').length).toBeGreaterThan(0)
			expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
			expect(screen.getAllByText('Fatima Khan').length).toBeGreaterThan(0)
		}, { timeout: 3000 })
	})

	it('displays freelancer skills correctly', async () => {
		await act(async () => {
			render(<FreelancerDashboardOverview />)
		})

		await waitFor(() => {
			expect(screen.getByText('Web Development')).toBeInTheDocument()
			expect(screen.getByText('Mobile Development')).toBeInTheDocument()
			expect(screen.getByText('UI/UX Design')).toBeInTheDocument()
		}, { timeout: 3000 })
	})

	it('shows recent activities section', async () => {
		await act(async () => {
			render(<FreelancerDashboardOverview />)
		})

		await waitFor(() => {
			expect(screen.getByText('Recent Activities')).toBeInTheDocument()
		}, { timeout: 3000 })
	})
})
