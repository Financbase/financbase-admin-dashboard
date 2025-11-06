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
import { CheckCircle, BarChart3, TrendingUp, PieChart, Target, Zap, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { CSSVariablesTest } from "@/components/dev/css-variables-test";

export const metadata: Metadata = {
	title: "Analytics | Financbase",
	description: "Track and analyze your website traffic with advanced analytics and insights",
};

const features = [
	{
		icon: BarChart3,
		title: "Real-time Analytics",
		description: "Monitor your website performance with live data updates and instant insights"
	},
	{
		icon: TrendingUp,
		title: "Growth Tracking",
		description: "Track visitor growth, conversion rates, and revenue trends over time"
	},
	{
		icon: PieChart,
		title: "Audience Insights",
		description: "Understand your visitors with detailed demographics, behavior, and engagement data"
	},
	{
		icon: Target,
		title: "Goal Tracking",
		description: "Set and monitor custom goals to measure the success of your marketing campaigns"
	},
	{
		icon: Zap,
		title: "Automated Reports",
		description: "Get weekly and monthly reports delivered automatically to your inbox"
	},
	{
		icon: Eye,
		title: "Heatmaps & Recordings",
		description: "See how users interact with your site with visual heatmaps and session recordings"
	}
];

const pricingPlans = [
	{
		name: "Basic",
		price: "$0",
		period: "/month",
		description: "Perfect for personal websites",
		features: [
			"Up to 10,000 page views",
			"Basic analytics",
			"7-day data retention",
			"Standard reports",
			"Email support"
		],
		cta: "Get Started Free",
		popular: false
	},
	{
		name: "Professional",
		price: "$29",
		period: "/month",
		description: "Ideal for growing businesses",
		features: [
			"Up to 100,000 page views",
			"Advanced analytics",
			"1-year data retention",
			"Custom reports",
			"Priority support",
			"Goal tracking"
		],
		cta: "Start Free Trial",
		popular: true
	},
	{
		name: "Enterprise",
		price: "$99",
		period: "/month",
		description: "For large organizations",
		features: [
			"Unlimited page views",
			"All analytics features",
			"Unlimited data retention",
			"Custom dashboards",
			"Dedicated support",
			"API access"
		],
		cta: "Contact Sales",
		popular: false
	}
];

export default function AnalyticsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<Badge variant="secondary" className="mb-4">
						<BarChart3 className="h-4 w-4 mr-2" />
						Analytics
					</Badge>
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
						Track & Analyze
						<br />
						<span className="text-4xl">Your Website Traffic</span>
					</h1>
					<p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
						Get deep insights into your website performance with powerful analytics. 
						Make data-driven decisions to grow your business.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="text-lg px-8">
							Start Free Trial
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button variant="outline" size="lg" className="text-lg px-8">
							View Live Demo
						</Button>
					</div>
					<p className="text-sm text-foreground/80 mt-4 font-medium">
						Free forever plan • No credit card required
					</p>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold mb-4 drop-shadow-sm text-foreground">Powerful Analytics Features</h2>
					<p className="text-xl text-foreground/90 max-w-2xl mx-auto font-medium">
						Everything you need to understand your audience and optimize your website performance.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card key={index} className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base text-muted-foreground">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Pricing Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold mb-4 drop-shadow-sm text-foreground">Simple, Transparent Pricing</h2>
					<p className="text-xl text-foreground/90 max-w-2xl mx-auto font-medium">
						Start free and upgrade as you grow. No hidden fees or long-term contracts.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-primary">Most Popular</Badge>
								</div>
							)}
							<CardHeader className="text-center">
								<CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold text-foreground">{plan.price}</span>
									<span className="text-muted-foreground">{plan.period}</span>
								</div>
								<CardDescription className="mt-2 text-muted-foreground">{plan.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3 mb-6">
									{plan.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-center">
											<CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
											<span className="text-foreground">{feature}</span>
										</li>
									))}
								</ul>
								<Button 
									className="w-full" 
									variant={plan.popular ? "default" : "outline"}
									size="lg"
								>
									{plan.cta}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-20">
				<Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
					<CardContent className="text-center py-16">
						<h2 className="text-3xl font-bold mb-4 text-primary-foreground">Ready to Get Insights?</h2>
						<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-primary-foreground">
							Join thousands of websites using our analytics to make better decisions.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" variant="secondary" className="text-lg px-8">
								Start Your Free Trial
							</Button>
							<Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
								Schedule a Demo
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* CSS Variables Test Section */}
			<section className="container mx-auto px-4 py-8">
				<CSSVariablesTest />
			</section>
		</div>
	);
}
