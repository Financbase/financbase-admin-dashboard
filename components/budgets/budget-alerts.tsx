/**
 * Budget Alerts Component
 * Displays budget alerts based on spending thresholds
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetAlert {
	id: number;
	budgetId: number;
	alertType: 'warning' | 'critical' | 'over-budget';
	message: string;
	spendingPercentage: string;
	budgetedAmount: string;
	spentAmount: string;
	remainingAmount: string;
	isRead: boolean;
	triggeredAt: Date;
}

export function BudgetAlerts() {
	const { data: alerts, isLoading } = useQuery<BudgetAlert[]>({
		queryKey: ['budget-alerts'],
		queryFn: async () => {
			const response = await fetch('/api/budgets/alerts');
			if (!response.ok) {
				throw new Error('Failed to fetch alerts');
			}
			const result = await response.json();
			return result.data || [];
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Budget Alerts
					</CardTitle>
					<CardDescription>Loading alerts...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (!alerts || alerts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5 text-green-500" />
						Budget Alerts
					</CardTitle>
					<CardDescription>No active budget alerts</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">All budgets are within their allocated limits.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5" />
					Budget Alerts
				</CardTitle>
				<CardDescription>
					Important notifications about your budget status
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{alerts.map((alert) => {
					const iconColor = 
						alert.alertType === 'over-budget' ? 'text-red-500' :
						alert.alertType === 'critical' ? 'text-orange-500' :
						'text-yellow-500';

					return (
						<div
							key={alert.id}
							className="flex items-center justify-between p-3 rounded-lg border"
						>
							<div className="flex items-center gap-3">
								<AlertTriangle className={`h-4 w-4 ${iconColor}`} />
								<span className="text-sm">{alert.message}</span>
							</div>
							{alert.alertType === 'over-budget' && (
								<Button variant="outline" size="sm">
									Review Expenses
								</Button>
							)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}

