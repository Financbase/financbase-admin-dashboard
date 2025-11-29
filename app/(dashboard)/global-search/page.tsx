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
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
	ExternalLink,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { logger } from '@/lib/logger';

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

interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: "page" | "transaction" | "invoice" | "client" | "report" | "setting";
	href: string;
	icon?: string;
	metadata?: Record<string, any>;
}

export default function SearchPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchHistory, setSearchHistory] = useState<Array<{ query: string; timestamp: string; results: number }>>([]);
	const [savedSearches, setSavedSearches] = useState<Array<{ query: string; name?: string }>>([]);
	const [dateRange, setDateRange] = useState("All time");
	const [category, setCategory] = useState("All");
	const [fileType, setFileType] = useState("All");

	// Debounced search
	const performSearch = useCallback(
		async (query: string) => {
			if (!query || query.length < 2) {
				setSearchResults([]);
				return;
			}

			setLoading(true);
			try {
				const params = new URLSearchParams({
					q: query,
					limit: "20",
				});
				if (category !== "All") {
					params.append("type", category.toLowerCase());
				}

				const response = await fetch(`/api/search?${params.toString()}`);
				if (!response.ok) throw new Error("Search failed");
				const data = await response.json();
				setSearchResults(data.results || []);

				// Add to search history
				setSearchHistory((prev) => [
					{ query, timestamp: new Date().toISOString(), results: data.results?.length || 0 },
					...prev.slice(0, 9),
				]);

				// Store in localStorage
				const stored = localStorage.getItem("searchHistory");
				const history = stored ? JSON.parse(stored) : [];
				const updated = [
					{ query, timestamp: new Date().toISOString(), results: data.results?.length || 0 },
					...history.filter((h: any) => h.query !== query).slice(0, 9),
				];
				localStorage.setItem("searchHistory", JSON.stringify(updated));
			} catch (error) {
				logger.error("Search error:", error);
				toast.error("Failed to perform search");
			} finally {
				setLoading(false);
			}
		},
		[category]
	);

	// Load search history from localStorage
	useEffect(() => {
		const stored = localStorage.getItem("searchHistory");
		if (stored) {
			try {
				setSearchHistory(JSON.parse(stored));
			} catch (error) {
				logger.error("Error loading search history:", error);
			}
		}

		const saved = localStorage.getItem("savedSearches");
		if (saved) {
			try {
				setSavedSearches(JSON.parse(saved));
			} catch (error) {
				logger.error("Error loading saved searches:", error);
			}
		}
	}, []);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, performSearch]);

	const handleSaveSearch = () => {
		if (!searchQuery) return;
		const updated = [...savedSearches, { query: searchQuery }];
		setSavedSearches(updated);
		localStorage.setItem("savedSearches", JSON.stringify(updated));
		toast.success("Search saved");
	};

	const handleResultClick = (result: SearchResult) => {
		router.push(result.href);
	};

	const getIconForType = (type: string) => {
		switch (type) {
			case "transaction":
				return Receipt;
			case "invoice":
				return FileText;
			case "client":
				return Users;
			case "report":
				return Calculator;
			case "setting":
				return Settings;
			default:
				return FileText;
		}
	};

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
					<Button 
						variant="outline"
						disabled
						title="Search settings feature coming soon"
					>
						<Settings className="h-4 w-4 mr-2" />
						Search Settings
						<Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
					</Button>
				</div>
			</div>

			{/* Search Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Searches</CardTitle>
						<Search className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{searchHistory.length}</div>
						<p className="text-xs text-muted-foreground">Search history count</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Results Found</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{searchResults.length}</div>
						<p className="text-xs text-muted-foreground">Current search</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Search Accuracy</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">94.2%</div>
						<p className="text-xs text-muted-foreground">Relevance score</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
						<Bookmark className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{savedSearches.length}</div>
						<p className="text-xs text-muted-foreground">Bookmarked queries</p>
					</CardContent>
				</Card>
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
							{loading ? (
								<Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
							) : (
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							)}
							<Input
								type="text"
								placeholder="Search transactions, customers, invoices, reports..."
								className="w-full pl-10 pr-4 py-3 text-lg"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && searchQuery.length >= 2) {
										performSearch(searchQuery);
									}
								}}
							/>
						</div>

						{/* Search filters */}
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<h4 className="font-medium text-sm">Date Range</h4>
								<select
									className="w-full p-2 border rounded-md text-sm"
									value={dateRange}
									onChange={(e) => setDateRange(e.target.value)}
								>
									{searchFilters[0].options.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-2">
								<h4 className="font-medium text-sm">Category</h4>
								<select
									className="w-full p-2 border rounded-md text-sm"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
								>
									{searchFilters[1].options.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
							<div className="space-y-2">
								<h4 className="font-medium text-sm">File Type</h4>
								<select
									className="w-full p-2 border rounded-md text-sm"
									value={fileType}
									onChange={(e) => setFileType(e.target.value)}
								>
									{searchFilters[2].options.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Search Results */}
						{searchQuery.length >= 2 && (
							<div className="mt-4 space-y-2">
								<div className="flex items-center justify-between">
									<h4 className="font-medium">
										{loading ? "Searching..." : `Found ${searchResults.length} results`}
									</h4>
									{searchQuery && (
										<Button
											variant="outline"
											size="sm"
											onClick={handleSaveSearch}
											disabled={savedSearches.some((s) => s.query === searchQuery)}
										>
											<Bookmark className="h-3 w-3 mr-1" />
											Save
										</Button>
									)}
								</div>
								{searchResults.length > 0 ? (
									<div className="space-y-2 max-h-96 overflow-y-auto">
										{searchResults.map((result) => {
											const Icon = getIconForType(result.type);
											return (
												<div
													key={result.id}
													className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
													onClick={() => handleResultClick(result)}
												>
													<div className="flex items-center gap-3 flex-1">
														<Icon className="h-4 w-4 text-muted-foreground" />
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<p className="font-medium">{result.title}</p>
																<Badge variant="outline">{result.type}</Badge>
															</div>
															<p className="text-sm text-muted-foreground">{result.description}</p>
														</div>
													</div>
													<Button variant="ghost" size="icon">
														<ExternalLink className="h-4 w-4" />
													</Button>
												</div>
											);
										})}
									</div>
								) : !loading && searchQuery.length >= 2 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No results found for "{searchQuery}"</p>
									</div>
								) : null}
							</div>
						)}
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
							{searchHistory.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No recent searches</p>
								</div>
							) : (
								<div className="space-y-3">
									{searchHistory.map((search, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="space-y-1 flex-1">
												<p
													className="font-medium cursor-pointer hover:underline"
													onClick={() => {
														setSearchQuery(search.query);
														performSearch(search.query);
													}}
												>
													{search.query}
												</p>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<span>{search.results} results</span>
													<span>•</span>
													<span>
														{formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
													</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														if (!savedSearches.some((s) => s.query === search.query)) {
															const updated = [...savedSearches, { query: search.query }];
															setSavedSearches(updated);
															localStorage.setItem("savedSearches", JSON.stringify(updated));
															toast.success("Search saved");
														}
													}}
													disabled={savedSearches.some((s) => s.query === search.query)}
												>
													<Bookmark className="h-3 w-3 mr-1" />
													Save
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setSearchQuery(search.query);
														performSearch(search.query);
													}}
												>
													<ExternalLink className="h-3 w-3" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
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
							{popularSearches.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No popular searches yet</p>
								</div>
							) : (
								<div className="space-y-3">
									{popularSearches.map((search, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="space-y-1">
												<p className="font-medium">{search.query}</p>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<span>{search.count} searches</span>
													{search.trend === "up" && (
														<TrendingUp className="h-3 w-3 text-green-500" />
													)}
													{search.trend === "down" && (
														<TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
													)}
													{search.trend === "stable" && (
														<div className="h-3 w-3 rounded-full bg-gray-300" />
													)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSearchQuery(search.query);
														performSearch(search.query);
													}}
												>
													Search
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														if (!savedSearches.some((s) => s.query === search.query)) {
															const updated = [...savedSearches, { query: search.query }];
															setSavedSearches(updated);
															localStorage.setItem("savedSearches", JSON.stringify(updated));
															toast.success("Search saved");
														}
													}}
													disabled={savedSearches.some((s) => s.query === search.query)}
												>
													<Bookmark className="h-3 w-3 mr-1" />
													Save
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
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
							{savedSearches.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">No Saved Searches</h3>
									<p className="text-sm mb-4">
										Save frequently used searches for quick access
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{savedSearches.map((saved, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="space-y-1 flex-1">
												<p
													className="font-medium cursor-pointer hover:underline"
													onClick={() => {
														setSearchQuery(saved.query);
														performSearch(saved.query);
													}}
												>
													{saved.name || saved.query}
												</p>
												<p className="text-sm text-muted-foreground">{saved.query}</p>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSearchQuery(saved.query);
														performSearch(saved.query);
													}}
												>
													Search
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														const updated = savedSearches.filter((s) => s.query !== saved.query);
														setSavedSearches(updated);
														localStorage.setItem("savedSearches", JSON.stringify(updated));
														toast.success("Search removed");
													}}
												>
													Remove
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
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
