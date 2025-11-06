/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
	Plus,
	Package,
	Search,
	Filter,
	MoreHorizontal,
	TrendingUp,
	TrendingDown,
	ShoppingCart,
	BarChart3,
	Tag,
	Edit,
	Trash2,
	Star,
	AlertTriangle,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useCurrentUser } from "@/hooks/use-current-user";

interface Product {
	id: string;
	name: string;
	sku: string;
	description?: string;
	category: string;
	price: string;
	cost?: string;
	stockQuantity: number;
	lowStockThreshold: number;
	status: "active" | "inactive" | "low_stock" | "discontinued" | "out_of_stock";
	images?: any;
	tags?: any;
	createdAt: string;
}

interface ProductCategory {
	id: string;
	name: string;
	description?: string;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const { data: userData } = useCurrentUser();

	// Fetch products
	const fetchProducts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (categoryFilter !== "all") params.append("category", categoryFilter);
			if (statusFilter !== "all") params.append("status", statusFilter);
			if (statusFilter === "lowStock") params.append("lowStock", "true");

			const response = await fetch(`/api/products?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch products");
			const data = await response.json();
			setProducts(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching products:", error);
			toast.error("Failed to load products");
		} finally {
			setLoading(false);
		}
	};

	// Fetch categories
	const fetchCategories = async () => {
		try {
			const organizationId = userData?.organizationId || null;
			if (!organizationId) {
				console.warn("No organizationId available");
				return;
			}
			const response = await fetch(`/api/products/categories?organizationId=${organizationId}`);
			if (!response.ok) throw new Error("Failed to fetch categories");
			const data = await response.json();
			setCategories(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	// Fetch analytics
	const fetchAnalytics = async () => {
		try {
			const response = await fetch("/api/products/analytics");
			if (!response.ok) throw new Error("Failed to fetch analytics");
			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			console.error("Error fetching analytics:", error);
		}
	};

	useEffect(() => {
		fetchProducts();
		fetchCategories();
		fetchAnalytics();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchProducts();
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, categoryFilter, statusFilter]);

	const featuredProducts = products
		.filter((p) => p.status === "active")
		.sort((a, b) => {
			const stockA = a.stockQuantity || 0;
			const stockB = b.stockQuantity || 0;
			return stockB - stockA;
		})
		.slice(0, 10);

	const productStats = [
		{
			name: "Total Products",
			value: analytics?.total?.toString() || "0",
			change: "+8",
			changeType: "positive" as const,
			icon: Package,
		},
		{
			name: "Active Products",
			value: analytics?.active?.toString() || "0",
			change: "+12",
			changeType: "positive" as const,
			icon: ShoppingCart,
		},
		{
			name: "Low Stock",
			value: analytics?.lowStock?.toString() || "0",
			change: "-5",
			changeType: "positive" as const,
			icon: AlertTriangle,
		},
		{
			name: "Total Value",
			value: `$${analytics?.totalValue?.toLocaleString() || "0"}`,
			change: "+15%",
			changeType: "positive" as const,
			icon: TrendingUp,
		},
	];

	// Calculate category stats from products
	const categoryStats = categories.map((cat) => {
		const catProducts = products.filter((p) => p.category === cat.name);
		const revenue = catProducts.reduce((sum, p) => {
			const price = parseFloat(p.price || "0");
			const stock = p.stockQuantity || 0;
			return sum + price * stock;
		}, 0);
		const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
		return {
			...cat,
			count: catProducts.length,
			revenue,
			color: colors[categories.indexOf(cat) % colors.length] || "bg-gray-500",
		};
	});

	if (loading && products.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Get low stock products
	const lowStockAlerts = products.filter(
		(p) => p.status === "low_stock" || (p.stockQuantity <= p.lowStockThreshold && p.status === "active")
	);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
					<p className="text-muted-foreground">
						Manage your product catalog, inventory, and pricing
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Product
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{productStats.map((stat, index) => (
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

			{/* Product Categories */}
			<Card>
				<CardHeader>
					<CardTitle>Product Categories</CardTitle>
					<CardDescription>
						Overview of products by category
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						{categories.map((category, index) => (
							<div key={category.name} className="space-y-2">
								<div className="flex items-center gap-2">
									<div className={`w-3 h-3 rounded-full ${category.color}`} />
									<h4 className="font-medium">{category.name}</h4>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{category.count}</p>
									<p className="text-sm text-muted-foreground">
										${category.revenue.toLocaleString()} revenue
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Stock Alerts */}
			{lowStockAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Stock Alerts
						</CardTitle>
						<CardDescription>
							Products that need restocking
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{lowStockAlerts.map((alert, index) => (
							<div key={index} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="space-y-1">
									<h4 className="font-medium">{alert.product}</h4>
									<p className="text-sm text-muted-foreground">
										SKU: {alert.sku} • Current: {alert.currentStock} • Reorder: {alert.reorderPoint}
									</p>
								</div>
								<div className="text-right space-y-1">
									<p className="text-sm">Order: {alert.suggestedOrder}</p>
									<Button size="sm" onClick={() => toast.info(`Reorder request for ${alert.product} will be processed`)}>
										Reorder
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Product Management */}
			<Tabs defaultValue="featured" className="space-y-4">
				<TabsList>
					<TabsTrigger value="featured">Featured Products</TabsTrigger>
					<TabsTrigger value="catalog">Full Catalog</TabsTrigger>
					<TabsTrigger value="inventory">Inventory</TabsTrigger>
					<TabsTrigger value="pricing">Pricing</TabsTrigger>
				</TabsList>

				<TabsContent value="featured" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Featured Products</CardTitle>
							<CardDescription>
								Top-selling and featured products
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{featuredProducts.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>No products yet</p>
										<p className="text-sm mt-2">Create your first product to get started</p>
									</div>
								) : (
									featuredProducts.map((product) => {
										const price = parseFloat(product.price || "0");
										return (
											<div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="space-y-1 flex-1">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">{product.name}</h4>
														<Badge variant="outline">{product.category}</Badge>
														<Badge
															variant={
																product.status === "active"
																	? "default"
																	: product.status === "low_stock"
																		? "secondary"
																		: "destructive"
															}
														>
															{product.status.replace("_", " ")}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground">
														SKU: {product.sku}
														{product.description && ` • ${product.description}`}
													</p>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<span>Stock: {product.stockQuantity}</span>
														{product.stockQuantity <= product.lowStockThreshold && (
															<Badge variant="destructive" className="text-xs">
																Low Stock
															</Badge>
														)}
													</div>
												</div>
												<div className="text-right space-y-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">${price.toLocaleString()}</span>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => toast.info(`More options for ${product.name}`)}
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Editing ${product.name}`)}
														>
															<Edit className="h-3 w-3 mr-1" />
															Edit
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Viewing analytics for ${product.name}`)}
														>
															<BarChart3 className="h-3 w-3 mr-1" />
															Analytics
														</Button>
													</div>
												</div>
											</div>
										);
									})
								)}
								<Separator />
								<Button
									variant="outline"
									className="w-full"
									onClick={() => {
										setCategoryFilter('all');
										setStatusFilter('all');
										toast.info('Showing all products');
									}}
								>
									<Search className="h-4 w-4 mr-2" />
									View All Products
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="catalog" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Product Catalog</CardTitle>
							<CardDescription>
								Complete product catalog with search and management
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls */}
								<div className="flex items-center gap-4">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search products..."
											className="pl-10"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<select
										className="px-3 py-2 border rounded-lg text-sm"
										value={categoryFilter}
										onChange={(e) => setCategoryFilter(e.target.value)}
									>
										<option value="all">All Categories</option>
										{categories.map((cat) => (
											<option key={cat.id || cat.name} value={cat.name}>
												{cat.name}
											</option>
										))}
									</select>
									<select
										className="px-3 py-2 border rounded-lg text-sm"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
									>
										<option value="all">All Status</option>
										<option value="active">Active</option>
										<option value="low_stock">Low Stock</option>
										<option value="out_of_stock">Out of Stock</option>
										<option value="inactive">Inactive</option>
										<option value="discontinued">Discontinued</option>
									</select>
								</div>

								{/* Products list */}
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : products.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No products found</p>
									</div>
								) : (
									<div className="space-y-2">
										{products.map((product) => {
											const price = parseFloat(product.price || "0");
											return (
												<div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<h4 className="font-medium">{product.name}</h4>
															<Badge
																variant={
																	product.status === "active"
																		? "default"
																		: product.status === "low_stock"
																			? "secondary"
																			: "destructive"
																}
															>
																{product.status.replace("_", " ")}
															</Badge>
															<Badge variant="outline">{product.category}</Badge>
														</div>
														<p className="text-sm text-muted-foreground">
															SKU: {product.sku} • Stock: {product.stockQuantity}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<span className="font-medium">${price.toLocaleString()}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Viewing details for ${product.name}`)}
														>
															View
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Editing ${product.name}`)}
														>
															Edit
														</Button>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="inventory" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Inventory Management</CardTitle>
							<CardDescription>
								Track stock levels and manage inventory
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Total Inventory Value</h4>
										<p className="text-2xl font-bold">$245,680</p>
										<p className="text-sm text-muted-foreground">Current stock value</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Items in Stock</h4>
										<p className="text-2xl font-bold">1,847</p>
										<p className="text-sm text-muted-foreground">Physical inventory</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Turnover Rate</h4>
										<p className="text-2xl font-bold">4.2x</p>
										<p className="text-sm text-muted-foreground">Annual turnover</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pricing" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Pricing Management</CardTitle>
							<CardDescription>
								Manage pricing strategies and discounts
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<h4 className="font-medium">Average Price</h4>
										<p className="text-2xl font-bold">$347</p>
										<p className="text-sm text-muted-foreground">Across all products</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Active Discounts</h4>
										<p className="text-2xl font-bold">12</p>
										<p className="text-sm text-muted-foreground">Promotional offers</p>
									</div>
								</div>
								<Separator />
								<Button variant="outline" className="w-full">
									<Tag className="h-4 w-4 mr-2" />
									Manage Pricing Rules
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
