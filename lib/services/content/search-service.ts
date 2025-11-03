import 'server-only';

import { sql } from "@/lib/neon";
import { BarChart3, MessageCircle, XCircle } from "lucide-react";

export interface SearchIndexItem {
	id: number;
	entityType: string;
	entityId: string;
	title: string;
	content?: string;
	excerpt?: string;
	category?: string;
	tags?: string[];
	metadata?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

export interface SearchResult {
	entityType: string;
	entityId: string;
	title: string;
	excerpt?: string;
	category?: string;
	tags?: string[];
	metadata?: Record<string, unknown>;
	relevanceScore: number;
	createdAt: Date;
}

export interface SearchQuery {
	id: number;
	query: string;
	userId?: string;
	entityTypes?: string[];
	resultsCount?: number;
	createdAt: Date;
}

export interface SearchFilters {
	entityTypes?: string[] | undefined;
	categories?: string[] | undefined;
	tags?: string[] | undefined;
	dateFrom?: Date | undefined;
	dateTo?: Date | undefined;
	limit?: number;
	offset?: number;
}

/**
 * Search Service
 * Provides full-text search capabilities across all entities
 */
export class SearchService {
	/**
	 * Search across all indexed entities
	 */
	async search(
		query: string,
		filters: SearchFilters = {},
	): Promise<{
		results: SearchResult[];
		total: number;
		query: string;
		filters: SearchFilters;
	}> {
		const {
			entityTypes,
			categories,
			tags,
			dateFrom,
			dateTo,
			limit = 50,
			offset = 0,
		} = filters;

		// Build search query
		let searchQuery = `
			SELECT si.*, ts_rank_cd(si.search_vector, plainto_tsquery('english', $1)) as relevance_score
			FROM cms.search_index si
			WHERE si.search_vector @@ plainto_tsquery('english', $1)
		`;
		const params: any[] = [query];
		let paramCount = 1;

		const whereConditions: string[] = [];

		// Entity type filter
		if (entityTypes && entityTypes.length > 0) {
			paramCount++;
			whereConditions.push(`si.entity_type = ANY($${paramCount})`);
			params.push(entityTypes);
		}

		// Category filter
		if (categories && categories.length > 0) {
			paramCount++;
			whereConditions.push(`si.category = ANY($${paramCount})`);
			params.push(categories);
		}

		// Tags filter
		if (tags && tags.length > 0) {
			// This is a simplified approach - in practice, you'd want to handle JSON array search
			paramCount++;
			whereConditions.push(`si.tags::text ILIKE $${paramCount}`);
			params.push(`%${tags.join("%")}%`);
		}

		// Date range filter
		if (dateFrom) {
			paramCount++;
			whereConditions.push(`si.created_at >= $${paramCount}`);
			params.push(dateFrom);
		}

		if (dateTo) {
			paramCount++;
			whereConditions.push(`si.created_at <= $${paramCount}`);
			params.push(dateTo);
		}

		if (whereConditions.length > 0) {
			searchQuery += ` AND ${whereConditions.join(" AND ")}`;
		}

		searchQuery += `
			ORDER BY relevance_score DESC, si.created_at DESC
			LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
		`;
		params.push(limit, offset);

		const result = await sql.query(searchQuery, params);

		// Get total count
		let countQuery = `
			SELECT COUNT(*) as total
			FROM cms.search_index si
			WHERE si.search_vector @@ plainto_tsquery('english', $1)
		`;

		if (whereConditions.length > 0) {
			countQuery += ` AND ${whereConditions.join(" AND ")}`;
		}

		const countResult = await sql.query(
			countQuery,
			params.slice(0, paramCount),
		);

		return {
			results: result.rows.map((row) => ({
				entityType: row.entity_type,
				entityId: row.entity_id,
				title: row.title,
				excerpt: row.excerpt,
				category: row.category,
				tags: row.tags ? JSON.parse(row.tags) : [],
				metadata: row.metadata ? JSON.parse(row.metadata) : {},
				relevanceScore: Number.parseFloat(row.relevance_score),
				createdAt: row.created_at,
			})),
			total: Number.parseInt(countResult.rows[0].total),
			query,
			filters,
		};
	}

	/**
	 * Add or update search index for an entity
	 */
	async indexEntity(
		entityType: string,
		entityId: string,
		title: string,
		content?: string,
		excerpt?: string,
		category?: string,
		tags?: string[],
		metadata?: Record<string, unknown>,
	): Promise<void> {
		// Prepare searchable content
		const searchableContent = [
			title,
			content || "",
			excerpt || "",
			category || "",
			tags?.join(" ") || "",
		].join(" ");

		// Create or update search index
		await sql.query(
			`INSERT INTO cms.search_index
       (entity_type, entity_id, title, content, excerpt, category, tags, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (entity_type, entity_id)
       DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         excerpt = EXCLUDED.excerpt,
         category = EXCLUDED.category,
         tags = EXCLUDED.tags,
         metadata = EXCLUDED.metadata,
         updated_at = NOW()`,
			[
				entityType,
				entityId,
				title,
				content || null,
				excerpt || null,
				category || null,
				tags ? JSON.stringify(tags) : null,
				metadata ? JSON.stringify(metadata) : null,
			],
		);
	}

	/**
	 * Remove entity from search index
	 */
	async removeFromIndex(entityType: string, entityId: string): Promise<void> {
		await sql.query(
			"DELETE FROM cms.search_index WHERE entity_type = $1 AND entity_id = $2",
			[entityType, entityId],
		);
	}

	/**
	 * Log search query for analytics
	 */
	async logSearchQuery(
		query: string,
		userId?: string,
		entityTypes?: string[],
		resultsCount?: number,
	): Promise<void> {
		await sql.query(
			`INSERT INTO cms.search_queries
       (query, user_id, entity_types, results_count, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
			[
				query,
				userId || null,
				entityTypes ? JSON.stringify(entityTypes) : null,
				resultsCount || null,
			],
		);
	}

	/**
	 * Get popular search queries
	 */
	async getPopularQueries(limit = 10): Promise<
		Array<{
			query: string;
			count: number;
			lastSearched: Date;
		}>
	> {
		const result = await sql.query(
			`
			SELECT
				query,
				COUNT(*) as count,
				MAX(created_at) as last_searched
			FROM cms.search_queries
			WHERE created_at >= NOW() - INTERVAL '30 days'
			GROUP BY query
			ORDER BY count DESC, last_searched DESC
			LIMIT $1
		`,
			[limit],
		);

		return result.rows;
	}

	/**
	 * Get search analytics
	 */
	async getSearchAnalytics(days = 30): Promise<{
		totalSearches: number;
		uniqueUsers: number;
		avgResultsPerSearch: number;
		topQueries: Array<{ query: string; count: number }>;
		searchesByDay: Array<{ date: string; count: number }>;
	}> {
		const result = await sql.query(`
			SELECT
				COUNT(*) as total_searches,
				COUNT(DISTINCT user_id) as unique_users,
				AVG(results_count) as avg_results_per_search
			FROM cms.search_queries
			WHERE created_at >= NOW() - INTERVAL '${days} days'
		`);

		const topQueriesResult = await sql.query(`
			SELECT
				query,
				COUNT(*) as count
			FROM cms.search_queries
			WHERE created_at >= NOW() - INTERVAL '${days} days'
			GROUP BY query
			ORDER BY count DESC
			LIMIT 10
		`);

		const searchesByDayResult = await sql.query(`
			SELECT
				DATE(created_at) as date,
				COUNT(*) as count
			FROM cms.search_queries
			WHERE created_at >= NOW() - INTERVAL '${days} days'
			GROUP BY DATE(created_at)
			ORDER BY date
		`);

		return {
			totalSearches: Number.parseInt(result.rows[0].total_searches),
			uniqueUsers: Number.parseInt(result.rows[0].unique_users),
			avgResultsPerSearch: Number.parseFloat(
				result.rows[0].avg_results_per_search || 0,
			),
			topQueries: topQueriesResult.rows.map((row) => ({
				query: row.query,
				count: Number.parseInt(row.count),
			})),
			searchesByDay: searchesByDayResult.rows.map((row) => ({
				date: row.date,
				count: Number.parseInt(row.count),
			})),
		};
	}

	/**
	 * Rebuild search index for specific entity types
	 */
	async rebuildIndex(entityTypes?: string[]): Promise<{
		indexed: number;
		skipped: number;
		errors: string[];
	}> {
		const errors: string[] = [];
		let indexed = 0;
		const skipped = 0;

		try {
			// This is a simplified rebuild - in practice, you'd want to rebuild from source data
			// For now, we'll just update the search vectors for existing index entries

			let updateQuery =
				"UPDATE cms.search_index SET search_vector = NULL WHERE 1=1";
			const updateParams: any[] = [];

			if (entityTypes && entityTypes.length > 0) {
				updateQuery += " AND entity_type = ANY($1)";
				updateParams.push(entityTypes);
			}

			await sql.query(updateQuery, updateParams);

			// Recreate search vectors
			await sql.query(`
				UPDATE cms.search_index
				SET search_vector = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
				                   setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
				                   setweight(to_tsvector('english', COALESCE(excerpt, '')), 'C') ||
				                   setweight(to_tsvector('english', COALESCE(category, '')), 'D')
				WHERE search_vector IS NULL
			`);

			indexed = 1; // Simplified count
		} catch (error) {
			errors.push(error instanceof Error ? error.message : "Unknown error");
		}

		return {
			indexed,
			skipped,
			errors,
		};
	}

	/**
	 * Get search suggestions/autocomplete
	 */
	async getSuggestions(
		partialQuery: string,
		limit = 10,
	): Promise<Array<{ query: string; count: number }>> {
		const result = await sql.query(
			`
			SELECT
				query,
				COUNT(*) as count
			FROM cms.search_queries
			WHERE query ILIKE $1
			AND created_at >= NOW() - INTERVAL '30 days'
			GROUP BY query
			ORDER BY count DESC, MAX(created_at) DESC
			LIMIT $2
		`,
			[`${partialQuery}%`, limit],
		);

		return result.rows.map((row) => ({
			query: row.query,
			count: Number.parseInt(row.count),
		}));
	}
}

// Export singleton instance
export const searchService = new SearchService();
