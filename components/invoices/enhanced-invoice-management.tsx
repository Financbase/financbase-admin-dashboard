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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Search,
	Filter,
	Download,
	Send,
	Eye,
	Edit,
	Trash2,
	Calendar,
	DollarSign,
	Clock,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	FileText,
	Users,
	Calculator,
	Brain,
	Lightbulb,
	Target,
	ExternalLink,
} from 'lucide-react';
import { FinancbaseGPTService } from '@/lib/services/business/financbase-gpt-service';
import { NotificationService } from '@/lib/services/notification-service';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Invoice {
	id: number;
	invoiceNumber: string;
	clientName: string;
	clientEmail: string;
	amount: number;
	totalAmount: number;
	status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
	paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
	issueDate: string;
	dueDate: string;
	paidDate?: string;
	sentDate?: string;
	amountPaid: number;
	daysOverdue?: number;
}

interface InvoiceAnalytics {
	totalRevenue: number;
	totalOutstanding: number;
	averagePaymentTime: number;
	overdueInvoices: number;
	monthlyTrend: number;
	topClients: Array<{
		name: string;
		total: number;
		count: number;
	}>;
}

export function EnhancedInvoiceManagement() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showAnalytics, setShowAnalytics] = useState(false);

	const queryClient = useQueryClient();
	const gptService = new FinancbaseGPTService();

	// Fetch invoices
	const { data: invoices = [], isLoading } = useQuery({
		queryKey: ['invoices', searchTerm, statusFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (statusFilter !== 'all') params.append('status', statusFilter);

			const response = await fetch(`/api/invoices?${params}`);
			return response.json();
		},
	});

	// Fetch analytics
	const { data: analytics } = useQuery({
		queryKey: ['invoice-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/invoices/analytics');
			return response.json();
		},
	});

	// Send invoice mutation
	const sendInvoiceMutation = useMutation({
		mutationFn: async (invoiceId: number) => {
			const response = await fetch(`/api/invoices/${invoiceId}/send`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: (data, invoiceId) => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });

			// Send notification
			NotificationService.createFinancialNotification(
				'user_12345', // Would get from auth
				'invoice',
				'Invoice Sent',
				`Invoice ${data.invoiceNumber} has been sent to ${data.clientName}`,
				{
					invoiceNumber: data.invoiceNumber,
					amount: data.amount,
					clientName: data.clientName,
				},
				`/invoices/${invoiceId}`
			);
		},
	});

	// Delete invoice mutation
	const deleteInvoiceMutation = useMutation({
		mutationFn: async (invoiceId: number) => {
			const response = await fetch(`/api/invoices/${invoiceId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
		},
	});

	// Get AI insights for invoices
	const getInvoiceInsightsMutation = useMutation({
		mutationFn: async (query: string) => {
			return await gptService.query({
				query,
				analysisType: 'invoice',
				userId: 'user_12345',
			});
		},
		onSuccess: (response) => {
			// Show insights in a dialog or toast
			logger.info('Invoice insights:', response.analysis);
		},
	});

	const filteredInvoices = invoices.filter((invoice: Invoice) => {
		if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;
		if (searchTerm) {
			return invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				   invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
		}
		return true;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'sent':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'viewed':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'overdue':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'draft':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getPaymentStatusIcon = (status: string) => {
		switch (status) {
			case 'paid':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'partial':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			case 'overdue':
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			default:
				return <DollarSign className="h-4 w-4 text-gray-600" />;
		}
	};

	const calculateDaysOverdue = (dueDate: string) => {
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = today.getTime() - due.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Invoice Management</h2>
					<p className="text-muted-foreground">
						Create, manage, and track your invoices with AI-powered insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => getInvoiceInsightsMutation.mutate('Analyze my invoice performance and suggest improvements')}
						disabled={getInvoiceInsightsMutation.isPending}
					>
						<Brain className="mr-2 h-4 w-4" />
						AI Insights
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Create Invoice
					</Button>
				</div>
			</div>

			{/* Analytics Overview */}
			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-green-600" />
								<div>
									<p className="text-sm text-muted-foreground">Total Revenue</p>
									<p className="text-xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-yellow-600" />
								<div>
									<p className="text-sm text-muted-foreground">Outstanding</p>
									<p className="text-xl font-bold">${analytics.totalOutstanding.toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-blue-600" />
								<div>
									<p className="text-sm text-muted-foreground">Avg Payment Time</p>
									<p className="text-xl font-bold">{analytics.averagePaymentTime} days</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-red-600" />
								<div>
									<p className="text-sm text-muted-foreground">Overdue</p>
									<p className="text-xl font-bold">{analytics.overdueInvoices}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search invoices by client or invoice number..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="sent">Sent</SelectItem>
								<SelectItem value="viewed">Viewed</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline">
							<Download className="mr-2 h-4 w-4" />
							Export
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Invoice List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						Invoices ({filteredInvoices.length})
					</CardTitle>
					<CardDescription>
						Manage your invoices and track payments
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : filteredInvoices.length === 0 ? (
						<div className="text-center py-8">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No invoices found</p>
							<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Invoice
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-green-600" />
										<span className="text-sm font-medium">Paid</span>
									</div>
									<p className="text-lg font-bold">
										{filteredInvoices.filter((i: any) => i.status === 'paid').length}
									</p>
								</div>

								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-yellow-600" />
										<span className="text-sm font-medium">Pending</span>
									</div>
									<p className="text-lg font-bold">
										{filteredInvoices.filter((i: any) => ['sent', 'viewed'].includes(i.status)).length}
									</p>
								</div>

								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<AlertTriangle className="h-4 w-4 text-red-600" />
										<span className="text-sm font-medium">Overdue</span>
									</div>
									<p className="text-lg font-bold">
										{filteredInvoices.filter((i: any) => i.status === 'overdue').length}
									</p>
								</div>
							</div>

							{/* Invoice Table */}
							<div className="border rounded-lg">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Invoice</TableHead>
											<TableHead>Client</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Due Date</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredInvoices.map((invoice: any) => (
											<TableRow key={invoice.id}>
												<TableCell>
													<div>
														<p className="font-medium">{invoice.invoiceNumber}</p>
														<p className="text-sm text-muted-foreground">
															{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">{invoice.clientName}</p>
														<p className="text-sm text-muted-foreground">
															{invoice.clientEmail}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">${invoice.totalAmount.toLocaleString()}</p>
														{invoice.amountPaid > 0 && (
															<p className="text-sm text-muted-foreground">
																Paid: ${invoice.amountPaid.toLocaleString()}
															</p>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{getPaymentStatusIcon(invoice.paymentStatus)}
														<Badge className={cn("text-xs", getStatusColor(invoice.status))}>
															{invoice.status}
														</Badge>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="text-sm">
															{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
														</p>
														{invoice.status === 'overdue' && (
															<p className="text-xs text-red-600">
																{calculateDaysOverdue(invoice.dueDate)} days overdue
															</p>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setSelectedInvoice(invoice)}
														>
															<Eye className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Edit invoice */}}
														>
															<Edit className="h-4 w-4" />
														</Button>

														{invoice.status === 'draft' && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => sendInvoiceMutation.mutate(invoice.id)}
																disabled={sendInvoiceMutation.isPending}
															>
																<Send className="h-4 w-4" />
															</Button>
														)}

														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Delete Invoice</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete invoice {invoice.invoiceNumber}?
																		This action cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
																		className="bg-red-600 hover:bg-red-700"
																	>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
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
			{getInvoiceInsightsMutation.data && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Brain className="mr-2 h-5 w-5" />
							AI Invoice Insights
						</CardTitle>
						<CardDescription>
							Smart analysis of your invoice performance
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Insights */}
						{getInvoiceInsightsMutation.data?.analysis?.insights?.map((insight: any, index: number) => {
							// Handle both string and object formats
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
						{getInvoiceInsightsMutation.data?.analysis?.recommendations?.map((rec: any, index: number) => {
							// Handle both string and object formats
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
						{getInvoiceInsightsMutation.data.analysis?.actions.map((action, index) => (
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

			{/* Invoice Detail Dialog */}
			{selectedInvoice && (
				<Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
							<DialogDescription>
								{selectedInvoice.clientName} • ${selectedInvoice.totalAmount.toLocaleString()}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* Invoice Details */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Client</p>
									<p className="text-sm text-muted-foreground">{selectedInvoice.clientName}</p>
									<p className="text-sm text-muted-foreground">{selectedInvoice.clientEmail}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Amount</p>
									<p className="text-lg font-bold">${selectedInvoice.totalAmount.toLocaleString()}</p>
									{selectedInvoice.amountPaid > 0 && (
										<p className="text-sm text-muted-foreground">
											Paid: ${selectedInvoice.amountPaid.toLocaleString()}
										</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">Issue Date</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">Due Date</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}
									</p>
									{selectedInvoice.status === 'overdue' && (
										<p className="text-xs text-red-600">
											{calculateDaysOverdue(selectedInvoice.dueDate)} days overdue
										</p>
									)}
								</div>
							</div>

							{/* Status */}
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Status:</span>
								<Badge className={cn("text-xs", getStatusColor(selectedInvoice.status))}>
									{selectedInvoice.status}
								</Badge>
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1">
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</Button>
								<Button variant="outline" className="flex-1">
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</Button>
								{selectedInvoice.status === 'draft' && (
									<Button
										className="flex-1"
										onClick={() => sendInvoiceMutation.mutate(selectedInvoice.id)}
									>
										<Send className="mr-2 h-4 w-4" />
										Send Invoice
									</Button>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Create Invoice Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create New Invoice</DialogTitle>
						<DialogDescription>
							Create a new invoice with line items and send it to your client
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Quick Invoice Creation Form */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="clientName">Client Name</Label>
								<Input id="clientName" placeholder="Enter client name" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input id="amount" type="number" placeholder="0.00" />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="dueDate">Due Date</Label>
								<Input id="dueDate" type="date" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input id="description" placeholder="Invoice description" />
							</div>
						</div>

						<div className="flex gap-2">
							<Button className="flex-1">
								<Plus className="mr-2 h-4 w-4" />
								Create Invoice
							</Button>
							<Button variant="outline" className="flex-1">
								<FileText className="mr-2 h-4 w-4" />
								Use Template
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
