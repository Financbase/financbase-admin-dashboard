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
	AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
	title: "Product Management | Financbase",
	description: "Manage your product catalog, inventory, and pricing",
};

const productStats = [
	{
		name: "Total Products",
		value: "156",
		change: "+8",
		changeType: "positive",
		icon: Package,
	},
	{
		name: "Active Products",
		value: "134",
		change: "+12",
		changeType: "positive",
		icon: ShoppingCart,
	},
	{
		name: "Low Stock",
		value: "23",
		change: "-5",
		changeType: "positive",
		icon: AlertTriangle,
	},
	{
		name: "Revenue",
		value: "$89,450",
		change: "+15%",
		changeType: "positive",
		icon: TrendingUp,
	},
];

const categories = [
	{
		name: "Software",
		count: 45,
		revenue: 45000,
		color: "bg-blue-500",
	},
	{
		name: "Services",
		count: 32,
		revenue: 28000,
		color: "bg-green-500",
	},
	{
		name: "Hardware",
		count: 28,
		revenue: 16500,
		color: "bg-purple-500",
	},
	{
		name: "Consulting",
		count: 51,
		revenue: 32000,
		color: "bg-orange-500",
	},
];

const featuredProducts = [
	{
		id: "PROD-001",
		name: "Financbase Pro",
		category: "Software",
		price: 99,
		stock: 150,
		sales: 1247,
		rating: 4.8,
		status: "active",
		description: "Advanced financial management software",
		sku: "FB-PRO-2025",
	},
	{
		id: "PROD-002",
		name: "Consulting Package",
		category: "Services",
		price: 2500,
		stock: -1, // Unlimited for services
		sales: 89,
		rating: 4.9,
		status: "active",
		description: "Comprehensive business consulting services",
		sku: "CONS-PKG-001",
	},
	{
		id: "PROD-003",
		name: "Mobile App SDK",
		category: "Software",
		price: 299,
		stock: 75,
		sales: 234,
		rating: 4.6,
		status: "active",
		description: "Complete SDK for mobile app development",
		sku: "SDK-MOBILE-001",
	},
	{
		id: "PROD-004",
		name: "Cloud Infrastructure",
		category: "Hardware",
		price: 1500,
		stock: 12,
		sales: 45,
		rating: 4.4,
		status: "low_stock",
		description: "Enterprise cloud infrastructure setup",
		sku: "CLOUD-INFRA-001",
	},
];

const lowStockAlerts = [
	{
		product: "Cloud Infrastructure",
		sku: "CLOUD-INFRA-001",
		currentStock: 12,
		reorderPoint: 15,
		suggestedOrder: 25,
	},
	{
		product: "Mobile App SDK",
		sku: "SDK-MOBILE-001",
		currentStock: 75,
		reorderPoint: 50,
		suggestedOrder: 100,
	},
];

export default function ProductsPage() {
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
									<Button size="sm">Reorder</Button>
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
								{featuredProducts.map((product, index) => (
									<div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{product.name}</h4>
												<Badge variant="outline">{product.category}</Badge>
												<Badge variant={
													product.status === 'active' ? 'default' :
													product.status === 'low_stock' ? 'secondary' :
													'destructive'
												}>
													{product.status.replace('_', ' ')}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												SKU: {product.sku} • {product.description}
											</p>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>{product.sales} sales</span>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
													<span>{product.rating}</span>
												</div>
											</div>
										</div>
										<div className="text-right space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">${product.price}</span>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
											<p className="text-sm text-muted-foreground">
												Stock: {product.stock === -1 ? 'Unlimited' : product.stock}
											</p>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">
													<Edit className="h-3 w-3 mr-1" />
													Edit
												</Button>
												<Button variant="ghost" size="sm">
													<BarChart3 className="h-3 w-3 mr-1" />
													Analytics
												</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
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
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search products...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
									<Button variant="outline">
										<Tag className="h-4 w-4 mr-2" />
										Categories
									</Button>
								</div>

								{/* Product grid placeholder */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Product grid with search, filtering, sorting, and bulk operations would be implemented here</p>
								</div>
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
