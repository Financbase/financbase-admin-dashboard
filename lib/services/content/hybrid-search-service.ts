import {
	type AlgoliaSearchOptions,
	type AlgoliaSearchResult,
	AlgoliaSearchService,
} from "./algolia-search-service";
import {
	type SearchFilters,
	type SearchResult,
	SearchService,
} from "./search-service";
import { SearchIndexItem } from "./search-service";

export interface HybridSearchOptions {
	query: string;
	filters?: SearchFilters;
	useAlgolia?: boolean;
	usePostgres?: boolean;
	fallbackToPostgres?: boolean;
	performanceTracking?: boolean;
}

export interface HybridSearchResult {
	results: SearchResult[];
	total: number;
	query: string;
	filters: SearchFilters;
	searchMethod: "algolia" | "postgres" | "hybrid";
	executionTime: number;
	algoliaResults?: AlgoliaSearchResult;
	postgresResults?: {
		results: SearchResult[];
		total: number;
	};
	performanceMetrics?: {
		algoliaTime?: number;
		postgresTime?: number;
		cacheHit?: boolean;
	};
}

/**
 * Hybrid Search Service
 * Intelligently routes between Algolia and PostgreSQL search
 * Provides fallback mechanisms and performance comparison
 */
export class HybridSearchService {
	private searchService: SearchService;
	private algoliaService: AlgoliaSearchService;
	private performanceCache: Map<
		string,
		{ result: HybridSearchResult; timestamp: number }
	> = new Map();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	constructor() {
		this.searchService = new SearchService();
		this.algoliaService = new AlgoliaSearchService();
	}

	/**
	 * Intelligent search routing between Algolia and PostgreSQL
	 */
	async search(options: HybridSearchOptions): Promise<HybridSearchResult> {
		const startTime = Date.now();
		const {
			query,
			filters = {},
			useAlgolia = true,
			usePostgres = true,
			fallbackToPostgres = true,
			performanceTracking = true,
		} = options;

		// Check cache first
		const cacheKey = this.getCacheKey(query, filters);
		const cached = this.performanceCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
			return {
				...cached.result,
				performanceMetrics: {
					...cached.result.performanceMetrics,
					cacheHit: true,
				},
			};
		}

		const performanceMetrics: HybridSearchResult["performanceMetrics"] = {};

		try {
			// Determine search strategy
			const searchStrategy = this.determineSearchStrategy(
				query,
				filters,
				useAlgolia,
				usePostgres,
			);

			let results: SearchResult[] = [];
			let total = 0;
			let searchMethod: "algolia" | "postgres" | "hybrid" = "postgres";
			let algoliaResults: AlgoliaSearchResult | undefined;
			let postgresResults:
				| { results: SearchResult[]; total: number }
				| undefined;

			if (searchStrategy === "algolia" || searchStrategy === "hybrid") {
				try {
					const algoliaStart = Date.now();
					algoliaResults = await this.searchWithAlgolia(query, filters);
					performanceMetrics.algoliaTime = Date.now() - algoliaStart;

					results = this.transformAlgoliaResults(algoliaResults);
					total = algoliaResults.nbHits;
					searchMethod = "algolia";

					// If hybrid and Algolia results are insufficient, supplement with PostgreSQL
					if (
						searchStrategy === "hybrid" &&
						results.length < (filters.limit || 20)
					) {
						const postgresStart = Date.now();
						postgresResults = await this.searchWithPostgres(
							query,
							filters,
							results.length,
						);
						performanceMetrics.postgresTime = Date.now() - postgresStart;

						// Merge results, avoiding duplicates
						const mergedResults = this.mergeResults(
							results,
							postgresResults.results,
						);
						results = mergedResults.slice(0, filters.limit || 20);
						total = Math.max(algoliaResults.nbHits, postgresResults.total);
						searchMethod = "hybrid";
					}
				} catch (algoliaError) {
					console.warn(
						"Algolia search failed, falling back to PostgreSQL:",
						algoliaError,
					);

					if (fallbackToPostgres) {
						const postgresStart = Date.now();
						postgresResults = await this.searchWithPostgres(query, filters);
						performanceMetrics.postgresTime = Date.now() - postgresStart;

						results = postgresResults.results;
						total = postgresResults.total;
						searchMethod = "postgres";
					} else {
						throw algoliaError;
					}
				}
			} else {
				// PostgreSQL only
				const postgresStart = Date.now();
				postgresResults = await this.searchWithPostgres(query, filters);
				performanceMetrics.postgresTime = Date.now() - postgresStart;

				results = postgresResults.results;
				total = postgresResults.total;
				searchMethod = "postgres";
			}

			const result: HybridSearchResult = {
				results,
				total,
				query,
				filters,
				searchMethod,
				executionTime: Date.now() - startTime,
				algoliaResults,
				postgresResults,
				performanceMetrics,
			};

			// Cache the result
			this.performanceCache.set(cacheKey, {
				result,
				timestamp: Date.now(),
			});

			// Track performance if enabled
			if (performanceTracking) {
				await this.trackPerformance(result);
			}

			return result;
		} catch (error) {
			console.error("Hybrid search failed:", error);
			throw new Error(
				`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Search using Algolia
	 */
	private async searchWithAlgolia(
		query: string,
		filters: SearchFilters,
	): Promise<AlgoliaSearchResult> {
		const algoliaOptions: AlgoliaSearchOptions = {
			query,
			filters: this.buildAlgoliaFilters(filters),
			facets: this.getFacetAttributes(filters),
			page: Math.floor((filters.offset || 0) / (filters.limit || 20)),
			hitsPerPage: filters.limit || 20,
			attributesToRetrieve: ["*"],
			attributesToHighlight: ["*"],
			attributesToSnippet: ["*"],
			getRankingInfo: true,
			analytics: true,
		};

		return await this.algoliaService.search(algoliaOptions);
	}

	/**
	 * Search using PostgreSQL
	 */
	private async searchWithPostgres(
		query: string,
		filters: SearchFilters,
		skipCount = 0,
	): Promise<{ results: SearchResult[]; total: number }> {
		const adjustedFilters = {
			...filters,
			limit: (filters.limit || 20) - skipCount,
			offset: (filters.offset || 0) + skipCount,
		};

		const postgresResult = await this.searchService.search(
			query,
			adjustedFilters,
		);

		return {
			results: postgresResult.results,
			total: postgresResult.total,
		};
	}

	/**
	 * Determine optimal search strategy
	 */
	private determineSearchStrategy(
		query: string,
		filters: SearchFilters,
		useAlgolia: boolean,
		usePostgres: boolean,
	): "algolia" | "postgres" | "hybrid" {
		// Simple queries favor Algolia for speed
		const isSimpleQuery =
			query.length <= 50 && !this.hasComplexFilters(filters);

		// Complex filters or no Algolia available
		const hasComplexFilters = this.hasComplexFilters(filters);
		const algoliaAvailable = AlgoliaSearchService.isAvailable();

		if (!algoliaAvailable || !useAlgolia) {
			return "postgres";
		}

		if (!usePostgres) {
			return "algolia";
		}

		// Hybrid approach for complex scenarios
		if (hasComplexFilters || query.length > 100) {
			return "hybrid";
		}

		// Simple queries use Algolia
		if (isSimpleQuery) {
			return "algolia";
		}

		// Default to hybrid for balanced approach
		return "hybrid";
	}

	/**
	 * Check if filters are complex (favor PostgreSQL)
	 */
	private hasComplexFilters(filters: SearchFilters): boolean {
		return !!(
			filters.dateFrom ||
			filters.dateTo ||
			(filters.tags && filters.tags.length > 3) ||
			(filters.categories && filters.categories.length > 5) ||
			(filters.entityTypes && filters.entityTypes.length > 3)
		);
	}

	/**
	 * Transform Algolia results to SearchResult format
	 */
	private transformAlgoliaResults(
		algoliaResults: AlgoliaSearchResult,
	): SearchResult[] {
		return algoliaResults.hits.map((hit: Record<string, unknown>) => ({
			entityType: hit._entityType || "unknown",
			entityId: hit.objectID || hit.id || "",
			title:
				hit.name ||
				hit.title ||
				hit.company_name ||
				`${hit.first_name || ""} ${hit.last_name || ""}`.trim(),
			excerpt:
				hit._snippetResult?.description?.value ||
				hit.description ||
				hit.excerpt ||
				"",
			category: hit.category || "",
			tags: hit.tags || [],
			metadata: hit.metadata || {},
			relevanceScore: hit._rankingInfo?.userScore || 0,
			highlightedTitle:
				hit._highlightResult?.name?.value ||
				hit._highlightResult?.title?.value ||
				hit._highlightResult?.company_name?.value,
			highlightedExcerpt: hit._snippetResult?.description?.value,
		}));
	}

	/**
	 * Merge results from different sources, avoiding duplicates
	 */
	private mergeResults(
		algoliaResults: SearchResult[],
		postgresResults: SearchResult[],
	): SearchResult[] {
		const merged = [...algoliaResults];
		const algoliaIds = new Set(algoliaResults.map((r) => r.entityId));

		// Add PostgreSQL results that aren't already in Algolia results
		for (const postgresResult of postgresResults) {
			if (!algoliaIds.has(postgresResult.entityId)) {
				merged.push(postgresResult);
			}
		}

		// Sort by relevance score
		return merged.sort((a, b) => b.relevanceScore - a.relevanceScore);
	}

	/**
	 * Build Algolia filter string
	 */
	private buildAlgoliaFilters(filters: SearchFilters): string {
		const filterParts: string[] = [];

		if (filters.entityTypes && filters.entityTypes.length > 0) {
			filterParts.push(
				`entity_type:${filters.entityTypes.join(" OR entity_type:")}`,
			);
		}

		if (filters.categories && filters.categories.length > 0) {
			filterParts.push(`category:${filters.categories.join(" OR category:")}`);
		}

		if (filters.tags && filters.tags.length > 0) {
			filterParts.push(`tags:${filters.tags.join(" OR tags:")}`);
		}

		if (filters.dateFrom) {
			filterParts.push(`created_at >= ${filters.dateFrom.getTime()}`);
		}

		if (filters.dateTo) {
			filterParts.push(`created_at <= ${filters.dateTo.getTime()}`);
		}

		return filterParts.join(" AND ");
	}

	/**
	 * Get facet attributes for Algolia
	 */
	private getFacetAttributes(filters: SearchFilters): string[] {
		const facets: string[] = ["entity_type", "category", "status"];

		if (filters.entityTypes && filters.entityTypes.length > 0) {
			facets.push("entity_type");
		}

		if (filters.categories && filters.categories.length > 0) {
			facets.push("category");
		}

		return facets;
	}

	/**
	 * Track search performance
	 */
	private async trackPerformance(result: HybridSearchResult): Promise<void> {
		try {
			const metrics = {
				query: result.query,
				searchMethod: result.searchMethod,
				executionTime: result.executionTime,
				resultCount: result.total,
				algoliaTime: result.performanceMetrics?.algoliaTime,
				postgresTime: result.performanceMetrics?.postgresTime,
				cacheHit: result.performanceMetrics?.cacheHit,
				timestamp: new Date().toISOString(),
			};

			// Log performance metrics
			console.log("Search Performance:", metrics);

			// In a real implementation, you might:
			// 1. Send to analytics service
			// 2. Store in database
			// 3. Send to monitoring service
		} catch (error) {
			console.error("Performance tracking error:", error);
			// Don't throw - performance tracking failures shouldn't break search
		}
	}

	/**
	 * Generate cache key for search results
	 */
	private getCacheKey(query: string, filters: SearchFilters): string {
		const filterString = JSON.stringify(filters);
		return `search:${query}:${filterString}`;
	}

	/**
	 * Clear performance cache
	 */
	clearCache(): void {
		this.performanceCache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hitRate: number } {
		return {
			size: this.performanceCache.size,
			hitRate: 0, // Would need to track hits/misses for accurate rate
		};
	}

	/**
	 * Check if hybrid search is available
	 */
	static isAvailable(): boolean {
		return AlgoliaSearchService.isAvailable();
	}
}

// Export singleton instance
export const hybridSearchService = new HybridSearchService();
export default HybridSearchService;
