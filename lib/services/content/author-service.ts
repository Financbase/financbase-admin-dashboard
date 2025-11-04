/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	authorAnalytics,
	authorCategories,
	authorCategoryRelations,
	authors,
} from "@/drizzle/schema/authors";
import { db } from "@/lib/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
	BarChart3,
	CheckCircle,
	MessageCircle,
	Search,
	Trash2,
	XCircle,
} from "lucide-react";

// Types for API responses
export interface Author {
	id: string;
	userId?: string;
	name: string;
	title?: string;
	email?: string;
	bio?: string;
	avatar?: string;
	socialLinks?: string;
	website?: string;
	status: string;
	isFeatured: boolean;
	articleCount: string;
	lastPublishedAt?: string;
	metadata?: string;
	ipAddress?: string;
	userAgent?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthorCategory {
	id: string;
	name: string;
	slug: string;
	description?: string;
	color: string;
	sortOrder: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAuthorData {
	name: string;
	title?: string;
	email?: string;
	bio?: string;
	avatar?: string;
	socialLinks?: string;
	website?: string;
	status?: string;
	isFeatured?: boolean;
	metadata?: string;
	userId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export interface UpdateAuthorData {
	name?: string;
	title?: string;
	email?: string;
	bio?: string;
	avatar?: string;
	socialLinks?: string;
	website?: string;
	status?: string;
	isFeatured?: boolean;
	articleCount?: string;
	lastPublishedAt?: string;
	metadata?: string;
}

export interface AuthorFilters {
	status?: string;
	isFeatured?: boolean;
	categoryId?: string;
	search?: string;
	page?: number;
	limit?: number;
}

// Author Service Class
export class AuthorService {
	/**
	 * Get all authors with optional filters and pagination
	 */
	static async getAuthors(filters: AuthorFilters = {}) {
		try {
			const {
				status,
				isFeatured,
				categoryId,
				search,
				page = 1,
				limit = 10,
			} = filters;

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (status) {
				whereConditions.push(eq(authors.status, status));
			}

			if (isFeatured !== undefined) {
				whereConditions.push(eq(authors.isFeatured, isFeatured));
			}

			if (search) {
				whereConditions.push(
					sql`LOWER(${authors.name}) LIKE LOWER(${`%${search}%`})`,
				);
			}

			// Get total count
			const [{ count }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(authors)
				.where(
					whereConditions.length > 0 ? and(...whereConditions) : undefined,
				);

			// Get authors with optional category join
			const query = db
				.select({
					id: authors.id,
					userId: authors.userId,
					name: authors.name,
					title: authors.title,
					email: authors.email,
					bio: authors.bio,
					avatar: authors.avatar,
					socialLinks: authors.socialLinks,
					website: authors.website,
					status: authors.status,
					isFeatured: authors.isFeatured,
					articleCount: authors.articleCount,
					lastPublishedAt: authors.lastPublishedAt,
					metadata: authors.metadata,
					ipAddress: authors.ipAddress,
					userAgent: authors.userAgent,
					createdAt: authors.createdAt,
					updatedAt: authors.updatedAt,
				})
				.from(authors)
				.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
				.orderBy(desc(authors.createdAt))
				.limit(limit)
				.offset(offset);

			const authorList = await query;

			return {
				success: true,
				data: {
					authors: authorList,
					pagination: {
						page,
						limit,
						total: count,
						pages: Math.ceil(count / limit),
					},
				},
			};
		} catch (error) {
			console.error("Error getting authors:", error);
			return {
				success: false,
				error: "Failed to get authors",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get a single author by ID
	 */
	static async getAuthorById(id: string) {
		try {
			const [author] = await db
				.select()
				.from(authors)
				.where(eq(authors.id, id))
				.limit(1);

			if (!author) {
				return {
					success: false,
					error: "Author not found",
				};
			}

			// Get author categories
			const categories = await db
				.select({
					id: authorCategories.id,
					name: authorCategories.name,
					slug: authorCategories.slug,
					description: authorCategories.description,
					color: authorCategories.color,
				})
				.from(authorCategoryRelations)
				.innerJoin(
					authorCategories,
					eq(authorCategoryRelations.categoryId, authorCategories.id),
				)
				.where(eq(authorCategoryRelations.authorId, id));

			// Get recent analytics (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const analytics = await db
				.select({
					eventType: authorAnalytics.eventType,
					count: sql<number>`COUNT(*)`,
					lastOccurred: sql<string>`MAX(${authorAnalytics.createdAt})`,
				})
				.from(authorAnalytics)
				.where(
					and(
						eq(authorAnalytics.authorId, id),
						sql`${authorAnalytics.createdAt} >= ${thirtyDaysAgo.toISOString()}`,
					),
				)
				.groupBy(authorAnalytics.eventType);

			return {
				success: true,
				data: {
					...author,
					categories,
					analytics,
				},
			};
		} catch (error) {
			console.error("Error getting author:", error);
			return {
				success: false,
				error: "Failed to get author",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Create a new author
	 */
	static async createAuthor(data: CreateAuthorData) {
		try {
			const [newAuthor] = await db
				.insert(authors)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Track creation analytics
			await db.insert(authorAnalytics).values({
				authorId: newAuthor.id,
				eventType: "profile_created",
				source: "admin",
				metadata: JSON.stringify({ createdBy: "system" }),
				createdAt: new Date(),
			});

			return {
				success: true,
				data: newAuthor,
				message: "Author created successfully",
			};
		} catch (error) {
			console.error("Error creating author:", error);
			return {
				success: false,
				error: "Failed to create author",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Update an author
	 */
	static async updateAuthor(id: string, data: UpdateAuthorData) {
		try {
			const [updatedAuthor] = await db
				.update(authors)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(authors.id, id))
				.returning();

			if (!updatedAuthor) {
				return {
					success: false,
					error: "Author not found",
				};
			}

			// Track update analytics
			await db.insert(authorAnalytics).values({
				authorId: id,
				eventType: "profile_updated",
				source: "admin",
				metadata: JSON.stringify({ updatedFields: Object.keys(data) }),
				createdAt: new Date(),
			});

			return {
				success: true,
				data: updatedAuthor,
				message: "Author updated successfully",
			};
		} catch (error) {
			console.error("Error updating author:", error);
			return {
				success: false,
				error: "Failed to update author",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Delete an author
	 */
	static async deleteAuthor(id: string) {
		try {
			const [deletedAuthor] = await db
				.delete(authors)
				.where(eq(authors.id, id))
				.returning();

			if (!deletedAuthor) {
				return {
					success: false,
					error: "Author not found",
				};
			}

			// Track deletion analytics
			await db.insert(authorAnalytics).values({
				authorId: id,
				eventType: "profile_deleted",
				source: "admin",
				metadata: JSON.stringify({ deletedBy: "system" }),
				createdAt: new Date(),
			});

			return {
				success: true,
				message: "Author deleted successfully",
			};
		} catch (error) {
			console.error("Error deleting author:", error);
			return {
				success: false,
				error: "Failed to delete author",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get author categories
	 */
	static async getAuthorCategories() {
		try {
			const categories = await db
				.select()
				.from(authorCategories)
				.where(eq(authorCategories.active, true))
				.orderBy(asc(authorCategories.sortOrder));

			return {
				success: true,
				data: categories,
			};
		} catch (error) {
			console.error("Error getting author categories:", error);
			return {
				success: false,
				error: "Failed to get author categories",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Track author analytics
	 */
	static async trackAuthorEvent(
		authorId: string,
		eventType: string,
		source = "website",
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
	) {
		try {
			await db.insert(authorAnalytics).values({
				authorId,
				eventType,
				source,
				ipAddress,
				userAgent,
				metadata: metadata ? JSON.stringify(metadata) : null,
				createdAt: new Date(),
			});

			return { success: true };
		} catch (error) {
			console.error("Error tracking author analytics:", error);
			return {
				success: false,
				error: "Failed to track analytics",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get author analytics summary
	 */
	static async getAuthorAnalytics(authorId: string, days = 30) {
		try {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const analytics = await db
				.select({
					eventType: authorAnalytics.eventType,
					count: sql<number>`COUNT(*)`,
					lastOccurred: sql<string>`MAX(${authorAnalytics.createdAt})`,
				})
				.from(authorAnalytics)
				.where(
					and(
						eq(authorAnalytics.authorId, authorId),
						sql`${authorAnalytics.createdAt} >= ${startDate.toISOString()}`,
					),
				)
				.groupBy(authorAnalytics.eventType)
				.orderBy(desc(sql`COUNT(*)`));

			return {
				success: true,
				data: analytics,
			};
		} catch (error) {
			console.error("Error getting author analytics:", error);
			return {
				success: false,
				error: "Failed to get analytics",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
