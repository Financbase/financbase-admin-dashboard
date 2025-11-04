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
	Settings,
	User,
	Building,
	Globe,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";

export default function AccountSetupPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<User className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Account Setup
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Set Up Your{" "}
							<span className="text-primary">Financbase Account</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Configure your profile and organization settings to get the most out of Financbase.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Account Configuration</h2>
						<div className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<User className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">1. Personal Information</h3>
											<p className="text-muted-foreground mb-4">
												Add your personal details including name, email, and contact information.
											</p>
											<div className="bg-muted p-4 rounded-lg">
												<p className="text-sm font-medium mb-2">Required Information:</p>
												<ul className="text-sm text-muted-foreground space-y-1">
													<li>• Full name and preferred display name</li>
													<li>• Primary email address</li>
													<li>• Phone number (optional)</li>
													<li>• Profile picture (optional)</li>
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
											<Building className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">2. Organization Details</h3>
											<p className="text-muted-foreground mb-4">
												Configure your company or organization information.
											</p>
											<div className="bg-muted p-4 rounded-lg">
												<p className="text-sm font-medium mb-2">Organization Information:</p>
												<ul className="text-sm text-muted-foreground space-y-1">
													<li>• Company name and legal entity name</li>
													<li>• Industry and business type</li>
													<li>• Company size and employee count</li>
													<li>• Business address and contact details</li>
													<li>• Tax identification numbers</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<Settings className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">3. Preferences & Settings</h3>
											<p className="text-muted-foreground mb-4">
												Customize your Financbase experience with personal preferences.
											</p>
											<div className="bg-muted p-4 rounded-lg">
												<p className="text-sm font-medium mb-2">Available Settings:</p>
												<ul className="text-sm text-muted-foreground space-y-1">
													<li>• Timezone and date format preferences</li>
													<li>• Currency and number formatting</li>
													<li>• Notification preferences</li>
													<li>• Dashboard layout customization</li>
													<li>• Language and localization</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
											<Shield className="h-5 w-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold mb-2">4. Security & Access</h3>
											<p className="text-muted-foreground mb-4">
												Set up security measures and access controls for your account.
											</p>
											<div className="bg-muted p-4 rounded-lg">
												<p className="text-sm font-medium mb-2">Security Features:</p>
												<ul className="text-sm text-muted-foreground space-y-1">
													<li>• Two-factor authentication setup</li>
													<li>• Password strength requirements</li>
													<li>• Session management settings</li>
													<li>• API key generation and management</li>
													<li>• Access permission controls</li>
												</ul>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Team Management */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Team Management</h2>
						<Card>
							<CardContent className="p-8">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div>
										<div className="flex items-center gap-3 mb-4">
											<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
												<Users className="h-5 w-5" />
											</div>
											<h3 className="font-semibold">Invite Team Members</h3>
										</div>
										<p className="text-muted-foreground mb-4">
											Add colleagues and team members to collaborate on financial management.
										</p>
										<Button variant="outline" asChild>
											<Link href="/dashboard/team">
												Manage Team
												<ArrowRight className="h-4 w-4 ml-2" />
											</Link>
										</Button>
									</div>

									<div>
										<div className="flex items-center gap-3 mb-4">
											<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
												<Globe className="h-5 w-5" />
											</div>
											<h3 className="font-semibold">Role-Based Access</h3>
										</div>
										<p className="text-muted-foreground mb-4">
											Configure different permission levels for various team roles.
										</p>
										<Button variant="outline" asChild>
											<Link href="/docs/help/security">
												Security Settings
												<ArrowRight className="h-4 w-4 ml-2" />
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Next Steps */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Account Setup Complete!</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Your account is now configured and ready for use. You can always update these settings later.
								</p>
								<Button asChild>
									<Link href="/dashboard">
										<Settings className="h-4 w-4 mr-2" />
										Access Dashboard
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
