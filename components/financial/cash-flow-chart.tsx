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
 * Cash Flow Chart
 * Shows cash inflows and outflows over time
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Waves } from 'lucide-react';

interface CashFlowChartProps {
	data?: Array<{
		month: string;
		inflow: number;
		outflow: number;
		net: number;
	}>;
	className?: string;
}

export function CashFlowChart({ data, className }: CashFlowChartProps) {
	// Placeholder data - replace with actual data from API
	const chartData = data || [
		{ month: 'Jan', inflow: 45000, outflow: 38000, net: 7000 },
		{ month: 'Feb', inflow: 52000, outflow: 41000, net: 11000 },
		{ month: 'Mar', inflow: 48000, outflow: 39000, net: 9000 },
		{ month: 'Apr', inflow: 61000, outflow: 45000, net: 16000 },
		{ month: 'May', inflow: 58000, outflow: 47000, net: 11000 },
		{ month: 'Jun', inflow: 67000, outflow: 52000, net: 15000 },
	];

	const avgNet = chartData.reduce((sum, item) => sum + item.net, 0) / chartData.length;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Waves className="h-5 w-5" />
					Cash Flow
				</CardTitle>
				<CardDescription>
					Monthly cash inflows and outflows
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4 grid grid-cols-3 gap-4 text-center">
					<div>
						<div className="text-xs text-muted-foreground">Avg Inflow</div>
						<div className="text-lg font-bold text-green-600">
							${(chartData.reduce((sum, item) => sum + item.inflow, 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground">Avg Outflow</div>
						<div className="text-lg font-bold text-red-600">
							${(chartData.reduce((sum, item) => sum + item.outflow, 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground">Avg Net</div>
						<div className="text-lg font-bold">
							${avgNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
						</div>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
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
						<ReferenceLine y={0} stroke="hsl(var(--border))" />
						<Bar 
							dataKey="inflow" 
							fill="hsl(var(--chart-2))" 
							name="Cash Inflow"
							radius={[4, 4, 0, 0]}
						/>
						<Bar 
							dataKey="outflow" 
							fill="hsl(var(--chart-5))" 
							name="Cash Outflow"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

