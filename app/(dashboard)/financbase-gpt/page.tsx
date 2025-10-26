"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Brain, TrendingUp, Shield, Zap } from "lucide-react";

export default function FinancbaseGPTPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold tracking-tight">FinancbaseGPT</h1>
						<Badge className="bg-gradient-to-r from-purple-500 to-blue-500">New</Badge>
					</div>
					<p className="text-muted-foreground">
						Advanced AI assistant specifically trained for financial management
					</p>
				</div>
			</div>

			{/* Hero */}
			<div className="rounded-lg border bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-12">
				<div className="max-w-3xl mx-auto text-center">
					<div className="flex justify-center mb-6">
						<div className="relative">
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
								<Bot className="h-12 w-12 text-white" />
							</div>
							<div className="absolute -top-2 -right-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400">
									<Sparkles className="h-4 w-4 text-yellow-900" />
								</div>
							</div>
						</div>
					</div>
					
					<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						Your Financial Co-Pilot
					</h2>
					<p className="text-lg text-muted-foreground mb-8">
						FinancbaseGPT combines the power of GPT-4 with deep financial domain knowledge 
						to provide expert-level insights, analysis, and recommendations for your business.
					</p>
					
					<div className="flex justify-center gap-4">
						<Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
							<Sparkles className="mr-2 h-5 w-5" />
							Start Conversation
						</Button>
						<Button variant="outline" size="lg">
							Watch Demo
						</Button>
					</div>
				</div>
			</div>

			{/* Key Features */}
			<div>
				<h3 className="text-2xl font-semibold mb-6">Why FinancbaseGPT?</h3>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							icon: Brain,
							title: "Financial Intelligence",
							description: "Trained on financial best practices, accounting principles, and business strategy to provide expert guidance.",
							color: "from-purple-500 to-purple-600"
						},
						{
							icon: TrendingUp,
							title: "Data-Driven Insights",
							description: "Analyzes your real financial data to provide personalized, actionable recommendations specific to your business.",
							color: "from-blue-500 to-blue-600"
						},
						{
							icon: Shield,
							title: "Secure & Private",
							description: "Your financial data is encrypted and never used to train external models. Complete privacy guaranteed.",
							color: "from-green-500 to-green-600"
						},
						{
							icon: Zap,
							title: "Instant Analysis",
							description: "Get complex financial analysis in seconds that would normally take hours with traditional tools.",
							color: "from-yellow-500 to-orange-600"
						},
						{
							icon: Sparkles,
							title: "Natural Language",
							description: "No complex formulas or commands needed. Just ask in plain English and get clear, detailed answers.",
							color: "from-pink-500 to-red-600"
						},
						{
							icon: Bot,
							title: "Always Learning",
							description: "Continuously improving with each interaction to better understand your business and provide more relevant insights.",
							color: "from-indigo-500 to-purple-600"
						},
					].map((feature, index) => (
						<div key={index} className="group p-6 rounded-lg border bg-card hover:shadow-lg transition-all">
							<div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
								<feature.icon className="h-6 w-6 text-white" />
							</div>
							<h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
							<p className="text-sm text-muted-foreground">{feature.description}</p>
						</div>
					))}
				</div>
			</div>

			{/* Use Cases */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-xl font-semibold mb-4">For Business Owners</h3>
					<ul className="space-y-3">
						{[
							"Get strategic advice on improving cash flow and profitability",
							"Understand complex financial metrics in simple terms",
							"Receive growth recommendations based on your numbers",
							"Compare your performance against industry benchmarks",
							"Plan scenarios and forecast future outcomes",
						].map((item, i) => (
							<li key={i} className="flex items-start gap-2">
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 mt-0.5">
									<span className="text-xs font-bold text-green-600">✓</span>
								</div>
								<span className="text-sm">{item}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-xl font-semibold mb-4">For Finance Teams</h3>
					<ul className="space-y-3">
						{[
							"Automate routine financial analysis and reporting",
							"Get instant answers to complex accounting questions",
							"Generate financial models and projections quickly",
							"Identify trends and anomalies in financial data",
							"Create executive summaries and presentations",
						].map((item, i) => (
							<li key={i} className="flex items-start gap-2">
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 mt-0.5">
									<span className="text-xs font-bold text-blue-600">✓</span>
								</div>
								<span className="text-sm">{item}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Example Prompts */}
			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-xl font-semibold mb-4">Try These Prompts</h3>
				<div className="grid gap-3 md:grid-cols-2">
					{[
						"Analyze my profit margins and suggest improvements",
						"What's the best pricing strategy for my services?",
						"Help me understand my cash flow statement",
						"Compare this quarter to last quarter's performance",
						"Create a financial forecast for the next 6 months",
						"Which expenses should I prioritize cutting?",
						"How can I improve my working capital ratio?",
						"Explain my financial health score in detail",
					].map((prompt, index) => (
						<div key={index} className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
							<Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
							<span className="text-sm">{prompt}</span>
						</div>
					))}
				</div>
			</div>

			{/* CTA */}
			<div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8">
				<div className="max-w-2xl mx-auto text-center">
					<div className="flex justify-center mb-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
							<Bot className="h-8 w-8 text-white" />
						</div>
					</div>
					<h3 className="text-2xl font-bold mb-3">Ready to Transform Your Financial Management?</h3>
					<p className="text-muted-foreground mb-6">
						FinancbaseGPT is currently in beta. Join our early access program to experience 
						the future of AI-powered financial intelligence.
					</p>
					<div className="flex justify-center gap-3">
						<Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
							Request Early Access
						</Button>
						<Button variant="outline" size="lg">
							Learn More
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

