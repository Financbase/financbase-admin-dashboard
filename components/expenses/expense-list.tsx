"use client";

/**
 * Expense List Component
 * Displays list of expenses with filters and actions
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
	Receipt, 
	MoreHorizontal,
	Check,
	X,
	Eye,
	Edit,
	Trash2,
	Download
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Expense {
	id: number;
	description: string;
	amount: number;
	category: string;
	vendor?: string;
	date: string;
	status: string;
	receiptUrl?: string;
	billable: boolean;
}

export function ExpenseList() {
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	// Fetch expenses
	const { data: expenses, isLoading } = useQuery<Expense[]>({
		queryKey: ['expenses', statusFilter, categoryFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}
			if (categoryFilter !== 'all') {
				params.append('category', categoryFilter);
			}
			const response = await fetch(`/api/expenses?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch expenses');
			}
			return response.json();
		},
	});

	// Fetch stats
	const { data: stats } = useQuery({
		queryKey: ['expense-stats'],
		queryFn: async () => {
			const response = await fetch('/api/expenses/stats');
			if (!response.ok) {
				throw new Error('Failed to fetch stats');
			}
			return response.json();
		},
	});

	// Fetch categories
	const { data: categories } = useQuery<Array<{ name: string }>>({
		queryKey: ['expense-categories'],
		queryFn: async () => {
			const response = await fetch('/api/expenses/categories');
			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}
			return response.json();
		},
	});

	// Approve mutation
	const approveMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/expenses/${id}/approve`, {
				method: 'POST',
			});
			if (!response.ok) {
				throw new Error('Failed to approve expense');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['expenses'] });
			queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
			toast.success('Expense approved');
		},
		onError: () => {
			toast.error('Failed to approve expense');
		},
	});

	// Reject mutation
	const rejectMutation = useMutation({
		mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
			const response = await fetch(`/api/expenses/${id}/reject`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason }),
			});
			if (!response.ok) {
				throw new Error('Failed to reject expense');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['expenses'] });
			queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
			setRejectDialogOpen(false);
			setRejectReason('');
			toast.success('Expense rejected');
		},
		onError: () => {
			toast.error('Failed to reject expense');
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/expenses/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete expense');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['expenses'] });
			queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
			toast.success('Expense deleted');
		},
		onError: () => {
			toast.error('Failed to delete expense');
		},
	});

	const handleReject = (expense: Expense) => {
		setSelectedExpense(expense);
		setRejectDialogOpen(true);
	};

	const handleRejectConfirm = () => {
		if (selectedExpense && rejectReason.trim()) {
			rejectMutation.mutate({ id: selectedExpense.id, reason: rejectReason });
		}
	};

	// Filter expenses by search query
	const filteredExpenses = expenses?.filter((expense) =>
		expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
		expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		expense.category.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	const getStatusBadge = (status: string) => {
		const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
			pending: { variant: 'secondary', label: 'Pending' },
			approved: { variant: 'default', label: 'Approved' },
			rejected: { variant: 'destructive', label: 'Rejected' },
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
							<CardDescription>Total Expenses</CardDescription>
							<CardTitle className="text-3xl">{stats.total}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Pending</CardDescription>
							<CardTitle className="text-3xl">{stats.pending}</CardTitle>
							<p className="text-xs text-muted-foreground">
								${stats.pendingAmount?.toLocaleString() || 0}
							</p>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Approved</CardDescription>
							<CardTitle className="text-3xl">{stats.approved}</CardTitle>
							<p className="text-xs text-muted-foreground">
								${stats.approvedAmount?.toLocaleString() || 0}
							</p>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Amount</CardDescription>
							<CardTitle className="text-3xl">
								${stats.totalAmount?.toLocaleString() || 0}
							</CardTitle>
						</CardHeader>
					</Card>
				</div>
			)}

			{/* Expense List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Expenses</CardTitle>
							<CardDescription>Track and manage your business expenses</CardDescription>
						</div>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							New Expense
						</Button>
					</div>

					{/* Filters */}
					<div className="flex items-center gap-4 mt-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search expenses..."
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
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories?.map((cat) => (
									<SelectItem key={cat.name} value={cat.name}>
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading expenses...
						</div>
					) : filteredExpenses.length === 0 ? (
						<div className="text-center py-8">
							<Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								{searchQuery ? 'No expenses found matching your search' : 'No expenses yet'}
							</p>
							<Button className="mt-4">
								<Plus className="h-4 w-4 mr-2" />
								Create your first expense
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredExpenses.map((expense) => (
									<TableRow key={expense.id}>
										<TableCell>
											<div>
												<div>{new Date(expense.date).toLocaleDateString()}</div>
												<div className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{expense.receiptUrl && (
													<Receipt className="h-4 w-4 text-muted-foreground" />
												)}
												<span className="font-medium">{expense.description}</span>
												{expense.billable && (
													<Badge variant="outline" className="text-xs">Billable</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{expense.category}</Badge>
										</TableCell>
										<TableCell>{expense.vendor || '-'}</TableCell>
										<TableCell className="font-semibold">
											${parseFloat(expense.amount).toLocaleString()}
										</TableCell>
										<TableCell>{getStatusBadge(expense.status)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Eye className="h-4 w-4 mr-2" />
														View
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Edit className="h-4 w-4 mr-2" />
														Edit
													</DropdownMenuItem>
													{expense.receiptUrl && (
														<DropdownMenuItem>
															<Download className="h-4 w-4 mr-2" />
															Download Receipt
														</DropdownMenuItem>
													)}
													{expense.status === 'pending' && (
														<>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => approveMutation.mutate(expense.id)}
															>
																<Check className="h-4 w-4 mr-2 text-green-600" />
																Approve
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleReject(expense)}
															>
																<X className="h-4 w-4 mr-2 text-red-600" />
																Reject
															</DropdownMenuItem>
														</>
													)}
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => deleteMutation.mutate(expense.id)}
													>
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

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Expense</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this expense.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Reason for Rejection</Label>
							<Textarea
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder="Enter rejection reason..."
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRejectConfirm}
							disabled={!rejectReason.trim() || rejectMutation.isPending}
						>
							Reject Expense
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

