"use client";

// Export all analytics components
export { default as CohortsDashboard } from './cohorts-dashboard';
export { default as AdvancedRealtimeDashboard } from './advanced-realtime-dashboard';
export { default as SegmentsDashboard } from './segments-dashboard';

// Advanced Analytics Features
export { default as PredictiveDashboard } from './predictive-dashboard';
export { ReportBuilder } from './report-builder';
export { BenchmarkingInsights } from './benchmarking-insights';

// Chart Components
export {
	InteractiveChart,
	RevenueChart,
	ExpenseBreakdownChart,
	KPIOverviewCards,
	ChartConfig,
	ChartDataPoint
} from './advanced-charts';

// Placeholder for additional analytics components
export function AnalyticsTemplates() {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Analytics Templates</h2>
			<p className="text-muted-foreground">Pre-built analytics templates coming soon</p>
		</div>
	);
}

