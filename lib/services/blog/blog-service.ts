/**
 * Blog Service
 * Business logic for blog content management
 */

import { db } from '@/lib/db';
import { blogPosts, blogCategories, blogComments, type BlogPost, type NewBlogPost, type BlogCategory } from '@/lib/db/schemas/blog.schema';
import { eq, and, desc, like, or, count, sql, isNull, isNotNull } from 'drizzle-orm';
import type { CreateBlogPostInput, UpdateBlogPostInput, CreateBlogCategoryInput, UpdateBlogCategoryInput } from '@/lib/validation-schemas';
import { cache } from '@/lib/cache/redis-cache';

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug, appending a number if needed
 */
async function generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
	let slug = baseSlug;
	let counter = 1;

	// Check if slug already exists
	const conditions = [eq(blogPosts.slug, slug)];
	if (excludeId) {
		conditions.push(sql`${blogPosts.id} != ${excludeId}`);
	}

	let existingPost = await db
		.select()
		.from(blogPosts)
		.where(and(...conditions))
		.limit(1);

	// Make slug unique if needed
	while (existingPost.length > 0) {
		slug = `${baseSlug}-${counter}`;
		const checkConditions = [eq(blogPosts.slug, slug)];
		if (excludeId) {
			checkConditions.push(sql`${blogPosts.id} != ${excludeId}`);
		}
		existingPost = await db
			.select()
			.from(blogPosts)
			.where(and(...checkConditions))
			.limit(1);
		if (existingPost.length === 0) break;
		counter++;
	}

	return slug;
}

/**
 * Create a new blog post
 */
export async function createPost(input: CreateBlogPostInput): Promise<BlogPost> {
	// Generate slug if not provided
	let slug = input.slug;
	if (!slug) {
		const baseSlug = generateSlug(input.title);
		slug = await generateUniqueSlug(baseSlug);
	} else {
		// Ensure provided slug is unique
		slug = await generateUniqueSlug(slug);
	}

	// Set publishedAt if status is published and publishedAt is not provided
	const publishedAt = input.status === 'published' && !input.publishedAt
		? new Date()
		: input.publishedAt ? new Date(input.publishedAt) : null;

	const [newPost] = await db
		.insert(blogPosts)
		.values({
			userId: input.userId,
			title: input.title,
			slug,
			excerpt: input.excerpt || null,
			content: input.content,
			featuredImage: input.featuredImage || null,
			categoryId: input.categoryId || null,
			status: input.status || 'draft',
			isFeatured: input.isFeatured || false,
			publishedAt,
			scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
		})
		.returning();

	// Invalidate cache
	await cache.blog.set(`post:${newPost.id}`, newPost);
	await cache.blog.set(`post:slug:${slug}`, newPost);

	return newPost;
}

/**
 * Update a blog post
 */
export async function updatePost(id: number, input: UpdateBlogPostInput): Promise<BlogPost> {
	const updateData: Partial<NewBlogPost> = {};

	if (input.title !== undefined) {
		updateData.title = input.title;
		// If title changed and slug wasn't explicitly provided, regenerate slug
		if (input.slug === undefined) {
			const baseSlug = generateSlug(input.title);
			updateData.slug = await generateUniqueSlug(baseSlug, id);
		}
	}

	if (input.slug !== undefined) {
		updateData.slug = await generateUniqueSlug(input.slug, id);
	}

	if (input.excerpt !== undefined) updateData.excerpt = input.excerpt || null;
	if (input.content !== undefined) updateData.content = input.content;
	if (input.featuredImage !== undefined) updateData.featuredImage = input.featuredImage || null;
	if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
	if (input.status !== undefined) {
		updateData.status = input.status;
		// Auto-set publishedAt if status changed to published
		if (input.status === 'published' && !input.publishedAt) {
			updateData.publishedAt = new Date();
		}
	}
	if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
	if (input.publishedAt !== undefined) updateData.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
	if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

	updateData.updatedAt = new Date();

	const [updatedPost] = await db
		.update(blogPosts)
		.set(updateData)
		.where(eq(blogPosts.id, id))
		.returning();

	if (!updatedPost) {
		throw new Error(`Blog post with id ${id} not found`);
	}

	// Invalidate cache
	await cache.blog.set(`post:${id}`, updatedPost);
	await cache.blog.set(`post:slug:${updatedPost.slug}`, updatedPost);

	return updatedPost;
}

/**
 * Delete a blog post (soft delete by archiving)
 */
export async function deletePost(id: number, hardDelete: boolean = false): Promise<void> {
	if (hardDelete) {
		await db.delete(blogPosts).where(eq(blogPosts.id, id));
	} else {
		// Soft delete by archiving
		await db
			.update(blogPosts)
			.set({
				status: 'archived',
				updatedAt: new Date(),
			})
			.where(eq(blogPosts.id, id));
	}

	// Invalidate cache
	await cache.blog.set(`post:${id}`, null);
}

/**
 * Publish a blog post
 */
export async function publishPost(id: number): Promise<BlogPost> {
	const [updatedPost] = await db
		.update(blogPosts)
		.set({
			status: 'published',
			publishedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(blogPosts.id, id))
		.returning();

	if (!updatedPost) {
		throw new Error(`Blog post with id ${id} not found`);
	}

	// Invalidate cache
	await cache.blog.set(`post:${id}`, updatedPost);
	await cache.blog.set(`post:slug:${updatedPost.slug}`, updatedPost);

	return updatedPost;
}

/**
 * Get a blog post by ID
 */
export async function getPostById(id: number, includeArchived: boolean = false): Promise<BlogPost | null> {
	const conditions = [eq(blogPosts.id, id)];
	if (!includeArchived) {
		conditions.push(sql`${blogPosts.status} != 'archived'`);
	}

	const post = await db
		.select()
		.from(blogPosts)
		.where(and(...conditions))
		.limit(1);

	return post[0] || null;
}

/**
 * Get a blog post by slug
 */
export async function getPostBySlug(slug: string, includeArchived: boolean = false): Promise<BlogPost | null> {
	// Try cache first
	const cached = await cache.blog.get(`post:slug:${slug}`);
	if (cached) {
		if (!includeArchived && cached.status === 'archived') {
			return null;
		}
		return cached as BlogPost;
	}

	const conditions = [eq(blogPosts.slug, slug)];
	if (!includeArchived) {
		conditions.push(sql`${blogPosts.status} != 'archived'`);
	}

	const post = await db
		.select()
		.from(blogPosts)
		.where(and(...conditions))
		.limit(1);

	if (post[0]) {
		// Cache the result
		await cache.blog.set(`post:slug:${slug}`, post[0]);
	}

	return post[0] || null;
}

/**
 * List blog posts with filtering
 */
export async function getPosts(options: {
	userId?: string;
	status?: 'draft' | 'published' | 'scheduled' | 'archived';
	categoryId?: number;
	search?: string;
	isFeatured?: boolean;
	limit?: number;
	offset?: number;
	includeArchived?: boolean;
}): Promise<{ posts: BlogPost[]; total: number }> {
	const {
		userId,
		status,
		categoryId,
		search,
		isFeatured,
		limit = 10,
		offset = 0,
		includeArchived = false,
	} = options;

	const conditions: any[] = [];

	if (userId) {
		conditions.push(eq(blogPosts.userId, userId));
	}

	if (status) {
		conditions.push(eq(blogPosts.status, status));
	} else if (!includeArchived) {
		conditions.push(sql`${blogPosts.status} != 'archived'`);
	}

	if (categoryId) {
		conditions.push(eq(blogPosts.categoryId, categoryId));
	}

	if (search) {
		conditions.push(
			or(
				like(blogPosts.title, `%${search}%`),
				like(blogPosts.excerpt, `%${search}%`),
				like(blogPosts.content, `%${search}%`)
			)
		);
	}

	if (isFeatured !== undefined) {
		conditions.push(eq(blogPosts.isFeatured, isFeatured));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get posts
	const posts = await db
		.select()
		.from(blogPosts)
		.where(whereClause)
		.orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const totalResult = await db
		.select({ count: count() })
		.from(blogPosts)
		.where(whereClause);

	const total = totalResult[0]?.count || 0;

	return { posts, total };
}

/**
 * Increment view count for a blog post
 */
export async function incrementViewCount(id: number): Promise<void> {
	// Get post first to get slug for cache invalidation
	const post = await getPostById(id, true);
	if (!post) return;

	await db
		.update(blogPosts)
		.set({
			viewCount: sql`${blogPosts.viewCount} + 1`,
		})
		.where(eq(blogPosts.id, id));

	// Invalidate cache for this post
	await cache.blog.set(`post:${id}`, null);
	if (post.slug) {
		await cache.blog.set(`post:slug:${post.slug}`, null);
	}
}

/**
 * Get all blog categories
 */
export async function getCategories(): Promise<BlogCategory[]> {
	const categories = await db
		.select()
		.from(blogCategories)
		.orderBy(blogCategories.name);

	return categories;
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: number): Promise<BlogCategory | null> {
	const category = await db
		.select()
		.from(blogCategories)
		.where(eq(blogCategories.id, id))
		.limit(1);

	return category[0] || null;
}

/**
 * Create a blog category
 */
export async function createCategory(input: CreateBlogCategoryInput): Promise<BlogCategory> {
	// Generate slug if not provided
	let slug = input.slug || generateSlug(input.name);
	
	// Ensure slug is unique
	let uniqueSlug = slug;
	let counter = 1;
	let existingCategory = await db
		.select()
		.from(blogCategories)
		.where(eq(blogCategories.slug, uniqueSlug))
		.limit(1);

	while (existingCategory.length > 0) {
		uniqueSlug = `${slug}-${counter}`;
		existingCategory = await db
			.select()
			.from(blogCategories)
			.where(eq(blogCategories.slug, uniqueSlug))
			.limit(1);
		if (existingCategory.length === 0) break;
		counter++;
	}

	const [newCategory] = await db
		.insert(blogCategories)
		.values({
			name: input.name,
			slug: uniqueSlug,
			description: input.description || null,
			color: input.color || null,
		})
		.returning();

	return newCategory;
}

/**
 * Update a blog category
 */
export async function updateCategory(id: number, input: UpdateBlogCategoryInput): Promise<BlogCategory> {
	const updateData: Partial<BlogCategory> = {};

	if (input.name !== undefined) updateData.name = input.name;
	if (input.slug !== undefined) updateData.slug = input.slug;
	if (input.description !== undefined) updateData.description = input.description || null;
	if (input.color !== undefined) updateData.color = input.color || null;
	updateData.updatedAt = new Date();

	const [updatedCategory] = await db
		.update(blogCategories)
		.set(updateData)
		.where(eq(blogCategories.id, id))
		.returning();

	if (!updatedCategory) {
		throw new Error(`Category with id ${id} not found`);
	}

	return updatedCategory;
}

/**
 * Delete a blog category
 */
export async function deleteCategory(id: number): Promise<void> {
	// Check if category has posts
	const postsWithCategory = await db
		.select()
		.from(blogPosts)
		.where(eq(blogPosts.categoryId, id))
		.limit(1);

	if (postsWithCategory.length > 0) {
		throw new Error('Cannot delete category that has posts assigned to it');
	}

	await db.delete(blogCategories).where(eq(blogCategories.id, id));
}

/**
 * Get blog statistics
 */
export async function getBlogStats(userId?: string): Promise<{
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
	totalViews: number;
	totalLikes: number;
	totalComments: number;
	averageViews: number;
}> {
	const conditions: any[] = [];
	if (userId) {
		conditions.push(eq(blogPosts.userId, userId));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get all posts for stats
	const allPosts = await db
		.select()
		.from(blogPosts)
		.where(whereClause);

	const totalPosts = allPosts.length;
	const publishedPosts = allPosts.filter(p => p.status === 'published').length;
	const draftPosts = allPosts.filter(p => p.status === 'draft').length;
	const totalViews = allPosts.reduce((sum, p) => sum + p.viewCount, 0);
	const totalLikes = allPosts.reduce((sum, p) => sum + p.likeCount, 0);
	const totalComments = allPosts.reduce((sum, p) => sum + p.commentCount, 0);
	const averageViews = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;

	return {
		totalPosts,
		publishedPosts,
		draftPosts,
		totalViews,
		totalLikes,
		totalComments,
		averageViews,
	};
}

