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
import { Receipt, Camera, CheckCircle, Sparkles, Zap, Shield, Clock, Users, TrendingDown, BarChart3, CreditCard, FileText, Smartphone, DollarSign } from "lucide-react";
import Link from "next/link";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";

export const metadata: Metadata = {
	title: "Expense Tracking | Financbase",
	description: "Track and manage business expenses with OCR receipt scanning, automated categorization, and approval workflows",
	openGraph: {
		title: "Expense Tracking | Financbase",
		description: "Track and manage business expenses with OCR receipt scanning, automated categorization, and approval workflows",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Expense Tracking | Financbase",
		description: "Track and manage business expenses with OCR receipt scanning, automated categorization, and approval workflows",
	},
};

const features = [
	{
		id: "ocr-scanning",
		icon: <Camera className="h-8 w-8" />,
		title: "OCR Receipt Scanning",
		description: "Automatically extract expense data from receipts using advanced OCR technology. Just snap a photo and we'll handle the rest",
		benefits: [
			"Instant receipt scanning",
			"Automatic data extraction",
			"Multi-language support",
			"Batch processing"
		],
		metrics: {
			value: "95%",
			label: "Accuracy Rate",
			change: "+5%"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "smart-categorization",
		icon: <Zap className="h-8 w-8" />,
		title: "Smart Categorization",
		description: "AI-powered expense categorization that learns from your patterns and automatically organizes expenses",
		benefits: [
			"Automatic categorization",
			"Custom category rules",
			"Tax-deductible identification",
			"Pattern recognition"
		],
		metrics: {
			value: "87%",
			label: "Auto-Categorized",
			change: "+15%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "approval-workflows",
		icon: <CheckCircle className="h-8 w-8" />,
		title: "Approval Workflows",
		description: "Streamline expense approvals with customizable workflows, multi-level approvals, and policy enforcement",
		benefits: [
			"Custom approval chains",
			"Policy enforcement",
			"Real-time notifications",
			"Audit trail"
		],
		metrics: {
			value: "3.2 days",
			label: "Avg Approval Time",
			change: "-40%"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const capabilities = [
	{
		icon: <Smartphone className="h-6 w-6" />,
		title: "Mobile App",
		description: "Track expenses on-the-go with iOS and Android apps"
	},
	{
		icon: <Clock className="h-6 w-6" />,
		title: "Real-Time Sync",
		description: "Expenses sync instantly across all devices"
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Team Management",
		description: "Manage team expenses with role-based access"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Secure & Compliant",
		description: "Bank-level security and compliance standards"
	}
];

const expenseTypes = [
	{ name: "Receipt Scanning", description: "OCR-powered receipt scanning and data extraction", icon: <Camera className="h-6 w-6" /> },
	{ name: "Mileage Tracking", description: "Automatic mileage tracking with GPS integration", icon: <Smartphone className="h-6 w-6" /> },
	{ name: "Multi-Currency", description: "Track expenses in any currency with automatic conversion", icon: <DollarSign className="h-6 w-6" /> },
	{ name: "Tax Compliance", description: "Automatic tax categorization and compliance reporting", icon: <FileText className="h-6 w-6" /> },
	{ name: "Budget Alerts", description: "Real-time budget tracking and spending alerts", icon: <TrendingDown className="h-6 w-6" /> },
	{ name: "Analytics & Reports", description: "Comprehensive expense analytics and insights", icon: <BarChart3 className="h-6 w-6" /> }
];

export default function ExpenseTrackingPage() {
	return (
		<>
			{/* Hero Section */}
			<section className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center max-w-4xl mx-auto">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
							<Receipt className="h-4 w-4 mr-2" />
							Expense Tracking
						</Badge>
						<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
							Track Expenses
							<br />
							<span className="text-4xl md:text-5xl">Effortlessly</span>
						</h1>
						<p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
							Capture receipts, categorize expenses, and manage approvals all in one place. Save time with AI-powered automation.
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
							Why Choose Expense Tracking
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">expense management</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional expense tracking software
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
					<Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
						<CardContent className="p-8">
							<div className="text-center mb-8">
								<h3 className="text-2xl font-bold text-slate-900 mb-4">
									Enterprise-Grade Capabilities
								</h3>
								<p className="text-slate-600">
									Everything you need to manage expenses professionally
								</p>
							</div>

							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
								{capabilities.map((capability) => (
									<div 
										key={`capability-${capability.title.toLowerCase().replace(/\s+/g, '-')}`}
										className="group p-6 rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300"
									>
										<div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
											{capability.icon}
										</div>
										<h4 className="font-semibold text-slate-900 mb-2">{capability.title}</h4>
										<p className="text-sm text-slate-600">{capability.description}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Expense Types Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<Receipt className="h-4 w-4 mr-2" />
							Expense Features
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Complete Expense Solution
							<span className="block text-primary">For Every Business Type</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Comprehensive expense tracking features designed to simplify your financial management
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{expenseTypes.map((type) => (
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
				title="Ready to Simplify Expense Management?"
				description="Join thousands of businesses using Expense Tracking to save time and stay compliant"
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

