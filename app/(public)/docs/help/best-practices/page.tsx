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
	CheckCircle,
	Lightbulb,
	Shield,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

export default function HelpBestPracticesPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Lightbulb className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Best Practices
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Optimize Your{" "}
							<span className="text-primary">Financbase Experience</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Follow these proven strategies to get the most out of your financial management platform.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Best Practices Categories */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Best Practices Guide</h2>
						<div className="space-y-8">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Zap className="h-5 w-5 text-blue-600" />
										Account Management
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Regular Account Reviews</h4>
												<p className="text-sm text-muted-foreground">
													Review your connected accounts weekly to ensure all transactions are syncing properly.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Enable Two-Factor Authentication</h4>
												<p className="text-sm text-muted-foreground">
													Add an extra layer of security to protect your financial data.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Keep Credentials Updated</h4>
												<p className="text-sm text-muted-foreground">
													Update bank passwords and security questions regularly for optimal security.
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TrendingUp className="h-5 w-5 text-green-600" />
										Data Management
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Categorize Transactions Promptly</h4>
												<p className="text-sm text-muted-foreground">
													Review and categorize new transactions within 24 hours for accurate reporting.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Set Up Custom Categories</h4>
												<p className="text-sm text-muted-foreground">
													Create custom categories that match your specific business needs for better organization.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Regular Data Backups</h4>
												<p className="text-sm text-muted-foreground">
													Export your data monthly to maintain your own backup copies.
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Target className="h-5 w-5 text-purple-600" />
										Performance Optimization
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Limit Connected Accounts</h4>
												<p className="text-sm text-muted-foreground">
													Connect only essential accounts to maintain optimal sync performance.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Schedule Sync Windows</h4>
												<p className="text-sm text-muted-foreground">
													Set up automated sync schedules during off-peak hours to avoid rate limits.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Monitor API Usage</h4>
												<p className="text-sm text-muted-foreground">
													Keep track of your API usage to stay within rate limits and optimize costs.
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-orange-600" />
										Security Best Practices
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Use Strong, Unique Passwords</h4>
												<p className="text-sm text-muted-foreground">
													Generate unique, complex passwords for your Financbase account and bank connections.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Enable Multi-Factor Authentication</h4>
												<p className="text-sm text-muted-foreground">
													Add 2FA to all accounts for enhanced security against unauthorized access.
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
											<div>
												<h4 className="font-medium">Regular Security Audits</h4>
												<p className="text-sm text-muted-foreground">
													Review connected accounts and API keys quarterly for any suspicious activity.
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Pro Tips */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Pro Tips</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
								<CardContent className="p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<TrendingUp className="h-5 w-5" />
										</div>
										<h3 className="font-semibold">Automated Reporting</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Set up automated reports to be delivered weekly or monthly to key stakeholders.
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
								<CardContent className="p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Zap className="h-5 w-5" />
										</div>
										<h3 className="font-semibold">Webhook Integration</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Use webhooks to receive real-time notifications about important financial events.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Optimize?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Implement these best practices to maximize the value of your Financbase experience.
								</p>
								<Button asChild>
									<Link href="/docs">
										Back to Documentation
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
