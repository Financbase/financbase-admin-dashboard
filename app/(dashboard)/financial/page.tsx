/**
 * Financial Dashboard Page
 * Main financial overview and analytics
 */

import { FinancialOverviewDashboard } from '@/components/financial/financial-overview-dashboard';

export default function FinancialPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Financial Dashboard</h1>
				<p className="text-muted-foreground">
					Comprehensive view of your financial performance and metrics
				</p>
			</div>

			<FinancialOverviewDashboard />
		</div>
	);
}

