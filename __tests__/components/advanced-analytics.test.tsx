import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PredictiveDashboard from '@/components/analytics/predictive-dashboard';
import { ReportBuilder } from '@/components/analytics/report-builder';
import { BenchmarkingInsights } from '@/components/analytics/benchmarking-insights';
import { InvestorPortalManager } from '@/components/investor-portal/investor-portal-manager';

describe('Advanced Analytics Components', () => {
	it('should render PredictiveDashboard without errors', () => {
		const { container } = render(<PredictiveDashboard />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('should render ReportBuilder without errors', () => {
		const { container } = render(<ReportBuilder />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('should render BenchmarkingInsights without errors', () => {
		const { container } = render(<BenchmarkingInsights />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('should render InvestorPortalManager without errors', () => {
		const { container } = render(<InvestorPortalManager />);
		expect(container.firstChild).toBeInTheDocument();
	});
});
