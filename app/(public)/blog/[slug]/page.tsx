/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Calendar,
	Eye,
	Heart,
	Share2,
	User,
} from "lucide-react";
import * as blogService from "@/lib/services/blog/blog-service";

interface BlogPost {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	featuredImage: string | null;
	status: string;
	viewCount: number;
	likeCount: number;
	commentCount: number;
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

async function getBlogPost(slug: string): Promise<BlogPost | null> {
	try {
		return await blogService.getPostBySlug(slug, false);
	} catch (error) {
		console.error('Error fetching blog post:', error);
		return null;
	}
}

async function getCategory(id: number): Promise<BlogCategory | null> {
	try {
		return await blogService.getCategoryById(id);
	} catch (error) {
		console.error('Error fetching category:', error);
		return null;
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

interface BlogPostPageProps {
	params: {
		slug: string;
	};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const post = await getBlogPost(params.slug);
	
	if (!post || post.status !== 'published') {
		notFound();
	}

	// Increment view count asynchronously (fire and forget)
	blogService.incrementViewCount(post.id).catch((err) => {
		console.error('Error incrementing view count:', err);
	});

	const category = post.categoryId ? await getCategory(post.categoryId) : null;
	const imageUrl = post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop";

	return (
		<div className="min-h-screen bg-background">
			{/* Header Navigation */}
			<div className="border-b bg-card">
				<div className="max-w-4xl mx-auto px-6 py-4">
					<Link href="/blog">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Blog
						</Button>
					</Link>
				</div>
			</div>

			<article className="max-w-4xl mx-auto px-6 py-12">
				{/* Post Header */}
				<header className="mb-8">
					{category && (
						<Badge variant="secondary" className="mb-4">
							{category.name}
						</Badge>
					)}
					
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
						{post.title}
					</h1>
					
					{post.excerpt && (
						<p className="text-xl text-muted-foreground mb-6">
							{post.excerpt}
						</p>
					)}

					<div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span>{formatDate(post.publishedAt)}</span>
						</div>
						<div className="flex items-center gap-2">
							<Eye className="h-4 w-4" />
							<span>{formatViews(post.viewCount)} views</span>
						</div>
						<div className="flex items-center gap-2">
							<Heart className="h-4 w-4" />
							<span>{post.likeCount} likes</span>
						</div>
					</div>

					{/* Featured Image */}
					<div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
						<Image
							src={imageUrl}
							alt={post.title}
							fill
							className="object-cover"
							priority
						/>
					</div>
				</header>

				{/* Post Content */}
				<div 
					className="prose prose-lg dark:prose-invert max-w-none mb-12"
					dangerouslySetInnerHTML={{ __html: post.content }}
				/>

				{/* Post Footer */}
				<footer className="border-t pt-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button variant="outline" size="sm">
								<Heart className="h-4 w-4 mr-2" />
								Like ({post.likeCount})
							</Button>
							<Button variant="outline" size="sm">
								<Share2 className="h-4 w-4 mr-2" />
								Share
							</Button>
						</div>
					</div>
				</footer>
			</article>

			{/* Related Posts Section (placeholder for future implementation) */}
			<section className="max-w-6xl mx-auto px-6 py-12 border-t">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">More Articles</h2>
					<Link href="/blog">
						<Button variant="outline">View All Posts</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

