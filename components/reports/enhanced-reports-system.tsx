/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Calendar,
	Download,
	Filter,
	Plus,
	Brain,
	Lightbulb,
	Target,
	PieChart,
	LineChart,
	Activity,
	Users,
	Receipt,
	FileText,
	Calculator,
	RefreshCw,
	Share,
	Settings,
	Eye,
	Edit,
	Trash2,
	ExternalLink,
	AlertTriangle,
} from 'lucide-react';
import { FinancbaseGPTService } from '@/lib/services/business/financbase-gpt-service';
import { NotificationService } from '@/lib/services/notification-service';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Report {
	id: number;
	name: string;
	description: string;
	type: 'financial' | 'expense' | 'invoice' | 'cash_flow' | 'budget' | 'custom';
	period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
	status: 'draft' | 'scheduled' | 'generated' | 'archived';
	createdAt: string;
	updatedAt: string;
	lastGenerated?: string;
	recipients: string[];
	automated: boolean;
	frequency?: string;
}

interface ReportData {
	summary: {
		totalRevenue: number;
		totalExpenses: number;
		netProfit: number;
		cashFlow: number;
		profitMargin: number;
	};
	trends: {
		revenue: { period: string; amount: number }[];
		expenses: { period: string; amount: number }[];
		profit: { period: string; amount: number }[];
	};
	topCategories: Array<{
		category: string;
		amount: number;
		percentage: number;
		change: number;
	}>;
	insights: string[];
	recommendations: string[];
	charts: Array<{
		type: 'line' | 'bar' | 'pie';
		title: string;
		data: any;
	}>;
}

const REPORT_TYPES = [
	{ value: 'financial', label: 'Financial Overview', description: 'Complete financial health analysis' },
	{ value: 'expense', label: 'Expense Analysis', description: 'Detailed expense breakdown and trends' },
	{ value: 'invoice', label: 'Invoice Report', description: 'Invoice status and payment tracking' },
	{ value: 'cash_flow', label: 'Cash Flow', description: 'Cash flow analysis and forecasting' },
	{ value: 'budget', label: 'Budget Performance', description: 'Budget vs actual spending analysis' },
	{ value: 'custom', label: 'Custom Report', description: 'Build your own custom report' },
];

const REPORT_PERIODS = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'quarterly', label: 'Quarterly' },
	{ value: 'yearly', label: 'Yearly' },
	{ value: 'custom', label: 'Custom Range' },
];

export function EnhancedReportsSystem() {
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showReportDialog, setShowReportDialog] = useState(false);
	const [reportData, setReportData] = useState<ReportData | null>(null);

	const queryClient = useQueryClient();
	const gptService = new FinancbaseGPTService();

	// Fetch reports
	const { data: reports = [], isLoading } = useQuery({
		queryKey: ['reports'],
		queryFn: async () => {
			const response = await fetch('/api/reports');
			return response.json();
		},
	});

	// Generate report mutation
	const generateReportMutation = useMutation({
		mutationFn: async (reportId: number) => {
			const response = await fetch(`/api/reports/${reportId}/generate`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: (data, reportId) => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });

			// Send notification
			NotificationService.createFinancialNotification(
				'user_12345',
				'report',
				'Report Generated',
				`Your ${data.reportName} report has been generated successfully.`,
				{
					reportName: data.reportName,
					period: data.period,
				},
				`/reports/${reportId}`
			);
		},
	});

	// Get AI insights for reports
	const getReportInsightsMutation = useMutation({
		mutationFn: async (query: string) => {
			return await gptService.query({
				query,
				analysisType: 'report',
				userId: 'user_12345',
			});
		},
		onSuccess: (response) => {
			logger.info('Report insights:', response.analysis);
		},
	});

	// Schedule report mutation
	const scheduleReportMutation = useMutation({
		mutationFn: async ({ reportId, schedule }: { reportId: number; schedule: any }) => {
			const response = await fetch(`/api/reports/${reportId}/schedule`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(schedule),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });
		},
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'generated':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'scheduled':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'draft':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'archived':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	// Helper functions for insights
	const getInsightIcon = (type: string) => {
		switch (type) {
			case 'trend':
				return <TrendingUp className="h-4 w-4" />;
			case 'anomaly':
				return <AlertTriangle className="h-4 w-4" />;
			case 'opportunity':
				return <Lightbulb className="h-4 w-4" />;
			case 'risk':
				return <TrendingDown className="h-4 w-4" />;
			default:
				return <Brain className="h-4 w-4" />;
		}
	};

	const getInsightColor = (type: string) => {
		switch (type) {
			case 'trend':
				return 'bg-blue-50 border-blue-200 text-blue-800';
			case 'anomaly':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			case 'opportunity':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'risk':
				return 'bg-red-50 border-red-200 text-red-800';
			default:
				return 'bg-gray-50 border-gray-200 text-gray-800';
		}
	};

	const getRecommendationIcon = (category: string) => {
		switch (category) {
			case 'optimization':
				return <Target className="h-4 w-4 text-blue-600" />;
			case 'savings':
				return <DollarSign className="h-4 w-4 text-green-600" />;
			case 'efficiency':
				return <TrendingUp className="h-4 w-4 text-purple-600" />;
			default:
				return <Lightbulb className="h-4 w-4 text-yellow-600" />;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'low':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'financial':
				return <BarChart3 className="h-4 w-4" />;
			case 'expense':
				return <Receipt className="h-4 w-4" />;
			case 'invoice':
				return <FileText className="h-4 w-4" />;
			case 'cash_flow':
				return <Activity className="h-4 w-4" />;
			case 'budget':
				return <Calculator className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Reports & Analytics</h2>
					<p className="text-muted-foreground">
						Generate comprehensive financial reports with AI-powered insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => getReportInsightsMutation.mutate('Analyze my financial performance and suggest report improvements')}
						disabled={getReportInsightsMutation.isPending}
					>
						<Brain className="mr-2 h-4 w-4" />
						AI Insights
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Create Report
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Reports</p>
								<p className="text-xl font-bold">{reports.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">This Month</p>
								<p className="text-xl font-bold">
									{reports.filter((r: any) => r.status === 'generated').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Automated</p>
								<p className="text-xl font-bold">
									{reports.filter((r: any) => r.automated).length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Share className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">Scheduled</p>
								<p className="text-xl font-bold">
									{reports.filter((r: any) => r.status === 'scheduled').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Report Templates */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						Report Templates
					</CardTitle>
					<CardDescription>
						Choose from pre-built report templates or create custom reports
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{REPORT_TYPES.map((type) => (
							<Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										{getTypeIcon(type.value)}
										<div className="flex-1">
											<h3 className="font-medium mb-1">{type.label}</h3>
											<p className="text-sm text-muted-foreground mb-3">
												{type.description}
											</p>
											<Button size="sm" className="w-full">
												<Plus className="mr-2 h-3 w-3" />
												Create Report
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Report List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						Your Reports ({reports.length})
					</CardTitle>
					<CardDescription>
						Manage and generate your financial reports
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : reports.length === 0 ? (
						<div className="text-center py-8">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No reports created yet</p>
							<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Report
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Report Table */}
							<div className="border rounded-lg">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Report Name</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Period</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Last Generated</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{reports.map((report: any) => (
											<TableRow key={report.id}>
												<TableCell>
													<div>
														<p className="font-medium">{report.name}</p>
														<p className="text-sm text-muted-foreground">
															{report.description}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{getTypeIcon(report.type)}
														<span className="text-sm capitalize">{report.type.replace('_', ' ')}</span>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm capitalize">{report.period}</span>
												</TableCell>
												<TableCell>
													<Badge className={cn("text-xs", getStatusColor(report.status))}>
														{report.status}
													</Badge>
												</TableCell>
												<TableCell>
													{report.lastGenerated ? (
														<p className="text-sm text-muted-foreground">
															{formatDistanceToNow(new Date(report.lastGenerated), { addSuffix: true })}
														</p>
													) : (
														<p className="text-sm text-muted-foreground">Never</p>
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedReport(report);
																generateReportMutation.mutate(report.id);
															}}
															disabled={generateReportMutation.isPending}
														>
															<RefreshCw className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedReport(report);
																setShowReportDialog(true);
															}}
														>
															<Eye className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Edit report */}}
														>
															<Edit className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Share report */}}
														>
															<Share className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* AI Insights */}
			{getReportInsightsMutation.data && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Brain className="mr-2 h-5 w-5" />
							AI Report Insights
						</CardTitle>
						<CardDescription>
							Smart analysis of your reporting patterns and recommendations
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Insights */}
						{getReportInsightsMutation.data?.analysis?.insights?.map((insight: any, index: number) => {
							if (typeof insight === 'string') {
								return (
									<div key={index} className="p-3 rounded-lg border bg-gray-50">
										<p className="text-sm">{insight}</p>
									</div>
								);
							}
							return (
								<div key={index} className={cn(
									"flex items-start gap-3 p-3 rounded-lg border",
									getInsightColor(insight.type || 'trend')
								)}>
									{getInsightIcon(insight.type || 'trend')}
									<div className="flex-1">
										<p className="font-medium text-sm">{insight.title || insight}</p>
										{insight.description && (
											<p className="text-sm text-muted-foreground mt-1">
												{insight.description}
											</p>
										)}
									</div>
									{insight.impact && (
										<Badge variant="outline" className="text-xs">
											{insight.impact} impact
										</Badge>
									)}
								</div>
							);
						})}

						{/* Recommendations */}
						{getReportInsightsMutation.data?.analysis?.recommendations?.map((rec: any, index: number) => {
							if (typeof rec === 'string') {
								return (
									<div key={index} className="p-3 border rounded-lg">
										<p className="text-sm">{rec}</p>
									</div>
								);
							}
							return (
								<div key={index} className="p-3 border rounded-lg">
									<div className="flex items-start gap-3">
										{getRecommendationIcon(rec.category || 'optimization')}
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-medium text-sm">{rec.title || rec}</p>
												{rec.priority && (
													<Badge className={cn("text-xs", getPriorityColor(rec.priority))}>
														{rec.priority}
													</Badge>
												)}
											</div>
											{rec.description && (
												<p className="text-sm text-muted-foreground mb-2">
													{rec.description}
												</p>
											)}
											{(rec.effort || rec.impact) && (
												<div className="flex gap-2">
													{rec.effort && (
														<Badge variant="outline" className="text-xs">
															{rec.effort} effort
														</Badge>
													)}
													{rec.impact && (
														<Badge variant="outline" className="text-xs">
															{rec.impact} impact
														</Badge>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}

						{/* Actions */}
						{getReportInsightsMutation.data.analysis?.actions.map((action, index) => (
							<Button
								key={index}
								variant="outline"
								className="justify-start"
								asChild={!!action.url}
							>
								{action.url ? (
									<a href={action.url} className="flex items-center gap-2">
										{action.description || (action as any).title}
										<ExternalLink className="h-3 w-3" />
									</a>
								) : (
									<span>{action.description || (action as any).title}</span>
								)}
							</Button>
						))}
					</CardContent>
				</Card>
			)}

			{/* Report Detail Dialog */}
			{selectedReport && reportData && (
				<Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
					<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{selectedReport.name}</DialogTitle>
							<DialogDescription>
								{selectedReport.description} • {selectedReport.period} report
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6">
							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<DollarSign className="h-4 w-4 text-green-600" />
											<div>
												<p className="text-sm text-muted-foreground">Revenue</p>
												<p className="text-lg font-bold">
													${reportData.summary.totalRevenue.toLocaleString()}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<Receipt className="h-4 w-4 text-red-600" />
											<div>
												<p className="text-sm text-muted-foreground">Expenses</p>
												<p className="text-lg font-bold">
													${reportData.summary.totalExpenses.toLocaleString()}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<TrendingUp className="h-4 w-4 text-blue-600" />
											<div>
												<p className="text-sm text-muted-foreground">Net Profit</p>
												<p className="text-lg font-bold">
													${reportData.summary.netProfit.toLocaleString()}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<Calculator className="h-4 w-4 text-purple-600" />
											<div>
												<p className="text-sm text-muted-foreground">Margin</p>
												<p className="text-lg font-bold">
													{reportData.summary.profitMargin}%
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Top Categories */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<PieChart className="mr-2 h-5 w-5" />
										Top Categories
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{reportData.topCategories.map((category, index) => (
											<div key={index} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-3 h-3 rounded-full bg-primary"></div>
													<span className="font-medium">{category.category}</span>
													<Badge variant="outline" className="text-xs">
														{category.change > 0 ? '+' : ''}{category.change}%
													</Badge>
												</div>
												<div className="text-right">
													<p className="font-medium">${category.amount.toLocaleString()}</p>
													<p className="text-sm text-muted-foreground">
														{category.percentage}%
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Insights */}
							{reportData.insights.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Lightbulb className="mr-2 h-5 w-5" />
											Key Insights
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{reportData.insights.map((insight, index) => (
												<div key={index} className="p-3 bg-muted rounded-lg">
													<p className="text-sm">{insight}</p>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Recommendations */}
							{reportData.recommendations.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Target className="mr-2 h-5 w-5" />
											Recommendations
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{reportData.recommendations.map((rec, index) => (
												<div key={index} className="p-3 border rounded-lg">
													<p className="text-sm">{rec}</p>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1">
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</Button>
								<Button variant="outline" className="flex-1">
									<Share className="mr-2 h-4 w-4" />
									Share Report
								</Button>
								<Button variant="outline" className="flex-1">
									<Settings className="mr-2 h-4 w-4" />
									Schedule Report
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Create Report Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create New Report</DialogTitle>
						<DialogDescription>
							Set up a new financial report with custom parameters
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Report Details */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="reportName">Report Name</Label>
								<Input id="reportName" placeholder="e.g., Monthly Financial Summary" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="reportType">Report Type</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select report type" />
									</SelectTrigger>
									<SelectContent>
										{REPORT_TYPES.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												<div>
													<div className="font-medium">{type.label}</div>
													<div className="text-xs text-muted-foreground">
														{type.description}
													</div>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="period">Reporting Period</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select period" />
									</SelectTrigger>
									<SelectContent>
										{REPORT_PERIODS.map((period) => (
											<SelectItem key={period.value} value={period.value}>
												{period.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="recipients">Email Recipients</Label>
								<Input id="recipients" placeholder="email1@example.com, email2@example.com" />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description (Optional)</Label>
							<Input id="description" placeholder="Brief description of what this report covers" />
						</div>

						{/* Advanced Options */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">Advanced Options</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-sm">Automated Generation</p>
										<p className="text-xs text-muted-foreground">
											Generate this report automatically on schedule
										</p>
									</div>
									<Button variant="outline" size="sm">
										<Settings className="mr-2 h-3 w-3" />
										Configure
									</Button>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-sm">AI Insights</p>
										<p className="text-xs text-muted-foreground">
											Include AI-powered analysis and recommendations
										</p>
									</div>
									<Button variant="outline" size="sm">
										<Brain className="mr-2 h-3 w-3" />
										Configure
									</Button>
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-2">
							<Button className="flex-1">
								<Plus className="mr-2 h-4 w-4" />
								Create Report
							</Button>
							<Button variant="outline" className="flex-1">
								<FileText className="mr-2 h-4 w-4" />
								Save as Template
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
