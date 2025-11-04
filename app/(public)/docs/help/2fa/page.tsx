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
	Shield,
	Smartphone,
	Key,
	CheckCircle,
	AlertTriangle,
	ArrowRight,
} from "lucide-react";

const setupSteps = [
	{
		number: 1,
		title: "Access Security Settings",
		description: "Go to Settings > Security in your account",
		icon: Shield,
	},
	{
		number: 2,
		title: "Enable Two-Factor Authentication",
		description: "Click 'Enable 2FA' and choose your preferred method",
		icon: Key,
	},
	{
		number: 3,
		title: "Scan QR Code",
		description: "Use your authenticator app to scan the QR code",
		icon: Smartphone,
	},
	{
		number: 4,
		title: "Verify Setup",
		description: "Enter the verification code to complete setup",
		icon: CheckCircle,
	},
];

const methods = [
	{
		title: "Authenticator App",
		description: "Use apps like Google Authenticator or Authy",
		icon: Smartphone,
		recommended: true,
	},
	{
		title: "SMS Verification",
		description: "Receive codes via text message",
		icon: Key,
		recommended: false,
	},
];

const tips = [
	"Keep backup codes in a safe place",
	"Use an authenticator app for better security",
	"Don't share your 2FA codes with anyone",
	"Update your phone number if it changes",
];

export default function TwoFactorAuthPage() {
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
								<Shield className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Security
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">
								Two-Factor Authentication
							</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							What is Two-Factor Authentication?
						</h2>
						<p className="text-muted-foreground mb-8">
							Two-factor authentication (2FA) adds an extra layer of security to
							your account by requiring a second verification step in addition to
							your password. This helps protect your account from unauthorized
							access.
						</p>
					</section>

					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Setup Steps</h2>
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
												<div className="flex items-center gap-3 mb-2">
													<step.icon className="h-5 w-5 text-primary" />
													<h3 className="text-xl font-semibold">{step.title}</h3>
												</div>
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

					{/* Methods */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Authentication Methods</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{methods.map((method, index) => (
								<Card key={index} className="relative">
									{method.recommended && (
										<Badge className="absolute top-4 right-4">Recommended</Badge>
									)}
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

					{/* Security Tips */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Security Tips</h2>
						<Card>
							<CardContent className="p-6">
								<ul className="space-y-3">
									{tips.map((tip, index) => (
										<li key={index} className="flex items-start gap-3">
											<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-muted-foreground">{tip}</span>
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
								<Link href="/settings/security">
									<Shield className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Security Settings</div>
										<div className="text-xs text-muted-foreground">
											Enable or manage 2FA
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
										<div>
											<div className="font-semibold mb-1">Lost Access?</div>
											<div className="text-sm text-muted-foreground">
												Contact support if you've lost access to your 2FA device
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Related Articles */}
					<section>
						<h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/security"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Security Guide</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/account-setup"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Account Setup</span>
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

