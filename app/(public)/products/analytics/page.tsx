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
import { BarChart3, TrendingUp, PieChart, Target, Zap, Eye, CheckCircle, Sparkles, Shield, Clock, Users, Activity, LineChart } from "lucide-react";
import AnalyticsHero from "@/components/home/analytics-hero";
import PremiumSocialProof from "@/components/home/premium-social-proof";
import PremiumFeaturesShowcase from "@/components/home/premium-features-showcase";
import PricingPreview from "@/components/home/pricing-preview";
import FAQ from "@/components/home/faq";
import { PublicCTA } from "@/components/layout/public-form";
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section";

export const metadata: Metadata = {
	title: "Analytics | Financbase",
	description: "Track and analyze your website traffic with advanced analytics and insights",
	openGraph: {
		title: "Analytics | Financbase",
		description: "Track and analyze your website traffic with advanced analytics and insights",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Analytics | Financbase",
		description: "Track and analyze your website traffic with advanced analytics and insights",
	},
};

const features = [
	{
		id: "real-time-analytics",
		icon: <BarChart3 className="h-8 w-8" />,
		title: "Real-time Analytics",
		description: "Monitor your website performance with live data updates and instant insights. Track visitors, page views, and conversions as they happen",
		benefits: [
			"Live visitor tracking",
			"Real-time dashboard updates",
			"Instant alert notifications",
			"Performance monitoring"
		],
		metrics: {
			value: "99.9%",
			label: "Uptime",
			change: "+0.2%"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "growth-tracking",
		icon: <TrendingUp className="h-8 w-8" />,
		title: "Growth Tracking",
		description: "Track visitor growth, conversion rates, and revenue trends over time. Identify what's working and optimize for better results",
		benefits: [
			"Revenue trend analysis",
			"Conversion rate tracking",
			"Visitor growth metrics",
			"Performance benchmarking"
		],
		metrics: {
			value: "45%",
			label: "Avg Growth",
			change: "+12%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "audience-insights",
		icon: <PieChart className="h-8 w-8" />,
		title: "Audience Insights",
		description: "Understand your visitors with detailed demographics, behavior, and engagement data. Make data-driven decisions",
		benefits: [
			"Demographic analysis",
			"Behavior tracking",
			"Engagement metrics",
			"Custom audience segments"
		],
		metrics: {
			value: "2.5M",
			label: "Events Tracked",
			change: "+30%"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const capabilities = [
	{
		icon: <BarChart3 className="h-6 w-6" />,
		title: "Advanced Reports",
		description: "Comprehensive analytics reports and dashboards"
	},
	{
		icon: <Clock className="h-6 w-6" />,
		title: "Real-Time Data",
		description: "Live updates and instant insights"
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Team Collaboration",
		description: "Share insights with your team"
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Privacy First",
		description: "GDPR compliant and privacy-focused"
	}
];

const analyticsTypes = [
	{ name: "Real-Time Analytics", description: "Monitor website performance with live data updates and instant insights", icon: <Activity className="h-6 w-6" /> },
	{ name: "Goal Tracking", description: "Set and monitor custom goals to measure the success of your marketing campaigns", icon: <Target className="h-6 w-6" /> },
	{ name: "Automated Reports", description: "Get weekly and monthly reports delivered automatically to your inbox", icon: <Zap className="h-6 w-6" /> },
	{ name: "Heatmaps & Recordings", description: "See how users interact with your site with visual heatmaps and session recordings", icon: <Eye className="h-6 w-6" /> },
	{ name: "Revenue Analytics", description: "Track revenue, conversions, and e-commerce performance metrics", icon: <TrendingUp className="h-6 w-6" /> },
	{ name: "Custom Dashboards", description: "Build custom dashboards with the metrics that matter most to your business", icon: <LineChart className="h-6 w-6" /> }
];

export default function AnalyticsPage() {
	return (
		<>
			<AnalyticsHero />

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
							Why Choose Analytics
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">data-driven decisions</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional analytics platforms
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
						description="Everything you need to understand your audience and optimize performance"
					/>
				</div>
			</section>

			{/* Analytics Types Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<BarChart3 className="h-4 w-4 mr-2" />
							Analytics Features
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Complete Analytics Solution
							<span className="block text-primary">For Every Business Type</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Comprehensive analytics features designed to help you understand and optimize your website performance
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{analyticsTypes.map((type) => (
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
				title="Ready to Get Insights?"
				description="Join thousands of websites using Analytics to make better data-driven decisions"
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
