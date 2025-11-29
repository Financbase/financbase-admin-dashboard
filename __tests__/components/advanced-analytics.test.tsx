import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import PredictiveDashboard from '@/components/analytics/predictive-dashboard';
import { ReportBuilder } from '@/components/analytics/report-builder';
import { BenchmarkingInsights } from '@/components/analytics/benchmarking-insights';
import { InvestorPortalManager } from '@/components/investor-portal/investor-portal-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Unmock QueryClientProvider to use the real implementation
vi.unmock('@tanstack/react-query');

// Create a test QueryClient
const createTestQueryClient = () => new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			gcTime: 0, // Use gcTime instead of cacheTime (React Query v5)
		},
	},
});

// ResizeObserver is already mocked globally in setup.ts

describe('Advanced Analytics Components', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = createTestQueryClient();
	});

	it('should render PredictiveDashboard without errors', async () => {
		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<PredictiveDashboard />
			</QueryClientProvider>
		);
		await waitFor(() => {
			expect(container.firstChild).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should render ReportBuilder without errors', async () => {
		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<ReportBuilder />
			</QueryClientProvider>
		);
		await waitFor(() => {
			expect(container.firstChild).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should render BenchmarkingInsights without errors', async () => {
		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<BenchmarkingInsights />
			</QueryClientProvider>
		);
		await waitFor(() => {
			expect(container.firstChild).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should render InvestorPortalManager without errors', async () => {
		// InvestorPortalManager uses useQueryClient, so it needs QueryClientProvider
		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<InvestorPortalManager />
			</QueryClientProvider>
		);
		await waitFor(() => {
			expect(container.firstChild).toBeInTheDocument();
		}, { timeout: 3000 });
	});
});
