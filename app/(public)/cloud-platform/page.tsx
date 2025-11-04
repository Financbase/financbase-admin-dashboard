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
import { CheckCircle, Cloud, Server, Zap, Shield, Users, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Cloud Platform | Financbase",
	description: "Deploy and scale apps in the cloud with our enterprise-grade cloud platform",
};

const features = [
	{
		icon: Cloud,
		title: "Global Infrastructure",
		description: "Deploy your applications across multiple regions with our worldwide network of data centers"
	},
	{
		icon: Server,
		title: "Auto Scaling",
		description: "Automatically scale your resources up or down based on demand to optimize costs"
	},
	{
		icon: Zap,
		title: "High Performance",
		description: "Lightning-fast SSD storage and optimized networking for maximum application performance"
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description: "Bank-grade security with encryption, compliance certifications, and 24/7 monitoring"
	},
	{
		icon: Users,
		title: "Team Collaboration",
		description: "Collaborate with your team using advanced project management and deployment tools"
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description: "Monitor performance with detailed metrics, logs, and real-time dashboards"
	}
];

const pricingPlans = [
	{
		name: "Developer",
		price: "$19",
		period: "/month",
		description: "Perfect for developers and startups",
		features: [
			"1 vCPU, 2GB RAM",
			"25GB SSD storage",
			"1TB bandwidth",
			"Basic monitoring",
			"Email support"
		],
		cta: "Start Free Trial",
		popular: false
	},
	{
		name: "Business",
		price: "$79",
		period: "/month",
		description: "Ideal for growing businesses",
		features: [
			"4 vCPU, 8GB RAM",
			"100GB SSD storage",
			"5TB bandwidth",
			"Advanced monitoring",
			"Priority support",
			"Auto-scaling"
		],
		cta: "Start Free Trial",
		popular: true
	},
	{
		name: "Enterprise",
		price: "$299",
		period: "/month",
		description: "For large organizations",
		features: [
			"16 vCPU, 32GB RAM",
			"500GB SSD storage",
			"Unlimited bandwidth",
			"Custom monitoring",
			"Dedicated support",
			"Custom configurations"
		],
		cta: "Contact Sales",
		popular: false
	}
];

export default function CloudPlatformPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<Badge variant="secondary" className="mb-4">
						<Cloud className="h-4 w-4 mr-2" />
						Cloud Platform
					</Badge>
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
						Deploy & Scale Apps
						<br />
						<span className="text-4xl">In the Cloud</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Enterprise-grade cloud infrastructure for modern applications. 
						Deploy, scale, and manage your apps with confidence.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="text-lg px-8">
							Start Free Trial
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button variant="outline" size="lg" className="text-lg px-8">
							View Documentation
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-4">
						30-day free trial • No credit card required
					</p>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold mb-4">Enterprise-Grade Infrastructure</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Built for scale, security, and performance. Everything you need to run production applications.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card key={index} className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
									<feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base">
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
					<h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Pay only for what you use. Scale up or down anytime with no long-term commitments.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-blue-500">Most Popular</Badge>
								</div>
							)}
							<CardHeader className="text-center">
								<CardTitle className="text-2xl">{plan.name}</CardTitle>
								<div className="mt-4">
									<span className="text-4xl font-bold">{plan.price}</span>
									<span className="text-muted-foreground">{plan.period}</span>
								</div>
								<CardDescription className="mt-2">{plan.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3 mb-6">
									{plan.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-center">
											<CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
											<span>{feature}</span>
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
				<Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
					<CardContent className="text-center py-16">
						<h2 className="text-3xl font-bold mb-4">Ready to Deploy?</h2>
						<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
							Join thousands of developers and businesses who trust our cloud platform.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" variant="secondary" className="text-lg px-8">
								Start Your Free Trial
							</Button>
							<Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600">
								Schedule a Demo
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
