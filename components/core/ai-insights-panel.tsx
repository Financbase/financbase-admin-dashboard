/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	Bot,
	CheckCircle,
	Clock,
	Code,
	DollarSign,
	Info,
	Key,
	Lightbulb,
	Loader2,
	PiggyBank,
	RefreshCw,
	Server,
	TrendingUp,
	XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
// Define local FinancialInsight type based on component usage
interface FinancialInsight {
	id: string;
	severity: 'warning' | 'critical' | 'info';
	title: string;
	insight: string;
	category: string;
	recommendation?: string;
}

export function AIInsightsPanel() {
	const [insights, setInsights] = useState<FinancialInsight[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchInsights = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/ai/financial-insights");
			const data = await response.json();

			if (data.success) {
				setInsights(data.insights);
			} else {
				setError(data.error || "Failed to fetch AI insights.");
				toast.error(data.error || "Failed to fetch AI insights.");
			}
		} catch (err) {
			console.error("Error fetching AI insights:", err);
			setError("Network error or server unreachable.");
			toast.error("Network error while fetching AI insights.");
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchInsights();
		setRefreshing(false);
	};

	useEffect(() => {
		fetchInsights();
	}, []);

	const getSeverityIcon = (severity: FinancialInsight["severity"]) => {
		switch (severity) {
			case "warning":
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case "critical":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Lightbulb className="h-4 w-4 text-blue-500" />;
		}
	};

	const getSeverityBadgeVariant = (severity: FinancialInsight["severity"]): "default" | "secondary" | "destructive" | "outline" => {
		switch (severity) {
			case "warning":
				return "secondary";
			case "critical":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getCategoryIcon = (category: FinancialInsight["category"]) => {
		switch (category) {
			case "income":
				return <TrendingUp className="h-3 w-3 text-green-500" />;
			case "expenses":
				return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
			case "profit":
				return <TrendingUp className="h-3 w-3 text-blue-500" />;
			case "cashflow":
				return <TrendingUp className="h-3 w-3 text-purple-500" />;
			case "budget":
				return <TrendingUp className="h-3 w-3 text-orange-500" />;
			case "goals":
				return <TrendingUp className="h-3 w-3 text-indigo-500" />;
			default:
				return <Lightbulb className="h-3 w-3 text-gray-500" />;
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Lightbulb className="h-5 w-5 text-blue-500" />
						<span>AI Financial Insights</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-32">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<span className="ml-2 text-gray-600">Generating insights...</span>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Lightbulb className="h-5 w-5 text-blue-500" />
						<span>AI Financial Insights</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-red-500 text-center h-32 flex items-center justify-center">
					<XCircle className="h-5 w-5 mr-2" /> {error}
				</CardContent>
			</Card>
		);
	}

	if (insights.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Lightbulb className="h-5 w-5 text-blue-500" />
						<span>AI Financial Insights</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-gray-600 text-center h-32 flex items-center justify-center">
					No insights available at this time.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Lightbulb className="h-5 w-5 text-blue-500" />
						<span>AI Financial Insights</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						disabled={refreshing}
						className="flex items-center space-x-1"
					>
						<RefreshCw
							className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						<span>Refresh</span>
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{insights.map((insight, index) => (
						<div
							key={index}
							className="border-b pb-3 last:border-b-0 last:pb-0"
						>
							<div className="flex items-center space-x-2 mb-2">
								{getSeverityIcon(insight.severity)}
								<h4 className="font-semibold text-md">{insight.title}</h4>
								<Badge
									variant={getSeverityBadgeVariant(insight.severity)}
									className="ml-auto"
								>
									{insight.severity}
								</Badge>
							</div>

							<div className="flex items-center space-x-2 mb-1">
								{getCategoryIcon(insight.category)}
								<Badge variant="outline" className="text-xs">
									{insight.category.replace("_", " ")}
								</Badge>
							</div>

							<p className="text-sm text-gray-700 mb-2">{insight.insight}</p>

							{insight.recommendation && (
								<div className="bg-blue-50 p-2 rounded-md">
									<p className="text-xs text-blue-800">
										<span className="font-medium">💡 Recommendation:</span>{" "}
										{insight.recommendation}
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
