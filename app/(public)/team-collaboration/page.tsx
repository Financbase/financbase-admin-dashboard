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
import { CheckCircle, Users, MessageSquare, Calendar, FileText, Video, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Team Collaboration | Financbase",
	description: "Tools to help your teams work better together with advanced collaboration features",
};

const features = [
	{
		icon: Users,
		title: "Team Workspaces",
		description: "Create dedicated workspaces for different projects and teams with role-based access"
	},
	{
		icon: MessageSquare,
		title: "Real-time Chat",
		description: "Communicate instantly with team members through channels, direct messages, and video calls"
	},
	{
		icon: Calendar,
		title: "Project Management",
		description: "Plan, track, and manage projects with kanban boards, timelines, and task assignments"
	},
	{
		icon: FileText,
		title: "Document Collaboration",
		description: "Work together on documents with real-time editing, comments, and version control"
	},
	{
		icon: Video,
		title: "Video Meetings",
		description: "Host HD video meetings with screen sharing, recording, and breakout rooms"
	},
	{
		icon: Share2,
		title: "File Sharing",
		description: "Share files securely with advanced permissions and access controls"
	}
];

const pricingPlans = [
	{
		name: "Starter",
		price: "$8",
		period: "/user/month",
		description: "Perfect for small teams",
		features: [
			"Up to 10 team members",
			"Unlimited messages",
			"Basic file sharing",
			"Video calls (up to 40 min)",
			"Email support"
		],
		cta: "Start Free Trial",
		popular: false
	},
	{
		name: "Professional",
		price: "$15",
		period: "/user/month",
		description: "Ideal for growing teams",
		features: [
			"Unlimited team members",
			"Advanced project management",
			"Unlimited video calls",
			"Screen sharing & recording",
			"Priority support",
			"Advanced integrations"
		],
		cta: "Start Free Trial",
		popular: true
	},
	{
		name: "Enterprise",
		price: "$25",
		period: "/user/month",
		description: "For large organizations",
		features: [
			"Everything in Professional",
			"SSO & advanced security",
			"Custom integrations",
			"Dedicated support",
			"Advanced analytics",
			"Custom branding"
		],
		cta: "Contact Sales",
		popular: false
	}
];

export default function TeamCollaborationPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<Badge variant="secondary" className="mb-4">
						<Users className="h-4 w-4 mr-2" />
						Team Collaboration
					</Badge>
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
						Work Better Together
						<br />
						<span className="text-4xl">With Your Team</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Boost productivity with powerful collaboration tools. 
						Chat, meet, share, and manage projects all in one place.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="text-lg px-8">
							Start Free Trial
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button variant="outline" size="lg" className="text-lg px-8">
							Watch Demo
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-4">
						14-day free trial • No credit card required
					</p>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold mb-4">Everything Your Team Needs</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						From communication to project management, we've got all the tools your team needs to succeed.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card key={index} className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
									<feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
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
						Choose the plan that fits your team size. Upgrade or downgrade anytime.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<Card key={index} className={`relative ${plan.popular ? 'border-green-500 shadow-lg scale-105' : ''}`}>
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-green-500">Most Popular</Badge>
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
				<Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
					<CardContent className="text-center py-16">
						<h2 className="text-3xl font-bold mb-4">Ready to Collaborate?</h2>
						<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
							Join thousands of teams who have improved their productivity with our collaboration tools.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" variant="secondary" className="text-lg px-8">
								Start Your Free Trial
							</Button>
							<Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-green-600">
								Schedule a Demo
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
