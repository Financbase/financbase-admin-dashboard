/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { PublicHero } from "@/components/layout/public-hero";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import * as blogService from "@/lib/services/blog/blog-service";
import { BlogListingClient } from "./blog-listing-client";
import { NewsletterSignup } from "./newsletter-signup";

export const metadata: Metadata = {
	title: "Blog | Financbase",
	description: "Insights, tutorials, and best practices for modern financial management. Stay updated with the latest trends in finance, accounting, and business strategy.",
	openGraph: {
		title: "Financbase Blog",
		description: "Insights, tutorials, and best practices for modern financial management",
		type: "website",
	},
};

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
		// Convert Date fields to strings for the interface
		return result.posts.map((post) => ({
			...post,
			publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
			createdAt: new Date(post.createdAt).toISOString(),
		})) as BlogPost[];
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

export default async function BlogPage() {
	const blogPosts = await getBlogPosts();
	const categories = await getCategories();

	return (
		<div className="min-h-screen bg-background">
			<PublicHero
				title="Financbase Blog"
				description="Insights, tutorials, and best practices for modern financial management"
				size="md"
			>
				{/* Search Bar */}
				<div className="max-w-md mx-auto mt-8">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5 z-10" />
						<Input
							placeholder="Search articles..."
							className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 backdrop-blur-sm"
							id="blog-search"
						/>
					</div>
				</div>
			</PublicHero>

			<BlogListingClient 
				initialPosts={blogPosts}
				initialCategories={categories}
			/>

			<NewsletterSignup />
		</div>
	);
}
