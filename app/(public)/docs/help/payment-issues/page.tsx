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
	AlertCircle,
	CreditCard,
	RefreshCw,
	CheckCircle,
	ArrowRight,
} from "lucide-react";

const commonIssues = [
	{
		title: "Payment Declined",
		description: "Your payment method was declined",
		solutions: [
			"Check that your card has sufficient funds",
			"Verify your card hasn't expired",
			"Ensure your billing address matches",
			"Contact your bank to verify the card is active",
		],
	},
	{
		title: "Payment Failed",
		description: "The payment transaction failed",
		solutions: [
			"Try using a different payment method",
			"Check your internet connection",
			"Verify your payment details are correct",
			"Wait a few minutes and try again",
		],
	},
	{
		title: "Card Not Accepted",
		description: "Your card type is not supported",
		solutions: [
			"Use a Visa, Mastercard, or American Express",
			"Try a debit card if credit card doesn't work",
			"Use bank account transfer as alternative",
			"Contact support for assistance",
		],
	},
	{
		title: "Subscription Not Renewing",
		description: "Your subscription didn't renew automatically",
		solutions: [
			"Check your payment method is still valid",
			"Verify your subscription is active",
			"Update your payment method if needed",
			"Contact support to restore your subscription",
		],
	},
];

const troubleshootingSteps = [
	{
		number: 1,
		title: "Verify Payment Details",
		description: "Check that all payment information is correct",
	},
	{
		number: 2,
		title: "Check Card Status",
		description: "Ensure your card is active and not expired",
	},
	{
		number: 3,
		title: "Try Alternative Method",
		description: "Use a different payment method if available",
	},
	{
		number: 4,
		title: "Contact Support",
		description: "Reach out to our support team for assistance",
	},
];

export default function PaymentIssuesPage() {
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
								<AlertCircle className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Troubleshooting
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Payment Issues</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Resolving Payment Issues
						</h2>
						<p className="text-muted-foreground mb-8">
							If you're experiencing issues with payments, follow these
							troubleshooting steps to resolve common problems.
						</p>
					</section>

					{/* Common Issues */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Common Issues</h2>
						<div className="space-y-6">
							{commonIssues.map((issue, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<AlertCircle className="h-5 w-5 text-orange-600" />
											{issue.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground mb-4">
											{issue.description}
										</p>
										<div>
											<p className="font-semibold mb-2">Solutions:</p>
											<ul className="space-y-2">
												{issue.solutions.map((solution, solIndex) => (
													<li
														key={solIndex}
														className="flex items-start gap-2 text-sm text-muted-foreground"
													>
														<CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
														<span>{solution}</span>
													</li>
												))}
											</ul>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Troubleshooting Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Troubleshooting Steps</h2>
						<div className="space-y-6">
							{troubleshootingSteps.map((step) => (
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
									<RefreshCw className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Update Payment Method</div>
										<div className="text-xs text-muted-foreground">
											Try a different payment method
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/support">
									<AlertCircle className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Contact Support</div>
										<div className="text-xs text-muted-foreground">
											Get help from our team
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
										href="/docs/help/payment"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Payment Methods</span>
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

