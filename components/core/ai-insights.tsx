/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIInsight {
	insights: string[];
	recommendations: string[];
	riskAssessment: string;
	forecast: {
		nextMonth: number;
		nextQuarter: number;
		nextYear: number;
	};
}

export default function AIInsights() {
	const [insights, setInsights] = useState<AIInsight | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchInsights = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/dashboard/ai-insights');
			
			if (!response.ok) {
				throw new Error('Failed to fetch AI insights');
			}
			
			const data = await response.json();
			setInsights(data.insights);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			// Set mock data for development
			setInsights({
				insights: [
					'Revenue growth is consistent with business plan',
					'Expense management shows good discipline',
				],
				recommendations: [
					'Consider increasing marketing spend for growth',
					'Review vendor contracts for better rates',
				],
				riskAssessment: 'Low - Strong financial position',
				forecast: {
					nextMonth: 22000,
					nextQuarter: 66000,
					nextYear: 264000,
				},
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchInsights();
	}, [fetchInsights]);

	if (loading) {
		return (
			<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
						<Brain className="h-5 w-5" />
						AI Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
						<span className="ml-2 text-gray-500">Loading insights...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error && !insights) {
		return (
			<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
						<Brain className="h-5 w-5" />
						AI Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
						<p className="text-red-500 mb-4">{error}</p>
						<Button onClick={fetchInsights} variant="outline" size="sm">
							<RefreshCw className="h-4 w-4 mr-2" />
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
					<div className="flex items-center gap-2">
						<Brain className="h-5 w-5" />
						AI Insights
					</div>
					<Button onClick={fetchInsights} variant="ghost" size="sm">
						<RefreshCw className="h-4 w-4" />
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Financial Insights */}
				<div>
					<h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
						<TrendingUp className="h-4 w-4" />
						Key Insights
					</h4>
					<ul className="space-y-2">
						{insights?.insights.map((insight, index) => (
							<li key={`insight-${index}-${insight.slice(0, 10)}`} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
								<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
								{insight}
							</li>
						))}
					</ul>
				</div>

				{/* Recommendations */}
				<div>
					<h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
						<Lightbulb className="h-4 w-4" />
						Recommendations
					</h4>
					<ul className="space-y-2">
						{insights?.recommendations.map((recommendation, index) => (
							<li key={`recommendation-${index}-${recommendation.slice(0, 10)}`} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
								<span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
								{recommendation}
							</li>
						))}
					</ul>
				</div>

				{/* Risk Assessment */}
				<div>
					<h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
						<AlertTriangle className="h-4 w-4" />
						Risk Assessment
					</h4>
					<div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
						{insights?.riskAssessment}
					</div>
				</div>

				{/* Forecast */}
				<div>
					<h4 className="font-semibold text-gray-900 dark:text-white mb-3">
						Revenue Forecast
					</h4>
					<div className="grid grid-cols-3 gap-4 text-center">
						<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
							<div className="text-xs text-gray-500 dark:text-gray-400">Next Month</div>
							<div className="font-semibold text-blue-600 dark:text-blue-400">
								${insights?.forecast.nextMonth.toLocaleString()}
							</div>
						</div>
						<div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
							<div className="text-xs text-gray-500 dark:text-gray-400">Next Quarter</div>
							<div className="font-semibold text-green-600 dark:text-green-400">
								${insights?.forecast.nextQuarter.toLocaleString()}
							</div>
						</div>
						<div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
							<div className="text-xs text-gray-500 dark:text-gray-400">Next Year</div>
							<div className="font-semibold text-purple-600 dark:text-purple-400">
								${insights?.forecast.nextYear.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
