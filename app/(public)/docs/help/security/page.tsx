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
	Lock,
	Shield,
	ShieldCheck,
	Users,
	Key,
	AlertTriangle,
	Eye,
	Database,
} from "lucide-react";
import Link from "next/link";

export default function HelpSecurityPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Shield className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Security Guide
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Security & Data{" "}
							<span className="text-primary">Protection</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Learn about our comprehensive security measures and how to keep your financial data safe.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Security Features */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Security Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Lock className="h-5 w-5 text-blue-600" />
										Data Encryption
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										All data is encrypted in transit and at rest using industry-standard AES-256 encryption.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">TLS 1.3 for all communications</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">Bank-level encryption standards</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ShieldCheck className="h-5 w-5 text-green-600" />
										Access Controls
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Granular permissions and role-based access control for team management.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">Multi-factor authentication</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">Role-based permissions</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Database className="h-5 w-5 text-purple-600" />
										Data Residency
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Choose where your data is stored with multiple global data centers.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">US, EU, and Asia-Pacific regions</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">GDPR and CCPA compliance</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Eye className="h-5 w-5 text-orange-600" />
										Audit Logging
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Complete audit trail of all account activities and data access.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">Detailed activity logs</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-sm">Export audit reports</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Your Security Responsibilities */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Your Security Responsibilities</h2>
						<Card>
							<CardContent className="p-8">
								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<Key className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Strong Passwords</h3>
											<p className="text-muted-foreground mb-3">
												Use unique, complex passwords for your Financbase account and enable two-factor authentication.
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href="/dashboard/settings">
													Manage Password
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Users className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Team Access Management</h3>
											<p className="text-muted-foreground mb-3">
												Regularly review and manage team member access permissions and remove inactive users.
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href="/dashboard/team">
													Manage Team
													<ArrowRight className="h-4 w-4 ml-2" />
												</Link>
											</Button>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
											<AlertTriangle className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">Monitor for Suspicious Activity</h3>
											<p className="text-muted-foreground">
												Regularly check your account activity logs for any unusual access patterns or changes.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Compliance */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Compliance & Standards</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="text-center">
								<CardContent className="p-6">
									<div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
										<Shield className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">SOC 2 Type II</h3>
									<p className="text-sm text-muted-foreground">
										Annual security audits and compliance certification.
									</p>
								</CardContent>
							</Card>

							<Card className="text-center">
								<CardContent className="p-6">
									<div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
										<Database className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">GDPR Compliant</h3>
									<p className="text-sm text-muted-foreground">
										Full compliance with EU data protection regulations.
									</p>
								</CardContent>
							</Card>

							<Card className="text-center">
								<CardContent className="p-6">
									<div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-4">
										<Lock className="h-6 w-6" />
									</div>
									<h3 className="font-semibold mb-2">PCI DSS</h3>
									<p className="text-sm text-muted-foreground">
										Payment card industry security standards compliance.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Security Resources */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Need Help with Security?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									If you have security concerns or need assistance with account protection, contact our security team.
								</p>
								<Button asChild>
									<Link href="/support">
										Contact Security Team
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
