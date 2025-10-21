/**
 * Financbase GPT Full Page
 * Dedicated page for AI financial assistant
 */

import { FinancbaseGPTChat } from '@/components/financbase-gpt/gpt-chat-interface';
import { Bot, TrendingUp, Zap, Shield } from 'lucide-react';

export default function FinancbaseGPTPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
						<Bot className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">Financbase GPT</h1>
						<p className="text-muted-foreground">
							Your AI-powered financial assistant
						</p>
					</div>
				</div>

				{/* Features */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FeatureCard
						icon={<TrendingUp className="h-5 w-5" />}
						title="Smart Analysis"
						description="Get instant insights from your financial data"
					/>
					<FeatureCard
						icon={<Zap className="h-5 w-5" />}
						title="Real-time Context"
						description="AI with access to your current financial status"
					/>
					<FeatureCard
						icon={<Shield className="h-5 w-5" />}
						title="Secure & Private"
						description="Your data never leaves our secure system"
					/>
				</div>
			</div>

			{/* Chat Interface */}
			<div className="max-w-4xl mx-auto">
				<FinancbaseGPTChat
					maxHeight="calc(100vh - 350px)"
					showHeader={false}
					showQuickActions={true}
					placeholder="Ask me anything about your finances..."
				/>
			</div>

			{/* Example Queries */}
			<div className="max-w-4xl mx-auto space-y-4">
				<h3 className="text-sm font-semibold text-muted-foreground">
					Example Questions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<ExampleQuery text="What's my profitability trend over the last quarter?" />
					<ExampleQuery text="Which expenses are eating into my margins the most?" />
					<ExampleQuery text="Should I be concerned about any late payments?" />
					<ExampleQuery text="Give me a cash flow forecast for next month" />
					<ExampleQuery text="Compare this month's revenue to last month" />
					<ExampleQuery text="What optimization opportunities do you see?" />
				</div>
			</div>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="p-4 rounded-lg border bg-card space-y-2">
			<div className="flex items-center gap-2">
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
					{icon}
				</div>
				<h3 className="font-semibold">{title}</h3>
			</div>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

function ExampleQuery({ text }: { text: string }) {
	return (
		<div className="px-4 py-3 rounded-lg border bg-muted/50 text-sm hover:bg-muted transition-colors cursor-pointer">
			{text}
		</div>
	);
}

