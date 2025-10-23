"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	DollarSign,
	TrendingUp,
	Users,
	Package,
	Calendar,
	Download,
	RefreshCw,
	BarChart3,
	PieChart,
	Activity,
	Target,
	Coins,
	Receipt
} from 'lucide-react';

interface DeveloperEarnings {
	totalEarnings: number;
	pendingPayouts: number;
	paidPayouts: number;
	monthlyEarnings: number;
	transactions: number;
}

interface PluginPerformance {
	pluginId: string;
	pluginName: string;
	installations: number;
	revenue: number;
	rating: number;
	status: string;
}

const SAMPLE_EARNINGS: DeveloperEarnings = {
	totalEarnings: 2847.50,
	pendingPayouts: 234.75,
	paidPayouts: 2612.75,
	monthlyEarnings: 456.25,
	transactions: 1247,
};

const SAMPLE_PLUGINS: PluginPerformance[] = [
	{
		pluginId: '1',
		pluginName: 'Advanced Reporting',
		installations: 245,
		revenue: 1837.50,
		rating: 4.8,
		status: 'active',
	},
	{
		pluginId: '2',
		pluginName: 'Invoice Automation',
		installations: 189,
		revenue: 1010.00,
		rating: 4.9,
		status: 'active',
	},
];

export function DeveloperEarnings() {
	const [selectedPeriod, setSelectedPeriod] = useState('month');
	const [selectedPlugin, setSelectedPlugin] = useState('all');

	// Fetch developer earnings
	const { data: earnings = SAMPLE_EARNINGS } = useQuery({
		queryKey: ['developer-earnings', selectedPeriod],
		queryFn: async () => {
			const response = await fetch(`/api/marketplace/revenue?type=developer&period=${selectedPeriod}`);
			return response.json();
		},
	});

	// Fetch plugin performance
	const { data: plugins = SAMPLE_PLUGINS } = useQuery({
		queryKey: ['plugin-performance', selectedPeriod],
		queryFn: async () => {
			const response = await fetch(`/api/marketplace/revenue?type=plugins&period=${selectedPeriod}`);
			return response.json();
		},
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const getPercentageChange = (current: number, previous: number) => {
		if (previous === 0) return 0;
		return ((current - previous) / previous) * 100;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Developer Earnings</h2>
					<p className="text-muted-foreground">
						Track your plugin revenue and performance metrics
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="month">This Month</SelectItem>
							<SelectItem value="quarter">This Quarter</SelectItem>
							<SelectItem value="year">This Year</SelectItem>
							<SelectItem value="all">All Time</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Export
					</Button>
					<Button variant="outline">
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Earnings Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Earnings</p>
								<p className="text-xl font-bold">{formatCurrency(earnings.totalEarnings)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-yellow-600" />
							<div>
								<p className="text-sm text-muted-foreground">Pending Payout</p>
								<p className="text-xl font-bold">{formatCurrency(earnings.pendingPayouts)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">This Month</p>
								<p className="text-xl font-bold">{formatCurrency(earnings.monthlyEarnings)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Receipt className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Transactions</p>
								<p className="text-xl font-bold">{earnings.transactions.toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="plugins">Plugin Performance</TabsTrigger>
					<TabsTrigger value="payouts">Payout History</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2">
						{/* Revenue Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<PieChart className="mr-2 h-5 w-5" />
									Revenue Breakdown
								</CardTitle>
								<CardDescription>
									How your earnings are distributed
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-green-500"></div>
											<span className="text-sm">Developer Share (70%)</span>
										</div>
										<span className="font-medium">{formatCurrency(earnings.totalEarnings * 0.7)}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-blue-500"></div>
											<span className="text-sm">Platform Fee (30%)</span>
										</div>
										<span className="font-medium">{formatCurrency(earnings.totalEarnings * 0.3)}</span>
									</div>
									<div className="flex items-center justify-between pt-2 border-t">
										<span className="font-medium">Total Revenue</span>
										<span className="font-bold">{formatCurrency(earnings.totalEarnings)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Activity className="mr-2 h-5 w-5" />
									Recent Activity
								</CardTitle>
								<CardDescription>
									Latest transactions and payouts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
										<div>
											<p className="font-medium">Payout Received</p>
											<p className="text-sm text-muted-foreground">Advanced Reporting plugin</p>
										</div>
										<div className="text-right">
											<p className="font-medium">+{formatCurrency(156.75)}</p>
											<p className="text-sm text-muted-foreground">2 days ago</p>
										</div>
									</div>

									<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
										<div>
											<p className="font-medium">New Installation</p>
											<p className="text-sm text-muted-foreground">Invoice Automation plugin</p>
										</div>
										<div className="text-right">
											<p className="font-medium">+{formatCurrency(29.00)}</p>
											<p className="text-sm text-muted-foreground">5 days ago</p>
										</div>
									</div>

									<div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
										<div>
											<p className="font-medium">Pending Payout</p>
											<p className="text-sm text-muted-foreground">Monthly subscription fees</p>
										</div>
										<div className="text-right">
											<p className="font-medium">{formatCurrency(234.75)}</p>
											<p className="text-sm text-muted-foreground">Expected in 3 days</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Performance Metrics */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<BarChart3 className="mr-2 h-5 w-5" />
								Performance Metrics
							</CardTitle>
							<CardDescription>
								Key performance indicators for your plugins
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{plugins.reduce((sum, p) => sum + p.installations, 0)}
									</div>
									<div className="text-sm text-muted-foreground">Total Installations</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{formatCurrency(plugins.reduce((sum, p) => sum + p.revenue, 0))}
									</div>
									<div className="text-sm text-muted-foreground">Total Revenue</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{(plugins.reduce((sum, p) => sum + p.rating, 0) / plugins.length).toFixed(1)}
									</div>
									<div className="text-sm text-muted-foreground">Average Rating</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Plugin Performance Tab */}
				<TabsContent value="plugins" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Package className="mr-2 h-5 w-5" />
								Plugin Performance
							</CardTitle>
							<CardDescription>
								Individual plugin metrics and revenue
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Plugin</TableHead>
										<TableHead>Installations</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Rating</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{plugins.map((plugin) => (
										<TableRow key={plugin.pluginId}>
											<TableCell>
												<div>
													<p className="font-medium">{plugin.pluginName}</p>
													<p className="text-sm text-muted-foreground">
														{plugin.installations} active users
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4 text-blue-600" />
													<span>{plugin.installations}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<DollarSign className="h-4 w-4 text-green-600" />
													<span>{formatCurrency(plugin.revenue)}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="text-yellow-600">★</span>
													<span>{plugin.rating}</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge className="bg-green-100 text-green-800">
													{plugin.status}
												</Badge>
											</TableCell>
											<TableCell>
												<Button variant="outline" size="sm">
													View Details
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Payout History Tab */}
				<TabsContent value="payouts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Calendar className="mr-2 h-5 w-5" />
								Payout History
							</CardTitle>
							<CardDescription>
								Track your payout history and upcoming payments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div>
										<p className="font-medium">October 2024 Payout</p>
										<p className="text-sm text-muted-foreground">Paid on November 1st</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-green-600">+{formatCurrency(342.50)}</p>
										<Badge className="bg-green-100 text-green-800">Paid</Badge>
									</div>
								</div>

								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div>
										<p className="font-medium">September 2024 Payout</p>
										<p className="text-sm text-muted-foreground">Paid on October 1st</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-green-600">+{formatCurrency(298.75)}</p>
										<Badge className="bg-green-100 text-green-800">Paid</Badge>
									</div>
								</div>

								<div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
									<div>
										<p className="font-medium">November 2024 Payout</p>
										<p className="text-sm text-muted-foreground">Expected on December 1st</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-yellow-600">{formatCurrency(234.75)}</p>
										<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Analytics Tab */}
				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Revenue Trend</CardTitle>
								<CardDescription>Monthly revenue over the last 6 months</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">Revenue chart coming soon</p>
									<p className="text-sm text-muted-foreground mt-2">
										Advanced analytics and reporting features will be available in the next update.
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Installation Growth</CardTitle>
								<CardDescription>User adoption metrics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">Growth chart coming soon</p>
									<p className="text-sm text-muted-foreground mt-2">
										Track installation trends and user engagement metrics.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Top Performing Features</CardTitle>
							<CardDescription>Most popular plugin features by usage</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-blue-600" />
										<span>Advanced Reporting</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">85% usage</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
											<div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Coins className="h-4 w-4 text-green-600" />
										<span>Invoice Automation</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">72% usage</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
											<div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Activity className="h-4 w-4 text-purple-600" />
										<span>Real-time Sync</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">58% usage</span>
										<div className="w-20 bg-gray-200 rounded-full h-2">
											<div className="bg-purple-600 h-2 rounded-full" style={{ width: '58%' }}></div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
