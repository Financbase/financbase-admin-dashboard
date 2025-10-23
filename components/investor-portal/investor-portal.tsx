"use client";

import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Building2,
	TrendingUp,
	TrendingDown,
	Users,
	DollarSign,
	Target,
	BarChart3,
	PieChart,
	Calendar,
	Download,
	Share,
	Shield,
	Activity,
	Info,
	RefreshCw,
} from "lucide-react";
import { InteractiveChart } from "../analytics/advanced-charts";

interface PortalData {
	company: {
		name: string;
		logo?: string;
		description: string;
		industry: string;
		founded: string;
	};
	metrics: {
		totalRevenue: number;
		revenueGrowth: number;
		profitMargin: number;
		customerCount: number;
		valuation: number;
	};
	charts: Array<{
		id: string;
		title: string;
		type: string;
		data: any[];
		config: any;
	}>;
	documents: Array<{
		id: string;
		name: string;
		type: string;
		size: string;
		uploadedAt: string;
	}>;
	lastUpdated: string;
}

interface InvestorPortalProps {
	portalId: string;
	accessToken: string;
}

export function InvestorPortal({ portalId, accessToken }: InvestorPortalProps) {
	const [portalData, setPortalData] = useState<PortalData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState("12m");

	useEffect(() => {
		fetchPortalData();
	}, [portalId, accessToken]);

	const fetchPortalData = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/investor-portal/${portalId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch portal data");
			}

			const data = await response.json();
			setPortalData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">Loading investor portal...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<Alert className="max-w-md">
					<Shield className="h-4 w-4" />
					<AlertDescription>
						{error}. Please check your access credentials.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!portalData) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
					<p className="text-muted-foreground">No data available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{portalData.company.logo ? (
								<img
									src={portalData.company.logo}
									alt={portalData.company.name}
									className="h-10 w-10 rounded-lg"
								/>
							) : (
								<div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
									<Building2 className="h-6 w-6 text-primary-foreground" />
								</div>
							)}
							<div>
								<h1 className="text-xl font-bold">
									{portalData.company.name} Investor Portal
								</h1>
								<p className="text-sm text-muted-foreground">
									{portalData.company.industry} • Founded {portalData.company.founded}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Share className="h-4 w-4 mr-2" />
								Share
							</Button>
							<Button variant="outline" size="sm">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-6 py-8">
				{/* Company Overview */}
				<div className="mb-8">
					<Card className="bg-white/50 backdrop-blur-sm">
						<CardContent className="p-6">
							<p className="text-muted-foreground mb-4">
								{portalData.company.description}
							</p>
							<div className="flex items-center gap-2">
								<Badge variant="secondary">Last updated: {portalData.lastUpdated}</Badge>
								<Badge variant="outline">Read-only access</Badge>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Key Metrics */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
					<Card className="bg-white/50 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
							<DollarSign className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								${portalData.metrics.totalRevenue.toLocaleString()}
							</div>
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								{portalData.metrics.revenueGrowth >= 0 ? (
									<TrendingUp className="h-3 w-3 text-green-600" />
								) : (
									<TrendingDown className="h-3 w-3 text-red-600" />
								)}
								<span
									className={
										portalData.metrics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
									}
								>
									{portalData.metrics.revenueGrowth >= 0 ? "+" : ""}
									{portalData.metrics.revenueGrowth.toFixed(1)}%
								</span>
								<span>vs last period</span>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white/50 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
							<Target className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{portalData.metrics.profitMargin.toFixed(1)}%
							</div>
							<div className="text-xs text-muted-foreground">
								Net profit percentage
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white/50 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Customers</CardTitle>
							<Users className="h-4 w-4 text-purple-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{portalData.metrics.customerCount.toLocaleString()}
							</div>
							<div className="text-xs text-muted-foreground">
								Active customers
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white/50 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Valuation</CardTitle>
							<BarChart3 className="h-4 w-4 text-orange-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								${portalData.metrics.valuation.toLocaleString()}
							</div>
							<div className="text-xs text-muted-foreground">
								Company valuation
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Charts and Analytics */}
				<Tabs defaultValue="performance" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="performance">Performance</TabsTrigger>
						<TabsTrigger value="financials">Financials</TabsTrigger>
						<TabsTrigger value="growth">Growth</TabsTrigger>
						<TabsTrigger value="documents">Documents</TabsTrigger>
					</TabsList>

					<TabsContent value="performance" className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-2">
							{portalData.charts.map((chart) => (
								<Card key={chart.id} className="bg-white/50 backdrop-blur-sm">
									<CardHeader>
										<CardTitle className="text-lg">{chart.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<InteractiveChart
											config={{
												type: chart.type as any,
												data: chart.data,
												xAxisKey: chart.config.xAxisKey || "month",
												yAxisKeys: chart.config.yAxisKeys || ["value"],
												colors: chart.config.colors || ["#3b82f6"],
												showGrid: true,
												showTooltip: true,
												showLegend: chart.config.showLegend,
											}}
											height={300}
										/>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="financials" className="space-y-6">
						<Card className="bg-white/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Financial Overview</CardTitle>
								<CardDescription>
									Key financial metrics and trends
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8 text-muted-foreground">
									Financial statements and detailed breakdowns would be displayed here
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="growth" className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-2">
							<Card className="bg-white/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>Growth Metrics</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Revenue Growth</span>
										<div className="flex items-center gap-2">
											<TrendingUp className="h-4 w-4 text-green-600" />
											<span className="text-sm font-bold text-green-600">
												+{portalData.metrics.revenueGrowth.toFixed(1)}%
											</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Customer Growth</span>
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-blue-600" />
											<span className="text-sm font-bold text-blue-600">
												+15.2%
											</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Market Expansion</span>
										<div className="flex items-center gap-2">
											<Target className="h-4 w-4 text-purple-600" />
											<span className="text-sm font-bold text-purple-600">
												3 new markets
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-white/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>Key Milestones</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
										<div>
											<div className="text-sm font-medium">Product Launch</div>
											<div className="text-xs text-muted-foreground">
												Successfully launched v2.0
											</div>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
										<div>
											<div className="text-sm font-medium">Team Expansion</div>
											<div className="text-xs text-muted-foreground">
												Grew team by 25%
											</div>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
										<div>
											<div className="text-sm font-medium">Funding Round</div>
											<div className="text-xs text-muted-foreground">
												Series A completed
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="documents" className="space-y-6">
						<Card className="bg-white/50 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Shared Documents</CardTitle>
								<CardDescription>
									Financial reports, presentations, and other materials
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{portalData.documents.map((doc) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
													{doc.type === "pdf" ? (
														<Download className="h-4 w-4" />
													) : (
														<Share className="h-4 w-4" />
													)}
												</div>
												<div>
													<div className="text-sm font-medium">{doc.name}</div>
													<div className="text-xs text-muted-foreground">
														{doc.size} • Uploaded {doc.uploadedAt}
													</div>
												</div>
											</div>
											<Button variant="outline" size="sm">
												<Download className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>

			{/* Footer */}
			<footer className="bg-white/50 backdrop-blur-sm border-t mt-16">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div>
							© 2024 {portalData.company.name}. All rights reserved.
						</div>
						<div className="flex items-center gap-4">
							<span>Investor Portal v1.0</span>
							<Shield className="h-4 w-4" />
							<span>Secure Access</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
