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
import { FileText, DollarSign, Clock, CheckCircle, Sparkles, Zap, Shield, Users, Send, Receipt, TrendingUp, BarChart3, CreditCard, Globe, FileCheck } from "lucide-react";
import Link from "next/link";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section";

export const metadata: Metadata = {
	title: "Invoice Management | Financbase",
	description: "Streamline your invoicing process with automated invoice creation, tracking, and payment management",
	openGraph: {
		title: "Invoice Management | Financbase",
		description: "Streamline your invoicing process with automated invoice creation, tracking, and payment management",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Invoice Management | Financbase",
		description: "Streamline your invoicing process with automated invoice creation, tracking, and payment management",
	},
};

const features = [
	{
		id: "automated-invoicing",
		icon: <Zap className="h-8 w-8" />,
		title: "Automated Invoice Creation",
		description: "Create professional invoices in seconds with customizable templates and automated recurring billing",
		benefits: [
			"One-click invoice generation",
			"Recurring invoice automation",
			"Customizable templates and branding",
			"Multi-currency support"
		],
		metrics: {
			value: "85%",
			label: "Time Saved",
			change: "+12%"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "payment-tracking",
		icon: <CreditCard className="h-8 w-8" />,
		title: "Payment Tracking",
		description: "Track invoice status, payment due dates, and automatically send payment reminders to clients",
		benefits: [
			"Real-time payment status",
			"Automated payment reminders",
			"Payment history tracking",
			"Overdue invoice alerts"
		],
		metrics: {
			value: "92%",
			label: "On-Time Payments",
			change: "+18%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "integrations",
		icon: <Globe className="h-8 w-8" />,
		title: "Seamless Integrations",
		description: "Connect with payment gateways, accounting software, and business tools for a unified workflow",
		benefits: [
			"Stripe, PayPal, Square integration",
			"QuickBooks, Xero sync",
			"Email and calendar integration",
			"API access for custom workflows"
		],
		metrics: {
			value: "50+",
			label: "Integrations",
			change: "+10"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const capabilities = [
	{
		icon: <FileText className="h-6 w-6" />,
		title: "Professional Templates",
		description: "Beautiful, customizable invoice templates"
	},
	{
		icon: <Clock className="h-6 w-6" />,
		title: "Real-Time Tracking",
		description: "Monitor invoice status and payments instantly"
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Client Management",
		description: "Manage client information and payment preferences"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Secure & Compliant",
		description: "Bank-level security and tax compliance"
	}
];

const invoiceTypes = [
	{ name: "Standard Invoices", description: "One-time invoices for products and services", icon: <FileText className="h-6 w-6" /> },
	{ name: "Recurring Billing", description: "Automated recurring invoices for subscriptions", icon: <Clock className="h-6 w-6" /> },
	{ name: "Payment Tracking", description: "Track payments, overdue invoices, and collections", icon: <Receipt className="h-6 w-6" /> },
	{ name: "Multi-Currency", description: "Invoice in any currency with automatic conversion", icon: <DollarSign className="h-6 w-6" /> },
	{ name: "Tax Management", description: "Automatic tax calculations and compliance", icon: <FileCheck className="h-6 w-6" /> },
	{ name: "Reporting & Analytics", description: "Revenue insights and payment analytics", icon: <BarChart3 className="h-6 w-6" /> }
];

export default function InvoiceManagementPage() {
	return (
		<>
			{/* Hero Section */}
			<section className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center max-w-4xl mx-auto">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<FileText className="h-4 w-4 mr-2" />
							Invoice Management
						</Badge>
						<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
							Streamline Your
							<br />
							<span className="text-4xl md:text-5xl">Invoicing Process</span>
						</h1>
						<p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
							Create, send, and track invoices effortlessly. Get paid faster with automated reminders and seamless payment processing.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8">
								Start Free Trial
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8">
								View Live Demo
							</Button>
						</div>
						<p className="text-sm text-foreground/80 mt-4 font-medium">
							Free forever plan • No credit card required
						</p>
					</div>
				</div>
			</section>

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
							Why Choose Invoice Management
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">business invoicing</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional invoicing software
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
						description="Everything you need to manage invoices professionally"
					/>
				</div>
			</section>

			{/* Invoice Types Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<FileText className="h-4 w-4 mr-2" />
							Invoice Features
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Complete Invoice Solution
							<span className="block text-primary">For Every Business Type</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Comprehensive invoicing features designed to streamline your billing process
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{invoiceTypes.map((type) => (
							<Card key={type.name} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
								<CardContent className="p-6">
									<div className="flex items-center gap-4 mb-4">
										<div className="p-3 bg-primary/10 rounded-lg text-primary">
											{type.icon}
										</div>
										<h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
									</div>
									<p className="text-gray-600">{type.description}</p>
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
				title="Ready to Transform Your Invoicing?"
				description="Join thousands of businesses using Invoice Management to get paid faster and manage their billing efficiently"
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

