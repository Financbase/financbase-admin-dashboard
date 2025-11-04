/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
} from "lucide-react";
import * as blogService from "@/lib/services/blog/blog-service";

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

async function getBlogPosts(): Promise<BlogPost[]> {
	try {
		const result = await blogService.getPosts({
			status: 'published',
			limit: 20,
			offset: 0,
		});
		return result.posts;
	} catch (error) {
		console.error('Error fetching blog posts:', error);
		return [];
	}
}

async function getCategories(): Promise<BlogCategory[]> {
	try {
		return await blogService.getCategories();
	} catch (error) {
		console.error('Error fetching categories:', error);
		return [];
	}
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

export default async function BlogPage() {
	const blogPosts = await getBlogPosts();
	const categories = await getCategories();

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
				<div className="max-w-6xl mx-auto px-6">
					<div className="text-center text-white">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Financbase Blog
						</h1>
						<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
							Insights, tutorials, and best practices for modern financial management
						</p>
						
						{/* Search Bar */}
						<div className="max-w-md mx-auto">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
								<Input
									placeholder="Search articles..."
									className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Categories */}
			{categories.length > 0 && (
				<section className="py-8 bg-card border-b">
					<div className="max-w-6xl mx-auto px-6">
						<div className="flex flex-wrap gap-2">
							<Badge
								variant="default"
								className="cursor-pointer hover:bg-primary/10"
							>
								All
							</Badge>
							{categories.map((category) => (
								<Badge
									key={category.id}
									variant="outline"
									className="cursor-pointer hover:bg-primary/10"
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
					{blogPosts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground text-lg">
								No blog posts available yet. Check back soon!
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{blogPosts.map((post) => {
								const category = categories.find((c) => c.id === post.categoryId);
								const imageUrl = post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop";
								
								return (
									<Link key={post.id} href={`/blog/${post.slug}`}>
										<Card className="group hover:shadow-lg transition-all duration-300 h-full">
											<CardHeader className="p-0">
												<div className="relative overflow-hidden rounded-t-lg">
													<Image
														src={imageUrl}
														alt={post.title}
														width={400}
														height={192}
														className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
													/>
													{category && (
														<div className="absolute top-4 left-4">
															<Badge variant="secondary" className="bg-white/90 text-gray-800">
																{category.name}
															</Badge>
														</div>
													)}
												</div>
											</CardHeader>
											
											<CardContent className="p-6">
												<div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
													<User className="h-4 w-4" />
													<span>{formatDate(post.publishedAt)}</span>
												</div>

												<h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
													{post.title}
												</h3>
												
												{post.excerpt && (
													<p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
														{post.excerpt}
													</p>
												)}
												
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4 text-sm text-gray-500">
														<div className="flex items-center gap-1">
															<Eye className="h-4 w-4" />
															<span>{formatViews(post.viewCount)}</span>
														</div>
														<div className="flex items-center gap-1">
															<Heart className="h-4 w-4" />
															<span>{post.likeCount}</span>
														</div>
													</div>
													
													<Button variant="ghost" size="sm" className="group">
														Read More
														<ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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

			{/* Newsletter Signup */}
			<section className="py-16 bg-primary/5">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						Stay Updated
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
						Get the latest insights and updates delivered to your inbox
					</p>
					
					<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
						<Input
							placeholder="Enter your email"
							className="flex-1"
						/>
						<Button className="whitespace-nowrap">
							Subscribe
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
