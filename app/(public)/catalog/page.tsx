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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, ShoppingCart, AlertTriangle, Loader2 } from "lucide-react";

interface Product {
	id: string;
	name: string;
	sku: string;
	description?: string;
	category: string;
	price: string;
	stockQuantity: number;
	status: "active" | "inactive" | "low_stock" | "discontinued" | "out_of_stock";
	images?: any;
}

export default function ProductCatalogPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		fetchProducts();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchProducts();
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, categoryFilter]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (categoryFilter !== "all") params.append("category", categoryFilter);

			const response = await fetch(`/api/products?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch products");
			const data = await response.json();
			const productsList = Array.isArray(data) ? data : [];
			setProducts(productsList);

			// Extract unique categories
			const uniqueCategories = Array.from(
				new Set(productsList.map((p: Product) => p.category))
			) as string[];
			setCategories(uniqueCategories);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredProducts = products.filter((product) => {
		if (product.status !== "active") return false;
		if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
		return true;
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<Badge variant="secondary" className="mb-4">
						<Package className="h-4 w-4 mr-2" />
						Product Catalog
					</Badge>
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
						Browse Our Products
					</h1>
					<p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto font-medium">
						Discover our complete range of products. Find exactly what you need
						with our easy-to-use catalog.
					</p>
				</div>
			</section>

			{/* Search and Filter Section */}
			<section className="container mx-auto px-4 py-8">
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row gap-4">
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
								className="px-3 py-2 border rounded-lg text-sm bg-background"
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
							>
								<option value="all">All Categories</option>
								{categories.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Products Grid */}
			<section className="container mx-auto px-4 py-8">
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : filteredProducts.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center py-12">
								<Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
								<p className="text-lg font-medium text-muted-foreground">
									No products found
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									Try adjusting your search or filter criteria
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.map((product) => {
							const price = parseFloat(product.price || "0");
							const isLowStock =
								product.status === "low_stock" ||
								product.stockQuantity <= 10;
							const isOutOfStock = product.status === "out_of_stock";

							return (
								<Card
									key={product.id}
									className="hover:shadow-lg transition-shadow"
								>
									<CardHeader>
										<div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
											<Package className="h-12 w-12 text-muted-foreground" />
										</div>
										<div className="flex items-start justify-between gap-2">
											<CardTitle className="text-lg line-clamp-2">
												{product.name}
											</CardTitle>
										</div>
										<CardDescription className="line-clamp-2">
											{product.description || "No description available"}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<span className="text-2xl font-bold">
													${price.toLocaleString(undefined, {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</span>
												<Badge variant="outline">{product.category}</Badge>
											</div>

											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												{isOutOfStock ? (
													<>
														<AlertTriangle className="h-4 w-4 text-destructive" />
														<span className="text-destructive">Out of Stock</span>
													</>
												) : isLowStock ? (
													<>
														<AlertTriangle className="h-4 w-4 text-yellow-600" />
														<span className="text-yellow-600">Low Stock</span>
													</>
												) : (
													<>
														<ShoppingCart className="h-4 w-4" />
														<span>In Stock ({product.stockQuantity})</span>
													</>
												)}
											</div>

											<Button
												className="w-full"
												variant={isOutOfStock ? "outline" : "default"}
												disabled={isOutOfStock}
											>
												{isOutOfStock ? "Unavailable" : "View Details"}
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-20">
				<Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
					<CardContent className="text-center py-16">
						<h2 className="text-3xl font-bold mb-4 text-primary-foreground">
							Can't Find What You're Looking For?
						</h2>
						<p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-primary-foreground">
							Contact our sales team for custom solutions and bulk pricing.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" variant="secondary" className="text-lg px-8">
								Contact Sales
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
							>
								Request Quote
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

