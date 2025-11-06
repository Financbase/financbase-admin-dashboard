/**
 * Budget Details Dialog Component
 * Displays detailed information about a budget
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, Edit, AlertCircle, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface BudgetDetailsDialogProps {
	budgetId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit?: (id: number) => void;
}

export function BudgetDetailsDialog({ budgetId, open, onOpenChange, onEdit }: BudgetDetailsDialogProps) {
	const { data: budgetResponse, isLoading, error } = useQuery({
		queryKey: ['budget', budgetId],
		queryFn: async () => {
			if (!budgetId) return null;
			const response = await fetch(`/api/budgets/${budgetId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch budget details');
			}
			return response.json();
		},
		enabled: open && budgetId !== null,
	});

	const budget = budgetResponse?.data;

	const formatCurrency = (amount: number | string, currency: string = 'USD') => {
		const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD',
		}).format(numAmount);
	};

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

	if (!budgetId) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Budget Details</DialogTitle>
							<DialogDescription>
								View detailed information about your budget
							</DialogDescription>
						</div>
						{onEdit && budget && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									onEdit(budget.id);
									onOpenChange(false);
								}}
							>
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</Button>
						)}
					</div>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : error ? (
					<div className="text-center py-8">
						<p className="text-destructive">Failed to load budget details</p>
					</div>
				) : budget ? (
					<div className="space-y-6">
						{/* Budget Overview */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{budget.name}</CardTitle>
									<div className="flex items-center gap-2">
										{statusIcons[budget.status]}
										<Badge variant={statusColors[budget.status]}>
											{statusLabels[budget.status]}
										</Badge>
									</div>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">{budget.category}</p>
									{budget.description && (
										<p className="text-sm text-muted-foreground">{budget.description}</p>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Progress Bar */}
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span>Spending Progress</span>
										<span className="font-medium">
											{Math.min(budget.spendingPercentage || 0, 100).toFixed(1)}%
										</span>
									</div>
									<Progress 
										value={Math.min(budget.spendingPercentage || 0, 100)} 
										className="h-3" 
									/>
								</div>

								{/* Financial Summary */}
								<div className="grid grid-cols-3 gap-4 pt-4 border-t">
									<div className="space-y-1">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<DollarSign className="h-4 w-4" />
											Budgeted
										</div>
										<p className="text-xl font-semibold">
											{formatCurrency(Number(budget.budgetedAmount), budget.currency)}
										</p>
									</div>
									<div className="space-y-1">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Receipt className="h-4 w-4" />
											Spent
										</div>
										<p className={`text-xl font-semibold ${budget.spendingPercentage >= 100 ? 'text-destructive' : ''}`}>
											{formatCurrency(budget.spentAmount || 0, budget.currency)}
										</p>
									</div>
									<div className="space-y-1">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											{budget.remainingAmount >= 0 ? (
												<TrendingDown className="h-4 w-4 text-green-500" />
											) : (
												<TrendingUp className="h-4 w-4 text-red-500" />
											)}
											Remaining
										</div>
										<p className={`text-xl font-semibold ${
											budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'
										}`}>
											{budget.remainingAmount >= 0 ? '+' : ''}
											{formatCurrency(Math.abs(budget.remainingAmount || 0), budget.currency)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Budget Period */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Budget Period
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Start Date</p>
										<p className="font-medium">
											{format(new Date(budget.startDate), 'MMM dd, yyyy')}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">End Date</p>
										<p className="font-medium">
											{format(new Date(budget.endDate), 'MMM dd, yyyy')}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Period Type</p>
										<Badge variant="outline" className="capitalize">
											{budget.periodType}
										</Badge>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Transactions</p>
										<p className="font-medium">
											{budget.transactionCount || 0} transactions
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Alert Thresholds */}
						{budget.alertThresholds && Array.isArray(budget.alertThresholds) && budget.alertThresholds.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										Alert Thresholds
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2 flex-wrap">
										{budget.alertThresholds.map((threshold: number, index: number) => (
											<Badge key={index} variant="outline">
												{threshold}%
											</Badge>
										))}
									</div>
									<p className="text-xs text-muted-foreground mt-2">
										Alerts will trigger when spending reaches these percentages
									</p>
								</CardContent>
							</Card>
						)}

						{/* Tags */}
						{budget.tags && Array.isArray(budget.tags) && budget.tags.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<Tag className="h-4 w-4" />
										Tags
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2 flex-wrap">
										{budget.tags.map((tag: string, index: number) => (
											<Badge key={index} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Additional Information */}
						{budget.notes && (
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<FileText className="h-4 w-4" />
										Notes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground whitespace-pre-wrap">
										{budget.notes}
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
