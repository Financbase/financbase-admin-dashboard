import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, Brain, Target, DollarSign, BarChart3, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface FinancialHealthScore {
	overall: number;
	revenue: number;
	expenses: number;
	cashflow: number;
	profitability: number;
	growth: number;
	recommendations: string[];
}

interface FinancialInsight {
	id: string;
	type: 'success' | 'warning' | 'info' | 'critical';
	title: string;
	description: string;
	impact: 'high' | 'medium' | 'low';
	category: 'revenue' | 'expenses' | 'cashflow' | 'profitability' | 'growth';
	action?: string;
	confidence: number;
	createdAt: string;
}

interface FinancialPrediction {
	id: string;
	type: 'revenue' | 'expenses' | 'cashflow' | 'profitability';
	period: 'monthly' | 'quarterly' | 'yearly';
	value: number;
	confidence: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	reasoning: string;
	createdAt: string;
}

interface FinancialRecommendation {
	id: string;
	priority: 'high' | 'medium' | 'low';
	category: 'cost_optimization' | 'revenue_growth' | 'cash_flow' | 'risk_management';
	title: string;
	description: string;
	expectedImpact: string;
	implementation: string;
	timeframe: string;
	createdAt: string;
}

export default function FinancialIntelligencePage() {
	// Fetch financial health score
	const { data: healthData, isLoading: healthLoading } = useQuery({
		queryKey: ['financial-health'],
		queryFn: async () => {
			const response = await fetch('/api/financial-intelligence/health');
			if (!response.ok) throw new Error('Failed to fetch financial health');
			return response.json();
		},
	});

	// Fetch financial insights
	const { data: insightsData, isLoading: insightsLoading } = useQuery({
		queryKey: ['financial-insights'],
		queryFn: async () => {
			const response = await fetch('/api/financial-intelligence/insights');
			if (!response.ok) throw new Error('Failed to fetch financial insights');
			return response.json();
		},
	});

	// Fetch financial predictions
	const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
		queryKey: ['financial-predictions'],
		queryFn: async () => {
			const response = await fetch('/api/financial-intelligence/predictions');
			if (!response.ok) throw new Error('Failed to fetch financial predictions');
			return response.json();
		},
	});

	// Fetch financial recommendations
	const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
		queryKey: ['financial-recommendations'],
		queryFn: async () => {
			const response = await fetch('/api/financial-intelligence/recommendations');
			if (!response.ok) throw new Error('Failed to fetch financial recommendations');
			return response.json();
		},
	});

	const healthScore: FinancialHealthScore = healthData?.healthScore || {
		overall: 0,
		revenue: 0,
		expenses: 0,
		cashflow: 0,
		profitability: 0,
		growth: 0,
		recommendations: [],
	};

	const insights: FinancialInsight[] = insightsData?.insights || [];
	const predictions: FinancialPrediction[] = predictionsData?.predictions || [];
	const recommendations: FinancialRecommendation[] = recommendationsData?.recommendations || [];

	if (healthLoading || insightsLoading || predictionsLoading || recommendationsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
					<p className="text-muted-foreground">
						AI-powered insights and analysis for smarter financial decisions
					</p>
				</div>
				<Button>
					<Brain className="mr-2 h-4 w-4" />
					Generate New Insights
				</Button>
			</div>

			{/* Intelligence Score */}
			<div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Financial Health Score</h2>
						<p className="text-muted-foreground mt-1">Based on AI analysis of your financial data</p>
					</div>
					<div className="text-right">
						<div className="text-6xl font-bold text-blue-600">{healthScore.overall}</div>
						<p className="text-sm text-muted-foreground">Out of 100</p>
						<Badge variant={healthScore.overall >= 80 ? "default" : healthScore.overall >= 60 ? "secondary" : "destructive"} className="mt-2">
							{healthScore.overall >= 80 ? "Excellent" : healthScore.overall >= 60 ? "Good" : "Needs Improvement"}
						</Badge>
					</div>
				</div>
				<div className="mt-6">
					<div className="h-3 bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${healthScore.overall}%` }}></div>
					</div>
					<div className="grid grid-cols-5 gap-4 mt-4 text-sm">
						<div className="text-center">
							<div className="font-semibold">Revenue</div>
							<div className="text-muted-foreground">{healthScore.revenue}/100</div>
						</div>
						<div className="text-center">
							<div className="font-semibold">Expenses</div>
							<div className="text-muted-foreground">{healthScore.expenses}/100</div>
						</div>
						<div className="text-center">
							<div className="font-semibold">Cash Flow</div>
							<div className="text-muted-foreground">{healthScore.cashflow}/100</div>
						</div>
						<div className="text-center">
							<div className="font-semibold">Profitability</div>
							<div className="text-muted-foreground">{healthScore.profitability}/100</div>
						</div>
						<div className="text-center">
							<div className="font-semibold">Growth</div>
							<div className="text-muted-foreground">{healthScore.growth}/100</div>
						</div>
					</div>
				</div>
			</div>

			{/* Key Insights */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Cash Flow Trend</h3>
						<TrendingUp className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-green-600">+15.2%</div>
						<p className="text-xs text-muted-foreground mt-1">Positive 3-month trend</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Expense Optimization</h3>
						<DollarSign className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">$2,340</div>
						<p className="text-xs text-muted-foreground mt-1">Potential monthly savings</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Revenue Forecast</h3>
						<BarChart3 className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">$145K</div>
						<p className="text-xs text-muted-foreground mt-1">Predicted next month</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Risk Level</h3>
						<Target className="h-5 w-5 text-yellow-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">Low</div>
						<p className="text-xs text-muted-foreground mt-1">Stable financial position</p>
					</div>
				</div>
			</div>

			{/* AI Insights & Recommendations */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Latest Insights */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Latest AI Insights</h3>
						<p className="text-sm text-muted-foreground">Generated from your financial data</p>
					</div>
					<div className="p-6 space-y-4">
						{insights.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No insights available. Generate new insights to get started.
							</div>
						) : (
							insights.map((insight) => {
								const colorMap = {
									success: "bg-green-100 text-green-800",
									warning: "bg-yellow-100 text-yellow-800",
									info: "bg-blue-100 text-blue-800",
									critical: "bg-red-100 text-red-800"
								};
								
								return (
									<div key={insight.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
											<Brain className="h-4 w-4" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-medium">{insight.title}</p>
												<Badge className={`text-xs ${colorMap[insight.type]}`}>{insight.impact}</Badge>
											</div>
											<p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
											{insight.action && (
												<Button variant="ghost" size="sm" className="mt-2">{insight.action}</Button>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Action Items */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recommended Actions</h3>
						<p className="text-sm text-muted-foreground">AI-powered suggestions to improve your finances</p>
					</div>
					<div className="p-6 space-y-3">
						{recommendations.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No recommendations available. Generate new insights to get recommendations.
							</div>
						) : (
							recommendations.map((recommendation) => (
								<div key={recommendation.id} className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex-1">
										<p className="font-medium">{recommendation.title}</p>
										<p className="text-sm text-muted-foreground">{recommendation.description}</p>
										<p className="text-xs text-muted-foreground mt-1">Expected Impact: {recommendation.expectedImpact}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
											{recommendation.priority}
										</Badge>
										<Button variant="outline" size="sm">Act</Button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Predictive Analytics */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Predictive Analytics</h3>
					<p className="text-sm text-muted-foreground">AI forecasts based on historical trends</p>
				</div>
				<div className="p-6">
					{predictions.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">
							No predictions available. Generate new insights to get predictions.
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-3">
							{predictions.map((prediction) => (
								<div key={prediction.id} className="space-y-4">
									<h4 className="font-semibold capitalize">{prediction.type} Prediction</h4>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Predicted Value</span>
											<span className="font-medium">${prediction.value.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Period</span>
											<span className="font-medium capitalize">{prediction.period}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Trend</span>
											<span className={`font-medium ${
												prediction.trend === 'increasing' ? 'text-green-600' : 
												prediction.trend === 'decreasing' ? 'text-red-600' : 
												'text-blue-600'
											}`}>
												{prediction.trend}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Confidence</span>
											<span className="font-medium">{prediction.confidence}%</span>
										</div>
										<div className="text-xs text-muted-foreground mt-2">
											{prediction.reasoning}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Anomaly Detection */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Anomaly Detection</h3>
							<p className="text-sm text-muted-foreground">Unusual patterns detected in your financial data</p>
						</div>
						<Badge variant="secondary">2 Active Alerts</Badge>
					</div>
				</div>
				<div className="p-6 space-y-3">
					<div className="flex items-start space-x-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
						<AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
						<div className="flex-1">
							<p className="font-medium">Unusual Expense Spike Detected</p>
							<p className="text-sm text-muted-foreground mt-1">
								Software expenses increased by 340% in October. This is significantly above normal patterns.
							</p>
							<div className="flex items-center gap-2 mt-2">
								<Button variant="outline" size="sm">Investigate</Button>
								<Button variant="ghost" size="sm">Dismiss</Button>
							</div>
						</div>
					</div>

					<div className="flex items-start space-x-3 p-4 rounded-lg border border-red-200 bg-red-50">
						<AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
						<div className="flex-1">
							<p className="font-medium">Late Payment Pattern Detected</p>
							<p className="text-sm text-muted-foreground mt-1">
								3 clients have consistently paid late over the last 2 months. This may indicate payment issues.
							</p>
							<div className="flex items-center gap-2 mt-2">
								<Button variant="outline" size="sm">View Clients</Button>
								<Button variant="ghost" size="sm">Dismiss</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

