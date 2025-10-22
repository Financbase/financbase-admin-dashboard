import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Zap, TrendingUp, DollarSign, FileText } from "lucide-react";

export default function AIAssistantPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
					<p className="text-muted-foreground">
						Get instant financial insights and guidance powered by AI
					</p>
				</div>
				<Badge variant="secondary">Beta</Badge>
			</div>

			{/* Hero Section */}
			<div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-12 text-center">
				<div className="flex justify-center mb-6">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
						<Bot className="h-10 w-10 text-blue-600" />
					</div>
				</div>
				<h2 className="text-3xl font-bold mb-4">Your Personal Financial AI</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
					Ask questions about your finances, get instant analysis, and receive personalized recommendations—all powered by advanced AI.
				</p>
				<div className="flex justify-center gap-3">
					<Button size="lg">
						<MessageSquare className="mr-2 h-5 w-5" />
						Start Chat
					</Button>
					<Button variant="outline" size="lg">
						View Examples
					</Button>
				</div>
			</div>

			{/* Capabilities */}
			<div>
				<h3 className="text-2xl font-semibold mb-6">What AI Assistant Can Do</h3>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							icon: TrendingUp,
							title: "Financial Analysis",
							description: "Get instant analysis of your revenue, expenses, and cash flow trends with actionable insights.",
							examples: ["What's my profit margin?", "Analyze my monthly expenses"]
						},
						{
							icon: DollarSign,
							title: "Budget Optimization",
							description: "Identify opportunities to reduce costs and optimize your budget for better financial health.",
							examples: ["Where can I cut costs?", "Optimize my spending"]
						},
						{
							icon: FileText,
							title: "Report Generation",
							description: "Generate custom financial reports and summaries in seconds with natural language commands.",
							examples: ["Create Q4 report", "Summarize this month"]
						},
						{
							icon: Bot,
							title: "Smart Recommendations",
							description: "Receive personalized recommendations based on your financial patterns and industry best practices.",
							examples: ["How to improve cash flow?", "Best payment terms?"]
						},
						{
							icon: Zap,
							title: "Quick Calculations",
							description: "Perform complex financial calculations instantly without manual spreadsheet work.",
							examples: ["Calculate ROI", "Project next quarter revenue"]
						},
						{
							icon: MessageSquare,
							title: "Natural Conversations",
							description: "Chat naturally about your finances without learning complex commands or formulas.",
							examples: ["Explain my dashboard", "What should I focus on?"]
						},
					].map((capability, index) => (
						<div key={index} className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
								<capability.icon className="h-6 w-6 text-blue-600" />
							</div>
							<h4 className="text-lg font-semibold mb-2">{capability.title}</h4>
							<p className="text-sm text-muted-foreground mb-4">{capability.description}</p>
							<div className="space-y-2">
								{capability.examples.map((example, i) => (
									<div key={i} className="text-xs p-2 rounded bg-muted">
										"{example}"
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-xl font-semibold mb-4">Popular Questions</h3>
				<div className="grid gap-3 md:grid-cols-2">
					{[
						"What's my current cash runway?",
						"How can I improve my profit margins?",
						"Which clients are most profitable?",
						"What's my average invoice payment time?",
						"Show me expense trends for last 3 months",
						"Compare Q3 vs Q4 revenue",
						"What's my client acquisition cost?",
						"Identify my largest expense categories",
					].map((question, index) => (
						<Button
							key={index}
							variant="outline"
							className="justify-start text-left h-auto py-3"
						>
							<MessageSquare className="mr-2 h-4 w-4 shrink-0" />
							<span className="truncate">{question}</span>
						</Button>
					))}
				</div>
			</div>

			{/* Features Notice */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
				<div className="flex items-start gap-3">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
						<Bot className="h-4 w-4 text-blue-600" />
					</div>
					<div>
						<h4 className="font-semibold mb-2">AI Assistant Coming Soon</h4>
						<p className="text-sm text-muted-foreground mb-4">
							We're building an advanced AI assistant powered by the latest language models. 
							It will understand your financial data, provide intelligent insights, and help you make better business decisions.
						</p>
						<ul className="space-y-1 text-sm text-muted-foreground">
							<li>• Context-aware responses based on your financial data</li>
							<li>• Natural language understanding for easy interaction</li>
							<li>• Real-time data analysis and insights</li>
							<li>• Personalized recommendations and action items</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

