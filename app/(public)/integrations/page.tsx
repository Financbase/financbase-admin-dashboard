/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Zap, Shield, Code, CheckCircle, Sparkles, Clock, Users, Link2, Database, Cloud, ArrowRight } from "lucide-react";
import Link from "next/link";
import IntegrationsHero from "@/components/home/integrations-hero";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section";

export const metadata: Metadata = {
	title: "Integrations | Financbase",
	description: "Connect your apps and services with Financbase. Seamless integrations with 100+ popular tools and platforms",
	openGraph: {
		title: "Integrations | Financbase",
		description: "Connect your apps and services with Financbase. Seamless integrations with 100+ popular tools and platforms",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Integrations | Financbase",
		description: "Connect your apps and services with Financbase. Seamless integrations with 100+ popular tools and platforms",
	},
};

const features = [
	{
		id: "one-click-integrations",
		icon: <Zap className="h-8 w-8" />,
		title: "One-Click Integrations",
		description: "Connect your favorite tools in seconds with our one-click integration setup. No technical knowledge required",
		benefits: [
			"100+ pre-built integrations",
			"Instant connection setup",
			"Automatic data synchronization",
			"Zero configuration required"
		],
		metrics: {
			value: "100+",
			label: "Integrations",
			change: "+15"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "real-time-sync",
		icon: <Clock className="h-8 w-8" />,
		title: "Real-Time Sync",
		description: "Keep your data synchronized across all platforms with real-time updates and automatic background sync",
		benefits: [
			"Real-time data updates",
			"Automatic background sync",
			"Bidirectional data flow",
			"Conflict resolution"
		],
		metrics: {
			value: "<1s",
			label: "Sync Time",
			change: "99.9%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "enterprise-security",
		icon: <Shield className="h-8 w-8" />,
		title: "Enterprise Security",
		description: "Bank-level security with OAuth 2.0, encrypted connections, and SOC 2 compliance for all integrations",
		benefits: [
			"OAuth 2.0 authentication",
			"End-to-end encryption",
			"SOC 2 compliant",
			"GDPR ready"
		],
		metrics: {
			value: "100%",
			label: "Secure",
			change: "Zero breaches"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const integrationCategories = [
	{
		name: "Accounting & Finance",
		integrations: ["QuickBooks", "Xero", "Sage", "FreshBooks", "Wave"],
		icon: <Database className="h-6 w-6" />,
		color: "from-blue-500 to-blue-600"
	},
	{
		name: "E-commerce",
		integrations: ["Shopify", "WooCommerce", "Stripe", "Square", "PayPal"],
		icon: <Link2 className="h-6 w-6" />,
		color: "from-green-500 to-green-600"
	},
	{
		name: "Banking & Payments",
		integrations: ["Plaid", "Stripe", "PayPal", "Square", "Wise"],
		icon: <Cloud className="h-6 w-6" />,
		color: "from-purple-500 to-purple-600"
	},
	{
		name: "CRM & Sales",
		integrations: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Monday.com"],
		icon: <Users className="h-6 w-6" />,
		color: "from-orange-500 to-orange-600"
	},
	{
		name: "Productivity",
		integrations: ["Slack", "Microsoft Teams", "Google Workspace", "Notion", "Asana"],
		icon: <Zap className="h-6 w-6" />,
		color: "from-pink-500 to-pink-600"
	},
	{
		name: "Marketing",
		integrations: ["Mailchimp", "SendGrid", "Google Analytics", "Facebook Ads", "LinkedIn"],
		icon: <Code className="h-6 w-6" />,
		color: "from-indigo-500 to-indigo-600"
	}
];

const capabilities = [
	{
		icon: <Plug className="h-6 w-6" />,
		title: "Easy Setup",
		description: "Connect integrations in minutes, not hours"
	},
	{
		icon: <Zap className="h-6 w-6" />,
		title: "Fast Sync",
		description: "Real-time data synchronization across platforms"
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Team Collaboration",
		description: "Share integrations across your organization"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Secure & Compliant",
		description: "Enterprise-grade security and compliance"
	}
];

export default function IntegrationsPage() {
	return (
		<>
			<IntegrationsHero />

			<PremiumSocialProof />

			{/* USPs Section */}
			<section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0">
					<div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
					<div className="absolute bottom-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					{/* Header */}
					<div className="text-center mb-20">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<Sparkles className="h-4 w-4 mr-2" />
							Why Choose Our Integrations
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">connected workflows</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional integration platforms
						</p>
					</div>

					{/* Main Features Grid */}
					<div className="grid lg:grid-cols-3 gap-8 mb-20">
						{features.map((feature) => (
							<Card 
								key={feature.id}
								className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
							>
								<CardContent className="p-8">
									{/* Icon and Title */}
									<div className="flex items-center mb-6">
										<div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>
											{feature.icon}
										</div>
										<div>
											<h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
											<div className="flex items-center gap-2 mt-1">
												<div className="text-2xl font-bold text-slate-900">{feature.metrics.value}</div>
												<div className="text-sm text-emerald-600 font-medium">{feature.metrics.change}</div>
											</div>
											<div className="text-xs text-slate-600">{feature.metrics.label}</div>
										</div>
									</div>

									{/* Description */}
									<p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>

									{/* Benefits */}
									<div className="space-y-3 mb-6">
										{feature.benefits.map((benefit, benefitIndex) => (
											<div key={`${feature.id}-benefit-${benefitIndex}`} className="flex items-center">
												<CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
												<span className="text-sm text-slate-700">{benefit}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Capabilities Section */}
					<EnterpriseCapabilitiesSection
						capabilities={capabilities}
						title="Enterprise-Grade Capabilities"
						description="Everything you need to connect and automate your business workflows"
					/>
				</div>
			</section>

			{/* Integration Categories Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<Plug className="h-4 w-4 mr-2" />
							Integration Categories
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Connect With
							<span className="block text-primary">100+ Popular Tools</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Integrate with the tools you already use. From accounting to marketing, we've got you covered.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrationCategories.map((category) => (
							<Card key={category.name} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
								<CardContent className="p-6">
									<div className="flex items-center gap-4 mb-4">
										<div className={`p-3 bg-gradient-to-br ${category.color} rounded-lg text-white`}>
											{category.icon}
										</div>
										<h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
									</div>
									<div className="flex flex-wrap gap-2">
										{category.integrations.map((integration) => (
											<Badge key={integration} variant="outline" className="text-xs">
												{integration}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			<PremiumFeaturesShowcase />

			<PricingPreview />

			<FAQ />

			<PublicCTA
				title="Ready to Connect Your Tools?"
				description="Join thousands of businesses using Financbase integrations to automate their workflows"
				primaryAction={{
					text: "Start Free Trial",
					href: "/auth/sign-up",
				}}
				secondaryAction={{
					text: "Contact Sales",
					href: "/contact",
				}}
			/>
		</>
	);
}

