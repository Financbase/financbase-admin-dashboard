/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Users, Zap, Star, Crown } from "lucide-react";

export const metadata: Metadata = {
	title: "Pricing & Plans | Financbase",
	description: "Manage your subscription plans, pricing tiers, and billing preferences",
};

const pricingPlans = [
	{
		name: "Starter",
		price: "$0",
		period: "month",
		description: "Perfect for small businesses and freelancers",
		features: [
			"Up to 100 transactions/month",
			"Basic reporting",
			"Email support",
			"Standard security",
			"1 user account",
		],
		popular: false,
		cta: "Get Started",
	},
	{
		name: "Professional",
		price: "$29",
		period: "month",
		description: "Ideal for growing businesses",
		features: [
			"Up to 1,000 transactions/month",
			"Advanced analytics",
			"Priority support",
			"Enhanced security",
			"Up to 5 users",
			"API access",
			"Custom integrations",
		],
		popular: true,
		cta: "Start Free Trial",
	},
	{
		name: "Enterprise",
		price: "$99",
		period: "month",
		description: "For large organizations",
		features: [
			"Unlimited transactions",
			"Advanced AI features",
			"Dedicated support",
			"Enterprise security",
			"Unlimited users",
			"White-label options",
			"Custom development",
			"SLA guarantee",
		],
		popular: false,
		cta: "Contact Sales",
	},
];

const addonFeatures = [
	{
		name: "Multi-Company Support",
		price: "$19/month",
		description: "Manage multiple companies under one account",
		icon: Users,
	},
	{
		name: "Advanced AI Assistant",
		price: "$15/month",
		description: "Premium AI features and insights",
		icon: Zap,
	},
	{
		name: "Priority Support",
		price: "$10/month",
		description: "24/7 priority customer support",
		icon: Star,
	},
];

export default function PricingPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Pricing & Plans</h1>
				<p className="text-muted-foreground">
					Choose the perfect plan for your business needs. Upgrade or downgrade at any time.
				</p>
			</div>

			{/* Current Plan Status */}
			<Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Crown className="h-5 w-5 text-yellow-500" />
								Current Plan: Professional
							</CardTitle>
							<CardDescription>
								You have access to all Professional features with 5 user accounts
							</CardDescription>
						</div>
						<Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
							Active
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-sm font-medium">Monthly Usage</p>
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<span>847/1,000 transactions used</span>
								<span>•</span>
								<span>3/5 users active</span>
							</div>
						</div>
						<Button variant="outline">Manage Billing</Button>
					</div>
				</CardContent>
			</Card>

			{/* Pricing Plans */}
			<div className="grid gap-6 md:grid-cols-3">
				{pricingPlans.map((plan, index) => (
					<Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
						{plan.popular && (
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
							</div>
						)}
						<CardHeader className="text-center">
							<CardTitle className="text-xl">{plan.name}</CardTitle>
							<div className="space-y-1">
								<div className="flex items-baseline justify-center">
									<span className="text-4xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground">/{plan.period}</span>
								</div>
								<p className="text-sm text-muted-foreground">{plan.description}</p>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<ul className="space-y-2">
								{plan.features.map((feature, featureIndex) => (
									<li key={featureIndex} className="flex items-start gap-2">
										<CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
							<Separator />
							<Button
								className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
								variant={plan.popular ? 'default' : 'outline'}
							>
								{plan.cta}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Add-on Features */}
			<div className="space-y-4">
				<h2 className="text-2xl font-bold tracking-tight">Add-on Features</h2>
				<p className="text-muted-foreground">
					Enhance your plan with these optional features
				</p>
				<div className="grid gap-4 md:grid-cols-3">
					{addonFeatures.map((addon, index) => (
						<Card key={addon.name}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<addon.icon className="h-5 w-5" />
									{addon.name}
								</CardTitle>
								<div className="space-y-1">
									<div className="flex items-baseline">
										<span className="text-2xl font-bold">{addon.price}</span>
									</div>
									<p className="text-sm text-muted-foreground">{addon.description}</p>
								</div>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full">
									Add Feature
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Billing Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Billing Information
					</CardTitle>
					<CardDescription>
						Manage your payment methods and billing history
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<h4 className="font-medium">Payment Method</h4>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<CreditCard className="h-4 w-4" />
								•••• •••• •••• 4242
							</div>
							<Button variant="outline" size="sm">Update</Button>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium">Next Billing Date</h4>
							<p className="text-sm text-muted-foreground">November 23, 2025</p>
							<Button variant="outline" size="sm">View Invoice</Button>
						</div>
					</div>
					<Separator />
					<div className="space-y-2">
						<h4 className="font-medium">Billing History</h4>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span>October 2025 - Professional Plan</span>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">$29.00</span>
									<Button variant="ghost" size="sm">Download</Button>
								</div>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span>September 2025 - Professional Plan</span>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">$29.00</span>
									<Button variant="ghost" size="sm">Download</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
