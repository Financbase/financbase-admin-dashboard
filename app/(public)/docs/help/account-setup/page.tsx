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
	CheckCircle,
	Settings,
	Users,
	Building2,
	Shield,
	Mail,
	ArrowRight,
} from "lucide-react";

const setupSteps = [
	{
		number: 1,
		title: "Create Your Account",
		description: "Sign up with your email address and verify your account",
		icon: Mail,
		color: "bg-blue-500",
	},
	{
		number: 2,
		title: "Set Up Organization",
		description: "Enter your company or organization details",
		icon: Building2,
		color: "bg-green-500",
	},
	{
		number: 3,
		title: "Configure Users",
		description: "Add team members and set up permissions",
		icon: Users,
		color: "bg-purple-500",
	},
	{
		number: 4,
		title: "Security Settings",
		description: "Enable two-factor authentication and security features",
		icon: Shield,
		color: "bg-orange-500",
	},
	{
		number: 5,
		title: "Preferences",
		description: "Customize your account settings and preferences",
		icon: Settings,
		color: "bg-red-500",
	},
];

const features = [
	{
		title: "Organization Management",
		description: "Manage your organization details, billing, and team members",
		icon: Building2,
	},
	{
		title: "User Roles & Permissions",
		description: "Control access with role-based permissions",
		icon: Users,
	},
	{
		title: "Security Settings",
		description: "Configure security features and authentication methods",
		icon: Shield,
	},
];

export default function AccountSetupPage() {
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
								<Settings className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Account Setup
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Account Setup Guide</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Setting Up Your Account
						</h2>
						<p className="text-muted-foreground mb-8">
							Follow these steps to configure your organization and user settings
							for optimal use of Financbase.
						</p>
					</section>

					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Setup Steps</h2>
						<div className="space-y-6">
							{setupSteps.map((step) => (
								<Card key={step.number} className="relative">
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div
												className={`${step.color} text-white rounded-full p-3 flex-shrink-0`}
											>
												<step.icon className="h-6 w-6" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span className="text-sm font-medium text-muted-foreground">
														Step {step.number}
													</span>
												</div>
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

					{/* Features */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Key Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{features.map((feature, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<feature.icon className="h-5 w-5 text-primary" />
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{feature.description}
										</p>
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
								<Link href="/auth/sign-up">
									<Settings className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Get Started</div>
										<div className="text-xs text-muted-foreground">
											Create your account to manage settings
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/auth/sign-up">
									<Shield className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Get Started</div>
										<div className="text-xs text-muted-foreground">
											Configure security and authentication
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
										href="/docs/help/dashboard"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Dashboard Overview</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/2fa"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Two-Factor Authentication</span>
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

