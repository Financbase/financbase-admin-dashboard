/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { guides, users } from '@/lib/db/schemas';
import { eq, and, or, like, desc, asc, sql, inArray } from 'drizzle-orm';

export interface GuideFilters {
	category?: string;
	type?: 'tutorial' | 'guide' | 'documentation';
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	featured?: boolean;
	search?: string;
	sort?: 'popular' | 'recent' | 'rating' | 'difficulty';
	limit?: number;
	offset?: number;
}

export interface Guide {
	id: number;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	description: string | null;
	category: string;
	type: 'tutorial' | 'guide' | 'documentation';
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	duration: string | null;
	estimatedReadTime: number | null;
	imageUrl: string | null;
	thumbnailUrl: string | null;
	videoUrl: string | null;
	authorId: string;
	author: {
		id: string;
		name: string | null;
		email: string | null;
	};
	status: 'draft' | 'published' | 'archived';
	featured: boolean;
	priority: number;
	sortOrder: number;
	tags: string[];
	keywords: string[];
	viewCount: number;
	rating: number;
	helpfulCount: number;
	notHelpfulCount: number;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export class GuidesService {
	/**
	 * Get published guides with filtering
	 */
	static async getGuides(filters: GuideFilters = {}): Promise<{ guides: Guide[]; total: number }> {
		try {
			const {
				category,
				type,
				difficulty,
				featured,
				search,
				sort = 'popular',
				limit = 20,
				offset = 0,
			} = filters;

			const conditions = [eq(guides.status, 'published')];

			if (category) {
				conditions.push(eq(guides.category, category));
			}

			if (type) {
				conditions.push(eq(guides.type, type));
			}

			if (difficulty) {
				conditions.push(eq(guides.difficulty, difficulty));
			}

			if (featured !== undefined) {
				conditions.push(eq(guides.featured, featured));
			}

			if (search) {
				const searchTerm = `%${search}%`;
				conditions.push(
					or(
						like(guides.title, searchTerm),
						like(guides.description, searchTerm),
						like(guides.excerpt, searchTerm),
						like(guides.content, searchTerm)
					)!
				);
			}

			// Get total count
			const totalResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(guides)
				.where(and(...conditions));

			const total = Number(totalResult[0]?.count || 0);

			// Determine sort order
			let orderBy;
			switch (sort) {
				case 'recent':
					orderBy = desc(guides.publishedAt);
					break;
				case 'rating':
					orderBy = desc(guides.rating);
					break;
				case 'difficulty':
					orderBy = asc(
						sql`CASE 
							WHEN ${guides.difficulty} = 'beginner' THEN 1
							WHEN ${guides.difficulty} = 'intermediate' THEN 2
							WHEN ${guides.difficulty} = 'advanced' THEN 3
							ELSE 4
						END`
					);
					break;
				case 'popular':
				default:
					orderBy = desc(guides.viewCount);
					break;
			}

			// Get guides with author information
			const guidesList = await db
				.select({
					id: guides.id,
					title: guides.title,
					slug: guides.slug,
					content: guides.content,
					excerpt: guides.excerpt,
					description: guides.description,
					category: guides.category,
					type: guides.type,
					difficulty: guides.difficulty,
					duration: guides.duration,
					estimatedReadTime: guides.estimatedReadTime,
					imageUrl: guides.imageUrl,
					thumbnailUrl: guides.thumbnailUrl,
					videoUrl: guides.videoUrl,
					authorId: guides.authorId,
					author: {
						id: users.id,
						name: sql<string | null>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Unknown Author')`,
						email: sql<string | null>`COALESCE(${users.email}, '')`,
					},
					status: guides.status,
					featured: guides.featured,
					priority: guides.priority,
					sortOrder: guides.sortOrder,
					tags: guides.tags,
					keywords: guides.keywords,
					viewCount: guides.viewCount,
					rating: guides.rating,
					helpfulCount: guides.helpfulCount,
					notHelpfulCount: guides.notHelpfulCount,
					publishedAt: guides.publishedAt,
					createdAt: guides.createdAt,
					updatedAt: guides.updatedAt,
				})
				.from(guides)
				.innerJoin(users, eq(guides.authorId, users.id))
				.where(and(...conditions))
				.orderBy(desc(guides.featured), desc(guides.priority), orderBy)
				.limit(limit)
				.offset(offset);

			return {
				guides: guidesList.map((guide) => ({
					...guide,
					tags: Array.isArray(guide.tags) ? guide.tags : [],
					keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
				})) as Guide[],
				total,
			};
		} catch (error) {
			console.error('Error getting guides:', error);
			throw new Error('Failed to get guides');
		}
	}

	/**
	 * Get single guide by ID
	 */
	static async getGuideById(id: number): Promise<Guide | null> {
		try {
			const result = await db
				.select({
					id: guides.id,
					title: guides.title,
					slug: guides.slug,
					content: guides.content,
					excerpt: guides.excerpt,
					description: guides.description,
					category: guides.category,
					type: guides.type,
					difficulty: guides.difficulty,
					duration: guides.duration,
					estimatedReadTime: guides.estimatedReadTime,
					imageUrl: guides.imageUrl,
					thumbnailUrl: guides.thumbnailUrl,
					videoUrl: guides.videoUrl,
					authorId: guides.authorId,
					author: {
						id: users.id,
						name: sql<string | null>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Unknown Author')`,
						email: sql<string | null>`COALESCE(${users.email}, '')`,
					},
					status: guides.status,
					featured: guides.featured,
					priority: guides.priority,
					sortOrder: guides.sortOrder,
					tags: guides.tags,
					keywords: guides.keywords,
					viewCount: guides.viewCount,
					rating: guides.rating,
					helpfulCount: guides.helpfulCount,
					notHelpfulCount: guides.notHelpfulCount,
					publishedAt: guides.publishedAt,
					createdAt: guides.createdAt,
					updatedAt: guides.updatedAt,
				})
				.from(guides)
				.innerJoin(users, eq(guides.authorId, users.id))
				.where(and(eq(guides.id, id), eq(guides.status, 'published')))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			const guide = result[0];
			return {
				...guide,
				tags: Array.isArray(guide.tags) ? guide.tags : [],
				keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
			} as Guide;
		} catch (error) {
			console.error('Error getting guide by ID:', error);
			throw new Error('Failed to get guide');
		}
	}

	/**
	 * Get guide by slug
	 */
	static async getGuideBySlug(slug: string): Promise<Guide | null> {
		try {
			const result = await db
				.select({
					id: guides.id,
					title: guides.title,
					slug: guides.slug,
					content: guides.content,
					excerpt: guides.excerpt,
					description: guides.description,
					category: guides.category,
					type: guides.type,
					difficulty: guides.difficulty,
					duration: guides.duration,
					estimatedReadTime: guides.estimatedReadTime,
					imageUrl: guides.imageUrl,
					thumbnailUrl: guides.thumbnailUrl,
					videoUrl: guides.videoUrl,
					authorId: guides.authorId,
					author: {
						id: users.id,
						name: sql<string | null>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Unknown Author')`,
						email: sql<string | null>`COALESCE(${users.email}, '')`,
					},
					status: guides.status,
					featured: guides.featured,
					priority: guides.priority,
					sortOrder: guides.sortOrder,
					tags: guides.tags,
					keywords: guides.keywords,
					viewCount: guides.viewCount,
					rating: guides.rating,
					helpfulCount: guides.helpfulCount,
					notHelpfulCount: guides.notHelpfulCount,
					publishedAt: guides.publishedAt,
					createdAt: guides.createdAt,
					updatedAt: guides.updatedAt,
				})
				.from(guides)
				.innerJoin(users, eq(guides.authorId, users.id))
				.where(and(eq(guides.slug, slug), eq(guides.status, 'published')))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			const guide = result[0];
			return {
				...guide,
				tags: Array.isArray(guide.tags) ? guide.tags : [],
				keywords: Array.isArray(guide.keywords) ? guide.keywords : [],
			} as Guide;
		} catch (error) {
			console.error('Error getting guide by slug:', error);
			throw new Error('Failed to get guide');
		}
	}

	/**
	 * Get featured guides
	 */
	static async getFeaturedGuides(limit: number = 6): Promise<Guide[]> {
		try {
			const result = await this.getGuides({
				featured: true,
				limit,
				sort: 'popular',
			});

			return result.guides;
		} catch (error) {
			console.error('Error getting featured guides:', error);
			throw new Error('Failed to get featured guides');
		}
	}

	/**
	 * Search guides
	 */
	static async searchGuides(query: string, filters: GuideFilters = {}): Promise<Guide[]> {
		try {
			const result = await this.getGuides({
				...filters,
				search: query,
				limit: filters.limit || 20,
			});

			return result.guides;
		} catch (error) {
			console.error('Error searching guides:', error);
			throw new Error('Failed to search guides');
		}
	}

	/**
	 * Increment view count
	 */
	static async incrementViewCount(id: number): Promise<void> {
		try {
			await db
				.update(guides)
				.set({
					viewCount: sql`${guides.viewCount} + 1`,
				})
				.where(eq(guides.id, id));
		} catch (error) {
			console.error('Error incrementing view count:', error);
			// Don't throw - view count is not critical
		}
	}

	/**
	 * Get guides by category
	 */
	static async getGuidesByCategory(category: string, limit: number = 10): Promise<Guide[]> {
		try {
			const result = await this.getGuides({
				category,
				limit,
				sort: 'popular',
			});

			return result.guides;
		} catch (error) {
			console.error('Error getting guides by category:', error);
			throw new Error('Failed to get guides by category');
		}
	}

	/**
	 * Get related guides
	 */
	static async getRelatedGuides(guideId: number, limit: number = 4): Promise<Guide[]> {
		try {
			// First get the current guide to find related ones
			const currentGuide = await this.getGuideById(guideId);
			if (!currentGuide) {
				return [];
			}

			// Get guides in the same category, excluding the current one
			const result = await db
				.select({
					id: guides.id,
					title: guides.title,
					slug: guides.slug,
					excerpt: guides.excerpt,
					description: guides.description,
					category: guides.category,
					type: guides.type,
					difficulty: guides.difficulty,
					duration: guides.duration,
					imageUrl: guides.imageUrl,
					thumbnailUrl: guides.thumbnailUrl,
					authorId: guides.authorId,
					author: {
						id: users.id,
						name: sql<string | null>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Unknown Author')`,
						email: sql<string | null>`COALESCE(${users.email}, '')`,
					},
					viewCount: guides.viewCount,
					rating: guides.rating,
					tags: guides.tags,
					publishedAt: guides.publishedAt,
				})
				.from(guides)
				.innerJoin(users, eq(guides.authorId, users.id))
				.where(
					and(
						eq(guides.status, 'published'),
						eq(guides.category, currentGuide.category),
						sql`${guides.id} != ${guideId}`
					)
				)
				.orderBy(desc(guides.featured), desc(guides.viewCount))
				.limit(limit);

			return result.map((guide) => ({
				...guide,
				content: '',
				estimatedReadTime: null,
				videoUrl: null,
				status: 'published' as const,
				featured: false,
				priority: 0,
				sortOrder: 0,
				keywords: [],
				helpfulCount: 0,
				notHelpfulCount: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				tags: Array.isArray(guide.tags) ? guide.tags : [],
			})) as Guide[];
		} catch (error) {
			console.error('Error getting related guides:', error);
			return [];
		}
	}
}

