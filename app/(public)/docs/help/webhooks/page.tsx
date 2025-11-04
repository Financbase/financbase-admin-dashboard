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
	Webhook,
	Code,
	Shield,
	CheckCircle,
	Settings,
	ArrowRight,
} from "lucide-react";

const webhookEvents = [
	{
		title: "Transaction Created",
		description: "Triggered when a new transaction is created",
		icon: CheckCircle,
	},
	{
		title: "Invoice Paid",
		description: "Triggered when an invoice is marked as paid",
		icon: CheckCircle,
	},
	{
		title: "Payment Failed",
		description: "Triggered when a payment fails",
		icon: Shield,
	},
];

const setupSteps = [
	{
		number: 1,
		title: "Create Webhook",
		description: "Go to Webhooks and click 'Create New Webhook'",
	},
	{
		number: 2,
		title: "Configure Endpoint",
		description: "Enter your webhook URL endpoint",
	},
	{
		number: 3,
		title: "Select Events",
		description: "Choose which events should trigger the webhook",
	},
	{
		number: 4,
		title: "Test & Verify",
		description: "Test your webhook and verify it's working",
	},
];

const securityTips = [
	"Always use HTTPS for webhook endpoints",
	"Verify webhook signatures",
	"Implement idempotency for webhook handlers",
	"Set up retry logic for failed deliveries",
];

export default function WebhooksHelpPage() {
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
								<Webhook className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Advanced Features
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Webhooks</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Understanding Webhooks
						</h2>
						<p className="text-muted-foreground mb-8">
							Webhooks allow you to receive real-time notifications when events
							occur in your Financbase account. Learn how to set up and manage
							webhooks to integrate with your systems.
						</p>
					</section>

					{/* Webhook Events */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Available Events</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{webhookEvents.map((event, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<event.icon className="h-5 w-5 text-primary" />
											{event.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{event.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Setting Up Webhooks</h2>
						<div className="space-y-6">
							{setupSteps.map((step) => (
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

					{/* Security Tips */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Security Best Practices</h2>
						<Card>
							<CardContent className="p-6">
								<ul className="space-y-3">
									{securityTips.map((tip, index) => (
										<li
											key={index}
											className="flex items-start gap-3 text-muted-foreground"
										>
											<Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span>{tip}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/webhooks">
									<Webhook className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Manage Webhooks</div>
										<div className="text-xs text-muted-foreground">
											Create and manage your webhooks
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/docs/api/webhooks">
									<Code className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">API Documentation</div>
										<div className="text-xs text-muted-foreground">
											Learn about webhook APIs
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
										href="/docs/help/workflows"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Workflows</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/api"
										className="flex items-center justify-between"
									>
										<span className="font-medium">API Reference</span>
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

