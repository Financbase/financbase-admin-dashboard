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
 * Report List Component
 * Displays list of reports with templates and actions
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { 
	Plus, 
	Search, 
	FileText, 
	MoreHorizontal,
	Play,
	Star,
	StarOff,
	Download,
	Edit,
	Trash2,
	BarChart3,
	TrendingUp,
	DollarSign,
	Users,
	Receipt
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/core/ui/navigation/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Report {
	id: number;
	name: string;
	description?: string;
	type: string;
	config: Record<string, unknown>;
	isFavorite: boolean;
	lastRunAt?: string;
	createdAt: string;
}

interface ReportTemplate {
	id: number;
	name: string;
	description?: string;
	category: string;
	type: string;
	icon?: string;
	isPopular: boolean;
}

export function ReportList() {
	const queryClient = useQueryClient();
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	// Fetch reports
	const { data: reports, isLoading } = useQuery<Report[]>({
		queryKey: ['reports', typeFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (typeFilter !== 'all') {
				params.append('type', typeFilter);
			}
			const response = await fetch(`/api/reports?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch reports');
			}
			return response.json();
		},
	});

	// Fetch templates
	const { data: templates, isLoading: templatesLoading } = useQuery<ReportTemplate[]>({
		queryKey: ['report-templates'],
		queryFn: async () => {
			const response = await fetch('/api/reports/templates');
			if (!response.ok) {
				// Return empty array on error instead of throwing
				console.warn('Failed to fetch templates, using defaults');
				return [];
			}
			return response.json();
		},
		retry: 1,
	});

	// Run report mutation
	const runMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/reports/${id}/run`, {
				method: 'POST',
			});
			if (!response.ok) {
				throw new Error('Failed to run report');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });
			toast.success('Report generated successfully');
		},
		onError: () => {
			toast.error('Failed to generate report');
		},
	});

	// Toggle favorite mutation
	const toggleFavoriteMutation = useMutation({
		mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
			const response = await fetch(`/api/reports/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isFavorite: !isFavorite }),
			});
			if (!response.ok) {
				throw new Error('Failed to update report');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/reports/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete report');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });
			toast.success('Report deleted');
		},
		onError: () => {
			toast.error('Failed to delete report');
		},
	});

	// Create report mutation
	const createMutation = useMutation({
		mutationFn: async (data: { name: string; description?: string; type: string }) => {
			const response = await fetch('/api/reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: data.name,
					description: data.description,
					type: data.type,
					config: {
						dateRange: {
							start: new Date(new Date().setDate(1)).toISOString(),
							end: new Date().toISOString(),
							preset: 'month',
						},
					},
				}),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create report');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['reports'] });
			setCreateDialogOpen(false);
			toast.success('Report created successfully');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create report');
		},
	});

	const [newReport, setNewReport] = useState({
		name: '',
		description: '',
		type: 'profit_loss',
	});

	// Filter reports by search query
	const filteredReports = reports?.filter((report) =>
		report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		report.description?.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'profit_loss':
				return <TrendingUp className="h-4 w-4" />;
			case 'cash_flow':
				return <DollarSign className="h-4 w-4" />;
			case 'balance_sheet':
				return <BarChart3 className="h-4 w-4" />;
			case 'revenue_by_customer':
				return <Users className="h-4 w-4" />;
			case 'expense_by_category':
				return <Receipt className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const getTypeBadge = (type: string) => {
		const labels: Record<string, string> = {
			profit_loss: 'P&L',
			cash_flow: 'Cash Flow',
			balance_sheet: 'Balance Sheet',
			revenue_by_customer: 'Revenue',
			expense_by_category: 'Expenses',
			custom: 'Custom',
		};
		return <Badge variant="outline">{labels[type] || type}</Badge>;
	};

	return (
		<div className="space-y-6">
			{/* Action Bar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 flex-1">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search reports..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="profit_loss">Profit & Loss</SelectItem>
							<SelectItem value="cash_flow">Cash Flow</SelectItem>
							<SelectItem value="balance_sheet">Balance Sheet</SelectItem>
							<SelectItem value="revenue_by_customer">Revenue</SelectItem>
							<SelectItem value="expense_by_category">Expenses</SelectItem>
							<SelectItem value="custom">Custom</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex gap-2">
					<Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="outline">
								<FileText className="h-4 w-4 mr-2" />
								Templates
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Report Templates</DialogTitle>
								<DialogDescription>
									Choose from pre-built report templates
								</DialogDescription>
							</DialogHeader>
							<div className="grid grid-cols-2 gap-4 mt-4">
								{templatesLoading ? (
									<div className="col-span-2 text-center py-4 text-muted-foreground">
										Loading templates...
									</div>
								) : templates && templates.length > 0 ? (
									templates.map((template) => (
										<Card
											key={template.id}
											className="cursor-pointer hover:bg-accent transition-colors"
											onClick={() => {
												setNewReport({
													name: template.name,
													description: template.description || '',
													type: template.type,
												});
												setTemplatesDialogOpen(false);
												setCreateDialogOpen(true);
											}}
										>
											<CardHeader>
												<CardTitle className="text-base flex items-center gap-2">
													{getTypeIcon(template.type)}
													{template.name}
													{template.isPopular && (
														<Badge variant="secondary" className="ml-auto">Popular</Badge>
													)}
												</CardTitle>
												<CardDescription>{template.description}</CardDescription>
											</CardHeader>
										</Card>
									))
								) : (
									<div className="col-span-2 text-center py-4 text-muted-foreground">
										No templates available
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						New Report
					</Button>
				</div>
			</div>

			{/* Reports List */}
			<Card>
				<CardHeader>
					<CardTitle>Your Reports</CardTitle>
					<CardDescription>Manage and run your financial reports</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading reports...
						</div>
					) : filteredReports.length === 0 ? (
						<div className="text-center py-8">
							<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								{searchQuery ? 'No reports found matching your search' : 'No reports yet'}
							</p>
							<Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Create your first report
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Last Run</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredReports.map((report) => (
									<TableRow key={report.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{report.isFavorite && (
													<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
												)}
												<div>
													<div className="font-medium">{report.name}</div>
													{report.description && (
														<div className="text-xs text-muted-foreground">
															{report.description}
														</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>{getTypeBadge(report.type)}</TableCell>
										<TableCell>
											{report.lastRunAt ? (
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(new Date(report.lastRunAt), { addSuffix: true })}
												</span>
											) : (
												<span className="text-sm text-muted-foreground">Never</span>
											)}
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{new Date(report.createdAt).toLocaleDateString()}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => runMutation.mutate(report.id)}
													disabled={runMutation.isPending}
												>
													<Play className="h-4 w-4 mr-1" />
													Run
												</Button>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem>
															<Edit className="h-4 w-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => toggleFavoriteMutation.mutate({
																id: report.id,
																isFavorite: report.isFavorite,
															})}
														>
															{report.isFavorite ? (
																<>
																	<StarOff className="h-4 w-4 mr-2" />
																	Remove from favorites
																</>
															) : (
																<>
																	<Star className="h-4 w-4 mr-2" />
																	Add to favorites
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuItem>
															<Download className="h-4 w-4 mr-2" />
															Export
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => deleteMutation.mutate(report.id)}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Create Report Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create New Report</DialogTitle>
						<DialogDescription>
							Create a new financial report with custom parameters
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (!newReport.name.trim()) {
								toast.error('Report name is required');
								return;
							}
							createMutation.mutate(newReport);
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="report-name">Report Name *</Label>
							<Input
								id="report-name"
								placeholder="e.g., Monthly Financial Summary"
								value={newReport.name}
								onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="report-description">Description</Label>
							<Textarea
								id="report-description"
								placeholder="Optional description for this report"
								value={newReport.description}
								onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="report-type">Report Type *</Label>
							<Select
								value={newReport.type}
								onValueChange={(value) => setNewReport({ ...newReport, type: value })}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select report type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="profit_loss">
										<div>
											<div className="font-medium">Profit & Loss</div>
											<div className="text-xs text-muted-foreground">
												Income statement showing revenue, expenses, and net profit
											</div>
										</div>
									</SelectItem>
									<SelectItem value="cash_flow">
										<div>
											<div className="font-medium">Cash Flow</div>
											<div className="text-xs text-muted-foreground">
												Track cash inflows and outflows
											</div>
										</div>
									</SelectItem>
									<SelectItem value="balance_sheet">
										<div>
											<div className="font-medium">Balance Sheet</div>
											<div className="text-xs text-muted-foreground">
												Assets, liabilities, and equity snapshot
											</div>
										</div>
									</SelectItem>
									<SelectItem value="revenue_by_customer">
										<div>
											<div className="font-medium">Revenue by Customer</div>
											<div className="text-xs text-muted-foreground">
												Breakdown of revenue by customer
											</div>
										</div>
									</SelectItem>
									<SelectItem value="expense_by_category">
										<div>
											<div className="font-medium">Expenses by Category</div>
											<div className="text-xs text-muted-foreground">
												Categorized expense breakdown
											</div>
										</div>
									</SelectItem>
									<SelectItem value="custom">
										<div>
											<div className="font-medium">Custom Report</div>
											<div className="text-xs text-muted-foreground">
												Create a custom report from scratch
											</div>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setCreateDialogOpen(false);
									setNewReport({ name: '', description: '', type: 'profit_loss' });
								}}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? 'Creating...' : 'Create Report'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

