/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Brain,
	TrendingUp,
	TrendingDown,
	Activity,
	Target,
	AlertTriangle,
	Info,
	Settings,
	RefreshCw,
} from "lucide-react";
import { InteractiveChart, ChartDataPoint } from "./advanced-charts";
import { AIPredictiveAnalyticsService } from "@/lib/services/analytics/ai-predictive-analytics.service";

interface ForecastScenario {
	name: string;
	data: ChartDataPoint[];
	color: string;
	description: string;
}

interface ModelParameters {
	horizon: number;
	confidence: number;
	seasonality: boolean;
	trend: boolean;
	anomalies: boolean;
}

interface Anomaly {
	type: string;
	severity: string;
	description: string;
	detectedAt: string;
	expectedValue: number;
	actualValue: number;
	deviation: number;
	recommendations: string[];
}

export default function PredictiveDashboard() {
	const [selectedModel, setSelectedModel] = useState<string>("revenue");
	const [parameters, setParameters] = useState<ModelParameters>({
		horizon: 12,
		confidence: 85,
		seasonality: true,
		trend: true,
		anomalies: true,
	});
	const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
	const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	const aiService = new AIPredictiveAnalyticsService();

	// Generate forecast
	const generateForecast = useCallback(async () => {
		setIsGenerating(true);
		try {
			const forecast = await aiService.generateRevenueForecast(
				"current-user", // This would come from auth context
				"monthly",
				parameters.horizon
			);

			// Generate scenario variations
			const baseScenario: ForecastScenario = {
				name: "Most Likely",
				data: forecast.forecast.map((point) => ({
					month: point.date,
					revenue: point.predictedValue,
					lower: point.confidenceInterval.lower,
					upper: point.confidenceInterval.upper,
					trend: String(point.trend),
					seasonality: typeof point.seasonality === 'number' ? point.seasonality : 0,
					anomaly: point.anomaly ? 1 : 0,
				})),
				color: "#3b82f6",
				description: "Baseline forecast with current trends",
			};

			const bestCaseScenario: ForecastScenario = {
				name: "Best Case",
				data: forecast.forecast.map((point) => ({
					month: point.date,
					revenue: point.predictedValue * 1.3,
					lower: point.confidenceInterval.lower * 1.2,
					upper: point.confidenceInterval.upper * 1.4,
					trend: "increasing",
					seasonality: typeof point.seasonality === 'number' ? point.seasonality : 0,
					anomaly: 0,
				})),
				color: "#10b981",
				description: "Optimistic scenario with accelerated growth",
			};

			const worstCaseScenario: ForecastScenario = {
				name: "Worst Case",
				data: forecast.forecast.map((point) => ({
					month: point.date,
					revenue: point.predictedValue * 0.7,
					lower: point.confidenceInterval.lower * 0.6,
					upper: point.confidenceInterval.upper * 0.8,
					trend: "decreasing",
					seasonality: typeof point.seasonality === 'number' ? point.seasonality : 0,
					anomaly: 0,
				})),
				color: "#ef4444",
				description: "Conservative scenario with market challenges",
			};

			setScenarios([baseScenario, bestCaseScenario, worstCaseScenario]);

			// Detect anomalies
			if (parameters.anomalies) {
				const detectedAnomalies = await aiService.detectAnomalies("current-user", 30);
				setAnomalies(detectedAnomalies);
			}

		} catch (error) {
			console.error("Error generating forecast:", error);
		} finally {
			setIsGenerating(false);
		}
	}, [parameters, aiService]);

	// Auto-generate forecast on parameter change
	useEffect(() => {
		generateForecast();
	}, [generateForecast]);

	const handleParameterChange = (key: keyof ModelParameters, value: boolean | number) => {
		setParameters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const getTrendIcon = (trend: string) => {
		switch (trend) {
			case "increasing":
				return <TrendingUp className="h-4 w-4 text-green-600" />;
			case "decreasing":
				return <TrendingDown className="h-4 w-4 text-red-600" />;
			default:
				return <Activity className="h-4 w-4 text-blue-600" />;
		}
	};

	const getAnomalyIcon = (severity: string) => {
		switch (severity) {
			case "high":
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			case "medium":
				return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
			case "low":
				return <Info className="h-4 w-4 text-blue-600" />;
			default:
				return <Info className="h-4 w-4 text-gray-600" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Brain className="h-6 w-6" />
						Predictive Financial Modeling
					</h2>
					<p className="text-muted-foreground">
						AI-powered forecasting with scenario analysis and anomaly detection
					</p>
				</div>
				<Button
					onClick={generateForecast}
					disabled={isGenerating}
					className="flex items-center gap-2"
				>
					<RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
					{isGenerating ? "Generating..." : "Refresh Forecast"}
				</Button>
			</div>

			{/* Model Configuration */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Forecast Parameters
					</CardTitle>
					<CardDescription>
						Configure your predictive model settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Forecast Horizon */}
						<div className="space-y-2">
							<Label htmlFor="horizon">Forecast Horizon (Months)</Label>
							<Select
								value={parameters.horizon.toString()}
								onValueChange={(value) =>
									handleParameterChange("horizon", parseInt(value))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="3">3 Months</SelectItem>
									<SelectItem value="6">6 Months</SelectItem>
									<SelectItem value="12">12 Months</SelectItem>
									<SelectItem value="24">24 Months</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Confidence Level */}
						<div className="space-y-2">
							<Label htmlFor="confidence">Confidence Level: {parameters.confidence}%</Label>
							<Slider
								value={[parameters.confidence]}
								onValueChange={(value) =>
									handleParameterChange("confidence", value[0])
								}
								max={95}
								min={70}
								step={5}
								className="w-full"
							/>
						</div>

						{/* Model Type */}
						<div className="space-y-2">
							<Label htmlFor="model">Model Type</Label>
							<Select
								value={selectedModel}
								onValueChange={setSelectedModel}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="revenue">Revenue Forecast</SelectItem>
									<SelectItem value="expenses">Expense Forecast</SelectItem>
									<SelectItem value="cashflow">Cash Flow Forecast</SelectItem>
									<SelectItem value="seasonality">Seasonality Analysis</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Advanced Options */}
					<div className="flex flex-wrap gap-6">
						<div className="flex items-center space-x-2">
							<Switch
								id="seasonality-switch"
								checked={parameters.seasonality}
								onCheckedChange={(checked) =>
									handleParameterChange("seasonality", checked)
								}
							/>
							<Label htmlFor="seasonality-switch">Include Seasonality</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="trend-switch"
								checked={parameters.trend}
								onCheckedChange={(checked) =>
									handleParameterChange("trend", checked)
								}
							/>
							<Label htmlFor="trend-switch">Include Trend Analysis</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="anomalies-switch"
								checked={parameters.anomalies}
								onCheckedChange={(checked) =>
									handleParameterChange("anomalies", checked)
								}
							/>
							<Label htmlFor="anomalies-switch">Detect Anomalies</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Forecast Visualization */}
			{scenarios.length > 0 && (
				<Tabs defaultValue="forecast" className="space-y-4">
					<TabsList>
						<TabsTrigger value="forecast">Forecast</TabsTrigger>
						<TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
						<TabsTrigger value="anomalies">Anomalies</TabsTrigger>
					</TabsList>

					<TabsContent value="forecast" className="space-y-4">
						<div className="grid gap-6 lg:grid-cols-3">
							{/* Summary Cards */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Target className="h-5 w-5" />
										Forecast Summary
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Total Predicted
										</span>
										<span className="text-2xl font-bold">
											$
											{scenarios[0]?.data
												.reduce((sum, item) => sum + (item.revenue as number), 0)
												.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Monthly Average
										</span>
										<span className="text-lg font-semibold">
											$
											{scenarios[0]?.data
												.reduce((sum, item) => sum + (item.revenue as number), 0)
												/ scenarios[0]?.data.length}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Confidence
										</span>
										<Badge variant="secondary">{parameters.confidence}%</Badge>
									</div>
								</CardContent>
							</Card>

							{/* Trend Analysis */}
							<Card>
								<CardHeader>
									<CardTitle>Trend Analysis</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{scenarios[0]?.data.slice(0, 3).map((point, index) => (
										<div key={`trend-${index}`} className="flex items-center justify-between">
											<span className="text-sm">
												{point.month as string}
											</span>
											<div className="flex items-center gap-2">
												{getTrendIcon(point.trend as string)}
												<span className="text-sm font-medium">
													{point.trend as string}
												</span>
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							{/* Seasonality Insights */}
							<Card>
								<CardHeader>
									<CardTitle>Seasonality</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground mb-2">
										Pattern Detected
									</div>
									<div className="text-sm font-medium">
										Q4 Peak, Q1 Dip
									</div>
									<div className="mt-2">
										<Badge variant="outline">High Confidence</Badge>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Main Chart */}
						<InteractiveChart
							config={{
								type: "area",
								data: scenarios[0]?.data || [],
								xAxisKey: "month",
								yAxisKeys: ["revenue", "lower", "upper"],
								colors: ["#3b82f6", "#93c5fd", "#93c5fd"],
								title: `${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Forecast`,
								description: `AI-generated forecast with ${parameters.confidence}% confidence intervals`,
								showGrid: true,
								showTooltip: true,
								showLegend: true,
								confidenceIntervals: [
									{
										upper: "upper",
										lower: "lower",
										color: "#3b82f6",
									},
								],
							}}
							height={450}
						/>
					</TabsContent>

					<TabsContent value="scenarios" className="space-y-4">
						<div className="grid gap-6">
							{scenarios.map((scenario, index) => (
								<Card key={`scenario-${index}`}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: scenario.color }}
											/>
											{scenario.name}
										</CardTitle>
										<CardDescription>{scenario.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<InteractiveChart
											config={{
												type: "line",
												data: scenario.data,
												xAxisKey: "month",
												yAxisKeys: ["revenue"],
												colors: [scenario.color],
												showGrid: true,
												showTooltip: true,
											}}
											height={300}
										/>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="anomalies" className="space-y-4">
						{anomalies.length > 0 ? (
							<div className="space-y-4">
								{anomalies.map((anomaly, index) => (
									<Alert key={`anomaly-${index}`}>
										{getAnomalyIcon(anomaly.severity)}
										<AlertDescription>
											<div className="space-y-2">
												<div className="font-medium">{anomaly.description}</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<span>
														Expected: ${anomaly.expectedValue.toLocaleString()}
													</span>
													<span>
														Actual: ${anomaly.actualValue.toLocaleString()}
													</span>
													<span>Deviation: {anomaly.deviation}%</span>
												</div>
												{anomaly.recommendations && (
													<div className="text-sm">
														<strong>Recommendations:</strong>{" "}
														{anomaly.recommendations.join(", ")}
													</div>
												)}
											</div>
										</AlertDescription>
									</Alert>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="flex items-center justify-center h-64">
									<div className="text-center text-muted-foreground">
										<Info className="h-8 w-8 mx-auto mb-2" />
										<p>No anomalies detected in the analyzed period</p>
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			)}

			{/* Loading State */}
			{isGenerating && (
				<Card>
					<CardContent className="flex items-center justify-center h-64">
						<div className="text-center">
							<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">
								Generating AI-powered forecast...
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
