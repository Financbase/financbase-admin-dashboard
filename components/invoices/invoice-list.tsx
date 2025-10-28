"use client";

/**
 * Invoice List Component
 * Displays list of invoices with filters and actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
	Send,
	Download,
	Eye,
	Edit,
	Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/core/ui/navigation/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Invoice {
	id: number;
	invoiceNumber: string;
	clientName: string;
	total: number;
	status: string;
	issueDate: string;
	dueDate: string;
	amountPaid: number;
}

export function InvoiceList() {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch invoices
	const { data: invoices, isLoading } = useQuery<Invoice[]>({
		queryKey: ['invoices', statusFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}
			const response = await fetch(`/api/invoices?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch invoices');
			}
			return response.json();
		},
	});

	// Fetch stats
	const { data: stats } = useQuery({
		queryKey: ['invoice-stats'],
		queryFn: async () => {
			const response = await fetch('/api/invoices/stats');
			if (!response.ok) {
				throw new Error('Failed to fetch stats');
			}
			return response.json();
		},
	});

	// Filter invoices by search query
	const filteredInvoices = invoices?.filter((invoice) =>
		invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
		invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	const getStatusBadge = (status: string) => {
		const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
			draft: { variant: 'secondary', label: 'Draft' },
			sent: { variant: 'default', label: 'Sent' },
			viewed: { variant: 'default', label: 'Viewed' },
			partial: { variant: 'outline', label: 'Partial' },
			paid: { variant: 'default', label: 'Paid' },
			overdue: { variant: 'destructive', label: 'Overdue' },
			cancelled: { variant: 'secondary', label: 'Cancelled' },
		};

		const config = variants[status] || { variant: 'secondary', label: status };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			{stats && (
				<div className="grid gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Invoices</CardDescription>
							<CardTitle className="text-3xl">{stats.total}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Draft</CardDescription>
							<CardTitle className="text-3xl">{stats.draft}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Sent</CardDescription>
							<CardTitle className="text-3xl">{stats.sent}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Paid</CardDescription>
							<CardTitle className="text-3xl">{stats.paid}</CardTitle>
						</CardHeader>
					</Card>
				</div>
			)}

			{/* Invoice List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Invoices</CardTitle>
							<CardDescription>Manage your invoices</CardDescription>
						</div>
						<Button onClick={() => router.push('/invoices/new')}>
							<Plus className="h-4 w-4 mr-2" />
							New Invoice
						</Button>
					</div>

					{/* Filters */}
					<div className="flex items-center gap-4 mt-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search invoices..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="sent">Sent</SelectItem>
								<SelectItem value="partial">Partial</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading invoices...
						</div>
					) : filteredInvoices.length === 0 ? (
						<div className="text-center py-8">
							<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								{searchQuery ? 'No invoices found matching your search' : 'No invoices yet'}
							</p>
							<Button className="mt-4" onClick={() => router.push('/invoices/new')}>
								<Plus className="h-4 w-4 mr-2" />
								Create your first invoice
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Client</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredInvoices.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell className="font-medium">
											{invoice.invoiceNumber}
										</TableCell>
										<TableCell>{invoice.clientName}</TableCell>
										<TableCell>
											<div>
												<div className="font-semibold">
													${parseFloat(invoice.total).toLocaleString()}
												</div>
												{parseFloat(invoice.amountPaid) > 0 && (
													<div className="text-xs text-muted-foreground">
														Paid: ${parseFloat(invoice.amountPaid).toLocaleString()}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(invoice.status)}</TableCell>
										<TableCell>
											<div>
												<div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
												<div className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(invoice.dueDate), { addSuffix: true })}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
														<Eye className="h-4 w-4 mr-2" />
														View
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
														<Edit className="h-4 w-4 mr-2" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Send className="h-4 w-4 mr-2" />
														Send
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Download className="h-4 w-4 mr-2" />
														Download PDF
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="text-destructive">
														<Trash2 className="h-4 w-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
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

