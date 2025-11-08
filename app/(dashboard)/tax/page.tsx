/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
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
	Receipt,
	Loader2,
	Edit,
	Trash2,
} from "lucide-react";
import {
	useTaxObligations,
	useTaxDeductions,
	useTaxSummary,
	useTaxDocuments,
	useCreateTaxObligation,
	useUpdateTaxObligation,
	useDeleteTaxObligation,
	useRecordTaxPayment,
	useCreateTaxDeduction,
	useUpdateTaxDeduction,
	useDeleteTaxDeduction,
	useCreateTaxDocument,
	useDeleteTaxDocument,
	type TaxObligation,
	type TaxDeduction,
	type TaxDocument,
	type TaxAlert,
} from "@/hooks/use-tax";
import { TaxObligationForm } from "@/components/tax/tax-obligation-form";
import { TaxPaymentForm } from "@/components/tax/tax-payment-form";
import { TaxDeductionForm } from "@/components/tax/tax-deduction-form";
import { TaxDocumentUpload } from "@/components/tax/tax-document-upload";
import { useRouter } from "next/navigation";

const currentYear = new Date().getFullYear();

export default function TaxPage() {
	const router = useRouter();
	const [selectedYear] = useState(currentYear);
	
	// Dialog state management
	const [obligationDialogOpen, setObligationDialogOpen] = useState(false);
	const [selectedObligation, setSelectedObligation] = useState<TaxObligation | undefined>();
	const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
	const [paymentObligation, setPaymentObligation] = useState<TaxObligation | undefined>();
	const [deductionDialogOpen, setDeductionDialogOpen] = useState(false);
	const [selectedDeduction, setSelectedDeduction] = useState<TaxDeduction | undefined>();
	const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

	// Fetch data
	const { data: obligations = [], isLoading: obligationsLoading } = useTaxObligations({
		year: selectedYear,
	});
	const { data: deductions = [], isLoading: deductionsLoading } = useTaxDeductions(selectedYear);
	const { data: documents = [], isLoading: documentsLoading } = useTaxDocuments(selectedYear);
	const {
		data: summaryData,
		isLoading: summaryLoading,
	} = useTaxSummary(selectedYear);

	// Mutations
	const createObligation = useCreateTaxObligation();
	const updateObligation = useUpdateTaxObligation();
	const deleteObligation = useDeleteTaxObligation();
	const recordPayment = useRecordTaxPayment();
	const createDeduction = useCreateTaxDeduction();
	const updateDeduction = useUpdateTaxDeduction();
	const deleteDeduction = useDeleteTaxDeduction();
	const createDocument = useCreateTaxDocument();
	const deleteDocument = useDeleteTaxDocument();

	const summary = summaryData?.summary;
	const alerts = summaryData?.alerts || [];

	// Calculate totals from obligations if summary not available
	const totalObligations =
		summary?.totalObligations ||
		obligations.reduce((sum, tax) => sum + parseFloat(tax.amount || "0"), 0);
	const totalPaid =
		summary?.totalPaid ||
		obligations.reduce((sum, tax) => sum + parseFloat(tax.paid || "0"), 0);
	const totalPending = summary?.totalPending || totalObligations - totalPaid;
	const totalDeductions =
		summary?.totalDeductions ||
		deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount || "0"), 0);

	const handlePayObligation = (obligation: TaxObligation) => {
		const remaining = parseFloat(obligation.amount || "0") - parseFloat(obligation.paid || "0");
		if (remaining <= 0) {
			toast.info("This obligation is already fully paid");
			return;
		}
		setPaymentObligation(obligation);
		setPaymentDialogOpen(true);
	};

	const handleEditObligation = (obligation: TaxObligation) => {
		setSelectedObligation(obligation);
		setObligationDialogOpen(true);
	};

	const handleAddObligation = () => {
		setSelectedObligation(undefined);
		setObligationDialogOpen(true);
	};

	const handleEditDeduction = (deduction: TaxDeduction) => {
		setSelectedDeduction(deduction);
		setDeductionDialogOpen(true);
	};

	const handleAddDeduction = () => {
		setSelectedDeduction(undefined);
		setDeductionDialogOpen(true);
	};

	const handleDeleteObligation = (id: string) => {
		if (confirm("Are you sure you want to delete this tax obligation?")) {
			deleteObligation.mutate(id);
		}
	};

	const handleDeleteDeduction = (id: string) => {
		if (confirm("Are you sure you want to delete this tax deduction?")) {
			deleteDeduction.mutate(id);
		}
	};

	const handleDeleteDocument = (id: string) => {
		if (confirm("Are you sure you want to delete this tax document?")) {
			deleteDocument.mutate(id);
		}
	};

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatCurrency = (amount: string | number) => {
		const num = typeof amount === "string" ? parseFloat(amount) : amount;
		return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
	};

	const isLoading = obligationsLoading || deductionsLoading || summaryLoading;

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
					<Button 
						variant="default" 
						onClick={() => router.push("/tax/direct-file")}
						className="bg-primary"
					>
						<FileText className="h-4 w-4 mr-2" />
						File Federal Taxes
					</Button>
					<Button variant="outline" onClick={() => toast.info("Export functionality coming soon")}>
						<Download className="h-4 w-4 mr-2" />
						Export Data
					</Button>
					<Button onClick={handleAddDeduction}>
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
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							<>
								<div className="text-2xl font-bold">{formatCurrency(totalObligations)}</div>
								<p className="text-xs text-muted-foreground">{selectedYear} tax year</p>
							</>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							<>
								<div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
								<p className="text-xs text-muted-foreground">Completed payments</p>
							</>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							<>
								<div className={`text-2xl font-bold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
									{formatCurrency(totalPending)}
								</div>
								<p className="text-xs text-muted-foreground">Remaining to pay</p>
							</>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							<>
								<div className="text-2xl font-bold text-green-600">{formatCurrency(totalDeductions)}</div>
								<p className="text-xs text-muted-foreground">Tax savings</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Tax Alerts */}
			{alerts.length > 0 && (
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
						{alerts.map((alert, index) => (
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
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											if (alert.obligationId) {
												const obligation = obligations.find((o) => o.id === alert.obligationId);
												if (obligation) {
													handlePayObligation(obligation);
												}
											} else {
												toast.info(alert.action || "Action");
											}
										}}
									>
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
							{obligationsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : obligations.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No tax obligations found. Create one to get started.
								</div>
							) : (
								<div className="space-y-4">
									{obligations.map((tax) => (
										<div key={tax.id} className="flex items-center justify-between p-4 border rounded-lg">
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
													{tax.quarter || `${tax.year}`} • Due: {formatDate(tax.dueDate)}
												</p>
											</div>
											<div className="text-right space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{formatCurrency(tax.amount)}</span>
													{tax.status === 'paid' ? (
														<CheckCircle className="h-4 w-4 text-green-500" />
													) : (
														<AlertTriangle className="h-4 w-4 text-yellow-500" />
													)}
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEditObligation(tax)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handlePayObligation(tax)}
														disabled={recordPayment.isPending || parseFloat(tax.amount || "0") - parseFloat(tax.paid || "0") <= 0}
													>
														{recordPayment.isPending ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															"Pay"
														)}
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteObligation(tax.id)}
														disabled={deleteObligation.isPending}
													>
														{deleteObligation.isPending ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Trash2 className="h-4 w-4 text-destructive" />
														)}
													</Button>
												</div>
											</div>
										</div>
									))}
									<Separator />
									<Button
										variant="outline"
										className="w-full"
										onClick={handleAddObligation}
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Tax Obligation
									</Button>
								</div>
							)}
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
							{deductionsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : deductions.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No tax deductions found. Create one to get started.
								</div>
							) : (
								<div className="space-y-4">
									{deductions.map((deduction) => (
										<div key={deduction.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="space-y-1">
												<h4 className="font-medium">{deduction.category}</h4>
												<p className="text-sm text-muted-foreground">
													{deduction.transactionCount} transactions • {parseFloat(deduction.percentage || "0").toFixed(1)}% of total deductions
												</p>
											</div>
											<div className="text-right space-y-1">
												<span className="font-medium text-green-600">
													{formatCurrency(deduction.amount)}
												</span>
												<div className="flex items-center gap-2">
													<Button variant="ghost" size="sm" onClick={() => handleEditDeduction(deduction)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteDeduction(deduction.id)}
														disabled={deleteDeduction.isPending}
													>
														{deleteDeduction.isPending ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Trash2 className="h-4 w-4 text-destructive" />
														)}
													</Button>
												</div>
											</div>
										</div>
									))}
									<Separator />
									<div className="grid gap-4 md:grid-cols-2">
										<Button
											variant="outline"
											className="w-full"
											onClick={handleAddDeduction}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Manual Deduction
										</Button>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => toast.info('Receipt scanning coming soon')}
										>
											<Receipt className="h-4 w-4 mr-2" />
											Scan Receipts
										</Button>
									</div>
								</div>
							)}
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
							{documentsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : documents.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No tax documents found. Upload one to get started.
								</div>
							) : (
								<div className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										{documents.map((doc) => (
											<div key={doc.id} className="p-4 border rounded-lg">
												<div className="flex items-center gap-2 mb-2">
													<FileText className="h-4 w-4" />
													<h4 className="font-medium">{doc.name}</h4>
												</div>
												<p className="text-sm text-muted-foreground mb-3">
													{doc.description || `${doc.type} • ${doc.year}`}
												</p>
												<div className="flex gap-2">
													<Button
														size="sm"
														className="flex-1"
														onClick={() => window.open(doc.fileUrl, '_blank')}
													>
														<Download className="h-4 w-4 mr-2" />
														Download
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleDeleteDocument(doc.id)}
														disabled={deleteDocument.isPending}
													>
														Delete
													</Button>
												</div>
											</div>
										))}
									</div>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => setDocumentDialogOpen(true)}
									>
										<Plus className="h-4 w-4 mr-2" />
										Upload Document
									</Button>
								</div>
							)}
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
									<h4 className="font-medium mb-2">Estimated {selectedYear} Tax Liability</h4>
									<p className="text-2xl font-bold text-blue-600">
										{summary ? formatCurrency(summary.totalPending) : "Calculating..."}
									</p>
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
										<p className="text-lg font-bold text-green-600">
											{summary ? formatCurrency(summary.totalDeductions * 0.25) : "$0"}
										</p>
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

			{/* Form Dialogs */}
			<TaxObligationForm
				open={obligationDialogOpen}
				onOpenChange={setObligationDialogOpen}
				obligation={selectedObligation}
				onSuccess={() => {
					setSelectedObligation(undefined);
				}}
			/>
			{paymentObligation && (
				<TaxPaymentForm
					open={paymentDialogOpen}
					onOpenChange={setPaymentDialogOpen}
					obligation={paymentObligation}
					onSuccess={() => {
						setPaymentObligation(undefined);
					}}
				/>
			)}
			<TaxDeductionForm
				open={deductionDialogOpen}
				onOpenChange={setDeductionDialogOpen}
				deduction={selectedDeduction}
				onSuccess={() => {
					setSelectedDeduction(undefined);
				}}
			/>
			<TaxDocumentUpload
				open={documentDialogOpen}
				onOpenChange={setDocumentDialogOpen}
			/>
		</div>
	);
}
