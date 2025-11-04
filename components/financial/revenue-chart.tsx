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
 * Revenue Chart Component
 * Displays revenue trends over time
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RevenueChartProps {
	data?: Array<{
		month: string;
		revenue: number;
		target?: number;
	}>;
	className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
	// Placeholder data - replace with actual data from API
	const chartData = data || [
		{ month: 'Jan', revenue: 45000, target: 50000 },
		{ month: 'Feb', revenue: 52000, target: 50000 },
		{ month: 'Mar', revenue: 48000, target: 50000 },
		{ month: 'Apr', revenue: 61000, target: 55000 },
		{ month: 'May', revenue: 58000, target: 55000 },
		{ month: 'Jun', revenue: 67000, target: 60000 },
		{ month: 'Jul', revenue: 72000, target: 65000 },
		{ month: 'Aug', revenue: 69000, target: 65000 },
		{ month: 'Sep', revenue: 78000, target: 70000 },
		{ month: 'Oct', revenue: 81000, target: 75000 },
		{ month: 'Nov', revenue: 87000, target: 80000 },
		{ month: 'Dec', revenue: 94000, target: 85000 },
	];

	// Calculate growth
	const currentRevenue = chartData[chartData.length - 1]?.revenue || 0;
	const previousRevenue = chartData[chartData.length - 2]?.revenue || 0;
	const growth = previousRevenue > 0 
		? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
		: '0';

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Revenue Trend
						</CardTitle>
						<CardDescription>
							Monthly revenue performance vs targets
						</CardDescription>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold">
							${currentRevenue.toLocaleString()}
						</div>
						<div className="text-sm text-muted-foreground">
							<span className={Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}>
								{Number(growth) >= 0 ? '+' : ''}{growth}%
							</span>
							{' '}from last month
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis 
							dataKey="month" 
							className="text-sm"
							tick={{ fill: 'hsl(var(--muted-foreground))' }}
						/>
						<YAxis 
							className="text-sm"
							tick={{ fill: 'hsl(var(--muted-foreground))' }}
							tickFormatter={(value) => `$${value / 1000}k`}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'hsl(var(--card))',
								border: '1px solid hsl(var(--border))',
								borderRadius: '8px',
							}}
							formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="revenue"
							stroke="hsl(var(--primary))"
							strokeWidth={2}
							dot={{ fill: 'hsl(var(--primary))', r: 4 }}
							activeDot={{ r: 6 }}
							name="Actual Revenue"
						/>
						<Line
							type="monotone"
							dataKey="target"
							stroke="hsl(var(--muted-foreground))"
							strokeWidth={2}
							strokeDasharray="5 5"
							dot={false}
							name="Target"
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

