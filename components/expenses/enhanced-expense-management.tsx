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
	Edit,
	Trash2,
	Calendar,
	DollarSign,
	Clock,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	Receipt,
	Tag,
	Brain,
	Lightbulb,
	Target,
	Camera,
	Upload,
	BarChart3,
	PieChart,
	Calculator
} from 'lucide-react';
import { FinancbaseGPTService } from '@/lib/services/business/financbase-gpt-service';
import { NotificationService } from '@/lib/services/notification-service';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Expense {
	id: number;
	description: string;
	amount: number;
	category: string;
	subcategory?: string;
	date: string;
	vendor: string;
	receipt?: string;
	status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
	approvedBy?: string;
	approvedDate?: string;
	tags: string[];
	notes?: string;
}

interface ExpenseAnalytics {
	totalExpenses: number;
	monthlyTrend: number;
	topCategories: Array<{
		category: string;
		amount: number;
		percentage: number;
		count: number;
	}>;
	pendingApprovals: number;
	averageProcessingTime: number;
	budgetComparison: {
		budgeted: number;
		spent: number;
		remaining: number;
		overBudget: boolean;
	};
}

const EXPENSE_CATEGORIES = [
	'Office Supplies',
	'Software & Tools',
	'Marketing',
	'Travel',
	'Meals & Entertainment',
	'Professional Services',
	'Equipment',
	'Utilities',
	'Insurance',
	'Training',
	'Other'
];

export function EnhancedExpenseManagement() {
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showAnalytics, setShowAnalytics] = useState(false);

	const queryClient = useQueryClient();
	const gptService = new FinancbaseGPTService();

	// Fetch expenses
	const { data: expenses = [], isLoading } = useQuery({
		queryKey: ['expenses', searchTerm, categoryFilter, statusFilter],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (categoryFilter !== 'all') params.append('category', categoryFilter);
			if (statusFilter !== 'all') params.append('status', statusFilter);

			const response = await fetch(`/api/expenses?${params}`);
			return response.json();
		},
	});

	// Fetch analytics
	const { data: analytics } = useQuery({
		queryKey: ['expense-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/expenses/analytics');
			return response.json();
		},
	});

	// Approve expense mutation
	const approveExpenseMutation = useMutation({
		mutationFn: async (expenseId: number) => {
			const response = await fetch(`/api/expenses/${expenseId}/approve`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: (data, expenseId) => {
			queryClient.invalidateQueries(['expenses']);

			// Send notification to expense submitter
			NotificationService.createFinancialNotification(
				data.submittedBy,
				'expense',
				'Expense Approved',
				`Your expense "${data.description}" has been approved for $${data.amount}.`,
				{
					expenseId: data.id,
					amount: data.amount,
					approvedBy: 'current_user',
				},
				`/expenses/${expenseId}`
			);
		},
	});

	// Reject expense mutation
	const rejectExpenseMutation = useMutation({
		mutationFn: async ({ expenseId, reason }: { expenseId: number; reason: string }) => {
			const response = await fetch(`/api/expenses/${expenseId}/reject`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason }),
			});
			return response.json();
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries(['expenses']);

			// Send notification to expense submitter
			NotificationService.createSystemAlert(
				data.submittedBy,
				'Expense Requires Changes',
				`Your expense "${data.description}" needs revision: ${variables.reason}`,
				'normal',
				`/expenses/${variables.expenseId}`
			);
		},
	});

	// Get AI insights for expenses
	const getExpenseInsightsMutation = useMutation({
		mutationFn: async (query: string) => {
			return await gptService.query({
				query,
				analysisType: 'expense',
				userId: 'user_12345',
			});
		},
		onSuccess: (response) => {
			console.log('Expense insights:', response.analysis);
		},
	});

	const filteredExpenses = expenses.filter((expense: Expense) => {
		if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
		if (statusFilter !== 'all' && expense.status !== statusFilter) return false;
		if (searchTerm) {
			return expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				   expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
				   expense.category.toLowerCase().includes(searchTerm.toLowerCase());
		}
		return true;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'approved':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'rejected':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'reimbursed':
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
					<h2 className="text-2xl font-bold">Expense Management</h2>
					<p className="text-muted-foreground">
						Track, approve, and analyze business expenses with AI insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => getExpenseInsightsMutation.mutate('Analyze my expense patterns and suggest optimizations')}
						disabled={getExpenseInsightsMutation.isPending}
					>
						<Brain className="mr-2 h-4 w-4" />
						AI Insights
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Expense
					</Button>
				</div>
			</div>

			{/* Analytics Overview */}
			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-red-600" />
								<div>
									<p className="text-sm text-muted-foreground">Total Expenses</p>
									<p className="text-xl font-bold">${analytics.totalExpenses.toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-blue-600" />
								<div>
									<p className="text-sm text-muted-foreground">Monthly Trend</p>
									<p className="text-xl font-bold">
										{analytics.monthlyTrend > 0 ? '+' : ''}{analytics.monthlyTrend}%
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-yellow-600" />
								<div>
									<p className="text-sm text-muted-foreground">Pending Approval</p>
									<p className="text-xl font-bold">{analytics.pendingApprovals}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-2">
								<Calculator className="h-4 w-4 text-purple-600" />
								<div>
									<p className="text-sm text-muted-foreground">Avg Processing</p>
									<p className="text-xl font-bold">{analytics.averageProcessingTime}h</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Category Breakdown */}
			{analytics?.topCategories && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<PieChart className="mr-2 h-5 w-5" />
							Expense Categories
						</CardTitle>
						<CardDescription>
							Your spending breakdown by category
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{analytics.topCategories.map((category, index) => (
								<div key={category.category} className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-3 h-3 rounded-full bg-primary"></div>
										<span className="font-medium">{category.category}</span>
										<Badge variant="outline" className="text-xs">
											{category.count} expenses
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
			)}

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search expenses by description, vendor, or category..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{EXPENSE_CATEGORIES.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="All Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
								<SelectItem value="reimbursed">Reimbursed</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline">
							<Download className="mr-2 h-4 w-4" />
							Export
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Expense List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Receipt className="mr-2 h-5 w-5" />
						Expenses ({filteredExpenses.length})
					</CardTitle>
					<CardDescription>
						Track and manage your business expenses
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : filteredExpenses.length === 0 ? (
						<div className="text-center py-8">
							<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No expenses found</p>
							<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Expense
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-yellow-600" />
										<span className="text-sm font-medium">Pending</span>
									</div>
									<p className="text-lg font-bold">
										{filteredExpenses.filter(e => e.status === 'pending').length}
									</p>
								</div>

								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm font-medium">Approved</span>
									</div>
									<p className="text-lg font-bold">
										{filteredExpenses.filter(e => e.status === 'approved').length}
									</p>
								</div>

								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<AlertTriangle className="h-4 w-4 text-red-600" />
										<span className="text-sm font-medium">Rejected</span>
									</div>
									<p className="text-lg font-bold">
										{filteredExpenses.filter(e => e.status === 'rejected').length}
									</p>
								</div>

								<div className="p-3 border rounded-lg">
									<div className="flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-blue-600" />
										<span className="text-sm font-medium">Total</span>
									</div>
									<p className="text-lg font-bold">
										${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
									</p>
								</div>
							</div>

							{/* Expense Table */}
							<div className="border rounded-lg">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Description</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredExpenses.map((expense) => (
											<TableRow key={expense.id}>
												<TableCell>
													<div>
														<p className="font-medium">{expense.description}</p>
														<p className="text-sm text-muted-foreground">{expense.vendor}</p>
														{expense.tags.length > 0 && (
															<div className="flex gap-1 mt-1">
																{expense.tags.slice(0, 2).map((tag) => (
																	<Badge key={tag} variant="outline" className="text-xs">
																		{tag}
																	</Badge>
																))}
																{expense.tags.length > 2 && (
																	<Badge variant="outline" className="text-xs">
																		+{expense.tags.length - 2}
																	</Badge>
																)}
															</div>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">{expense.category}</p>
														{expense.subcategory && (
															<p className="text-sm text-muted-foreground">
																{expense.subcategory}
															</p>
														)}
													</div>
												</TableCell>
												<TableCell>
													<p className="font-medium">${expense.amount.toLocaleString()}</p>
												</TableCell>
												<TableCell>
													<div>
														<p className="text-sm">
															{format(new Date(expense.date), 'MMM dd, yyyy')}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<Badge className={cn("text-xs", getStatusColor(expense.status))}>
														{expense.status}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setSelectedExpense(expense)}
														>
															<Edit className="h-4 w-4" />
														</Button>

														{expense.receipt && (
															<Button variant="ghost" size="sm">
																<Camera className="h-4 w-4" />
															</Button>
														)}

														{expense.status === 'pending' && (
															<div className="flex gap-1">
																<Button
																	variant="ghost"
																	size="sm"
																	className="text-green-600 hover:text-green-700"
																	onClick={() => approveExpenseMutation.mutate(expense.id)}
																>
																	<CheckCircle className="h-4 w-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	className="text-red-600 hover:text-red-700"
																	onClick={() => rejectExpenseMutation.mutate({
																		expenseId: expense.id,
																		reason: 'Please provide more details'
																	})}
																>
																	<AlertTriangle className="h-4 w-4" />
																</Button>
															</div>
														)}

														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Delete Expense</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete this expense?
																		This action cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction className="bg-red-600 hover:bg-red-700">
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
			{getExpenseInsightsMutation.data && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Brain className="mr-2 h-5 w-5" />
							AI Expense Insights
						</CardTitle>
						<CardDescription>
							Smart analysis of your expense patterns and optimization opportunities
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Insights */}
						{getExpenseInsightsMutation.data.analysis?.insights.map((insight, index) => (
							<div key={index} className={cn(
								"flex items-start gap-3 p-3 rounded-lg border",
								getInsightColor(insight.type)
							)}>
								{getInsightIcon(insight.type)}
								<div className="flex-1">
									<p className="font-medium text-sm">{insight.title}</p>
									<p className="text-sm text-muted-foreground mt-1">
										{insight.description}
									</p>
								</div>
								<Badge variant="outline" className="text-xs">
									{insight.impact} impact
								</Badge>
							</div>
						))}

						{/* Recommendations */}
						{getExpenseInsightsMutation.data.analysis?.recommendations.map((rec, index) => (
							<div key={index} className="p-3 border rounded-lg">
								<div className="flex items-start gap-3">
									{getRecommendationIcon(rec.category)}
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<p className="font-medium text-sm">{rec.title}</p>
											<Badge className={cn("text-xs", getPriorityColor(rec.priority))}>
												{rec.priority}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{rec.description}
										</p>
										<div className="flex gap-2">
											<Badge variant="outline" className="text-xs">
												{rec.effort} effort
											</Badge>
											<Badge variant="outline" className="text-xs">
												{rec.impact} impact
											</Badge>
										</div>
									</div>
								</div>
							</div>
						))}

						{/* Actions */}
						{getExpenseInsightsMutation.data.analysis?.actions.map((action, index) => (
							<Button
								key={index}
								variant="outline"
								className="justify-start"
								asChild={!!action.url}
							>
								{action.url ? (
									<a href={action.url} className="flex items-center gap-2">
										{action.title}
										<ExternalLink className="h-3 w-3" />
									</a>
								) : (
									<span>{action.title}</span>
								)}
							</Button>
						))}
					</CardContent>
				</Card>
			)}

			{/* Expense Detail Dialog */}
			{selectedExpense && (
				<Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Expense Details</DialogTitle>
							<DialogDescription>
								{selectedExpense.description} • ${selectedExpense.amount.toLocaleString()}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* Expense Details */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Description</p>
									<p className="text-sm text-muted-foreground">{selectedExpense.description}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Amount</p>
									<p className="text-lg font-bold">${selectedExpense.amount.toLocaleString()}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Category</p>
									<p className="text-sm text-muted-foreground">{selectedExpense.category}</p>
									{selectedExpense.subcategory && (
										<p className="text-xs text-muted-foreground">
											{selectedExpense.subcategory}
										</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">Date</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(selectedExpense.date), 'MMM dd, yyyy')}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">Vendor</p>
									<p className="text-sm text-muted-foreground">{selectedExpense.vendor}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Status</p>
									<Badge className={cn("text-xs", getStatusColor(selectedExpense.status))}>
										{selectedExpense.status}
									</Badge>
								</div>
							</div>

							{/* Tags */}
							{selectedExpense.tags.length > 0 && (
								<div>
									<p className="text-sm font-medium mb-2">Tags</p>
									<div className="flex gap-1">
										{selectedExpense.tags.map((tag) => (
											<Badge key={tag} variant="outline" className="text-xs">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Notes */}
							{selectedExpense.notes && (
								<div>
									<p className="text-sm font-medium">Notes</p>
									<p className="text-sm text-muted-foreground">{selectedExpense.notes}</p>
								</div>
							)}

							{/* Receipt */}
							{selectedExpense.receipt && (
								<div>
									<p className="text-sm font-medium">Receipt</p>
									<Button variant="outline" size="sm">
										<Camera className="mr-2 h-4 w-4" />
										View Receipt
									</Button>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1">
									<Edit className="mr-2 h-4 w-4" />
									Edit Expense
								</Button>
								<Button variant="outline" className="flex-1">
									<Download className="mr-2 h-4 w-4" />
									Download Receipt
								</Button>
								{selectedExpense.status === 'pending' && (
									<div className="flex gap-1">
										<Button
											size="sm"
											className="text-green-600 border-green-600 hover:bg-green-50"
											onClick={() => approveExpenseMutation.mutate(selectedExpense.id)}
										>
											<CheckCircle className="mr-1 h-4 w-4" />
											Approve
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="text-red-600 border-red-600 hover:bg-red-50"
											onClick={() => rejectExpenseMutation.mutate({
												expenseId: selectedExpense.id,
												reason: 'Please provide more details'
											})}
										>
											<AlertTriangle className="mr-1 h-4 w-4" />
											Reject
										</Button>
									</div>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Create Expense Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Add New Expense</DialogTitle>
						<DialogDescription>
							Record a new business expense with receipt upload
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Quick Expense Creation Form */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input id="description" placeholder="What was this expense for?" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input id="amount" type="number" placeholder="0.00" />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{EXPENSE_CATEGORIES.map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<Input id="date" type="date" />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="vendor">Vendor</Label>
							<Input id="vendor" placeholder="Who did you pay?" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="receipt">Receipt (Optional)</Label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
								<Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
								<p className="text-sm text-muted-foreground mb-2">
									Drag and drop your receipt here, or
								</p>
								<Button variant="outline" size="sm">
									<Upload className="mr-2 h-4 w-4" />
									Choose File
								</Button>
							</div>
						</div>

						<div className="flex gap-2">
							<Button className="flex-1">
								<Plus className="mr-2 h-4 w-4" />
								Add Expense
							</Button>
							<Button variant="outline" className="flex-1">
								<Receipt className="mr-2 h-4 w-4" />
								Scan Receipt
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
