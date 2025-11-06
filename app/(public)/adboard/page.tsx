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
import { Target, TrendingUp, BarChart3, DollarSign, Eye, MousePointer, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Adboard | Financbase",
	description: "Campaign management and advertising analytics platform for businesses",
};

const features = [
	{
		icon: Target,
		title: "Campaign Management",
		description: "Create, manage, and optimize advertising campaigns across multiple platforms"
	},
	{
		icon: TrendingUp,
		title: "ROAS Tracking",
		description: "Track Return on Ad Spend with real-time analytics and performance insights"
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description: "Deep dive into campaign performance with detailed metrics and reporting"
	},
	{
		icon: DollarSign,
		title: "Budget Optimization",
		description: "Automatically optimize ad spend across channels for maximum ROI"
	},
	{
		icon: Eye,
		title: "Audience Insights",
		description: "Understand your audience with detailed demographics and behavior analysis"
	},
	{
		icon: MousePointer,
		title: "Conversion Tracking",
		description: "Track conversions across all touchpoints with advanced attribution modeling"
	}
];

const platforms = [
	{ name: "Google Ads", description: "Search, Display, Shopping, YouTube" },
	{ name: "Facebook Ads", description: "Social media advertising and retargeting" },
	{ name: "LinkedIn Ads", description: "B2B advertising and professional targeting" },
	{ name: "Twitter Ads", description: "Social media campaigns and engagement" },
	{ name: "TikTok Ads", description: "Video advertising for younger audiences" },
	{ name: "Amazon Ads", description: "E-commerce advertising and product promotion" }
];

const stats = [
	{ label: "Average ROAS Improvement", value: "3.2x" },
	{ label: "Campaign Setup Time", value: "75% faster" },
	{ label: "Cost Reduction", value: "40% less" },
	{ label: "Conversion Rate", value: "+85%" }
];

export default function AdboardPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
							Campaign Management Platform
						</Badge>
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 drop-shadow-sm">
							Adboard
						</h1>
						<p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
							Professional campaign management and advertising analytics platform. 
							Optimize your ad spend, track performance, and maximize ROI across all channels.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
								Start Free Trial
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
							<Button variant="outline" size="lg">
								View Demo
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{stats.map((stat) => (
							<div key={stat.label} className="text-center">
								<div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
									{stat.value}
								</div>
								<div className="text-gray-600">{stat.label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
							Powerful Advertising Features
						</h2>
						<p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
							Everything you need to manage successful advertising campaigns
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature) => (
							<Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
								<CardHeader>
									<div className="flex items-center gap-3">
										<div className="p-2 bg-blue-100 rounded-lg">
											<feature.icon className="h-6 w-6 text-blue-600" />
										</div>
										<CardTitle className="text-lg">{feature.title}</CardTitle>
									</div>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Platforms Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
							Connect All Your Ad Platforms
						</h2>
						<p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
							Manage campaigns across all major advertising platforms from one dashboard
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{platforms.map((platform) => (
							<Card key={platform.name} className="border-0 shadow-lg">
								<CardContent className="p-6">
									<h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
									<p className="text-gray-600">{platform.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
						Ready to Optimize Your Advertising?
					</h2>
					<p className="text-xl text-blue-100 mb-8">
						Join thousands of businesses using Adboard to maximize their advertising ROI
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
							Start Free Trial
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
							Contact Sales
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
