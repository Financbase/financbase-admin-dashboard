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
	ArrowRight,
	Code,
	Webhook,
	Zap,
	Settings,
	Shield,
	CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ApiWebhooksPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Webhook className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Webhooks
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Real-time Event{" "}
							<span className="text-primary">Notifications</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Receive instant notifications when important events occur in your Financbase account.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Setup Process */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Getting Started</h2>
						<div className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<Settings className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">1. Create Webhook Endpoint</h3>
											<p className="text-muted-foreground mb-4">
												Set up a secure HTTPS endpoint in your application to receive webhook events.
											</p>
											<div className="bg-muted p-4 rounded-lg">
												<p className="text-sm font-medium mb-2">Requirements:</p>
												<ul className="text-sm text-muted-foreground space-y-1">
													<li>• HTTPS endpoint (HTTP not supported)</li>
													<li>• Must respond with 2xx status code within 30 seconds</li>
													<li>• Should handle duplicate events (idempotent)</li>
													<li>• Validate webhook signature for security</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Webhook className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">2. Configure Webhook</h3>
											<p className="text-muted-foreground mb-4">
												Register your webhook endpoint in the Financbase dashboard.
											</p>
											<Button variant="outline" asChild>
												<Link href="/auth/sign-up">
													Get Started
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<Shield className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">3. Verify & Test</h3>
											<p className="text-muted-foreground">
												Test your webhook integration and verify event delivery.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Event Types */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Event Types</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Zap className="h-5 w-5 text-blue-600" />
										Transaction Events
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											transaction.created
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											transaction.updated
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											transaction.categorized
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Webhook className="h-5 w-5 text-green-600" />
										Account Events
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											account.connected
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											account.disconnected
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											account.sync_completed
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Payload Example */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Payload Example</h2>
						<Card>
							<CardContent className="p-8">
								<div className="bg-muted p-6 rounded-lg font-mono text-sm overflow-x-auto">
									<div>{"{"}</div>
									<div className="ml-4">
										<div>"id": "evt_1234567890",</div>
										<div>"type": "transaction.created",</div>
										<div>"created": 1640995200,</div>
										<div>"data": {"{"}</div>
										<div className="ml-8">"id": "txn_9876543210",</div>
										<div className="ml-8">"amount": -29.99,</div>
										<div className="ml-8">"description": "Coffee Shop",</div>
										<div className="ml-8">"account_id": "acc_12345"</div>
										<div className="ml-4">{"}"}</div>
									</div>
									<div>{"}"}</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Get Started?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Set up webhooks to receive real-time notifications about your financial data.
								</p>
								<Button asChild>
									<Link href="/auth/sign-up">
										<Settings className="h-4 w-4 mr-2" />
										Get Started Free
									</Link>
								</Button>
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</div>
	);
}
