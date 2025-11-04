/**
 * Reports Page
 * Main page for report management and generation
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { ReportList } from '@/components/reports/report-list';

export default function ReportsPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Reports</h1>
					<p className="text-muted-foreground">
					Generate and manage financial reports
					</p>
			</div>

			<ReportList />
		</div>
	);
}
