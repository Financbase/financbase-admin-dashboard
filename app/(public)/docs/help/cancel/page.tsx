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
	AlertTriangle,
	Mail,
	RefreshCw,
	Shield,
	X,
} from "lucide-react";
import Link from "next/link";

export default function HelpCancelPage() {
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
								<X className="h-5 w-5 text-destructive" />
								<Badge variant="secondary" className="text-sm font-medium">
									Cancel Subscription
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Cancel Your Subscription</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Warning */}
					<Card className="mb-8 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
						<CardContent className="p-6">
							<div className="flex items-start gap-4">
								<AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
								<div>
									<h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
										Before You Cancel
									</h3>
									<p className="text-sm text-yellow-800 dark:text-yellow-200">
										Canceling your subscription will immediately downgrade your account. You'll lose access to premium features, but your data will be preserved for 30 days in case you want to reactivate.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* How to Cancel */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">How to Cancel</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 font-semibold">
											1
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Go to Account Settings</h3>
											<p className="text-muted-foreground mb-4">
												Navigate to your account settings and find the billing section.
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href="/auth/sign-up">
													Get Started
													<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
												</Link>
											</Button>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 font-semibold">
											2
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Select Cancel Subscription</h3>
											<p className="text-muted-foreground mb-4">
												Find the "Cancel Subscription" option and click it. You'll be asked to confirm your decision.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 font-semibold">
											3
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Confirm Cancellation</h3>
											<p className="text-muted-foreground">
												Review the cancellation details and confirm. Your subscription will be canceled immediately.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* What Happens Next */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">What Happens Next?</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<X className="h-5 w-5 text-destructive" />
										Immediate Changes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-muted-foreground">
										<li>• Access to premium features removed</li>
										<li>• Account downgraded to free tier</li>
										<li>• No further charges</li>
										<li>• Data preserved for 30 days</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-primary" />
										Data Protection
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-muted-foreground">
										<li>• Your data is safe for 30 days</li>
										<li>• Export your data anytime</li>
										<li>• Reactivate within 30 days to restore</li>
										<li>• After 30 days, data is permanently deleted</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Alternatives */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Alternatives to Canceling</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<RefreshCw className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Downgrade Your Plan</h3>
											<p className="text-muted-foreground mb-4">
												Instead of canceling, consider downgrading to a lower tier plan that better fits your needs.
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href="/pricing">
													View Plans
													<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
												</Link>
											</Button>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<Mail className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Pause Your Subscription</h3>
											<p className="text-muted-foreground mb-4">
												Contact our support team to temporarily pause your subscription if you're unsure about canceling.
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href="/docs/help/support">
													Contact Support
													<Mail className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Reactivation */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Change Your Mind?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									You can reactivate your subscription at any time within 30 days of cancellation. All your data will be restored instantly.
								</p>
								<Button asChild>
									<Link href="/auth/sign-up">
										<RefreshCw className="h-4 w-4 mr-2" />
										Get Started
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

