/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	useDashboardLastUpdated,
	useDashboardRefresh,
} from "@/contexts/dashboard-context";
import { format } from "date-fns";
import { toast } from "@/lib/toast";
import { Clock, Download, LayoutDashboard, RefreshCw } from "lucide-react";
import { memo, useCallback } from "react";
import DateRangePicker from "./date-range-picker";

interface DashboardHeaderProps {
	className?: string;
}

const DashboardHeader = memo(function DashboardHeader({
	className,
}: DashboardHeaderProps) {
	const { triggerRefresh, autoRefresh, setAutoRefresh } = useDashboardRefresh();
	const { lastUpdated } = useDashboardLastUpdated();

	const handleRefresh = useCallback(() => {
		triggerRefresh();
	}, [triggerRefresh]);

	const handleExport = useCallback(async () => {
		try {
			// Fetch dashboard data for export
			const response = await fetch('/api/dashboard/export');
			
			if (!response.ok) {
				throw new Error('Failed to export dashboard data');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			
			// Generate filename with current date
			const dateStr = new Date().toISOString().split('T')[0];
			a.download = `dashboard-export-${dateStr}.csv`;
			
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
			
			toast.success(
				'Dashboard exported',
				'Your dashboard data has been exported successfully.'
			);
		} catch (error) {
			console.error('Error exporting dashboard:', error);
			toast.error(
				'Export failed',
				'Unable to export dashboard data. Please try again.'
			);
		}
	}, []);

	return (
		<div
			className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
		>
			<div className="space-y-1">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Dashboard Overview
				</h1>
				{lastUpdated && (
					<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
						<Clock className="mr-1 h-3 w-3" />
						Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
					</div>
				)}
			</div>

			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
				{/* Date Range Picker */}
				<div className="w-full sm:w-auto">
					<DateRangePicker />
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}
						className="flex items-center gap-2"
					>
						<Download className="h-4 w-4" />
						Export
					</Button>

					<Button
						variant={autoRefresh ? "default" : "outline"}
						size="sm"
						onClick={() => setAutoRefresh(!autoRefresh)}
						className="flex items-center gap-2"
					>
						<div
							className={
								`h-2 w-2 rounded-full ${autoRefresh}`
									? "bg-green-500"
									: "bg-gray-400"
							}
						/>
						Auto-refresh
					</Button>
				</div>
			</div>
		</div>
	);
});

export default DashboardHeader;
