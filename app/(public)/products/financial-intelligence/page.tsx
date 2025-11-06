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
import { Brain, TrendingUp, BarChart3, DollarSign, Activity, Target, CheckCircle, Sparkles, Zap, Shield, Clock, Users, PieChart, LineChart } from "lucide-react";
import Link from "next/link";
import FinancialIntelligenceHero from "@/components/home/financial-intelligence-hero";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";

export const metadata: Metadata = {
	title: "Financial Intelligence | Financbase",
	description: "AI-powered financial insights, predictions, and strategic recommendations for your business",
	openGraph: {
		title: "Financial Intelligence | Financbase",
		description: "AI-powered financial insights, predictions, and strategic recommendations for your business",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Financial Intelligence | Financbase",
		description: "AI-powered financial insights, predictions, and strategic recommendations for your business",
	},
};

const features = [
	{
		id: "ai-insights",
		icon: <Brain className="h-8 w-8" />,
		title: "AI-Powered Insights",
		description: "Get intelligent financial insights powered by machine learning algorithms that analyze your data patterns and identify opportunities",
		benefits: [
			"Automated financial analysis",
			"Pattern recognition and anomaly detection",
			"Predictive cash flow forecasting",
			"Intelligent expense categorization"
		],
		metrics: {
			value: "94%",
			label: "Prediction Accuracy",
			change: "+8%"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "health-scoring",
		icon: <Activity className="h-8 w-8" />,
		title: "Financial Health Scoring",
		description: "Comprehensive health scoring across revenue, expenses, cash flow, profitability, and growth metrics",
		benefits: [
			"Real-time health score calculation",
			"Multi-dimensional analysis",
			"Trend tracking and alerts",
			"Benchmark comparisons"
		],
		metrics: {
			value: "85",
			label: "Average Health Score",
			change: "+12%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "smart-recommendations",
		icon: <Target className="h-8 w-8" />,
		title: "Smart Recommendations",
		description: "Actionable recommendations to optimize revenue, reduce costs, improve cash flow, and increase profitability",
		benefits: [
			"Prioritized action items",
			"Impact and effort analysis",
			"Implementation guidance",
			"Expected ROI calculations"
		],
		metrics: {
			value: "$12K",
			label: "Avg Savings",
			change: "+25%"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const capabilities = [
	{
		icon: <Brain className="h-6 w-6" />,
		title: "AI-Powered",
		description: "Machine learning algorithms for accurate predictions"
	},
	{
		icon: <Clock className="h-6 w-6" />,
		title: "Real-Time",
		description: "Live financial data and instant insights"
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Multi-User",
		description: "Team collaboration with role-based access"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Secure & Private",
		description: "Enterprise-grade security and data protection"
	}
];

const intelligenceTypes = [
	{ name: "Agency Intelligence", description: "Client profitability, project margins, and agency-specific insights", icon: <Users className="h-6 w-6" /> },
	{ name: "E-commerce Intelligence", description: "Product performance, inventory optimization, and sales forecasting", icon: <PieChart className="h-6 w-6" /> },
	{ name: "Startup Intelligence", description: "Burn rate, runway analysis, and growth metrics", icon: <TrendingUp className="h-6 w-6" /> },
	{ name: "Health Scoring", description: "Comprehensive financial health assessment", icon: <Activity className="h-6 w-6" /> },
	{ name: "AI Predictions", description: "Revenue, cash flow, and expense forecasting", icon: <LineChart className="h-6 w-6" /> },
	{ name: "Recommendations", description: "Actionable insights to optimize your finances", icon: <Target className="h-6 w-6" /> }
];

export default function FinancialIntelligencePage() {
	return (
		<>
			<FinancialIntelligenceHero />

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
							Why Choose Financial Intelligence
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">financial decision-making</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional financial software
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
									Everything you need to make smarter financial decisions
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

			{/* Intelligence Types Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<Brain className="h-4 w-4 mr-2" />
							Intelligence Modules
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Specialized Intelligence
							<span className="block text-primary">For Every Business Type</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Tailored financial intelligence solutions designed for your specific industry and business model
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{intelligenceTypes.map((type) => (
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
				title="Ready to Transform Your Financial Operations?"
				description="Join thousands of businesses using Financial Intelligence to make smarter financial decisions"
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

