"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	BarChart3, 
	TrendingUp, 
	Users, 
	DollarSign, 
	CreditCard, 
	FileText,
	Briefcase,
	Target,
	AlertCircle,
	CheckCircle,
	Clock,
	Loader2,
	Settings,
	Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UnifiedMetrics {
	totalRevenue: number;
	totalExpenses: number;
	netIncome: number;
	cashFlow: number;
	totalClients: number;
	activeProjects: number;
	activeCampaigns: number;
	averageInvoiceValue: number;
	paymentSuccessRate: number;
	clientRetentionRate: number;
	projectCompletionRate: number;
	campaignROAS: number;
	revenueGrowth: number;
	clientGrowth: number;
	projectGrowth: number;
	recentInvoices: Array<{
		id: string;
		clientName: string;
		amount: number;
		status: string;
		createdAt: string;
	}>;
	recentTransactions: Array<{
		id: string;
		description: string;
		amount: number;
		type: string;
		createdAt: string;
	}>;
	recentProjects: Array<{
		id: string;
		name: string;
		status: string;
		progress: number;
		updatedAt: string;
	}>;
	recentCampaigns: Array<{
		id: string;
		name: string;
		platform: string;
		spend: number;
		roas: number;
		status: string;
	}>;
}

export default function UnifiedDashboardPage() {
	// Fetch unified metrics
	const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useQuery({
		queryKey: ['unified-metrics'],
		queryFn: async () => {
			const response = await fetch('/api/unified-dashboard/metrics');
			if (!response.ok) throw new Error('Failed to fetch unified metrics');
			return response.json();
		},
	});

	const metrics: UnifiedMetrics = metricsData?.metrics || {
		totalRevenue: 0,
		totalExpenses: 0,
		netIncome: 0,
		cashFlow: 0,
		totalClients: 0,
		activeProjects: 0,
		activeCampaigns: 0,
		averageInvoiceValue: 0,
		paymentSuccessRate: 0,
		clientRetentionRate: 0,
		projectCompletionRate: 0,
		campaignROAS: 0,
		revenueGrowth: 0,
		clientGrowth: 0,
		projectGrowth: 0,
		recentInvoices: [],
		recentTransactions: [],
		recentProjects: [],
		recentCampaigns: [],
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'completed':
			case 'paid':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'overdue':
				return 'destructive';
			case 'active':
				return 'default';
			case 'paused':
				return 'secondary';
			default:
				return 'outline';
		}
	};

	const getTransactionIcon = (type: string) => {
		return type === 'credit' ? (
			<TrendingUp className="h-4 w-4 text-green-600" />
		) : (
			<TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
		);
	};

	if (metricsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (metricsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading unified dashboard: {metricsError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2 mb-2">
						<h1 className="text-3xl font-bold tracking-tight">Unified Dashboard</h1>
						<Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>
					</div>
					<p className="text-muted-foreground">
						All-in-one view of your financial operations and key metrics
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Settings className="mr-2 h-4 w-4" />
						Customize
					</Button>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Widget
					</Button>
				</div>
			</div>

			{/* Key Metrics Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							<h3 className="text-sm font-medium">Total Revenue</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-green-600">↑ {metrics.revenueGrowth}%</span> from last month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5 text-blue-600" />
							<h3 className="text-sm font-medium">Net Income</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${metrics.netIncome.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							${metrics.totalExpenses.toLocaleString()} expenses
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<Users className="h-5 w-5 text-purple-600" />
							<h3 className="text-sm font-medium">Active Clients</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.totalClients}</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-purple-600">↑ {metrics.clientGrowth}%</span> from last month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<Briefcase className="h-5 w-5 text-orange-600" />
							<h3 className="text-sm font-medium">Active Projects</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.activeProjects}</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-orange-600">↑ {metrics.projectGrowth}%</span> from last month
						</p>
					</div>
				</div>
			</div>

			{/* Performance Indicators */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Payment Success Rate</h3>
						<CheckCircle className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.paymentSuccessRate.toFixed(1)}%</div>
						<p className="text-xs text-muted-foreground mt-1">Transaction success rate</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Client Retention</h3>
						<Target className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.clientRetentionRate.toFixed(1)}%</div>
						<p className="text-xs text-muted-foreground mt-1">Client retention rate</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Project Completion</h3>
						<FileText className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.projectCompletionRate.toFixed(1)}%</div>
						<p className="text-xs text-muted-foreground mt-1">Project completion rate</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Campaign ROAS</h3>
						<BarChart3 className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{metrics.campaignROAS.toFixed(1)}x</div>
						<p className="text-xs text-muted-foreground mt-1">Return on ad spend</p>
					</div>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Transactions */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Transactions</h3>
						<p className="text-sm text-muted-foreground">Your latest financial activity</p>
					</div>
					<div className="p-6 space-y-4">
						{metrics.recentTransactions.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent transactions
							</div>
						) : (
							metrics.recentTransactions.map((txn) => (
								<div key={txn.id} className="flex items-center justify-between border-b pb-4 last:border-0">
									<div className="flex items-center gap-3">
										{getTransactionIcon(txn.type)}
										<div>
											<p className="font-medium">{txn.description}</p>
											<div className="flex items-center gap-2 mt-1">
												<p className="text-xs text-muted-foreground">{txn.id}</p>
												<span className="text-xs">•</span>
												<p className="text-xs text-muted-foreground">
													{new Date(txn.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
									</div>
									<div className="text-right">
										<p className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
											{txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
										</p>
										<Badge variant="outline" className="text-xs mt-1">
											{txn.type}
										</Badge>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Recent Projects */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Projects</h3>
						<p className="text-sm text-muted-foreground">Latest project updates</p>
					</div>
					<div className="p-6 space-y-4">
						{metrics.recentProjects.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent projects
							</div>
						) : (
							metrics.recentProjects.map((project) => (
								<div key={project.id} className="flex items-center justify-between border-b pb-4 last:border-0">
									<div>
										<p className="font-medium">{project.name}</p>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-xs text-muted-foreground">{project.id}</p>
											<span className="text-xs">•</span>
											<p className="text-xs text-muted-foreground">
												{new Date(project.updatedAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className="text-right">
										<div className="flex items-center gap-2">
											<span className="text-sm font-semibold">{project.progress}%</span>
											<Badge variant={getStatusBadgeVariant(project.status)} className="text-xs">
												{project.status}
											</Badge>
										</div>
										<div className="w-16 h-2 bg-muted rounded-full overflow-hidden mt-1">
											<div 
												className="h-full bg-blue-600 rounded-full"
												style={{ width: `${project.progress}%` }}
											></div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Recent Invoices and Campaigns */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Invoices */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Invoices</h3>
						<p className="text-sm text-muted-foreground">Latest billing activity</p>
					</div>
					<div className="p-6 space-y-4">
						{metrics.recentInvoices.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent invoices
							</div>
						) : (
							metrics.recentInvoices.map((invoice) => (
								<div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0">
									<div>
										<p className="font-medium">{invoice.clientName}</p>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-xs text-muted-foreground">{invoice.id}</p>
											<span className="text-xs">•</span>
											<p className="text-xs text-muted-foreground">
												{new Date(invoice.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-green-600">
											${invoice.amount.toLocaleString()}
										</p>
										<Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs mt-1">
											{invoice.status}
										</Badge>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Recent Campaigns */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Campaigns</h3>
						<p className="text-sm text-muted-foreground">Latest advertising activity</p>
					</div>
					<div className="p-6 space-y-4">
						{metrics.recentCampaigns.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent campaigns
							</div>
						) : (
							metrics.recentCampaigns.map((campaign) => (
								<div key={campaign.id} className="flex items-center justify-between border-b pb-4 last:border-0">
									<div>
										<p className="font-medium">{campaign.name}</p>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-xs text-muted-foreground">{campaign.platform}</p>
											<span className="text-xs">•</span>
											<p className="text-xs text-muted-foreground">{campaign.id}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-blue-600">
											{campaign.roas.toFixed(1)}x ROAS
										</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs text-muted-foreground">
												${campaign.spend.toLocaleString()} spent
											</span>
											<Badge variant={getStatusBadgeVariant(campaign.status)} className="text-xs">
												{campaign.status}
											</Badge>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Performance Overview */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Performance Overview</h3>
					<p className="text-sm text-muted-foreground">Key performance indicators and targets</p>
				</div>
				<div className="p-6 space-y-6">
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Revenue Target</span>
							<span className="text-sm text-muted-foreground">
								{Math.round((metrics.totalRevenue / 150000) * 100)}% complete
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div 
								className="h-full bg-green-600 rounded-full" 
								style={{ width: `${Math.min((metrics.totalRevenue / 150000) * 100, 100)}%` }}
							></div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							${metrics.totalRevenue.toLocaleString()} of $150,000 goal
						</p>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Client Acquisition</span>
							<span className="text-sm text-muted-foreground">
								{Math.round((metrics.totalClients / 200) * 100)}% complete
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div 
								className="h-full bg-blue-600 rounded-full" 
								style={{ width: `${Math.min((metrics.totalClients / 200) * 100, 100)}%` }}
							></div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{metrics.totalClients} of 200 clients target
						</p>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Expense Management</span>
							<span className="text-sm text-muted-foreground">
								{Math.round((metrics.totalExpenses / 120000) * 100)}% of budget
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div 
								className="h-full bg-orange-500 rounded-full" 
								style={{ width: `${Math.min((metrics.totalExpenses / 120000) * 100, 100)}%` }}
							></div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							${metrics.totalExpenses.toLocaleString()} of $120,000 budget
						</p>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Payment Success</span>
							<span className="text-sm text-muted-foreground">
								{metrics.paymentSuccessRate.toFixed(1)}% success rate
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div 
								className="h-full bg-purple-600 rounded-full" 
								style={{ width: `${metrics.paymentSuccessRate}%` }}
							></div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Transaction processing success rate
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}