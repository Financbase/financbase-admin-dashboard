/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { helpArticles, helpCategories, helpArticleFeedback, helpSearchAnalytics } from '@/lib/db/schemas';
import { eq, and, desc, or, ilike, sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type HelpArticle = InferSelectModel<typeof helpArticles>;
export type HelpCategory = InferSelectModel<typeof helpCategories>;
export type HelpArticleFeedback = InferSelectModel<typeof helpArticleFeedback>;

export type NewHelpArticle = InferInsertModel<typeof helpArticles>;
export type NewHelpCategory = InferInsertModel<typeof helpCategories>;

export class HelpService {
	/**
	 * Search help articles
	 */
	static async searchArticles(
		query: string,
		options?: {
			categoryId?: number;
			limit?: number;
			offset?: number;
		}
	): Promise<HelpArticle[]> {
		const conditions = [
			eq(helpArticles.status, 'published'),
			or(
				ilike(helpArticles.title, `%${query}%`),
				ilike(helpArticles.content, `%${query}%`),
				ilike(helpArticles.excerpt, `%${query}%`)
			)!,
		];

		if (options?.categoryId) {
			conditions.push(eq(helpArticles.categoryId, options.categoryId));
		}

		let dbQuery = db
			.select()
			.from(helpArticles)
			.where(and(...conditions))
			.orderBy(desc(helpArticles.priority), desc(helpArticles.viewCount));

		if (options?.limit) {
			dbQuery = dbQuery.limit(options.limit) as any;
		}

		if (options?.offset) {
			dbQuery = dbQuery.offset(options.offset) as any;
		}

		return await dbQuery;
	}

	/**
	 * Get help articles
	 */
	static async getArticles(options?: {
		categoryId?: number;
		status?: 'draft' | 'published' | 'archived';
		featured?: boolean;
		limit?: number;
		offset?: number;
	}): Promise<HelpArticle[]> {
		const conditions = [];

		if (options?.categoryId) {
			conditions.push(eq(helpArticles.categoryId, options.categoryId));
		}

		if (options?.status) {
			conditions.push(eq(helpArticles.status, options.status));
		} else {
			conditions.push(eq(helpArticles.status, 'published'));
		}

		if (options?.featured !== undefined) {
			conditions.push(eq(helpArticles.featured, options.featured));
		}

		let dbQuery = db
			.select()
			.from(helpArticles)
			.where(and(...conditions))
			.orderBy(desc(helpArticles.priority), desc(helpArticles.createdAt));

		if (options?.limit) {
			dbQuery = dbQuery.limit(options.limit) as any;
		}

		if (options?.offset) {
			dbQuery = dbQuery.offset(options.offset) as any;
		}

		return await dbQuery;
	}

	/**
	 * Get a single article by ID or slug
	 */
	static async getArticle(identifier: number | string): Promise<HelpArticle | null> {
		if (typeof identifier === 'number') {
			const result = await db
				.select()
				.from(helpArticles)
				.where(eq(helpArticles.id, identifier))
				.limit(1);
			return result[0] || null;
		} else {
			const result = await db
				.select()
				.from(helpArticles)
				.where(eq(helpArticles.slug, identifier))
				.limit(1);
			return result[0] || null;
		}
	}

	/**
	 * Get help categories
	 */
	static async getCategories(options?: {
		parentId?: number | null;
		isActive?: boolean;
		isPublic?: boolean;
	}): Promise<HelpCategory[]> {
		const conditions = [];

		if (options?.parentId !== undefined) {
			if (options.parentId === null) {
				conditions.push(sql`${helpCategories.parentId} IS NULL`);
			} else {
				conditions.push(eq(helpCategories.parentId, options.parentId));
			}
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(helpCategories.isActive, options.isActive));
		}

		if (options?.isPublic !== undefined) {
			conditions.push(eq(helpCategories.isPublic, options.isPublic));
		}

		return await db
			.select()
			.from(helpCategories)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(helpCategories.sortOrder);
	}

	/**
	 * Record article view
	 */
	static async recordArticleView(articleId: number): Promise<void> {
		await db
			.update(helpArticles)
			.set({
				viewCount: sql`${helpArticles.viewCount} + 1`,
				lastViewedAt: new Date(),
			})
			.where(eq(helpArticles.id, articleId));
	}

	/**
	 * Submit article feedback
	 */
	static async submitFeedback(
		articleId: number,
		userId: string,
		data: {
			helpful: boolean;
			comment?: string;
		}
	): Promise<HelpArticleFeedback> {
		const [feedback] = await db
			.insert(helpArticleFeedback)
			.values({
				articleId,
				userId,
				helpful: data.helpful,
				comment: data.comment || null,
			})
			.returning();

		// Update article helpful counts
		if (data.helpful) {
			await db
				.update(helpArticles)
				.set({
					helpfulCount: sql`${helpArticles.helpfulCount} + 1`,
				})
				.where(eq(helpArticles.id, articleId));
		} else {
			await db
				.update(helpArticles)
				.set({
					notHelpfulCount: sql`${helpArticles.notHelpfulCount} + 1`,
				})
				.where(eq(helpArticles.id, articleId));
		}

		return feedback;
	}

	/**
	 * Record search analytics
	 */
	static async recordSearch(
		userId: string,
		query: string,
		resultsCount: number,
		clickedArticleId?: number
	): Promise<void> {
		await db.insert(helpSearchAnalytics).values({
			userId,
			query,
			resultsCount,
			clickedArticleId: clickedArticleId || null,
		});
	}
}

