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
import { 
	CheckCircle, 
	Code, 
	Zap, 
	Shield, 
	Users, 
	ArrowRight, 
	BookOpen, 
	Terminal, 
	HelpCircle,
	Copy,
	Check,
	BarChart3,
	Clock,
	Globe,
	TrendingUp
} from "lucide-react";
import Link from "next/link";
import { CodeExamples } from "./code-examples";
import { StatsSection } from "./stats-section";

export const metadata: Metadata = {
	title: "API Documentation | Financbase",
	description: "Build custom integrations with our powerful API and developer tools",
};

const features = [
	{
		icon: Code,
		title: "RESTful API",
		description: "Clean, intuitive REST API with comprehensive endpoints for all platform features",
		color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
	},
	{
		icon: Zap,
		title: "Real-time Webhooks",
		description: "Get instant notifications when events occur in your account with webhook support",
		color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description: "OAuth 2.0, API keys, and rate limiting to keep your integrations secure",
		color: "bg-green-500/10 text-green-600 dark:text-green-400"
	},
	{
		icon: Users,
		title: "SDKs & Libraries",
		description: "Official SDKs for popular languages including JavaScript, Python, PHP, and more",
		color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
	},
	{
		icon: BookOpen,
		title: "Interactive Docs",
		description: "Try API endpoints directly in your browser with our interactive documentation",
		color: "bg-pink-500/10 text-pink-600 dark:text-pink-400"
	},
	{
		icon: Terminal,
		title: "CLI Tools",
		description: "Command-line tools to manage your integrations and automate deployments",
		color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
	}
];

const pricingPlans = [
	{
		name: "Developer",
		price: "$0",
		period: "/month",
		description: "Perfect for developers",
		features: [
			"1,000 API calls/month",
			"Basic documentation",
			"Community support",
			"Sandbox environment",
			"Webhook support"
		],
		cta: "Get Started Free",
		popular: false
	},
	{
		name: "Professional",
		price: "$49",
		period: "/month",
		description: "Ideal for growing apps",
		features: [
			"50,000 API calls/month",
			"Priority support",
			"Advanced webhooks",
			"SDK access",
			"Rate limit increases"
		],
		cta: "Start Free Trial",
		popular: true
	},
	{
		name: "Enterprise",
		price: "$199",
		period: "/month",
		description: "For large applications",
		features: [
			"Unlimited API calls",
			"Dedicated support",
			"Custom integrations",
			"SLA guarantee",
			"White-label options"
		],
		cta: "Contact Sales",
		popular: false
	}
];

export default function APIDocumentationPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Breadcrumbs */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link href="/" className="hover:text-primary transition-colors">
							Home
						</Link>
						<span>/</span>
						<Link href="/docs" className="hover:text-primary transition-colors">
							Documentation
						</Link>
						<span>/</span>
						<span className="text-foreground font-medium">API</span>
					</div>
				</div>
			</div>

			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-20">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-6">
							<Code className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								API Documentation
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
							Build Custom Integrations with{" "}
							<span className="text-primary">Our API</span>
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
							Powerful REST API with comprehensive documentation, SDKs, and developer tools. 
							Build amazing integrations in minutes, not hours.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8 h-12" asChild>
								<Link href="/auth/sign-up">
									Get API Key
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8 h-12" asChild>
								<Link href="/docs/api/endpoints">
									View Documentation
								</Link>
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8 h-12" asChild>
								<Link href="/docs/api/openapi.yaml" target="_blank">
									OpenAPI Spec
								</Link>
							</Button>
						</div>
						<p className="text-sm text-muted-foreground mt-6">
							Free developer plan • No credit card required
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-7xl mx-auto">
					{/* Stats Section */}
					<StatsSection />

					{/* Features Section */}
					<section className="mb-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Developer-Friendly Features</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Everything you need to build powerful integrations quickly and efficiently.
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{features.map((feature, index) => (
								<Card 
									key={index} 
									className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20"
								>
									<CardHeader>
										<div className={`mx-auto w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
											<feature.icon className="h-7 w-7" />
										</div>
										<CardTitle className="text-xl text-center">{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base text-center">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Code Examples */}
					<section className="mb-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start Examples</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Get started with our API in just a few lines of code. Copy and paste ready-to-use examples.
							</p>
						</div>
						
						<CodeExamples />
					</section>

					{/* Pricing Section */}
					<section className="mb-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Start free and scale as your application grows.
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
							{pricingPlans.map((plan, index) => (
								<Card 
									key={index} 
									className={`relative transition-all duration-300 hover:shadow-xl ${
										plan.popular 
											? 'border-primary shadow-lg scale-105 border-2' 
											: 'hover:border-primary/20 hover:scale-[1.02]'
									}`}
								>
									{plan.popular && (
										<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
											<Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
												Most Popular
											</Badge>
										</div>
									)}
									<CardHeader className="text-center pb-4">
										<CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
										<div className="mt-4 mb-2">
											<span className="text-5xl font-bold">{plan.price}</span>
											<span className="text-muted-foreground text-lg">{plan.period}</span>
										</div>
										<CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-4 mb-8">
											{plan.features.map((feature, featureIndex) => (
												<li key={featureIndex} className="flex items-start">
													<CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
													<span className="text-sm">{feature}</span>
												</li>
											))}
										</ul>
										<Button 
											className="w-full h-11" 
											variant={plan.popular ? "default" : "outline"}
											size="lg"
											asChild
										>
											<Link href={plan.popular ? "/auth/sign-up" : "/auth/sign-up"}>
												{plan.cta}
											</Link>
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* CTA Section */}
					<section className="mb-20">
						<Card className="bg-gradient-to-r from-primary/90 to-primary text-white border-0 shadow-2xl">
							<CardContent className="text-center py-16 px-6">
								<h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build?</h2>
								<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
									Join thousands of developers building amazing integrations with our API.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button 
										size="lg" 
										className="text-lg px-8 h-12 bg-white text-primary hover:bg-white/90 border-white" 
										asChild
									>
										<Link href="/auth/sign-up">
											Get Your API Key
											<ArrowRight className="ml-2 h-5 w-5" />
										</Link>
									</Button>
									<Button 
										size="lg" 
										variant="outline" 
										className="text-lg px-8 h-12 border-white text-white hover:bg-white hover:text-primary" 
										asChild
									>
										<Link href="/docs/api/endpoints">
											View Full Documentation
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Support Section */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg">
						<CardContent className="p-8 md:p-12 text-center">
							<div className="max-w-2xl mx-auto">
								<h3 className="text-2xl md:text-3xl font-semibold mb-4">Need Help?</h3>
								<p className="text-muted-foreground mb-8 text-lg">
									Can't find what you're looking for? Our support team is here
									to help you get the most out of Financbase.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button size="lg" asChild>
										<Link href="/support">
											<HelpCircle className="h-4 w-4 mr-2" />
											Contact Support
										</Link>
									</Button>
									<Button variant="outline" size="lg" asChild>
										<Link href="/docs/help">
											<BookOpen className="h-4 w-4 mr-2" />
											Browse Help Center
										</Link>
									</Button>
									<Button variant="outline" size="lg" asChild>
										<Link href="/docs/api/openapi.yaml" target="_blank">
											<Code className="h-4 w-4 mr-2" />
											OpenAPI Spec
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
