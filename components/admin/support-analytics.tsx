/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Clock, CheckCircle, XCircle, Star, TrendingUp } from 'lucide-react';

interface Analytics {
	totalTickets: number;
	byStatus: {
		open: number;
		in_progress: number;
		resolved: number;
		closed: number;
	};
	byPriority: {
		low: number;
		medium: number;
		high: number;
		urgent: number;
	};
	byCategory: {
		technical: number;
		billing: number;
		feature_request: number;
		bug_report: number;
		general: number;
	};
	avgResponseTime: number;
	avgResolutionTime: number;
	avgSatisfactionRating: number;
	totalWithResponseTime: number;
	totalWithResolutionTime: number;
	totalWithRating: number;
}

export function SupportAnalytics() {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAnalytics();
	}, []);

	const fetchAnalytics = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/admin/support/analytics');
			if (!response.ok) {
				throw new Error('Failed to fetch analytics');
			}
			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			console.error('Error fetching analytics:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (minutes: number) => {
		if (minutes < 60) {
			return `${Math.round(minutes)}m`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = Math.round(minutes % 60);
		return `${hours}h ${mins}m`;
	};

	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!analytics) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
						<Ticket className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.totalTickets}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.avgResponseTime > 0
								? formatTime(analytics.avgResponseTime)
								: 'N/A'}
						</div>
						<p className="text-xs text-muted-foreground">
							{analytics.totalWithResponseTime} tickets
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.avgResolutionTime > 0
								? formatTime(analytics.avgResolutionTime)
								: 'N/A'}
						</div>
						<p className="text-xs text-muted-foreground">
							{analytics.totalWithResolutionTime} tickets
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.avgSatisfactionRating > 0
								? analytics.avgSatisfactionRating.toFixed(1)
								: 'N/A'}
						</div>
						<p className="text-xs text-muted-foreground">
							{analytics.totalWithRating} ratings
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Status Breakdown */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Tickets by Status</CardTitle>
						<CardDescription>Current ticket status distribution</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
										Open
									</Badge>
								</div>
								<span className="font-medium">{analytics.byStatus.open}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
										In Progress
									</Badge>
								</div>
								<span className="font-medium">{analytics.byStatus.in_progress}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
										Resolved
									</Badge>
								</div>
								<span className="font-medium">{analytics.byStatus.resolved}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
										Closed
									</Badge>
								</div>
								<span className="font-medium">{analytics.byStatus.closed}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tickets by Priority</CardTitle>
						<CardDescription>Priority level distribution</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
										Urgent
									</Badge>
								</div>
								<span className="font-medium">{analytics.byPriority.urgent}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
										High
									</Badge>
								</div>
								<span className="font-medium">{analytics.byPriority.high}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
										Medium
									</Badge>
								</div>
								<span className="font-medium">{analytics.byPriority.medium}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
										Low
									</Badge>
								</div>
								<span className="font-medium">{analytics.byPriority.low}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Category Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Tickets by Category</CardTitle>
					<CardDescription>Category distribution</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold">{analytics.byCategory.technical}</div>
							<div className="text-sm text-muted-foreground">Technical</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">{analytics.byCategory.billing}</div>
							<div className="text-sm text-muted-foreground">Billing</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">{analytics.byCategory.feature_request}</div>
							<div className="text-sm text-muted-foreground">Feature Request</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">{analytics.byCategory.bug_report}</div>
							<div className="text-sm text-muted-foreground">Bug Report</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">{analytics.byCategory.general}</div>
							<div className="text-sm text-muted-foreground">General</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

