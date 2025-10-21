import {
	type SearchClient,
	SearchIndex,
	type SearchResponse,
} from "algoliasearch";
import AlgoliaConfig from "./algolia-config";

export interface AlgoliaSearchOptions {
	query: string;
	indexName?: string;
	filters?: string;
	facets?: string[];
	page?: number;
	hitsPerPage?: number;
	attributesToRetrieve?: string[];
	attributesToHighlight?: string[];
	attributesToSnippet?: string[];
	getRankingInfo?: boolean;
	analytics?: boolean;
	enablePersonalization?: boolean;
}

export interface AlgoliaSearchResult {
	hits: Record<string, unknown>[];
	nbHits: number;
	page: number;
	nbPages: number;
	hitsPerPage: number;
	processingTimeMS: number;
	facets?: Record<string, Record<string, number>>;
	facetStats?: Record<
		string,
		{ min: number; max: number; avg: number; sum: number }
	>;
	query: string;
	params: string;
	index: string;
	_rankingInfo?: Record<string, unknown>;
}

export interface AlgoliaFacetResult {
	name: string;
	data: Record<string, number>;
	stats?: { min: number; max: number; avg: number; sum: number };
}

export interface AlgoliaSuggestion {
	query: string;
	count: number;
	popularity: number;
}

/**
 * Enhanced Algolia Search Service
 * Provides comprehensive search functionality with Algolia
 */
export class AlgoliaSearchService {
	private client: SearchClient;
	private indexNames: Record<string, string>;

	constructor() {
		this.client = AlgoliaConfig.getSearchClient();
		this.indexNames = AlgoliaConfig.getIndexNames();
	}

	/**
	 * Multi-index search across all entities
	 */
	async search(options: AlgoliaSearchOptions): Promise<AlgoliaSearchResult> {
		const {
			query,
			filters,
			facets,
			page = 0,
			hitsPerPage = 20,
			attributesToRetrieve,
			attributesToHighlight,
			attributesToSnippet,
			getRankingInfo = false,
			analytics = true,
			enablePersonalization = false,
		} = options;

		try {
			// Configure search parameters
			const searchParams = {
				query,
				filters,
				facets,
				page,
				attributesToRetrieve: attributesToRetrieve || ["*"],
				attributesToHighlight: attributesToHighlight || ["*"],
				attributesToSnippet: attributesToSnippet || ["*"],
				getRankingInfo,
				analytics,
				enablePersonalization,
				typoTolerance: true,
				minWordSizefor1Typo: 4,
				minWordSizefor2Typos: 8,
				hitsPerPage: Math.min(hitsPerPage, 1000), // Algolia limit
			};

			// Execute multi-index search
			const searchPromises = [
				this.searchSingleIndex("products", searchParams),
				this.searchSingleIndex("vendors", searchParams),
				this.searchSingleIndex("customers", searchParams),
				this.searchSingleIndex("posts", searchParams),
				this.searchSingleIndex("landingPages", searchParams),
			];

			const results = await Promise.all(searchPromises);

			// Merge and rank results
			return this.mergeSearchResults(results, query);
		} catch (error) {
			console.error("Algolia search error:", error);
			throw new Error(
				`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Search single index
	 */
	async searchSingleIndex(
		entityType: keyof typeof this.indexNames,
		options: AlgoliaSearchOptions,
	): Promise<AlgoliaSearchResult> {
		const indexName = this.indexNames[entityType];
		const index = this.client.initIndex(indexName);

		const {
			query,
			filters,
			facets,
			page = 0,
			hitsPerPage = 20,
			attributesToRetrieve,
			attributesToHighlight,
			attributesToSnippet,
			getRankingInfo = false,
			analytics = true,
			enablePersonalization = false,
		} = options;

		try {
			const searchParams = {
				query,
				filters,
				facets,
				page,
				hitsPerPage: Math.min(hitsPerPage, 1000),
				attributesToRetrieve: attributesToRetrieve || ["*"],
				attributesToHighlight: attributesToHighlight || ["*"],
				attributesToSnippet: attributesToSnippet || ["*"],
				getRankingInfo,
				analytics,
				enablePersonalization,
				typoTolerance: true,
				minWordSizefor1Typo: 4,
				minWordSizefor2Typos: 8,
			};

			const response: SearchResponse = await index.search(searchParams);

			return {
				hits: response.hits || [],
				nbHits: response.nbHits || 0,
				page: response.page || 0,
				nbPages: response.nbPages || 0,
				hitsPerPage: response.hitsPerPage || hitsPerPage,
				processingTimeMS: response.processingTimeMS || 0,
				facets: response.facets,
				facetStats: response.facetStats,
				query: response.query || query,
				params: response.params || "",
				index: indexName,
				_rankingInfo: response._rankingInfo,
			};
		} catch (error) {
			console.error(`Algolia search error for ${entityType}:`, error);
			throw new Error(
				`Search failed for ${entityType}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get facet values and counts
	 */
	async getFacets(
		entityType: keyof typeof this.indexNames,
		facetName: string,
		options: AlgoliaSearchOptions = { query: "" },
	): Promise<AlgoliaFacetResult> {
		const indexName = this.indexNames[entityType];
		const index = this.client.initIndex(indexName);

		try {
			const response = await index.searchForFacetValues({
				facetName,
				query: options.query,
				maxFacetHits: options.hitsPerPage || 100,
			});

			return {
				name: facetName,
				data: response.facetHits.reduce(
					(acc, hit) => {
						acc[hit.value] = hit.count;
						return acc;
					},
					{} as Record<string, number>,
				),
				stats: response.facetStats,
			};
		} catch (error) {
			console.error(`Algolia facet error for ${entityType}:`, error);
			throw new Error(
				`Facet search failed for ${entityType}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get search suggestions/autocomplete
	 */
	async getSuggestions(
		query: string,
		entityType?: keyof typeof this.indexNames,
		limit = 10,
	): Promise<AlgoliaSuggestion[]> {
		try {
			if (entityType) {
				// Single index suggestions
				const indexName = this.indexNames[entityType];
				const index = this.client.initIndex(indexName);

				const response = await index.search({
					query,
					hitsPerPage: limit,
					attributesToRetrieve: [
						"name",
						"title",
						"company_name",
						"first_name",
						"last_name",
					],
					attributesToHighlight: [
						"name",
						"title",
						"company_name",
						"first_name",
						"last_name",
					],
				});

				return response.hits.map((hit: Record<string, unknown>) => ({
					query:
						hit.name ||
						hit.title ||
						hit.company_name ||
						`${hit.first_name} ${hit.last_name}`,
					count: 1,
					popularity: hit._rankingInfo?.userScore || 0,
				}));
			}
			// Multi-index suggestions
			const suggestions: AlgoliaSuggestion[] = [];
			const entityTypes: (keyof typeof this.indexNames)[] = [
				"products",
				"vendors",
				"customers",
				"posts",
				"landingPages",
			];

			for (const type of entityTypes) {
				try {
					const typeSuggestions = await this.getSuggestions(
						query,
						type,
						Math.ceil(limit / entityTypes.length),
					);
					suggestions.push(...typeSuggestions);
				} catch (error) {
					console.warn(`Failed to get suggestions for ${type}:`, error);
				}
			}

			// Sort by popularity and limit
			return suggestions
				.sort((a, b) => b.popularity - a.popularity)
				.slice(0, limit);
		} catch (error) {
			console.error("Algolia suggestions error:", error);
			throw new Error(
				`Suggestions failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Track search analytics
	 */
	async trackAnalytics(
		query: string,
		userId?: string,
		entityTypes?: string[],
		resultCount?: number,
	): Promise<void> {
		try {
			// This would integrate with your existing analytics system
			// For now, we'll just log the search
			console.log("Search analytics:", {
				query,
				userId,
				entityTypes,
				resultCount,
				timestamp: new Date().toISOString(),
			});

			// In a real implementation, you might:
			// 1. Send to your analytics service (PostHog, etc.)
			// 2. Store in your database
			// 3. Send to Algolia Insights API
		} catch (error) {
			console.error("Analytics tracking error:", error);
			// Don't throw - analytics failures shouldn't break search
		}
	}

	/**
	 * Build Algolia filter string from search filters
	 */
	buildFilters(filters: {
		entityTypes?: string[];
		categories?: string[];
		tags?: string[];
		status?: string[];
		dateFrom?: Date;
		dateTo?: Date;
	}): string {
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

		if (filters.status && filters.status.length > 0) {
			filterParts.push(`status:${filters.status.join(" OR status:")}`);
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
	 * Merge search results from multiple indices
	 */
	private mergeSearchResults(
		results: AlgoliaSearchResult[],
		query: string,
	): AlgoliaSearchResult {
		const allHits = results.flatMap((result) =>
			result.hits.map((hit) => ({
				...hit,
				_index: result.index,
				_entityType: this.getEntityTypeFromIndex(result.index),
			})),
		);

		// Sort by relevance score (if available) or by processing time
		allHits.sort((a, b) => {
			const scoreA = a._rankingInfo?.userScore || 0;
			const scoreB = b._rankingInfo?.userScore || 0;
			return scoreB - scoreA;
		});

		const totalHits = results.reduce((sum, result) => sum + result.nbHits, 0);
		const totalPages = Math.ceil(totalHits / (results[0]?.hitsPerPage || 20));
		const maxProcessingTime = Math.max(
			...results.map((r) => r.processingTimeMS),
		);

		// Merge facets from all results
		const mergedFacets: Record<string, Record<string, number>> = {};
		for (const result of results) {
			if (result.facets) {
				for (const [facetName, facetData] of Object.entries(result.facets)) {
					if (!mergedFacets[facetName]) {
						mergedFacets[facetName] = {};
					}
					for (const [value, count] of Object.entries(facetData)) {
						mergedFacets[facetName][value] =
							(mergedFacets[facetName][value] || 0) + count;
					}
				}
			}
		}

		return {
			hits: allHits,
			nbHits: totalHits,
			page: results[0]?.page || 0,
			nbPages: totalPages,
			hitsPerPage: results[0]?.hitsPerPage || 20,
			processingTimeMS: maxProcessingTime,
			facets: Object.keys(mergedFacets).length > 0 ? mergedFacets : undefined,
			query,
			params: "",
			index: "multi-index",
		};
	}

	/**
	 * Get entity type from index name
	 */
	private getEntityTypeFromIndex(indexName: string): string {
		const indexNames = this.indexNames;
		for (const [entityType, name] of Object.entries(indexNames)) {
			if (name === indexName) {
				return entityType;
			}
		}
		return "unknown";
	}

	/**
	 * Check if Algolia is available
	 */
	static isAvailable(): boolean {
		return AlgoliaConfig.isConfigured();
	}
}

// Export singleton instance
export const algoliaSearchService = new AlgoliaSearchService();
export default AlgoliaSearchService;
