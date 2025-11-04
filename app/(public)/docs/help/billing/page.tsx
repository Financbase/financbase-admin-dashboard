/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowLeft,
	CreditCard,
	Download,
	FileText,
	Mail,
	Receipt,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function HelpBillingPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/docs/help">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Help
							</Link>
						</Button>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<CreditCard className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Billing & Invoices
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Billing & Invoices</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Understanding Your Billing</h2>
						<p className="text-muted-foreground mb-8">
							Manage your subscription, view invoices, and update payment methods all in one place.
						</p>
					</section>

					{/* Payment Methods */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Payment Methods</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="h-5 w-5 text-primary" />
										Add Payment Method
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Add a credit card, debit card, or bank account to your account.
									</p>
									<Button asChild>
										<Link href="/settings/billing">
											Add Payment Method
											<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<RefreshCw className="h-5 w-5 text-primary" />
										Update Payment Method
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Update your existing payment method or change your default payment option.
									</p>
									<Button variant="outline" asChild>
										<Link href="/settings/billing">
											Manage Payment Methods
											<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Invoices */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Invoices & Receipts</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<FileText className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">View Invoice History</h3>
											<p className="text-muted-foreground mb-4">
												Access all your past invoices and receipts in one place. You can view, download, or print any invoice.
											</p>
											<Button variant="outline" asChild>
												<Link href="/settings/billing">
													View Invoices
													<Download className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Receipt className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Download Receipts</h3>
											<p className="text-muted-foreground mb-4">
												Download receipts in PDF format for your records or accounting purposes.
											</p>
											<Button variant="outline" asChild>
												<Link href="/settings/billing">
													Download Receipts
													<Download className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Billing Cycles */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Billing Cycles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Monthly Billing</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Your subscription renews automatically every month on the same date you signed up.
									</p>
									<ul className="text-sm text-muted-foreground space-y-2">
										<li>• Automatic renewal</li>
										<li>• Pay monthly</li>
										<li>• Cancel anytime</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Annual Billing</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Save up to 20% by choosing annual billing. Your subscription renews yearly.
									</p>
									<ul className="text-sm text-muted-foreground space-y-2">
										<li>• Save 20% compared to monthly</li>
										<li>• Pay once per year</li>
										<li>• Better value</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Troubleshooting */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Common Billing Issues</h2>
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Payment Failed</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										If your payment fails, we'll send you an email notification. Update your payment method and retry the payment.
									</p>
									<Button variant="outline" size="sm" asChild>
										<Link href="/settings/billing">
											Update Payment Method
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Need Help?</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										For billing questions or assistance, contact our support team.
									</p>
									<Button variant="outline" size="sm" asChild>
										<Link href="/docs/help/support">
											<Mail className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

