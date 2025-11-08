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
} from "lucide-react";
import * as blogService from "@/lib/services/blog/blog-service";
import { BlogPostActions } from "./blog-post-actions";

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
		const post = await blogService.getPostBySlug(slug, false);
		if (!post) return null;
		// Convert Date fields to strings for the interface
		return {
			...post,
			publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
			createdAt: new Date(post.createdAt).toISOString(),
		} as BlogPost;
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

			<article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Post Header */}
				<header className="mb-10 sm:mb-12">
					{category && (
						<Badge variant="secondary" className="mb-4">
							{category.name}
						</Badge>
					)}
					
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
						{post.title}
					</h1>
					
					{post.excerpt && (
						<p className="text-lg sm:text-xl text-muted-foreground mb-6 leading-relaxed">
							{post.excerpt}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b">
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
					{post.featuredImage && (
						<div className="relative w-full aspect-video mb-10 rounded-lg overflow-hidden bg-muted">
							<Image
								src={imageUrl}
								alt={post.title}
								fill
								className="object-cover"
								priority
							/>
						</div>
					)}
				</header>

				{/* Post Content */}
				<div 
					className="blog-content prose prose-lg prose-slate dark:prose-invert max-w-none"
					dangerouslySetInnerHTML={{ __html: post.content }}
				/>

				{/* Post Footer */}
				<footer className="border-t pt-8">
					<BlogPostActions postId={post.id} initialLikeCount={post.likeCount} slug={post.slug} title={post.title} />
				</footer>
			</article>

			{/* Related Posts Section */}
			<section className="max-w-6xl mx-auto px-6 py-12 border-t">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">More Articles</h2>
					<p className="text-muted-foreground mb-6">
						Explore more content from our blog
					</p>
					<Link href="/blog">
						<Button variant="outline">View All Posts</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

