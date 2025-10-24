import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Calculator,
	FileText,
	Calendar,
	AlertTriangle,
	CheckCircle,
	TrendingUp,
	TrendingDown,
	Plus,
	Download,
	Settings,
	Receipt
} from "lucide-react";

export const metadata: Metadata = {
	title: "Tax Management | Financbase",
	description: "Manage your tax obligations, track deductions, and prepare for tax season",
};

const taxObligations = [
	{
		name: "Federal Income Tax",
		amount: 45000,
		dueDate: "2025-04-15",
		status: "pending",
		quarter: "Q1 2025",
		paid: 0,
	},
	{
		name: "State Income Tax",
		amount: 12500,
		dueDate: "2025-04-15",
		status: "pending",
		quarter: "Q1 2025",
		paid: 0,
	},
	{
		name: "Self-Employment Tax",
		amount: 8500,
		dueDate: "2025-01-15",
		status: "overdue",
		quarter: "Q4 2024",
		paid: 0,
	},
	{
		name: "Sales Tax",
		amount: 3200,
		dueDate: "2025-02-15",
		status: "paid",
		quarter: "Q4 2024",
		paid: 3200,
	},
];

const taxDeductions = [
	{
		category: "Business Expenses",
		amount: 24500,
		percentage: 35,
		transactions: 127,
	},
	{
		category: "Home Office",
		amount: 8500,
		percentage: 12,
		transactions: 23,
	},
	{
		category: "Equipment & Software",
		amount: 12800,
		percentage: 18,
		transactions: 45,
	},
	{
		category: "Travel & Meals",
		amount: 6200,
		percentage: 9,
		transactions: 34,
	},
	{
		category: "Professional Services",
		amount: 18200,
		percentage: 26,
		transactions: 28,
	},
];

const taxAlerts = [
	{
		type: "danger",
		message: "Q4 2024 Self-Employment Tax is overdue by 15 days",
		action: "Pay Now",
		amount: "$8,500",
	},
	{
		type: "warning",
		message: "Q1 2025 estimated taxes due in 45 days",
		action: "Prepare Payment",
		amount: "$57,500",
	},
	{
		type: "info",
		message: "Tax documents ready for download",
		action: "Download",
		amount: null,
	},
];

export default function TaxPage() {
	const totalObligations = taxObligations.reduce((sum, tax) => sum + tax.amount, 0);
	const totalPaid = taxObligations.reduce((sum, tax) => sum + tax.paid, 0);
	const totalPending = totalObligations - totalPaid;
	const totalDeductions = taxDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
					<p className="text-muted-foreground">
						Track tax obligations, maximize deductions, and stay compliant
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Download className="h-4 w-4 mr-2" />
						Export Data
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Deduction
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Obligations</CardTitle>
						<Calculator className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalObligations.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">2025 tax year</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Completed payments</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
							${totalPending.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Remaining to pay</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">${totalDeductions.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Tax savings</p>
					</CardContent>
				</Card>
			</div>

			{/* Tax Alerts */}
			{taxAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Tax Alerts
						</CardTitle>
						<CardDescription>
							Important tax-related notifications and deadlines
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{taxAlerts.map((alert, index) => (
							<div key={index} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									{alert.type === 'danger' && <AlertTriangle className="h-4 w-4 text-red-500" />}
									{alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
									{alert.type === 'info' && <FileText className="h-4 w-4 text-blue-500" />}
									<div>
										<span className="text-sm">{alert.message}</span>
										{alert.amount && (
											<p className="text-sm font-medium text-muted-foreground">{alert.amount}</p>
										)}
									</div>
								</div>
								{alert.action && (
									<Button variant="outline" size="sm">
										{alert.action}
									</Button>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Tax Management */}
			<Tabs defaultValue="obligations" className="space-y-4">
				<TabsList>
					<TabsTrigger value="obligations">Tax Obligations</TabsTrigger>
					<TabsTrigger value="deductions">Deductions</TabsTrigger>
					<TabsTrigger value="documents">Documents</TabsTrigger>
					<TabsTrigger value="planning">Tax Planning</TabsTrigger>
				</TabsList>

				<TabsContent value="obligations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Tax Obligations</CardTitle>
							<CardDescription>
								Track your tax payments and deadlines
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{taxObligations.map((tax, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{tax.name}</h4>
												<Badge variant={
													tax.status === 'paid' ? 'default' :
													tax.status === 'pending' ? 'secondary' :
													'destructive'
												}>
													{tax.status}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{tax.quarter} • Due: {tax.dueDate}
											</p>
										</div>
										<div className="text-right space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">${tax.amount.toLocaleString()}</span>
												{tax.status === 'paid' ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<AlertTriangle className="h-4 w-4 text-yellow-500" />
												)}
											</div>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">Edit</Button>
												<Button variant="ghost" size="sm">Pay</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Add Tax Obligation
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="deductions" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Tax Deductions</CardTitle>
							<CardDescription>
								Track and categorize your business deductions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{taxDeductions.map((deduction, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<h4 className="font-medium">{deduction.category}</h4>
											<p className="text-sm text-muted-foreground">
												{deduction.transactions} transactions • {deduction.percentage}% of total deductions
											</p>
										</div>
										<div className="text-right space-y-1">
											<span className="font-medium text-green-600">
												${deduction.amount.toLocaleString()}
											</span>
											<Button variant="ghost" size="sm">
												View Details
											</Button>
										</div>
									</div>
								))}
								<Separator />
								<div className="grid gap-4 md:grid-cols-2">
									<Button variant="outline" className="w-full">
										<Plus className="h-4 w-4 mr-2" />
										Add Manual Deduction
									</Button>
									<Button variant="outline" className="w-full">
										<Receipt className="h-4 w-4 mr-2" />
										Scan Receipts
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="documents" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Tax Documents</CardTitle>
							<CardDescription>
								Access and download your tax-related documents
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<FileText className="h-4 w-4" />
											<h4 className="font-medium">2024 Tax Summary</h4>
										</div>
										<p className="text-sm text-muted-foreground mb-3">
											Complete tax year summary and forms
										</p>
										<Button size="sm" className="w-full">
											<Download className="h-4 w-4 mr-2" />
											Download PDF
										</Button>
									</div>
									<div className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Receipt className="h-4 w-4" />
											<h4 className="font-medium">Expense Report</h4>
										</div>
										<p className="text-sm text-muted-foreground mb-3">
											Detailed business expense breakdown
										</p>
										<Button size="sm" className="w-full" variant="outline">
											<Download className="h-4 w-4 mr-2" />
											Download
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="planning" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Tax Planning</CardTitle>
							<CardDescription>
								AI-powered tax planning and optimization suggestions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
									<h4 className="font-medium mb-2">Estimated 2025 Tax Liability</h4>
									<p className="text-2xl font-bold text-blue-600">$62,000 - $68,000</p>
									<p className="text-sm text-muted-foreground">
										Based on current income and deduction patterns
									</p>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<h4 className="font-medium">Recommended Actions</h4>
										<ul className="space-y-1 text-sm text-muted-foreground">
											<li>• Increase retirement contributions</li>
											<li>• Maximize business deductions</li>
											<li>• Consider tax-loss harvesting</li>
										</ul>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Potential Savings</h4>
										<p className="text-lg font-bold text-green-600">$8,500</p>
										<p className="text-sm text-muted-foreground">
											Estimated tax savings with optimization
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
