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
	Plus,
	Building,
	Car,
	Monitor,
	Wrench,
	TrendingUp,
	TrendingDown,
	Calendar,
	AlertTriangle,
	Search,
	Filter,
	MoreHorizontal
} from "lucide-react";

export const metadata: Metadata = {
	title: "Asset Management | Financbase",
	description: "Track and manage your business assets, equipment, and property",
};

const assetCategories = [
	{
		name: "Equipment",
		count: 24,
		totalValue: 125000,
		icon: Monitor,
		color: "text-blue-600",
	},
	{
		name: "Vehicles",
		count: 3,
		totalValue: 85000,
		icon: Car,
		color: "text-green-600",
	},
	{
		name: "Property",
		count: 2,
		totalValue: 450000,
		icon: Building,
		color: "text-purple-600",
	},
	{
		name: "Tools & Machinery",
		count: 18,
		totalValue: 67000,
		icon: Wrench,
		color: "text-orange-600",
	},
];

const recentAssets = [
	{
		id: "AST-001",
		name: "MacBook Pro 16-inch",
		category: "Equipment",
		purchaseDate: "2024-03-15",
		purchasePrice: 3200,
		currentValue: 2800,
		depreciation: 12,
		status: "active",
		location: "Main Office",
	},
	{
		id: "AST-002",
		name: "Company Vehicle - Toyota Camry",
		category: "Vehicles",
		purchaseDate: "2023-08-20",
		purchasePrice: 28000,
		currentValue: 22000,
		depreciation: 21,
		status: "active",
		location: "Field Operations",
	},
	{
		id: "AST-003",
		name: "Office Building - 123 Main St",
		category: "Property",
		purchaseDate: "2022-01-10",
		purchasePrice: 350000,
		currentValue: 380000,
		depreciation: -9,
		status: "active",
		location: "Downtown",
	},
	{
		id: "AST-004",
		name: "CNC Machine",
		category: "Tools & Machinery",
		purchaseDate: "2024-01-05",
		purchasePrice: 45000,
		currentValue: 42000,
		depreciation: 7,
		status: "maintenance",
		location: "Manufacturing Floor",
	},
];

const assetAlerts = [
	{
		type: "warning",
		asset: "CNC Machine",
		message: "Scheduled maintenance due in 5 days",
		action: "Schedule Service",
	},
	{
		type: "info",
		asset: "MacBook Pro 16-inch",
		message: "Warranty expires in 3 months",
		action: "Extend Warranty",
	},
];

export default function AssetsPage() {
	const totalValue = assetCategories.reduce((sum, cat) => sum + cat.totalValue, 0);
	const totalAssets = assetCategories.reduce((sum, cat) => sum + cat.count, 0);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
					<p className="text-muted-foreground">
						Track, manage, and optimize your business assets and equipment
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Asset
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Assets</CardTitle>
						<Building className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalAssets}</div>
						<p className="text-xs text-muted-foreground">Active assets</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Value</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">Current market value</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Categories</CardTitle>
						<Monitor className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{assetCategories.length}</div>
						<p className="text-xs text-muted-foreground">Asset types</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">3</div>
						<p className="text-xs text-muted-foreground">Assets need attention</p>
					</CardContent>
				</Card>
			</div>

			{/* Asset Categories */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{assetCategories.map((category, index) => (
					<Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<category.icon className={`h-5 w-5 ${category.color}`} />
									<CardTitle className="text-lg">{category.name}</CardTitle>
								</div>
								<Button variant="ghost" size="icon">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Assets</span>
								<span className="font-medium">{category.count}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Total Value</span>
								<span className="font-medium">${category.totalValue.toLocaleString()}</span>
							</div>
							<Button variant="outline" size="sm" className="w-full mt-3">
								View Assets
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Asset Alerts */}
			{assetAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Asset Alerts
						</CardTitle>
						<CardDescription>
							Important notifications about your assets
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{assetAlerts.map((alert, index) => (
							<div key={`${alert.asset}-${alert.message}`} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									<AlertTriangle className="h-4 w-4 text-yellow-500" />
									<div>
										<span className="text-sm font-medium">{alert.asset}</span>
										<p className="text-sm text-muted-foreground">{alert.message}</p>
									</div>
								</div>
								{alert.action && (
									<Button variant="outline" size="sm">
										{alert.action}
									</Button>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Asset List */}
			<Tabs defaultValue="recent" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recent">Recent Assets</TabsTrigger>
					<TabsTrigger value="all">All Assets</TabsTrigger>
					<TabsTrigger value="depreciation">Depreciation</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Assets</CardTitle>
							<CardDescription>
								Recently added or modified assets
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentAssets.map((asset, index) => (
									<div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{asset.name}</h4>
												<Badge variant="outline">{asset.category}</Badge>
												<Badge variant={
													asset.status === 'active' ? 'default' :
													asset.status === 'maintenance' ? 'secondary' :
													'destructive'
												}>
													{asset.status}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												ID: {asset.id} • Purchased: {asset.purchaseDate} • Location: {asset.location}
											</p>
										</div>
										<div className="text-right space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">${asset.currentValue.toLocaleString()}</span>
												{asset.depreciation > 0 ? (
													<TrendingDown className="h-4 w-4 text-red-500" />
												) : (
													<TrendingUp className="h-4 w-4 text-green-500" />
												)}
											</div>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">Edit</Button>
												<Button variant="ghost" size="sm">View</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Search className="h-4 w-4 mr-2" />
									View All Assets
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Assets</CardTitle>
							<CardDescription>
								Complete list of all business assets
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls would go here */}
								<div className="flex items-center gap-4">
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search assets...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Asset table would go here */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Asset table with sorting, filtering, and pagination would be implemented here</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="depreciation" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Depreciation Tracking</CardTitle>
							<CardDescription>
								Monitor asset depreciation and plan for replacements
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Total Depreciation</h4>
										<p className="text-2xl font-bold text-red-600">$47,200</p>
										<p className="text-sm text-muted-foreground">This month</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Assets Due for Replacement</h4>
										<p className="text-2xl font-bold">2</p>
										<p className="text-sm text-muted-foreground">Within 6 months</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Maintenance Budget</h4>
										<p className="text-2xl font-bold">$8,500</p>
										<p className="text-sm text-muted-foreground">Monthly allocation</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
