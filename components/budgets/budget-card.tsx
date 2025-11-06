/**
 * Budget Card Component
 * Displays a single budget with spending information
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, TrendingDown, Eye, Edit } from 'lucide-react';

interface BudgetCardProps {
	budget: {
		id: number;
		name: string;
		category: string;
		budgetedAmount: string;
		spentAmount: number;
		remainingAmount: number;
		spendingPercentage: number;
		status: 'good' | 'warning' | 'critical' | 'over-budget';
		transactionCount: number;
		periodType: string;
		startDate: Date;
		endDate: Date;
	};
	onViewDetails?: (id: number) => void;
	onEdit?: (id: number) => void;
}

export function BudgetCard({ budget, onViewDetails, onEdit }: BudgetCardProps) {
	const budgetedAmount = Number(budget.budgetedAmount);
	const percentage = Math.min(budget.spendingPercentage, 100);
	
	const statusColors = {
		good: 'default',
		warning: 'secondary',
		critical: 'secondary',
		'over-budget': 'destructive',
	} as const;

	const statusLabels = {
		good: 'On Track',
		warning: 'Warning',
		critical: 'Critical',
		'over-budget': 'Over Budget',
	} as const;

	const statusIcons = {
		good: <Target className="h-4 w-4 text-blue-500" />,
		warning: <TrendingUp className="h-4 w-4 text-yellow-500" />,
		critical: <TrendingUp className="h-4 w-4 text-orange-500" />,
		'over-budget': <TrendingUp className="h-4 w-4 text-red-500" />,
	} as const;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">{budget.name}</CardTitle>
					<div className="flex items-center gap-2">
						{statusIcons[budget.status]}
						<Badge variant={statusColors[budget.status]}>
							{statusLabels[budget.status]}
						</Badge>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">{budget.category}</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span>Progress</span>
						<span className="font-medium">{percentage.toFixed(1)}%</span>
					</div>
					<Progress value={percentage} className="h-2" />
				</div>
				<div className="grid grid-cols-3 gap-4 text-sm">
					<div>
						<p className="text-muted-foreground">Budgeted</p>
						<p className="font-medium">${budgetedAmount.toLocaleString()}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Spent</p>
						<p className="font-medium">${budget.spentAmount.toLocaleString()}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Remaining</p>
						<p className={`font-medium ${budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
							{budget.remainingAmount >= 0 ? '+' : ''}${Math.abs(budget.remainingAmount).toLocaleString()}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-between pt-2 border-t">
					<span className="text-sm text-muted-foreground">
						{budget.transactionCount} transactions
					</span>
					<div className="flex gap-2">
						{onViewDetails && (
							<Button variant="ghost" size="sm" onClick={() => onViewDetails(budget.id)}>
								<Eye className="h-4 w-4 mr-1" />
								View
							</Button>
						)}
						{onEdit && (
							<Button variant="ghost" size="sm" onClick={() => onEdit(budget.id)}>
								<Edit className="h-4 w-4 mr-1" />
								Edit
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

