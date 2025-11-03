import { algoliasearch, type SearchClient } from 'algoliasearch';

// Lazy initialization function for Algolia client
function getAlgoliaClient(): SearchClient {
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
	const adminKey = process.env.ALGOLIA_ADMIN_KEY;

	if (!appId || !adminKey) {
		throw new Error(
			'Algolia configuration missing: NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY required'
		);
	}

	// Algolia v5: algoliasearch() returns a SearchClient directly
	const client = algoliasearch(appId, adminKey);
	return client;
}

// Search indices
export const SEARCH_INDICES = {
	PRODUCTS: 'products_prod',
	VENDORS: 'vendors_prod',
	CUSTOMERS: 'customers_prod',
	INVOICES: 'invoices_prod',
	EXPENSES: 'expenses_prod',
} as const;

export interface SearchResult {
	objectID: string;
	[key: string]: any;
}

export interface SearchResponse {
	hits: SearchResult[];
	nbHits: number;
	page: number;
	nbPages: number;
	hitsPerPage: number;
	processingTimeMS: number;
	query: string;
	params: string;
}

export class AlgoliaSearchService {
	private client: SearchClient | null = null;

	/**
	 * Get or initialize Algolia client
	 */
	private getClient() {
		if (!this.client) {
			this.client = getAlgoliaClient();
		}
		return this.client;
	}

	/**
	 * Search across all indices with timeout protection
	 */
	async searchAll(query: string, options?: {
		hitsPerPage?: number;
		page?: number;
		filters?: string;
	}): Promise<SearchResponse[]> {
		try {
			// Validate client is available
			const client = this.getClient();

			// Create search promises with individual error handling
			const searchPromises = Object.values(SEARCH_INDICES).map(async (indexName) => {
				try {
					return await Promise.race([
						this.search(indexName, query, options),
						new Promise<SearchResponse>((_, reject) =>
							setTimeout(() => reject(new Error(`Search timeout for index ${indexName}`)), 10000)
						),
					]);
				} catch (error) {
					console.error(`Search failed for index ${indexName}:`, error);
					// Return empty result for failed index instead of failing all
					return {
						hits: [],
						nbHits: 0,
						page: 0,
						nbPages: 0,
						hitsPerPage: options?.hitsPerPage || 20,
						processingTimeMS: 0,
						query,
						params: '',
					};
				}
			});

			const results = await Promise.all(searchPromises);
			return results;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Search all indices error:', errorMessage, error);
			throw new Error(`Search service unavailable: ${errorMessage}`);
		}
	}

	/**
	 * Search a specific index
	 */
	async search(
		indexName: string,
		query: string,
		options?: {
			hitsPerPage?: number;
			page?: number;
			filters?: string;
			facetFilters?: string[][];
			numericFilters?: string[];
		}
	): Promise<SearchResponse> {
		try {
			const client = this.getClient();

			// Build search options according to Algolia v5 API
			const searchOptions: any = {
				hitsPerPage: options?.hitsPerPage || 20,
				page: options?.page || 0,
			};

			if (options?.filters) {
				searchOptions.filters = options.filters;
			}

			if (options?.facetFilters) {
				searchOptions.facetFilters = options.facetFilters;
			}

			if (options?.numericFilters) {
				searchOptions.numericFilters = options.numericFilters;
			}

			// Algolia v5 API: client.searchSingleIndex({ indexName, query, ...options })
			const response = await client.searchSingleIndex({
				indexName,
				query,
				...searchOptions,
			});

			return {
				hits: response.hits as SearchResult[],
				nbHits: response.nbHits,
				page: response.page,
				nbPages: response.nbPages,
				hitsPerPage: response.hitsPerPage,
				processingTimeMS: response.processingTimeMS,
				query: response.query,
				params: response.params,
			};
		} catch (error) {
			// Enhanced error logging for Algolia-specific errors
			const errorDetails: any = {
				indexName,
				query,
				errorType: error instanceof Error ? error.name : 'Unknown',
				errorMessage: error instanceof Error ? error.message : String(error),
			};

			// Check for Algolia-specific error properties
			if (error && typeof error === 'object') {
				if ('status' in error) errorDetails.status = error.status;
				if ('statusCode' in error) errorDetails.statusCode = error.statusCode;
				if ('indexName' in error) errorDetails.algoliaIndexName = error.indexName;
			}

			console.error(`Algolia search error for index ${indexName}:`, errorDetails, error);

			// Re-throw with more context
			throw new Error(
				`Algolia search failed for index "${indexName}": ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Search invoices
	 */
	async searchInvoices(query: string, filters?: {
		status?: string;
		clientId?: string;
		dateRange?: { start: string; end: string };
	}): Promise<SearchResponse> {
		let filterString = '';

		if (filters?.status) {
			filterString += `status:${filters.status}`;
		}

		if (filters?.clientId) {
			filterString += `${filterString ? ' AND ' : ''}clientId:${filters.clientId}`;
		}

		if (filters?.dateRange) {
			filterString += `${filterString ? ' AND ' : ''}date:${filters.dateRange.start} TO ${filters.dateRange.end}`;
		}

		return this.search(SEARCH_INDICES.INVOICES, query, { filters: filterString });
	}

	/**
	 * Search expenses
	 */
	async searchExpenses(query: string, filters?: {
		category?: string;
		vendor?: string;
		amountRange?: { min: number; max: number };
	}): Promise<SearchResponse> {
		let filterString = '';

		if (filters?.category) {
			filterString += `category:${filters.category}`;
		}

		if (filters?.vendor) {
			filterString += `${filterString ? ' AND ' : ''}vendor:${filters.vendor}`;
		}

		if (filters?.amountRange) {
			filterString += `${filterString ? ' AND ' : ''}amount:${filters.amountRange.min} TO ${filters.amountRange.max}`;
		}

		return this.search(SEARCH_INDICES.EXPENSES, query, { filters: filterString });
	}

	/**
	 * Search customers/clients
	 */
	async searchCustomers(query: string, filters?: {
		status?: string;
		location?: string;
	}): Promise<SearchResponse> {
		let filterString = '';

		if (filters?.status) {
			filterString += `status:${filters.status}`;
		}

		if (filters?.location) {
			filterString += `${filterString ? ' AND ' : ''}location:${filters.location}`;
		}

		return this.search(SEARCH_INDICES.CUSTOMERS, query, { filters: filterString });
	}

	/**
	 * Get search suggestions/autocomplete
	 */
	async getSuggestions(query: string, indexName: string = SEARCH_INDICES.PRODUCTS): Promise<string[]> {
		const client = this.getClient();

		// Algolia v5 API: client.searchSingleIndex({ indexName, query, ...options })
		const response = await client.searchSingleIndex({
			indexName,
			query,
			hitsPerPage: 5,
			attributesToRetrieve: ['name', 'description'],
			attributesToHighlight: ['name'],
		});

		// Extract unique suggestions from results
		const suggestions = new Set<string>();
		response.hits.forEach(hit => {
			if (hit.name) suggestions.add(hit.name);
			if (hit.description) suggestions.add(hit.description);
		});

		return Array.from(suggestions).slice(0, 5);
	}
}

export default AlgoliaSearchService;
