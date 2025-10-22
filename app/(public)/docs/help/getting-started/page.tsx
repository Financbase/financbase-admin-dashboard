"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Users,
	DollarSign,
	BarChart3,
	Settings,
	Shield,
	BookOpen,
	ArrowRight,
} from "lucide-react";

const steps = [
	{
		number: 1,
		title: "Create Your Account",
		description: "Sign up for a Financbase account with your email address",
		duration: "2 minutes",
		icon: Users,
		color: "bg-blue-500",
	},
	{
		number: 2,
		title: "Complete Onboarding",
		description: "Set up your organization details and preferences",
		duration: "5 minutes",
		icon: Settings,
		color: "bg-green-500",
	},
	{
		number: 3,
		title: "Import Your Data",
		description: "Upload your financial data or connect your bank accounts",
		duration: "10 minutes",
		icon: DollarSign,
		color: "bg-purple-500",
	},
	{
		number: 4,
		title: "Explore Dashboard",
		description: "Get familiar with your financial dashboard and insights",
		duration: "5 minutes",
		icon: BarChart3,
		color: "bg-orange-500",
	},
	{
		number: 5,
		title: "Configure Settings",
		description: "Customize your preferences and notification settings",
		duration: "3 minutes",
		icon: Settings,
		color: "bg-red-500",
	},
];

const features = [
	{
		title: "Real-time Analytics",
		description: "Monitor your financial health with live data and insights",
		icon: BarChart3,
	},
	{
		title: "Multi-user Support",
		description: "Collaborate with team members and manage permissions",
		icon: Users,
	},
	{
		title: "Bank Integration",
		description: "Connect with 10,000+ financial institutions worldwide",
		icon: Shield,
	},
	{
		title: "Export & Reporting",
		description: "Generate custom reports and export data in multiple formats",
		icon: BookOpen,
	},
];

export default function GettingStartedPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/docs/help">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Help
							</Link>
						</Button>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<BookOpen className="h-5 w-5 text-primary" />
								<Badge variant="secondary">Getting Started</Badge>
							</div>
							<h1 className="text-2xl font-bold">Quick Start Guide</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Introduction */}
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold mb-4">
							Get Started with Financbase in 5 Easy Steps
						</h2>
						<p className="text-xl text-muted-foreground mb-6">
							Welcome to Financbase! This guide will help you get up and running
							with your financial dashboard in just 25 minutes.
						</p>
						<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>Total time: ~25 minutes</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="h-4 w-4" />
								<span>Beginner friendly</span>
							</div>
						</div>
					</div>

					{/* Steps */}
					<div className="mb-12">
						<h3 className="text-xl font-semibold mb-6">Step-by-Step Guide</h3>
						<div className="space-y-6">
							{steps.map((step) => (
								<Card
									key={step.number}
									className="group hover:shadow-md transition-all duration-200"
								>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div
												className={`flex items-center justify-center w-10 h-10 rounded-lg ${step.color} text-white font-bold text-lg`}
											>
												{step.number}
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h4 className="text-lg font-semibold">
														{step.title}
													</h4>
													<Badge variant="outline" className="text-xs">
														{step.duration}
													</Badge>
												</div>
												<p className="text-muted-foreground mb-4">
													{step.description}
												</p>
												<Button variant="outline" size="sm" asChild>
													<Link href={`/docs/help/${step.title.toLowerCase().replace(/\s+/g, '-')}`}>
														Learn More
														<ArrowRight className="h-3 w-3 ml-1" />
													</Link>
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Key Features */}
					<div className="mb-12">
						<h3 className="text-xl font-semibold mb-6">What You Can Do</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{features.map((feature) => (
								<Card key={feature.title}>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="p-2 rounded-lg bg-primary/10 text-primary">
												<feature.icon className="h-5 w-5" />
											</div>
											<div>
												<h4 className="font-semibold mb-2">
													{feature.title}
												</h4>
												<p className="text-sm text-muted-foreground">
													{feature.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Next Steps */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-8">
							<div className="text-center">
								<h3 className="text-xl font-semibold mb-4">
									Ready to Get Started?
								</h3>
								<p className="text-muted-foreground mb-6">
									Complete these steps and you'll be ready to explore your
									financial data like never before.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<Link href="/auth/sign-up">
											Create Account
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link href="/docs/help">
											Back to Help Center
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
