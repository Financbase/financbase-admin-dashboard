/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	Search, 
	Plus, 
	TrendingUp, 
	Users, 
	DollarSign, 
	Target,
	Phone,
	Mail,
	Building,
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Loader2,
	Filter,
	Download,
	Eye,
	Edit,
	Trash2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Lead {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	company?: string;
	jobTitle?: string;
	website?: string;
	status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'nurturing';
	source: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'trade_show' | 'advertisement' | 'partner' | 'other';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	leadScore: string;
	isQualified: boolean;
	qualificationNotes?: string;
	estimatedValue?: string;
	probability: string;
	expectedCloseDate?: string;
	actualCloseDate?: string;
	lastContactDate?: string;
	nextFollowUpDate?: string;
	contactAttempts: string;
	assignedTo?: string;
	tags?: string;
	notes?: string;
	convertedToClient: boolean;
	clientId?: string;
	createdAt: string;
	updatedAt: string;
}

interface LeadStats {
	totalLeads: number;
	newLeads: number;
	qualifiedLeads: number;
	convertedLeads: number;
	totalValue: number;
	conversionRate: number;
	averageLeadScore: number;
	leadsByStatus: Array<{
		status: string;
		count: number;
		value: number;
	}>;
	leadsBySource: Array<{
		source: string;
		count: number;
		conversionRate: number;
	}>;
	topPerformingSources: Array<{
		source: string;
		leads: number;
		conversions: number;
		value: number;
	}>;
	recentActivities: Array<{
		id: string;
		leadName: string;
		activityType: string;
		description: string;
		createdAt: string;
	}>;
}

interface PipelineMetrics {
	stage: string;
	leads: number;
	value: number;
	conversionRate: number;
	averageTime: number;
}

export default function LeadsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");

	// Fetch leads data
	const { data: leadsData, isLoading: leadsLoading, error: leadsError } = useQuery({
		queryKey: ['leads', searchQuery, statusFilter, sourceFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			if (statusFilter) params.append('status', statusFilter);
			if (sourceFilter) params.append('source', sourceFilter);

			const response = await fetch(`/api/leads?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch leads');
			return response.json();
		},
	});

	// Fetch lead stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['lead-stats'],
		queryFn: async () => {
			const response = await fetch('/api/leads/stats');
			if (!response.ok) throw new Error('Failed to fetch lead stats');
			return response.json();
		},
	});

	// Fetch pipeline metrics
	const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
		queryKey: ['lead-pipeline'],
		queryFn: async () => {
			const response = await fetch('/api/leads/pipeline');
			if (!response.ok) throw new Error('Failed to fetch pipeline metrics');
			return response.json();
		},
	});

	const leads: Lead[] = leadsData?.leads || [];
	const stats: LeadStats = statsData?.stats || {
		totalLeads: 0,
		newLeads: 0,
		qualifiedLeads: 0,
		convertedLeads: 0,
		totalValue: 0,
		conversionRate: 0,
		averageLeadScore: 0,
		leadsByStatus: [],
		leadsBySource: [],
		topPerformingSources: [],
		recentActivities: [],
	};

	const pipeline: PipelineMetrics[] = pipelineData?.pipeline || [];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'new':
				return 'secondary';
			case 'contacted':
				return 'default';
			case 'qualified':
				return 'default';
			case 'proposal':
				return 'default';
			case 'negotiation':
				return 'default';
			case 'closed_won':
				return 'default';
			case 'closed_lost':
				return 'destructive';
			case 'nurturing':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	const getPriorityBadgeVariant = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'destructive';
			case 'high':
				return 'default';
			case 'medium':
				return 'secondary';
			case 'low':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	const getSourceIcon = (source: string) => {
		switch (source) {
			case 'website':
				return <Building className="h-4 w-4" />;
			case 'referral':
				return <Users className="h-4 w-4" />;
			case 'social_media':
				return <TrendingUp className="h-4 w-4" />;
			case 'email_campaign':
				return <Mail className="h-4 w-4" />;
			case 'cold_call':
				return <Phone className="h-4 w-4" />;
			default:
				return <Target className="h-4 w-4" />;
		}
	};

	if (leadsLoading || statsLoading || pipelineLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (leadsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading leads: {leadsError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
					<p className="text-muted-foreground">
						Track and manage your sales pipeline and lead conversions
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Lead
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
						<Users className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.totalLeads}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.newLeads} new this month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Qualified Leads</h3>
						<Target className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.totalLeads > 0 ? Math.round((stats.qualifiedLeads / stats.totalLeads) * 100) : 0}% of total
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
						<TrendingUp className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.convertedLeads} converted leads
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Pipeline Value</h3>
						<DollarSign className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total estimated value
						</p>
					</div>
				</div>
			</div>

			{/* Pipeline Overview */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Sales Pipeline</h3>
					<p className="text-sm text-muted-foreground">Lead progression through sales stages</p>
				</div>
				<div className="p-6">
					{pipeline.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">
							No pipeline data available
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{pipeline.map((stage) => (
								<div key={stage.stage} className="text-center">
									<div className="text-2xl font-bold">{stage.leads}</div>
									<div className="text-sm text-muted-foreground capitalize">
										{stage.stage.replace('_', ' ')}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										${stage.value.toLocaleString()} value
									</div>
									<div className="text-xs text-muted-foreground">
										{stage.conversionRate.toFixed(1)}% conversion
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Leads Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Leads</h3>
							<p className="text-sm text-muted-foreground">Manage your sales pipeline</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" />
								Filter
							</Button>
							<Button variant="outline" size="sm">
								<Download className="mr-2 h-4 w-4" />
								Export
							</Button>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search leads..."
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
							<option value="new">New</option>
							<option value="contacted">Contacted</option>
							<option value="qualified">Qualified</option>
							<option value="proposal">Proposal</option>
							<option value="negotiation">Negotiation</option>
							<option value="closed_won">Closed Won</option>
							<option value="closed_lost">Closed Lost</option>
						</select>
						<select 
							className="px-3 py-2 border rounded-md"
							value={sourceFilter}
							onChange={(e) => setSourceFilter(e.target.value)}
						>
							<option value="">All Sources</option>
							<option value="website">Website</option>
							<option value="referral">Referral</option>
							<option value="social_media">Social Media</option>
							<option value="email_campaign">Email Campaign</option>
							<option value="cold_call">Cold Call</option>
							<option value="trade_show">Trade Show</option>
							<option value="advertisement">Advertisement</option>
							<option value="partner">Partner</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Lead</th>
								<th className="text-left p-4 font-medium text-sm">Company</th>
								<th className="text-left p-4 font-medium text-sm">Source</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Priority</th>
								<th className="text-right p-4 font-medium text-sm">Value</th>
								<th className="text-right p-4 font-medium text-sm">Score</th>
								<th className="text-left p-4 font-medium text-sm">Last Contact</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{leads.length === 0 ? (
								<tr>
									<td colSpan={9} className="text-center py-8 text-muted-foreground">
										No leads found. Create your first lead to get started.
									</td>
								</tr>
							) : (
								leads.map((lead) => (
									<tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors">
										<td className="p-4">
											<div>
												<p className="font-medium">{lead.firstName} {lead.lastName}</p>
												<div className="flex items-center gap-2 mt-1">
													<Mail className="h-3 w-3 text-muted-foreground" />
													<span className="text-xs text-muted-foreground">{lead.email}</span>
												</div>
												{lead.phone && (
													<div className="flex items-center gap-2 mt-1">
														<Phone className="h-3 w-3 text-muted-foreground" />
														<span className="text-xs text-muted-foreground">{lead.phone}</span>
													</div>
												)}
											</div>
										</td>
										<td className="p-4">
											<div>
												<p className="font-medium">{lead.company || 'No company'}</p>
												{lead.jobTitle && (
													<p className="text-xs text-muted-foreground">{lead.jobTitle}</p>
												)}
											</div>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-2">
												{getSourceIcon(lead.source)}
												<span className="text-sm capitalize">{lead.source.replace('_', ' ')}</span>
											</div>
										</td>
										<td className="p-4">
											<Badge variant={getStatusBadgeVariant(lead.status)} className="text-xs">
												{lead.status.replace('_', ' ')}
											</Badge>
										</td>
										<td className="p-4">
											<Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-xs">
												{lead.priority}
											</Badge>
										</td>
										<td className="p-4 text-sm text-right">
											{lead.estimatedValue ? `$${Number(lead.estimatedValue).toLocaleString()}` : 'N/A'}
										</td>
										<td className="p-4 text-sm text-right">
											<div className="flex items-center gap-1">
												<span className="font-medium">{lead.leadScore}</span>
												{Number(lead.leadScore) >= 70 ? (
													<CheckCircle className="h-3 w-3 text-green-600" />
												) : Number(lead.leadScore) >= 40 ? (
													<AlertCircle className="h-3 w-3 text-yellow-600" />
												) : (
													<XCircle className="h-3 w-3 text-red-600" />
												)}
											</div>
										</td>
										<td className="p-4 text-sm">
											{lead.lastContactDate ? (
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3 text-muted-foreground" />
													{new Date(lead.lastContactDate).toLocaleDateString()}
												</div>
											) : (
												<span className="text-muted-foreground">Never</span>
											)}
										</td>
										<td className="p-4">
											<div className="flex items-center gap-1">
												<Button variant="ghost" size="sm">
													<Eye className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Edit className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
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
				{/* Top Performing Sources */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Top Performing Sources</h3>
						<p className="text-sm text-muted-foreground">Lead sources with highest conversion rates</p>
					</div>
					<div className="p-6 space-y-4">
						{stats.topPerformingSources.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No source data available
							</div>
						) : (
							stats.topPerformingSources.map((source, index) => (
								<div key={source.source} className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
											{index + 1}
										</div>
										<div>
											<p className="font-medium capitalize">{source.source.replace('_', ' ')}</p>
											<p className="text-xs text-muted-foreground">
												{source.leads} leads • {source.conversions} conversions
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-green-600">
											{source.leads > 0 ? ((source.conversions / source.leads) * 100).toFixed(1) : 0}%
										</p>
										<p className="text-xs text-muted-foreground">conversion rate</p>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Recent Activities */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Activities</h3>
						<p className="text-sm text-muted-foreground">Latest lead interactions and updates</p>
					</div>
					<div className="p-6 space-y-3">
						{stats.recentActivities.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent activities
							</div>
						) : (
							stats.recentActivities.map((activity) => (
								<div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
											<Calendar className="h-4 w-4" />
										</div>
										<div>
											<p className="font-medium text-sm">{activity.leadName}</p>
											<p className="text-xs text-muted-foreground">{activity.description}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs text-muted-foreground capitalize">
											{activity.activityType.replace('_', ' ')}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(activity.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
