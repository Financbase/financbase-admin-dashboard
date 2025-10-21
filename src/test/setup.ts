import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: vi.fn(),
			prefetch: vi.fn(),
			replace: vi.fn(),
			back: vi.fn(),
			forward: vi.fn(),
			refresh: vi.fn(),
			pathname: '/',
			query: {},
		}
	},
	usePathname() {
		return '/'
	},
	useSearchParams() {
		return new URLSearchParams()
	},
}))

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
	ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
	useUser: () => ({
		isLoaded: true,
		isSignedIn: true,
		user: {
			id: 'test-user-id',
			email: 'test@example.com',
			firstName: 'Test',
			lastName: 'User',
		},
	}),
	useAuth: () => ({
		isLoaded: true,
		isSignedIn: true,
		userId: 'test-user-id',
	}),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-key'
process.env.CLERK_SECRET_KEY = 'test-clerk-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock PostHog
vi.mock('@/lib/analytics/posthog-service', () => ({
	AnalyticsService: {
		init: vi.fn(),
		track: vi.fn(),
		pageView: vi.fn(),
		trackUserAction: vi.fn(),
		trackFinancialEvent: vi.fn(),
		trackFeatureUsage: vi.fn(),
		trackError: vi.fn(),
		trackPerformance: vi.fn(),
		identify: vi.fn(),
		setUserProperties: vi.fn(),
		reset: vi.fn(),
		trackConversion: vi.fn(),
	},
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}))

// Mock WebSocket for tests
global.WebSocket = vi.fn().mockImplementation(() => ({
	send: vi.fn(),
	close: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
}))
