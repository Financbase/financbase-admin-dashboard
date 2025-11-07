/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Eye, CheckCircle, Sparkles, Zap, Shield, Clock, Users } from "lucide-react";
import { PlatformLogo } from "@/components/ui/platform-logo";
import AdboardHero from "@/components/home/adboard-hero";
import AdboardSocialProof from "@/components/home/adboard-social-proof";
import AdboardFeaturesShowcase from "@/components/home/adboard-features-showcase";
import AdboardPricing from "@/components/home/adboard-pricing";
import AdboardFAQ from "@/components/home/adboard-faq";
import { PublicCTA } from "@/components/layout/public-form";
import { EnterpriseCapabilitiesSection } from "@/components/home/enterprise-capabilities-section";

// Icon mapping to avoid JSX in server component
const iconMap = {
  Target,
  TrendingUp,
  Eye,
  Zap,
  Shield,
  Clock,
  Users,
};

export const metadata: Metadata = {
	title: "Adboard | Financbase",
	description: "Campaign management and advertising analytics platform for businesses",
	openGraph: {
		title: "Adboard | Financbase",
		description: "Campaign management and advertising analytics platform for businesses",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Adboard | Financbase",
		description: "Campaign management and advertising analytics platform for businesses",
	},
};

const features = [
	{
		id: "campaign-management",
		iconName: "Target" as keyof typeof iconMap,
		title: "Campaign Management",
		description: "Create, manage, and optimize advertising campaigns across multiple platforms from one unified dashboard",
		benefits: [
			"Multi-platform campaign creation",
			"Automated budget allocation",
			"Real-time performance monitoring",
			"Smart optimization recommendations"
		],
		metrics: {
			value: "75%",
			label: "Faster Setup",
			change: "+30%"
		},
		color: "from-blue-500 to-blue-600"
	},
	{
		id: "roas-tracking",
		iconName: "TrendingUp" as keyof typeof iconMap,
		title: "ROAS Tracking",
		description: "Track Return on Ad Spend with real-time analytics and performance insights across all channels",
		benefits: [
			"Real-time ROAS calculations",
			"Cross-channel attribution",
			"Revenue tracking by campaign",
			"Automated reporting"
		],
		metrics: {
			value: "3.2x",
			label: "Average ROAS",
			change: "+45%"
		},
		color: "from-emerald-500 to-emerald-600"
	},
	{
		id: "audience-insights",
		iconName: "Eye" as keyof typeof iconMap,
		title: "Audience Insights",
		description: "Understand your audience with detailed demographics, behavior analysis, and segmentation tools",
		benefits: [
			"Demographic analysis",
			"Behavior tracking",
			"Audience segmentation",
			"Lookalike audience creation"
		],
		metrics: {
			value: "+85%",
			label: "Conversion Rate",
			change: "+23%"
		},
		color: "from-purple-500 to-purple-600"
	}
];

const platforms = [
	{ 
		name: "Google Ads", 
		description: "Search, Display, Shopping, YouTube", 
		logo: "/logos/google-ads.svg",
		fallback: "/logos/google.svg"
	},
	{ 
		name: "Facebook Ads", 
		description: "Social media advertising and retargeting", 
		logo: "/logos/meta.svg",
		fallback: "/logos/facebook.svg"
	},
	{ 
		name: "LinkedIn Ads", 
		description: "B2B advertising and professional targeting", 
		logo: "/logos/linkedin.svg",
		fallback: "/logos/linkedin.svg"
	},
	{ 
		name: "Twitter Ads", 
		description: "Social media campaigns and engagement", 
		logo: "/logos/x.svg",
		fallback: "/logos/twitter.svg"
	},
	{ 
		name: "TikTok Ads", 
		description: "Video advertising for younger audiences", 
		logo: "/logos/tiktok.svg",
		fallback: "/logos/tiktok.svg"
	},
	{ 
		name: "Amazon Ads", 
		description: "E-commerce advertising and product promotion", 
		logo: "/logos/amazon.svg",
		fallback: "/logos/amazon.svg"
	}
];

const capabilities = [
	{
		iconName: "Zap" as keyof typeof iconMap,
		title: "Lightning Fast",
		description: "Process thousands of campaigns in seconds"
	},
	{
		iconName: "Clock" as keyof typeof iconMap,
		title: "Real-Time Updates",
		description: "Live data sync across all platforms"
	},
	{
		iconName: "Users" as keyof typeof iconMap,
		title: "Team Collaboration",
		description: "Seamless collaboration across departments"
	},
	{
		iconName: "Shield" as keyof typeof iconMap,
		title: "Secure & Compliant",
		description: "Enterprise-grade security and compliance"
	}
];

export default function AdboardPage() {
	return (
		<>
			<AdboardHero />

			<AdboardSocialProof />

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
							Why Choose Adboard
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							Built for the future of
							<span className="block text-primary">advertising management</span>
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Three core capabilities that set us apart from traditional ad management tools
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
											{(() => {
												const IconComponent = iconMap[feature.iconName];
												return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
											})()}
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
						description="Everything you need to scale your advertising operations"
						iconMap={iconMap}
					/>
				</div>
			</section>

			{/* Platforms Integration Section */}
			<section className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 px-4 py-2">
							<Target className="h-4 w-4 mr-2" />
							Platform Integrations
						</Badge>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
							Connect All Your
							<span className="block text-primary">Ad Platforms</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Manage campaigns across all major advertising platforms from one unified dashboard
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{platforms.map((platform) => (
							<Card key={platform.name} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
								<CardContent className="p-6">
									<div className="flex items-center gap-4 mb-4">
										<div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
											<PlatformLogo 
												src={platform.logo}
												fallback={platform.fallback}
												alt={`${platform.name} logo`}
											/>
										</div>
										<h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
									</div>
									<p className="text-gray-600">{platform.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			<AdboardFeaturesShowcase />

			<AdboardPricing />

			<AdboardFAQ />

			<PublicCTA
				title="Ready to Optimize Your Advertising?"
				description="Join thousands of businesses using Adboard to maximize their advertising ROI"
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
