/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 Bot,
 Brain,
 Filter,
 Lightbulb,
 MessageSquare,
 Play,
 Plus,
 RefreshCw,
 Search,
 Settings,
 Shield,
 Square as Stop,
 Target,
 TrendingDown,
 TrendingUp,
 Zap
} from "lucide-react";
export const metadata: Metadata = {
	title: "AI Assistant | Financbase",
	description: "Intelligent AI assistance for financial management and business insights",
};

const aiFeatures = [
	{
		name: "Smart Categorization",
		description: "Automatically categorize transactions with 97% accuracy",
		status: "active",
		usage: "1,247 transactions",
		accuracy: "97.2%",
		icon: Target,
		color: "text-green-600",
	},
	{
		name: "Fraud Detection",
		description: "Real-time fraud detection and anomaly alerts",
		status: "active",
		usage: "24/7 monitoring",
		accuracy: "94.8%",
		icon: Shield,
		color: "text-red-600",
	},
	{
		name: "Cash Flow Prediction",
		description: "Predict future cash flow with ML algorithms",
		status: "active",
		usage: "30-day forecast",
		accuracy: "89.5%",
		icon: TrendingUp,
		color: "text-blue-600",
	},
	{
		name: "Expense Optimization",
		description: "AI-powered suggestions to reduce expenses",
		status: "beta",
		usage: "Monthly analysis",
		accuracy: "85.3%",
		icon: Lightbulb,
		color: "text-yellow-600",
	},
];

const recentInteractions = [
	{
		type: "categorization",
		query: "How should I categorize this $2,500 software subscription?",
		response: "Based on the transaction details, this appears to be a SaaS subscription. I've categorized it as 'Software & Technology' with high confidence (94%).",
		timestamp: "2 minutes ago",
		confidence: 94,
	},
	{
		type: "insight",
		query: "What are my biggest expense categories this month?",
		response: "Your top expense categories this month are: 1) Office Rent ($3,200), 2) Marketing ($2,800), 3) Software Subscriptions ($1,900).",
		timestamp: "15 minutes ago",
		confidence: 100,
	},
	{
		type: "recommendation",
		query: "How can I optimize my cash flow?",
		response: "Consider negotiating better payment terms with vendors, implementing automated invoicing, and setting up a cash reserve for seasonal fluctuations.",
		timestamp: "1 hour ago",
		confidence: 88,
	},
];

const aiModels = [
	{
		name: "GPT-4 Turbo",
		provider: "OpenAI",
		status: "active",
		usage: "Financial Analysis",
		cost: "$0.03/1k tokens",
	},
	{
		name: "Claude 3",
		provider: "Anthropic",
		status: "active",
		usage: "Document Processing",
		cost: "$0.008/1k tokens",
	},
	{
		name: "Gemini Pro",
		provider: "Google",
		status: "standby",
		usage: "Data Analysis",
		cost: "$0.002/1k tokens",
	},
];

export default function AiAssistPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
					<p className="text-muted-foreground">
						Intelligent AI assistance for financial management and business insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="h-4 w-4 mr-2" />
						AI Settings
					</Button>
					<Button>
						<MessageSquare className="h-4 w-4 mr-2" />
						Start Chat
					</Button>
				</div>
			</div>

			{/* AI Features Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{aiFeatures.map((feature, index) => (
					<Card key={feature.name}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<feature.icon className={`h-5 w-5 ${feature.color}`} />
									<CardTitle className="text-lg">{feature.name}</CardTitle>
								</div>
								<Badge variant={
									feature.status === 'active' ? 'default' :
									feature.status === 'beta' ? 'secondary' :
									'outline'
								}>
									{feature.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-sm text-muted-foreground">{feature.description}</p>
							<div className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>Usage</span>
									<span className="font-medium">{feature.usage}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>Accuracy</span>
									<span className="font-medium text-green-600">{feature.accuracy}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* AI Assistant Interface */}
			<Tabs defaultValue="chat" className="space-y-4">
				<TabsList>
					<TabsTrigger value="chat">AI Chat</TabsTrigger>
					<TabsTrigger value="insights">Insights</TabsTrigger>
					<TabsTrigger value="models">AI Models</TabsTrigger>
					<TabsTrigger value="training">Training Data</TabsTrigger>
				</TabsList>

				<TabsContent value="chat" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bot className="h-5 w-5" />
								AI Assistant Chat
							</CardTitle>
							<CardDescription>
								Ask questions about your finances and get intelligent insights
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Chat interface placeholder */}
								<div className="h-96 border rounded-lg p-4 flex items-center justify-center text-muted-foreground">
									<div className="text-center space-y-2">
										<Bot className="h-12 w-12 mx-auto opacity-50" />
										<h3 className="font-medium">AI Assistant Ready</h3>
										<p className="text-sm">Ask me anything about your financial data, transactions, or business insights</p>
										<Button className="mt-4">
											<MessageSquare className="h-4 w-4 mr-2" />
											Start Conversation
										</Button>
									</div>
								</div>

								{/* Quick actions */}
								<div className="grid gap-2 md:grid-cols-4">
									<Button variant="outline" size="sm">
										Analyze Expenses
									</Button>
									<Button variant="outline" size="sm">
										Predict Cash Flow
									</Button>
									<Button variant="outline" size="sm">
										Categorize Transactions
									</Button>
									<Button variant="outline" size="sm">
										Generate Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="insights" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5" />
								Recent AI Insights
							</CardTitle>
							<CardDescription>
								Latest insights and recommendations from AI analysis
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentInteractions.map((interaction, index) => (
									<div key={`${interaction.type}-${interaction.timestamp}`} className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Badge variant="outline">{interaction.type}</Badge>
											<span className="text-sm text-muted-foreground">{interaction.timestamp}</span>
											<div className="ml-auto">
												<Badge variant="secondary">{interaction.confidence}% confidence</Badge>
											</div>
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Q: {interaction.query}</p>
											<p className="text-sm text-muted-foreground">A: {interaction.response}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="models" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>AI Model Management</CardTitle>
							<CardDescription>
								Manage AI models and their configurations
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{aiModels.map((model, index) => (
									<div key={model.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{model.name}</h4>
												<Badge variant="outline">{model.provider}</Badge>
												<Badge variant={
													model.status === 'active' ? 'default' :
													model.status === 'standby' ? 'secondary' :
													'outline'
												}>
													{model.status}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{model.usage} • {model.cost}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												Configure
											</Button>
											{model.status === 'active' ? (
												<Button variant="outline" size="sm">
													<Stop className="h-3 w-3 mr-1" />
													Disable
												</Button>
											) : (
												<Button variant="outline" size="sm">
													<Play className="h-3 w-3 mr-1" />
													Activate
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="training" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Brain className="h-5 w-5" />
								Training Data Management
							</CardTitle>
							<CardDescription>
								Manage training data and model performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Training Data</h4>
										<p className="text-2xl font-bold">24,567</p>
										<p className="text-sm text-muted-foreground">Transactions processed</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Model Accuracy</h4>
										<p className="text-2xl font-bold">94.2%</p>
										<p className="text-sm text-muted-foreground">Overall performance</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Feedback Received</h4>
										<p className="text-2xl font-bold">1,847</p>
										<p className="text-sm text-muted-foreground">User corrections</p>
									</div>
								</div>
								<Separator />
								<div className="flex items-center gap-2">
									<Button variant="outline">
										<RefreshCw className="h-4 w-4 mr-2" />
										Retrain Models
									</Button>
									<Button variant="outline">
										Export Data
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
