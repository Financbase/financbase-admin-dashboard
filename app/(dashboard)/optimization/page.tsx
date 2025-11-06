/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Target,
	TrendingUp,
	TrendingDown,
	Zap,
	Lightbulb,
	BarChart3,
	PieChart,
	Settings,
	RefreshCw,
	AlertTriangle,
	CheckCircle,
	Clock,
	DollarSign,
	Users,
	Package
} from "lucide-react";

export const metadata: Metadata = {
	title: "Business Optimization | Financbase",
	description: "AI-powered insights and recommendations to optimize your business performance",
};

const optimizationStats = [
	{
		name: "Potential Savings",
		value: "$24,500",
		change: "+15%",
		changeType: "positive",
		icon: DollarSign,
	},
	{
		name: "Efficiency Score",
		value: "87%",
		change: "+5%",
		changeType: "positive",
		icon: Target,
	},
	{
		name: "Active Optimizations",
		value: "12",
		change: "+3",
		changeType: "positive",
		icon: Zap,
	},
	{
		name: "Time to ROI",
		value: "3.2 months",
		change: "-0.8",
		changeType: "positive",
		icon: Clock,
	},
];

const optimizationAreas = [
	{
		area: "Cash Flow",
		score: 85,
		potential: 12500,
		status: "good",
		recommendations: 3,
		icon: TrendingUp,
		color: "text-green-600",
	},
	{
		area: "Expense Management",
		score: 72,
		potential: 8500,
		status: "warning",
		recommendations: 5,
		icon: DollarSign,
		color: "text-yellow-600",
	},
	{
		area: "Inventory",
		score: 91,
		potential: 3200,
		status: "excellent",
		recommendations: 1,
		icon: Package,
		color: "text-blue-600",
	},
	{
		area: "Team Productivity",
		score: 78,
		potential: 6800,
		status: "good",
		recommendations: 4,
		icon: Users,
		color: "text-purple-600",
	},
];

const recommendations = [
	{
		title: "Negotiate Better Payment Terms",
		description: "Extend payment terms with suppliers to improve cash flow by 15-20%",
		impact: "High",
		effort: "Low",
		savings: 8500,
		priority: "high",
		category: "Cash Flow",
		status: "pending",
	},
	{
		title: "Implement Automated Invoicing",
		description: "Reduce invoice processing time by 75% and improve collection rates",
		impact: "High",
		effort: "Medium",
		savings: 6200,
		priority: "high",
		category: "Operations",
		status: "in_progress",
	},
	{
		title: "Optimize Inventory Levels",
		description: "Reduce excess inventory by 30% while maintaining service levels",
		impact: "Medium",
		effort: "Medium",
		savings: 3200,
		priority: "medium",
		category: "Inventory",
		status: "pending",
	},
	{
		title: "Streamline Approval Workflows",
		description: "Reduce approval time by 60% with automated routing",
		impact: "Medium",
		effort: "Low",
		savings: 4800,
		priority: "medium",
		category: "Operations",
		status: "pending",
	},
	{
		title: "Vendor Consolidation",
		description: "Consolidate vendors to negotiate better rates and terms",
		impact: "High",
		effort: "High",
		savings: 12500,
		priority: "low",
		category: "Procurement",
		status: "pending",
	},
];

const implementedOptimizations = [
	{
		name: "Automated Expense Categorization",
		description: "AI-powered expense categorization with 97% accuracy",
		savings: 3400,
		implemented: "2024-12-01",
		roi: "285%",
		status: "active",
	},
	{
		name: "Dynamic Pricing Engine",
		description: "Automated pricing adjustments based on market conditions",
		savings: 5600,
		implemented: "2024-11-15",
		roi: "420%",
		status: "active",
	},
	{
		name: "Predictive Maintenance",
		description: "AI-driven equipment maintenance scheduling",
		savings: 2800,
		implemented: "2024-10-20",
		roi: "180%",
		status: "active",
	},
];

export default function OptimizationPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Business Optimization</h1>
					<p className="text-muted-foreground">
						AI-powered insights and recommendations to optimize your business performance
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh Insights
					</Button>
					<Button>
						<Settings className="h-4 w-4 mr-2" />
						Optimization Settings
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{optimizationStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Optimization Areas */}
			<Card>
				<CardHeader>
					<CardTitle>Optimization Areas</CardTitle>
					<CardDescription>
						Current performance scores and improvement opportunities
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{optimizationAreas.map((area, index) => (
							<Card key={area.area}>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<area.icon className={`h-5 w-5 ${area.color}`} />
											<CardTitle className="text-lg">{area.area}</CardTitle>
										</div>
										<Badge variant={
											area.status === 'excellent' ? 'default' :
											area.status === 'good' ? 'secondary' :
											area.status === 'warning' ? 'outline' :
											'destructive'
										}>
											{area.status}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span>Performance Score</span>
											<span className="font-medium">{area.score}%</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span>Potential Savings</span>
											<span className="font-medium text-green-600">${area.potential.toLocaleString()}</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span>Recommendations</span>
											<span className="font-medium">{area.recommendations}</span>
										</div>
									</div>
									<Button variant="outline" size="sm" className="w-full mt-3">
										View Details
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Recommendations */}
			<Tabs defaultValue="recommendations" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recommendations">Recommendations</TabsTrigger>
					<TabsTrigger value="implemented">Implemented</TabsTrigger>
					<TabsTrigger value="roadmap">Optimization Roadmap</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="recommendations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5" />
								AI Recommendations
							</CardTitle>
							<CardDescription>
								Personalized optimization recommendations based on your business data
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recommendations.map((rec, index) => (
									<div key={index} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-3">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{rec.title}</h4>
													<Badge variant={
														rec.priority === 'high' ? 'destructive' :
														rec.priority === 'medium' ? 'secondary' :
														'outline'
													}>
														{rec.priority} priority
													</Badge>
													<Badge variant="outline">{rec.category}</Badge>
													<Badge variant={
														rec.status === 'pending' ? 'outline' :
														rec.status === 'in_progress' ? 'secondary' :
														'default'
													}>
														{rec.status}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">{rec.description}</p>
											</div>
											<div className="text-right space-y-1">
												<p className="font-medium text-green-600">${rec.savings.toLocaleString()}</p>
												<p className="text-sm text-muted-foreground">potential savings</p>
											</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4 text-sm">
												<div className="flex items-center gap-1">
													<span className="text-muted-foreground">Impact:</span>
													<Badge variant={
														rec.impact === 'High' ? 'default' :
														rec.impact === 'Medium' ? 'secondary' :
														'outline'
													}>
														{rec.impact}
													</Badge>
												</div>
												<div className="flex items-center gap-1">
													<span className="text-muted-foreground">Effort:</span>
													<Badge variant={
														rec.effort === 'Low' ? 'default' :
														rec.effort === 'Medium' ? 'secondary' :
														'destructive'
													}>
														{rec.effort}
													</Badge>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm">
													Learn More
												</Button>
												<Button size="sm">
													Implement
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="implemented" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5" />
								Implemented Optimizations
							</CardTitle>
							<CardDescription>
								Successfully implemented optimizations and their performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{implementedOptimizations.map((opt, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{opt.name}</h4>
												<Badge variant="default">Active</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{opt.description}</p>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>Implemented: {opt.implemented}</span>
												<span>•</span>
												<span>ROI: {opt.roi}</span>
											</div>
										</div>
										<div className="text-right space-y-1">
											<p className="font-medium text-green-600">${opt.savings.toLocaleString()}/month</p>
											<Button variant="outline" size="sm">
												View Details
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="roadmap" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Optimization Roadmap</CardTitle>
							<CardDescription>
								Strategic optimization plan and timeline
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Optimization Roadmap</h3>
									<p className="text-sm mb-4">
										Strategic timeline showing planned optimizations and expected impact over time
									</p>
									<Button variant="outline">
										<BarChart3 className="h-4 w-4 mr-2" />
										View Roadmap
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Performance Trends</CardTitle>
								<CardDescription>
									Optimization performance over time
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">This Month</span>
										<span className="font-medium">$18,200 saved</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Last Month</span>
										<span className="font-medium">$15,800 saved</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Growth Rate</span>
										<span className="font-medium text-green-600">+15%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Target Achievement</span>
										<span className="font-medium text-green-600">87%</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>ROI Analysis</CardTitle>
								<CardDescription>
									Return on investment for implemented optimizations
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Total Invested</span>
										<span className="font-medium">$12,400</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Total Savings</span>
										<span className="font-medium text-green-600">$45,600</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Net ROI</span>
										<span className="font-medium text-green-600">268%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Payback Period</span>
										<span className="font-medium">4.2 months</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
