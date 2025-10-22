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
	DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
	const { data: templates } = useQuery<ReportTemplate[]>({
		queryKey: ['report-templates'],
		queryFn: async () => {
			const response = await fetch('/api/reports/templates');
			if (!response.ok) {
				throw new Error('Failed to fetch templates');
			}
			return response.json();
		},
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
								{templates?.map((template) => (
									<Card key={template.id} className="cursor-pointer hover:bg-accent">
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
								))}
							</div>
						</DialogContent>
					</Dialog>
					<Button>
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
							<Button className="mt-4">
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
		</div>
	);
}

