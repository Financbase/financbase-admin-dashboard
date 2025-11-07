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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Search,
	User,
	Eye,
	Heart,
	Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BlogPost {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	featuredImage: string | null;
	status: string;
	viewCount: number;
	likeCount: number;
	publishedAt: string | null;
	createdAt: string;
	categoryId: number | null;
}

interface BlogCategory {
	id: number;
	name: string;
	slug: string;
	color: string | null;
}

interface BlogListingClientProps {
	initialPosts: BlogPost[];
	initialCategories: BlogCategory[];
}

function formatDate(dateString: string | null): string {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

function formatViews(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}k`;
	}
	return count.toString();
}

export function BlogListingClient({ initialPosts, initialCategories }: BlogListingClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Sync with hero search input
	useEffect(() => {
		// Wait for hydration
		const heroSearchInput = document.getElementById("blog-search") as HTMLInputElement;
		if (heroSearchInput) {
			const handleInput = (e: Event) => {
				const target = e.target as HTMLInputElement;
				setSearchQuery(target.value);
			};
			heroSearchInput.addEventListener("input", handleInput);
			// Sync initial value if any
			if (heroSearchInput.value) {
				setSearchQuery(heroSearchInput.value);
			}
			return () => heroSearchInput.removeEventListener("input", handleInput);
		}
	}, []);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch blog posts with filters
	const { data: postsData, isLoading } = useQuery({
		queryKey: ["blog-posts", selectedCategory, debouncedSearch],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.append("status", "published");
			params.append("limit", "50");
			if (selectedCategory) {
				params.append("categoryId", selectedCategory.toString());
			}
			if (debouncedSearch.trim()) {
				params.append("search", debouncedSearch.trim());
			}

			const response = await fetch(`/api/blog?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch blog posts");
			const result = await response.json();
			return result.data || [];
		},
		initialData: initialPosts,
		enabled: selectedCategory !== null || debouncedSearch.trim().length > 0,
	});

	const blogPosts = postsData || initialPosts;
	const categories = initialCategories;

	return (
		<>
			{/* Categories Filter */}
			{categories.length > 0 && (
				<section className="py-8 bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
					<div className="max-w-6xl mx-auto px-6">
						<div className="flex flex-wrap gap-2 justify-center">
							<Badge
								variant={selectedCategory === null ? "default" : "outline"}
								className="cursor-pointer hover:bg-primary/10 transition-colors px-4 py-2"
								onClick={() => {
									setSelectedCategory(null);
									setSearchQuery("");
									const heroSearchInput = document.getElementById("blog-search") as HTMLInputElement;
									if (heroSearchInput) heroSearchInput.value = "";
								}}
							>
								All Posts
							</Badge>
							{categories.map((category) => (
								<Badge
									key={category.id}
									variant={selectedCategory === category.id ? "default" : "outline"}
									className="cursor-pointer hover:bg-primary/10 transition-colors px-4 py-2"
									onClick={() => setSelectedCategory(category.id)}
								>
									{category.name}
								</Badge>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Blog Posts */}
			<section className="py-12">
				<div className="max-w-6xl mx-auto px-6">
					{isLoading && blogPosts.length === 0 ? (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : blogPosts.length === 0 ? (
						<div className="text-center py-20">
							<div className="max-w-md mx-auto">
								<Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
								<h3 className="text-2xl font-semibold mb-2">No posts found</h3>
								<p className="text-muted-foreground mb-6">
									{debouncedSearch || selectedCategory
										? "Try adjusting your search or filter criteria"
										: "No blog posts available yet. Check back soon!"}
								</p>
								{(debouncedSearch || selectedCategory) && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory(null);
											const heroSearchInput = document.getElementById("blog-search") as HTMLInputElement;
											if (heroSearchInput) heroSearchInput.value = "";
										}}
									>
										Clear Filters
									</Button>
								)}
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{blogPosts.map((post) => {
								const category = categories.find((c) => c.id === post.categoryId);
								const imageUrl = post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop";
								
								return (
									<Link key={post.id} href={`/blog/${post.slug}`}>
										<Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col border-2 hover:border-primary/20">
											<CardHeader className="p-0">
												<div className="relative overflow-hidden rounded-t-lg">
													<Image
														src={imageUrl}
														alt={post.title}
														width={400}
														height={192}
														className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
													/>
													{category && (
														<div className="absolute top-4 left-4">
															<Badge 
																variant="secondary" 
																className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 shadow-md"
															>
																{category.name}
															</Badge>
														</div>
													)}
													<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
												</div>
											</CardHeader>
											
											<CardContent className="p-6 flex flex-col flex-1">
												<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
													<User className="h-4 w-4" />
													<span>{formatDate(post.publishedAt)}</span>
												</div>

												<h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
													{post.title}
												</h3>
												
												{post.excerpt && (
													<p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
														{post.excerpt}
													</p>
												)}
												
												<div className="flex items-center justify-between mt-auto pt-4 border-t">
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1.5">
															<Eye className="h-4 w-4" />
															<span>{formatViews(post.viewCount)}</span>
														</div>
														<div className="flex items-center gap-1.5">
															<Heart className="h-4 w-4" />
															<span>{post.likeCount}</span>
														</div>
													</div>
													
													<Button 
														variant="ghost" 
														size="sm" 
														className="group/btn"
													>
														Read More
														<ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
													</Button>
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</section>
		</>
	);
}

