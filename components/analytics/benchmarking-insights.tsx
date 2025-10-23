"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Target,
	Users,
	DollarSign,
	Building2,
	Lightbulb,
	AlertCircle,
	CheckCircle,
	Info,
	RefreshCw,
} from "lucide-react";
import { InteractiveChart } from "./advanced-charts";

interface BenchmarkData {
	industry: string;
	metrics: {
		revenueGrowth: {
			percentile25: number;
			percentile50: number;
			percentile75: number;
			percentile90: number;
			industryAverage: number;
		};
		profitMargin: {
			percentile25: number;
			percentile50: number;
			percentile75: number;
			percentile90: number;
			industryAverage: number;
		};
		customerAcquisitionCost: {
			percentile25: number;
			percentile50: number;
			percentile75: number;
			percentile90: number;
			industryAverage: number;
		};
		monthlyRecurringRevenue: {
			percentile25: number;
			percentile50: number;
			percentile75: number;
			percentile90: number;
			industryAverage: number;
		};
	};
}

interface UserMetrics {
	revenueGrowth: number;
	profitMargin: number;
	customerAcquisitionCost: number;
	monthlyRecurringRevenue: number;
}

interface Insight {
	type: "improvement" | "warning" | "achievement";
	title: string;
	description: string;
	metric: string;
	impact: "high" | "medium" | "low";
	actionable: boolean;
	recommendations: string[];
}

interface BenchmarkingInsightsProps {
	userId?: string;
}

export function BenchmarkingInsights({ userId }: BenchmarkingInsightsProps) {
	const [selectedIndustry, setSelectedIndustry] = useState("saas");
	const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
	const [userMetrics, setUserMetrics] = useState<UserMetrics>({
		revenueGrowth: 15.5,
		profitMargin: 22.3,
		customerAcquisitionCost: 150,
		monthlyRecurringRevenue: 50000,
	});
	const [insights, setInsights] = useState<Insight[]>([]);
	const [loading, setLoading] = useState(false);

	// Sample benchmark data (in a real app, this would come from an API)
	const sampleBenchmarkData: Record<string, BenchmarkData> = {
		saas: {
			industry: "Software as a Service",
			metrics: {
				revenueGrowth: {
					percentile25: 5,
					percentile50: 15,
					percentile75: 30,
					percentile90: 50,
					industryAverage: 18.5,
				},
				profitMargin: {
					percentile25: 10,
					percentile50: 20,
					percentile75: 35,
					percentile90: 50,
					industryAverage: 22.8,
				},
				customerAcquisitionCost: {
					percentile25: 50,
					percentile50: 120,
					percentile75: 250,
					percentile90: 500,
					industryAverage: 145,
				},
				monthlyRecurringRevenue: {
					percentile25: 10000,
					percentile50: 50000,
					percentile75: 200000,
					percentile90: 1000000,
					industryAverage: 125000,
				},
			},
		},
		consulting: {
			industry: "Management Consulting",
			metrics: {
				revenueGrowth: {
					percentile25: 3,
					percentile50: 12,
					percentile75: 25,
					percentile90: 40,
					industryAverage: 15.2,
				},
				profitMargin: {
					percentile25: 15,
					percentile50: 25,
					percentile75: 40,
					percentile90: 60,
					industryAverage: 28.5,
				},
				customerAcquisitionCost: {
					percentile25: 200,
					percentile50: 500,
					percentile75: 1200,
					percentile90: 2500,
					industryAverage: 650,
				},
				monthlyRecurringRevenue: {
					percentile25: 5000,
					percentile50: 25000,
					percentile75: 100000,
					percentile90: 500000,
					industryAverage: 75000,
				},
			},
		},
	};

	useEffect(() => {
		loadBenchmarkData();
		generateInsights();
	}, [selectedIndustry, userMetrics]);

	const loadBenchmarkData = () => {
		setLoading(true);
		// Simulate API call
		setTimeout(() => {
			setBenchmarkData(sampleBenchmarkData[selectedIndustry]);
			setLoading(false);
		}, 1000);
	};

	const generateInsights = () => {
		if (!benchmarkData) return;

		const newInsights: Insight[] = [];

		// Revenue Growth Insights
		const revenueBenchmark = benchmarkData.metrics.revenueGrowth;
		if (userMetrics.revenueGrowth > revenueBenchmark.percentile90) {
			newInsights.push({
				type: "achievement",
				title: "Outstanding Revenue Growth",
				description: `Your ${userMetrics.revenueGrowth}% revenue growth exceeds 90% of ${benchmarkData.industry} companies.`,
				metric: "revenueGrowth",
				impact: "high",
				actionable: false,
				recommendations: [
					"Document your growth strategies for future scaling",
					"Consider sharing success metrics with investors",
					"Evaluate expansion opportunities",
				],
			});
		} else if (userMetrics.revenueGrowth < revenueBenchmark.percentile25) {
			newInsights.push({
				type: "warning",
				title: "Below Average Revenue Growth",
				description: `Your ${userMetrics.revenueGrowth}% growth is below 75% of industry peers.`,
				metric: "revenueGrowth",
				impact: "high",
				actionable: true,
				recommendations: [
					"Review pricing strategy and market positioning",
					"Invest in sales and marketing initiatives",
					"Consider product diversification",
					"Analyze competitor strategies",
				],
			});
		}

		// Profit Margin Insights
		const marginBenchmark = benchmarkData.metrics.profitMargin;
		if (userMetrics.profitMargin > marginBenchmark.percentile75) {
			newInsights.push({
				type: "achievement",
				title: "Excellent Profitability",
				description: `Your ${userMetrics.profitMargin}% profit margin is in the top 25% of ${benchmarkData.industry} companies.`,
				metric: "profitMargin",
				impact: "high",
				actionable: true,
				recommendations: [
					"Maintain cost discipline while scaling",
					"Consider reinvesting profits for growth",
					"Document operational efficiencies",
				],
			});
		} else if (userMetrics.profitMargin < marginBenchmark.percentile25) {
			newInsights.push({
				type: "improvement",
				title: "Profit Margin Optimization",
				description: `Your ${userMetrics.profitMargin}% margin is below industry average. There's room for improvement.`,
				metric: "profitMargin",
				impact: "medium",
				actionable: true,
				recommendations: [
					"Review operational costs and efficiency",
					"Optimize pricing strategy",
					"Consider automation and process improvements",
					"Evaluate vendor relationships",
				],
			});
		}

		// Customer Acquisition Cost Insights
		const cacBenchmark = benchmarkData.metrics.customerAcquisitionCost;
		if (userMetrics.customerAcquisitionCost < cacBenchmark.percentile25) {
			newInsights.push({
				type: "achievement",
				title: "Efficient Customer Acquisition",
				description: `Your CAC of $${userMetrics.customerAcquisitionCost} is in the top 25% of industry peers.`,
				metric: "customerAcquisitionCost",
				impact: "high",
				actionable: true,
				recommendations: [
					"Scale marketing efforts while maintaining efficiency",
					"Document acquisition channels and strategies",
					"Consider geographic expansion",
				],
			});
		} else if (userMetrics.customerAcquisitionCost > cacBenchmark.percentile75) {
			newInsights.push({
				type: "warning",
				title: "High Customer Acquisition Cost",
				description: `Your CAC of $${userMetrics.customerAcquisitionCost} is above 75% of industry peers.`,
				metric: "customerAcquisitionCost",
				impact: "medium",
				actionable: true,
				recommendations: [
					"Optimize marketing channels for better ROI",
					"Improve conversion rates through A/B testing",
					"Focus on organic growth and referrals",
					"Review sales process efficiency",
				],
			});
		}

		setInsights(newInsights);
	};

	const getBenchmarkComparison = (userValue: number, benchmark: any) => {
		if (userValue >= benchmark.percentile90) return { percentile: 95, status: "excellent" };
		if (userValue >= benchmark.percentile75) return { percentile: 80, status: "good" };
		if (userValue >= benchmark.percentile50) return { percentile: 60, status: "average" };
		if (userValue >= benchmark.percentile25) return { percentile: 40, status: "below_average" };
		return { percentile: 20, status: "needs_improvement" };
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "excellent":
				return "text-green-600";
			case "good":
				return "text-blue-600";
			case "average":
				return "text-yellow-600";
			case "below_average":
				return "text-orange-600";
			case "needs_improvement":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getInsightIcon = (type: string) => {
		switch (type) {
			case "achievement":
				return <CheckCircle className="h-5 w-5 text-green-600" />;
			case "warning":
				return <AlertCircle className="h-5 w-5 text-red-600" />;
			case "improvement":
				return <Lightbulb className="h-5 w-5 text-blue-600" />;
			default:
				return <Info className="h-5 w-5 text-gray-600" />;
		}
	};

	const MetricComparisonCard = ({
		title,
		userValue,
		benchmark,
		unit = "",
		format = "number",
	}: {
		title: string;
		userValue: number;
		benchmark: any;
		unit?: string;
		format?: string;
	}) => {
		const comparison = getBenchmarkComparison(userValue, benchmark);

		const formatValue = (value: number) => {
			switch (format) {
				case "currency":
					return `$${value.toLocaleString()}`;
				case "percentage":
					return `${value.toFixed(1)}%`;
				default:
					return value.toLocaleString();
			}
		};

		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{title}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-2xl font-bold">
							{formatValue(userValue)}
							{unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
						</span>
						<Badge variant="secondary" className={getStatusColor(comparison.status)}>
							{comparison.percentile}th percentile
						</Badge>
					</div>
					<Progress value={comparison.percentile} className="h-2" />
					<div className="text-xs text-muted-foreground">
						Industry average: {formatValue(benchmark.industryAverage)} {unit}
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<BarChart3 className="h-6 w-6" />
						Industry Benchmarking & Insights
					</h2>
					<p className="text-muted-foreground">
						Compare your performance against industry standards and get actionable insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
						<SelectTrigger className="w-48">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="saas">Software as a Service</SelectItem>
							<SelectItem value="consulting">Management Consulting</SelectItem>
							<SelectItem value="ecommerce">E-commerce</SelectItem>
							<SelectItem value="fintech">Financial Technology</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" onClick={loadBenchmarkData} disabled={loading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</div>

			{/* Benchmark Overview */}
			{benchmarkData && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							{benchmarkData.industry} Overview
						</CardTitle>
						<CardDescription>
							Industry benchmarks based on thousands of companies
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							<MetricComparisonCard
								title="Revenue Growth"
								userValue={userMetrics.revenueGrowth}
								benchmark={benchmarkData.metrics.revenueGrowth}
								unit="%"
								format="percentage"
							/>
							<MetricComparisonCard
								title="Profit Margin"
								userValue={userMetrics.profitMargin}
								benchmark={benchmarkData.metrics.profitMargin}
								unit="%"
								format="percentage"
							/>
							<MetricComparisonCard
								title="Customer Acquisition Cost"
								userValue={userMetrics.customerAcquisitionCost}
								benchmark={benchmarkData.metrics.customerAcquisitionCost}
								unit="$"
								format="currency"
							/>
							<MetricComparisonCard
								title="Monthly Recurring Revenue"
								userValue={userMetrics.monthlyRecurringRevenue}
								benchmark={benchmarkData.metrics.monthlyRecurringRevenue}
								unit="$"
								format="currency"
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Insights */}
			{insights.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Lightbulb className="h-5 w-5" />
							AI-Generated Insights
						</CardTitle>
						<CardDescription>
							Actionable recommendations based on your performance vs industry benchmarks
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{insights.map((insight, index) => (
								<Alert key={index} className="relative">
									{getInsightIcon(insight.type)}
									<AlertDescription>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold">{insight.title}</h4>
												<div className="flex items-center gap-2">
													<Badge
														variant={
															insight.impact === "high"
																? "default"
																: insight.impact === "medium"
																? "secondary"
																: "outline"
														}
													>
														{insight.impact} impact
													</Badge>
													{insight.actionable && (
														<Badge variant="outline">Actionable</Badge>
													)}
												</div>
											</div>
											<p className="text-sm text-muted-foreground">
												{insight.description}
											</p>
											{insight.recommendations.length > 0 && (
												<div className="text-sm">
													<strong>Recommended Actions:</strong>
													<ul className="list-disc list-inside mt-1 space-y-1">
														{insight.recommendations.map((rec, recIndex) => (
															<li key={recIndex}>{rec}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</AlertDescription>
								</Alert>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Competitive Analysis */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Performance Distribution</CardTitle>
						<CardDescription>
							See where you rank among industry peers
						</CardDescription>
					</CardHeader>
					<CardContent>
						{benchmarkData && (
							<div className="space-y-4">
								{Object.entries(benchmarkData.metrics).map(([metricKey, metricData]) => {
									const userValue = userMetrics[metricKey as keyof UserMetrics];
									const comparison = getBenchmarkComparison(userValue, metricData);

									return (
										<div key={metricKey} className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="capitalize">
													{metricKey.replace(/([A-Z])/g, " $1").trim()}
												</span>
												<span className={`font-medium ${getStatusColor(comparison.status)}`}>
													{comparison.percentile}th percentile
												</span>
											</div>
											<Progress value={comparison.percentile} className="h-2" />
											<div className="flex justify-between text-xs text-muted-foreground">
												<span>25th</span>
												<span>50th</span>
												<span>75th</span>
												<span>90th</span>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Industry Leaders</CardTitle>
						<CardDescription>
							Characteristics of top-performing companies
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Target className="h-4 w-4 text-blue-600" />
									<span className="font-medium">Top 10% Companies</span>
								</div>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li>• Revenue growth &gt; 50% annually</li>
									<li>• Profit margins &gt; 35%</li>
									<li>• CAC &lt; $100 per customer</li>
									<li>• Strong product-market fit</li>
								</ul>
							</div>
							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<TrendingUp className="h-4 w-4 text-green-600" />
									<span className="font-medium">Growth Strategies</span>
								</div>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li>• Focus on customer retention</li>
									<li>• Data-driven decision making</li>
									<li>• Continuous product innovation</li>
									<li>• Strategic partnerships</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
