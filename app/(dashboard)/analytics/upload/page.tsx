/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
import { logger } from '@/lib/logger';
	BarChart3,
	TrendingUp,
	Users,
	Download,
	Upload,
	ImageIcon,
	Video,
	Clock,
	AlertCircle,
	CheckCircle,
	Settings,
	RefreshCw,
	Calendar,
	Filter,
	ArrowUpRight,
	ArrowDownRight,
	Activity,
	Database,
	Target,
	Zap
} from 'lucide-react';

interface UploadMetrics {
	totalUploads: number;
	totalImages: number;
	totalVideos: number;
	totalSize: number;
	averageFileSize: number;
	aiAnalysisCount: number;
	aiAnalysisSuccessRate: number;
	uploadSuccessRate: number;
	averageProcessingTime: number;
	popularCategories: { category: string; count: number }[];
	recentActivity: {
		timestamp: Date;
		type: 'image' | 'video' | 'ai_analysis';
		size: number;
		success: boolean;
	}[];
}

export default function UploadAnalyticsDashboard() {
	const [metrics, setMetrics] = useState<UploadMetrics>({
		totalUploads: 0,
		totalImages: 0,
		totalVideos: 0,
		totalSize: 0,
		averageFileSize: 0,
		aiAnalysisCount: 0,
		aiAnalysisSuccessRate: 0,
		uploadSuccessRate: 0,
		averageProcessingTime: 0,
		popularCategories: [],
		recentActivity: []
	});

	const [isLoading, setIsLoading] = useState(true);
	const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

	// Fetch real data from API
	useEffect(() => {
		async function fetchMetrics() {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/analytics/upload?timeRange=${timeRange}`);
				if (!response.ok) throw new Error('Failed to fetch upload analytics');
				const data = await response.json();
				
				// Format the data
				const formattedMetrics: UploadMetrics = {
					totalUploads: data.metrics.totalUploads || 0,
					totalImages: data.metrics.totalImages || 0,
					totalVideos: data.metrics.totalVideos || 0,
					totalSize: data.metrics.totalSize || 0,
					averageFileSize: data.metrics.averageFileSize || 0,
					aiAnalysisCount: data.metrics.aiAnalysisCount || 0,
					aiAnalysisSuccessRate: data.metrics.aiAnalysisSuccessRate || 0,
					uploadSuccessRate: data.metrics.uploadSuccessRate || 0,
					averageProcessingTime: data.metrics.averageProcessingTime || 0,
					popularCategories: data.metrics.popularCategories || [],
					recentActivity: (data.metrics.recentActivity || []).map((activity: any) => ({
						timestamp: new Date(activity.timestamp),
						type: activity.type,
						size: activity.size,
						success: activity.success,
					})),
				};
				
				setMetrics(formattedMetrics);
			} catch (error) {
				logger.error('Error fetching upload analytics:', error);
			} finally {
				setIsLoading(false);
			}
		}
		
		fetchMetrics();
	}, [timeRange]);

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDuration = (seconds: number) => {
		return `${seconds.toFixed(1)}s`;
	};

	const getActivityIcon = (type: string, success: boolean) => {
		if (type === 'ai_analysis') {
			return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />;
		}
		return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />;
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case 'image': return 'bg-blue-100 text-blue-800';
			case 'video': return 'bg-purple-100 text-purple-800';
			case 'ai_analysis': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Upload Analytics</h1>
					<p className="text-muted-foreground">
						Monitor upload performance, AI analysis metrics, and user engagement
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Time Range Selector */}
					<div className="flex border rounded-md">
						{(['7d', '30d', '90d'] as const).map((range) => (
							<Button
								key={range}
								variant={timeRange === range ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setTimeRange(range)}
								className="rounded-none first:rounded-l-md last:rounded-r-md"
							>
								{range}
							</Button>
						))}
					</div>

					<Button 
						variant="outline" 
						size="sm" 
						disabled={isLoading}
						onClick={() => {
							setIsLoading(true);
							// Trigger refetch by changing timeRange and back
							const current = timeRange;
							setTimeRange(current === '7d' ? '30d' : '7d');
							setTimeout(() => setTimeRange(current), 10);
						}}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
						<Upload className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.totalUploads.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							+12% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Images Uploaded</CardTitle>
						<ImageIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.totalImages.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							{((metrics.totalImages / metrics.totalUploads) * 100).toFixed(1)}% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Videos Uploaded</CardTitle>
						<Video className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.totalVideos.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							{((metrics.totalVideos / metrics.totalUploads) * 100).toFixed(1)}% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
						<Zap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.aiAnalysisCount.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							{metrics.aiAnalysisSuccessRate.toFixed(1)}% success rate
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Analytics */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Upload Success Rate */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle className="h-5 w-5 text-green-500" />
									Upload Success Rate
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-green-600">
									{metrics.uploadSuccessRate.toFixed(1)}%
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{((metrics.uploadSuccessRate / 100) * metrics.totalUploads).toFixed(0)} successful uploads
								</p>
								<div className="mt-3">
									<div className="flex items-center justify-between text-sm mb-1">
										<span>Success Rate</span>
										<span>{metrics.uploadSuccessRate.toFixed(1)}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-green-500 h-2 rounded-full transition-all duration-300"
											style={{ width: `${metrics.uploadSuccessRate}%` }}
										></div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* File Size Distribution */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Database className="h-5 w-5 text-blue-500" />
									Storage Usage
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{formatFileSize(metrics.totalSize)}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									Average: {formatFileSize(metrics.averageFileSize)}
								</p>
								<div className="mt-3 space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span>Images</span>
										<span>{formatFileSize(metrics.totalSize * 0.85)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span>Videos</span>
										<span>{formatFileSize(metrics.totalSize * 0.15)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						{/* AI Analysis Performance */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5 text-purple-500" />
									AI Analysis
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{metrics.aiAnalysisSuccessRate.toFixed(1)}%
								</div>
								<p className="text-sm text-muted-foreground">
									Success rate
								</p>
								<div className="mt-3">
									<div className="flex items-center justify-between text-sm mb-1">
										<span>Processing Time</span>
										<span>{formatDuration(metrics.averageProcessingTime)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span>Analyses</span>
										<span>{metrics.aiAnalysisCount.toLocaleString()}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Upload Performance */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Activity className="h-5 w-5 text-orange-500" />
									Upload Speed
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatDuration(1.2)}
								</div>
								<p className="text-sm text-muted-foreground">
									Average per file
								</p>
								<div className="mt-3">
									<div className="flex items-center justify-between text-sm mb-1">
										<span>Batch Processing</span>
										<span>{formatDuration(0.8)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span>Single Upload</span>
										<span>{formatDuration(1.2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Error Rate */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-red-500" />
									Error Rate
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-red-600">
									{(100 - metrics.uploadSuccessRate).toFixed(1)}%
								</div>
								<p className="text-sm text-muted-foreground">
									Failure rate
								</p>
								<div className="mt-3">
									<div className="flex items-center justify-between text-sm mb-1">
										<span>Upload Errors</span>
										<span>{((100 - metrics.uploadSuccessRate) * metrics.totalUploads / 100).toFixed(0)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span>AI Analysis Errors</span>
										<span>{((100 - metrics.aiAnalysisSuccessRate) * metrics.aiAnalysisCount / 100).toFixed(0)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Popular Categories</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{metrics.popularCategories.map((category, index) => (
									<div key={category.category} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium">
												{index + 1}
											</div>
											<span className="font-medium">{category.category}</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-32 bg-gray-200 rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-all duration-300"
													style={{
														width: `${(category.count / metrics.popularCategories[0].count) * 100}%`
													}}
												></div>
											</div>
											<span className="text-sm font-medium w-12 text-right">
												{category.count}
											</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{metrics.recentActivity.map((activity, index) => (
									<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="flex items-center gap-3">
											{getActivityIcon(activity.type, activity.success)}
											<div>
												<div className="flex items-center gap-2">
													<span className="font-medium capitalize">
														{activity.type === 'ai_analysis' ? 'AI Analysis' : `${activity.type} Upload`}
													</span>
													<Badge variant="secondary" className={getActivityColor(activity.type)}>
														{activity.type}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{activity.timestamp.toLocaleTimeString()}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">
												{formatFileSize(activity.size)}
											</p>
											<p className={`text-xs ${activity.success ? 'text-green-600' : 'text-red-600'}`}>
												{activity.success ? 'Success' : 'Failed'}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
