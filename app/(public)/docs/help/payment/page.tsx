/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	CreditCard,
	Plus,
	RefreshCw,
	CheckCircle,
	ArrowRight,
} from "lucide-react";

const paymentMethods = [
	{
		title: "Credit Card",
		description: "Visa, Mastercard, American Express",
		icon: CreditCard,
	},
	{
		title: "Debit Card",
		description: "Visa, Mastercard debit cards",
		icon: CreditCard,
	},
	{
		title: "Bank Account",
		description: "Direct ACH transfer",
		icon: CreditCard,
	},
];

const steps = [
	{
		number: 1,
		title: "Go to Billing Settings",
		description: "Navigate to Settings > Billing in your account",
	},
	{
		number: 2,
		title: "Add Payment Method",
		description: "Click 'Add Payment Method' and enter your details",
	},
	{
		number: 3,
		title: "Verify Payment Method",
		description: "Complete verification process if required",
	},
	{
		number: 4,
		title: "Set as Default",
		description: "Choose your default payment method for automatic billing",
	},
];

export default function PaymentHelpPage() {
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
									Payment
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Payment Methods</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Managing Payment Methods
						</h2>
						<p className="text-muted-foreground mb-8">
							Learn how to add, update, and manage your payment methods for
							seamless billing and subscription management.
						</p>
					</section>

					{/* Payment Methods */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Supported Payment Methods</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{paymentMethods.map((method, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<method.icon className="h-5 w-5 text-primary" />
											{method.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{method.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">How to Add a Payment Method</h2>
						<div className="space-y-6">
							{steps.map((step) => (
								<Card key={step.number}>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="font-semibold text-primary">
													{step.number}
												</span>
											</div>
											<div className="flex-1">
												<h3 className="text-xl font-semibold mb-2">
													{step.title}
												</h3>
												<p className="text-muted-foreground">
													{step.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/settings/billing">
									<Plus className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Add Payment Method</div>
										<div className="text-xs text-muted-foreground">
											Add a new payment method to your account
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/settings/billing">
									<RefreshCw className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Update Payment Method</div>
										<div className="text-xs text-muted-foreground">
											Update existing payment information
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
						</div>
					</section>

					{/* Related Articles */}
					<section>
						<h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/payment-issues"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Payment Issues</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/billing"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Billing & Invoices</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

