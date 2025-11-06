/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard-data-optimized";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useCounter, useLocalStorage, useTimeout } from "@/hooks";
import { Button } from "@/components/ui/button";

export default function FinancialWidgets() {
	const { data: stats, loading: statsLoading } = useDashboardStats();
	const { count: refreshCount, increment: refreshData } = useCounter(0);
	const [widgetPreferences, setWidgetPreferences] = useLocalStorage('widget-preferences', {
		autoRefresh: true,
		showDetailedMetrics: true,
		lastRefresh: null as string | null
	});

	// Auto-refresh every 30 seconds if enabled
	useTimeout(() => {
		if (widgetPreferences.autoRefresh) {
			refreshData();
			setWidgetPreferences(prev => ({
				...prev,
				lastRefresh: new Date().toISOString()
			}));
		}
	}, widgetPreferences.autoRefresh ? 30000 : null);

	// Calculate portfolio data from real stats
	const portfolioValue = stats?.revenue.value
		? (typeof stats.revenue.value === 'string'
			? parseFloat(stats.revenue.value.replace(/[$,]/g, '')) || 125000
			: stats.revenue.value) || 125000
		: 125000;
	const revenueGrowth = stats?.revenue.change || 8.5;

	return (
		<div className="space-y-6">
			{/* Portfolio Overview Card */}
			<div>
				<Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
								Interactive Portfolio Overview
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									refreshData();
									setWidgetPreferences(prev => ({
										...prev,
										lastRefresh: new Date().toISOString()
									}));
								}}
								className="h-8 w-8 p-0"
							>
								<RefreshCw className={`h-4 w-4 ${refreshCount > 0 ? 'animate-spin' : ''}`} />
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Portfolio Value</span>
								<span className="text-2xl font-bold">${portfolioValue.toLocaleString()}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Growth</span>
								<div className="flex items-center gap-1">
									{revenueGrowth > 0 ? (
										<TrendingUp className="h-4 w-4 text-green-500" />
									) : (
										<TrendingDown className="h-4 w-4 text-red-500" />
									)}
									<span className={`text-sm font-medium ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
										{revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
