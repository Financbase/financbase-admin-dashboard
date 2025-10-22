"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
	Search, 
	Plus, 
	TrendingUp, 
	Eye, 
	MousePointer, 
	DollarSign,
	Target,
	BarChart3,
	PieChart,
	Loader2,
	Play,
	Pause,
	Stop
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Campaign {
	id: string;
	userId: string;
	name: string;
	description?: string;
	type: 'search' | 'display' | 'social' | 'video' | 'email' | 'retargeting' | 'affiliate';
	platform: string;
	audience?: string;
	keywords?: string;
	demographics?: string;
	budget: string;
	dailyBudget?: string;
	bidStrategy?: string;
	maxBid?: string;
	startDate: string;
	endDate?: string;
	impressions: string;
	clicks: string;
	conversions: string;
	spend: string;
	revenue: string;
	ctr: string;
	cpc: string;
	cpa: string;
	roas: string;
	status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

interface CampaignStats {
	totalCampaigns: number;
	activeCampaigns: number;
	totalSpend: number;
	totalRevenue: number;
	averageROAS: number;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	overallCTR: number;
	overallCPC: number;
	overallCPA: number;
	campaignsByStatus: Array<{
		status: string;
		count: number;
	}>;
	campaignsByPlatform: Array<{
		platform: string;
		count: number;
		spend: number;
		revenue: number;
	}>;
	topPerformingCampaigns: Array<{
		id: string;
		name: string;
		roas: number;
		spend: number;
		revenue: number;
	}>;
}

export default function AdboardPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Fetch campaigns data
	const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useQuery({
		queryKey: ['campaigns', searchQuery, statusFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			if (statusFilter) params.append('status', statusFilter);

			const response = await fetch(`/api/campaigns?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch campaigns');
			return response.json();
		},
	});

	// Fetch campaign stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['campaign-stats'],
		queryFn: async () => {
			const response = await fetch('/api/campaigns/stats');
			if (!response.ok) throw new Error('Failed to fetch campaign stats');
			return response.json();
		},
	});

	const campaigns: Campaign[] = campaignsData?.campaigns || [];
	const stats: CampaignStats = statsData?.stats || {
		totalCampaigns: 0,
		activeCampaigns: 0,
		totalSpend: 0,
		totalRevenue: 0,
		averageROAS: 0,
		totalImpressions: 0,
		totalClicks: 0,
		totalConversions: 0,
		overallCTR: 0,
		overallCPC: 0,
		overallCPA: 0,
		campaignsByStatus: [],
		campaignsByPlatform: [],
		topPerformingCampaigns: [],
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active':
				return 'default';
			case 'paused':
				return 'secondary';
			case 'completed':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			case 'draft':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'search':
				return <Search className="h-4 w-4" />;
			case 'display':
				return <Eye className="h-4 w-4" />;
			case 'social':
				return <Target className="h-4 w-4" />;
			case 'video':
				return <Play className="h-4 w-4" />;
			case 'email':
				return <MousePointer className="h-4 w-4" />;
			default:
				return <BarChart3 className="h-4 w-4" />;
		}
	};

	if (campaignsLoading || statsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (campaignsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading campaigns: {campaignsError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Adboard</h1>
					<p className="text-muted-foreground">
						Campaign management and advertising analytics
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Campaign
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${stats.totalSpend.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							${stats.totalRevenue.toLocaleString()} revenue
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Impressions</h3>
						<Eye className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{(stats.totalImpressions / 1000).toFixed(1)}K</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.totalClicks.toLocaleString()} total clicks
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Click-Through Rate</h3>
						<MousePointer className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.overallCTR.toFixed(2)}%</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.totalConversions.toLocaleString()} conversions
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">ROAS</h3>
						<TrendingUp className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.averageROAS.toFixed(1)}x</div>
						<p className="text-xs text-muted-foreground mt-1">
							Return on ad spend
						</p>
					</div>
				</div>
			</div>

			{/* Campaigns Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Campaigns</h3>
							<p className="text-sm text-muted-foreground">Manage your advertising campaigns</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">Filter</Button>
							<Button variant="outline" size="sm">Export</Button>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search campaigns..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<select 
							className="px-3 py-2 border rounded-md"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="">All Status</option>
							<option value="active">Active</option>
							<option value="paused">Paused</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Campaign</th>
								<th className="text-left p-4 font-medium text-sm">Platform</th>
								<th className="text-left p-4 font-medium text-sm">Type</th>
								<th className="text-right p-4 font-medium text-sm">Budget</th>
								<th className="text-right p-4 font-medium text-sm">Spent</th>
								<th className="text-right p-4 font-medium text-sm">Impressions</th>
								<th className="text-right p-4 font-medium text-sm">Clicks</th>
								<th className="text-right p-4 font-medium text-sm">CTR</th>
								<th className="text-right p-4 font-medium text-sm">Conversions</th>
								<th className="text-right p-4 font-medium text-sm">ROAS</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{campaigns.length === 0 ? (
								<tr>
									<td colSpan={11} className="text-center py-8 text-muted-foreground">
										No campaigns found. Create your first campaign to get started.
									</td>
								</tr>
							) : (
								campaigns.map((campaign) => (
								<tr key={campaign.id} className="border-b hover:bg-muted/50 transition-colors">
										<td className="p-4">
											<div>
												<p className="font-medium">{campaign.name}</p>
												<p className="text-xs text-muted-foreground">{campaign.description}</p>
											</div>
										</td>
									<td className="p-4 text-sm">{campaign.platform}</td>
										<td className="p-4">
											<div className="flex items-center gap-2">
												{getTypeIcon(campaign.type)}
												<span className="text-sm capitalize">{campaign.type}</span>
											</div>
										</td>
										<td className="p-4 text-sm text-right">${Number(campaign.budget).toLocaleString()}</td>
										<td className="p-4 text-sm text-right">${Number(campaign.spend).toLocaleString()}</td>
										<td className="p-4 text-sm text-right">{Number(campaign.impressions).toLocaleString()}</td>
										<td className="p-4 text-sm text-right">{Number(campaign.clicks).toLocaleString()}</td>
										<td className="p-4 text-sm text-right">{Number(campaign.ctr).toFixed(2)}%</td>
										<td className="p-4 text-sm text-right font-semibold text-green-600">{Number(campaign.conversions).toLocaleString()}</td>
										<td className="p-4 text-sm text-right font-semibold">{Number(campaign.roas).toFixed(1)}x</td>
									<td className="p-4">
										<Badge 
												variant={getStatusBadgeVariant(campaign.status)}
											className="text-xs"
										>
											{campaign.status}
										</Badge>
									</td>
									<td className="p-4">
										<Button variant="ghost" size="sm">View</Button>
									</td>
								</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Performance Insights */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Top Performers */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Top Performing Campaigns</h3>
						<p className="text-sm text-muted-foreground">By ROAS</p>
					</div>
					<div className="p-6 space-y-3">
						{stats.topPerformingCampaigns.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No performance data available
							</div>
						) : (
							stats.topPerformingCampaigns.slice(0, 3).map((campaign, index) => (
								<div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
											{index + 1}
										</div>
										<div>
											<p className="font-medium text-sm">{campaign.name}</p>
											<p className="text-xs text-muted-foreground">
												${campaign.spend.toLocaleString()} spent
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-green-600">{campaign.roas.toFixed(1)}x</p>
										<p className="text-xs text-muted-foreground">
											${campaign.revenue.toLocaleString()} revenue
										</p>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Platform Distribution */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Budget by Platform</h3>
						<p className="text-sm text-muted-foreground">Ad spend distribution</p>
					</div>
					<div className="p-6 space-y-4">
						{stats.campaignsByPlatform.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No platform data available
							</div>
						) : (
							stats.campaignsByPlatform.map((platform, index) => {
								const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-red-600"];
								const percentage = stats.totalSpend > 0 ? (platform.spend / stats.totalSpend) * 100 : 0;
								
								return (
									<div key={platform.platform}>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">{platform.platform}</span>
											<div className="flex items-center gap-2">
												<span className="text-sm text-muted-foreground">${platform.spend.toLocaleString()}</span>
												<span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
											</div>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div 
												className={`h-full ${colors[index % colors.length]} rounded-full`}
												style={{ width: `${percentage}%` }}
											></div>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{platform.count} campaigns • ${platform.revenue.toLocaleString()} revenue
										</p>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>

			{/* Campaign Status Overview */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Campaign Status Overview</h3>
					<p className="text-sm text-muted-foreground">Distribution of campaigns by status</p>
				</div>
				<div className="p-6">
					{stats.campaignsByStatus.length === 0 ? (
						<div className="text-center text-muted-foreground py-4">
							No status data available
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
							{stats.campaignsByStatus.map((status, index) => {
								const colors = ["bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800", "bg-blue-100 text-blue-800", "bg-gray-100 text-gray-800", "bg-red-100 text-red-800"];
								const percentage = stats.totalCampaigns > 0 ? (status.count / stats.totalCampaigns) * 100 : 0;
								
								return (
									<div key={status.status} className="text-center">
										<div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[index % colors.length]}`}>
											{status.status}
										</div>
										<div className="mt-2">
											<div className="text-2xl font-bold">{status.count}</div>
											<div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
										</div>
									</div>
								);
							})}
					</div>
					)}
				</div>
			</div>
		</div>
	);
}