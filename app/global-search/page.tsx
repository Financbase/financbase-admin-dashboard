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
	Search,
	Filter,
	Clock,
	TrendingUp,
	Users,
	FileText,
	Calculator,
	Building,
	Receipt,
	Settings,
	Star,
	Bookmark,
	Share2,
	ExternalLink
} from "lucide-react";

export const metadata: Metadata = {
	title: "Global Search | Financbase",
	description: "Search across all your data, documents, and business information",
};

const searchStats = [
	{
		name: "Total Searches",
		value: "2,847",
		change: "+15%",
		changeType: "positive",
		icon: Search,
	},
	{
		name: "Avg Response Time",
		value: "0.3s",
		change: "-0.1s",
		changeType: "positive",
		icon: Clock,
	},
	{
		name: "Search Accuracy",
		value: "94.2%",
		change: "+2.1%",
		changeType: "positive",
		icon: TrendingUp,
	},
	{
		name: "Popular Queries",
		value: "156",
		change: "+8",
		changeType: "positive",
		icon: Star,
	},
];

const searchCategories = [
	{
		name: "Transactions",
		count: 1247,
		icon: Receipt,
		color: "bg-green-500",
		description: "Search through financial transactions",
	},
	{
		name: "Customers",
		count: 892,
		icon: Users,
		color: "bg-blue-500",
		description: "Find customer information and history",
	},
	{
		name: "Invoices",
		count: 634,
		icon: FileText,
		color: "bg-purple-500",
		description: "Search invoice documents and details",
	},
	{
		name: "Reports",
		count: 156,
		icon: Calculator,
		color: "bg-orange-500",
		description: "Access financial and business reports",
	},
	{
		name: "Assets",
		count: 89,
		icon: Building,
		color: "bg-red-500",
		description: "Search equipment and property records",
	},
	{
		name: "Settings",
		count: 45,
		icon: Settings,
		color: "bg-gray-500",
		description: "Find configuration and preferences",
	},
];

const recentSearches = [
	{
		query: "Q4 2024 tax deductions",
		results: 23,
		timestamp: "2 minutes ago",
		category: "Tax",
	},
	{
		query: "customer payment history",
		results: 156,
		timestamp: "15 minutes ago",
		category: "Customers",
	},
	{
		query: "monthly expense report",
		results: 8,
		timestamp: "1 hour ago",
		category: "Reports",
	},
	{
		query: "office equipment inventory",
		results: 12,
		timestamp: "3 hours ago",
		category: "Assets",
	},
];

const popularSearches = [
	{
		query: "tax deductions",
		count: 234,
		trend: "up",
	},
	{
		query: "customer invoices",
		count: 189,
		trend: "up",
	},
	{
		query: "expense categories",
		count: 145,
		trend: "stable",
	},
	{
		query: "cash flow analysis",
		count: 98,
		trend: "up",
	},
	{
		query: "vendor payments",
		count: 76,
		trend: "down",
	},
];

const searchFilters = [
	{
		name: "Date Range",
		options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"],
	},
	{
		name: "Category",
		options: ["All", "Transactions", "Customers", "Invoices", "Reports", "Assets"],
	},
	{
		name: "File Type",
		options: ["All", "PDF", "Excel", "Word", "Images", "Other"],
	},
];

export default function SearchPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Global Search</h1>
					<p className="text-muted-foreground">
						Search across all your data, documents, and business information
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="h-4 w-4 mr-2" />
						Search Settings
					</Button>
				</div>
			</div>

			{/* Search Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				{searchStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last week
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Search Interface */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Smart Search
					</CardTitle>
					<CardDescription>
						Search across all your business data with AI-powered results
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Main search bar */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search transactions, customers, invoices, reports..."
								className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg"
							/>
						</div>

						{/* Search filters */}
						<div className="grid gap-4 md:grid-cols-3">
							{searchFilters.map((filter, index) => (
								<div key={filter.name} className="space-y-2">
									<h4 className="font-medium text-sm">{filter.name}</h4>
									<select className="w-full p-2 border rounded-md text-sm">
										{filter.options.map((option, optionIndex) => (
											<option key={optionIndex} value={option.toLowerCase().replace(' ', '-')}>
												{option}
											</option>
										))}
									</select>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Search Categories */}
			<Card>
				<CardHeader>
					<CardTitle>Search Categories</CardTitle>
					<CardDescription>
						Quick access to different types of business data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{searchCategories.map((category, index) => (
							<div key={category.name} className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
								<div className="flex items-center gap-2 mb-2">
									<div className={`w-3 h-3 rounded-full ${category.color}`} />
									<category.icon className="h-4 w-4" />
									<h4 className="font-medium">{category.name}</h4>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{category.count.toLocaleString()}</p>
									<p className="text-sm text-muted-foreground">{category.description}</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Search History and Popular */}
			<Tabs defaultValue="recent" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recent">Recent Searches</TabsTrigger>
					<TabsTrigger value="popular">Popular Queries</TabsTrigger>
					<TabsTrigger value="saved">Saved Searches</TabsTrigger>
					<TabsTrigger value="advanced">Advanced Search</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Searches</CardTitle>
							<CardDescription>
								Your recent search queries and results
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{recentSearches.map((search, index) => (
									<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="space-y-1">
											<p className="font-medium">{search.query}</p>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Badge variant="outline">{search.category}</Badge>
												<span>{search.results} results</span>
												<span>•</span>
												<span>{search.timestamp}</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												<Bookmark className="h-3 w-3 mr-1" />
												Save
											</Button>
											<Button variant="outline" size="sm">
												<Share2 className="h-3 w-3 mr-1" />
												Share
											</Button>
											<Button variant="ghost" size="sm">
												<ExternalLink className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="popular" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Popular Searches</CardTitle>
							<CardDescription>
								Most frequently searched queries in your organization
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{popularSearches.map((search, index) => (
									<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="space-y-1">
											<p className="font-medium">{search.query}</p>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span>{search.count} searches</span>
												{search.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
												{search.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
												{search.trend === 'stable' && <div className="h-3 w-3 rounded-full bg-gray-300" />}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												Search
											</Button>
											<Button variant="outline" size="sm">
												<Bookmark className="h-3 w-3 mr-1" />
												Save
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="saved" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Saved Searches</CardTitle>
							<CardDescription>
								Your bookmarked and frequently used searches
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								<Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<h3 className="font-medium mb-2">No Saved Searches</h3>
								<p className="text-sm mb-4">
									Save frequently used searches for quick access
								</p>
								<Button variant="outline">
									<Bookmark className="h-4 w-4 mr-2" />
									Create Saved Search
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="advanced" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Advanced Search</CardTitle>
							<CardDescription>
								Use advanced filters and operators for precise results
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<h4 className="font-medium">Field Search</h4>
										<p className="text-sm text-muted-foreground">
											Search specific fields like customer:name, amount:{'>'}1000, date:2025-01
										</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Boolean Operators</h4>
										<p className="text-sm text-muted-foreground">
											Use AND, OR, NOT to combine search terms for precise results
										</p>
									</div>
								</div>
								<Separator />
								<div className="space-y-2">
									<h4 className="font-medium">Search Examples</h4>
									<div className="space-y-1 text-sm">
										<p>• <code className="bg-muted px-1 rounded">customer:"Acme Corp" amount:{'>'}5000</code> - Find high-value Acme transactions</p>
										<p>• <code className="bg-muted px-1 rounded">invoice status:overdue -category:cancelled</code> - Overdue invoices excluding cancelled</p>
										<p>• <code className="bg-muted px-1 rounded">report type:financial date:2025-01-*</code> - Financial reports from January 2025</p>
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
