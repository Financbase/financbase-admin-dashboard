"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	Workflow,
	Zap,
	CheckCircle,
	Settings,
	ArrowRight,
} from "lucide-react";

const workflowTypes = [
	{
		title: "Automated Approval",
		description: "Automatically route transactions for approval based on rules",
		icon: CheckCircle,
	},
	{
		title: "Notification Workflows",
		description: "Send notifications when specific events occur",
		icon: Zap,
	},
	{
		title: "Data Sync",
		description: "Automatically sync data between systems",
		icon: Settings,
	},
];

const setupSteps = [
	{
		number: 1,
		title: "Create Workflow",
		description: "Go to Workflows and click 'Create New Workflow'",
	},
	{
		number: 2,
		title: "Define Triggers",
		description: "Set the conditions that will start the workflow",
	},
	{
		number: 3,
		title: "Configure Actions",
		description: "Define what actions should be performed",
	},
	{
		number: 4,
		title: "Test & Activate",
		description: "Test your workflow and activate it when ready",
	},
];

export default function WorkflowsHelpPage() {
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
								<Workflow className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Advanced Features
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Workflows</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Understanding Workflows
						</h2>
						<p className="text-muted-foreground mb-8">
							Workflows allow you to automate business processes and create
							custom automation rules. Learn how to set up and manage workflows
							to streamline your operations.
						</p>
					</section>

					{/* Workflow Types */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Workflow Types</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{workflowTypes.map((type, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<type.icon className="h-5 w-5 text-primary" />
											{type.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{type.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Setup Steps */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Setting Up a Workflow</h2>
						<div className="space-y-6">
							{setupSteps.map((step) => (
								<Card key={step.number}>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="font-semibold text-primary">
													{step.number}
												</span>
											</div>
											<div className="flex-1">
												<h3 className="text-xl font-semibold mb-2">
													{step.title}
												</h3>
												<p className="text-muted-foreground">
													{step.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/workflows">
									<Workflow className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Manage Workflows</div>
										<div className="text-xs text-muted-foreground">
											Create and manage your workflows
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/docs/api">
									<Settings className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">API Documentation</div>
										<div className="text-xs text-muted-foreground">
											Learn about workflow APIs
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
						</div>
					</section>

					{/* Related Articles */}
					<section>
						<h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/webhooks"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Webhooks</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/reporting"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Reporting</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

