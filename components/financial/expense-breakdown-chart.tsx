/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Expense Breakdown Chart
 * Shows expense distribution by category
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CreditCard } from 'lucide-react';

interface ExpenseBreakdownChartProps {
	data?: Array<{
		category: string;
		amount: number;
		color?: string;
	}>;
	className?: string;
}

const DEFAULT_COLORS = [
	'hsl(var(--chart-1))',
	'hsl(var(--chart-2))',
	'hsl(var(--chart-3))',
	'hsl(var(--chart-4))',
	'hsl(var(--chart-5))',
];

export function ExpenseBreakdownChart({ data, className }: ExpenseBreakdownChartProps) {
	// Placeholder data - replace with actual data from API
	const chartData = data || [
		{ category: 'Payroll', amount: 35000, color: DEFAULT_COLORS[0] },
		{ category: 'Marketing', amount: 12000, color: DEFAULT_COLORS[1] },
		{ category: 'Operations', amount: 18000, color: DEFAULT_COLORS[2] },
		{ category: 'Software', amount: 8000, color: DEFAULT_COLORS[3] },
		{ category: 'Other', amount: 5234, color: DEFAULT_COLORS[4] },
	];

	const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Expense Breakdown
				</CardTitle>
				<CardDescription>
					Distribution of expenses by category
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col md:flex-row items-center gap-6">
					{/* Pie Chart */}
					<div className="w-full md:w-1/2">
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ category, percent }) => 
										`${category} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill="#8884d8"
									dataKey="amount"
								>
									{chartData.map((entry, index) => (
										<Cell 
											key={`cell-${index}`} 
											fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
										/>
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'hsl(var(--card))',
										border: '1px solid hsl(var(--border))',
										borderRadius: '8px',
									}}
									formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* Category List */}
					<div className="w-full md:w-1/2 space-y-3">
						<div className="text-center md:text-left mb-4">
							<div className="text-sm text-muted-foreground">Total Expenses</div>
							<div className="text-2xl font-bold">
								${totalExpenses.toLocaleString()}
							</div>
						</div>
						{chartData.map((item, index) => {
							const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
							return (
								<div key={item.category} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ 
												backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] 
											}}
										/>
										<span className="text-sm font-medium">{item.category}</span>
									</div>
									<div className="text-right">
										<div className="text-sm font-semibold">
											${item.amount.toLocaleString()}
										</div>
										<div className="text-xs text-muted-foreground">
											{percentage}%
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

