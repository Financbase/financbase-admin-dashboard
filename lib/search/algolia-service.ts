import { algoliasearch } from 'algoliasearch';

// Initialize Algolia client
const client = algoliasearch(
	process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
	process.env.ALGOLIA_ADMIN_KEY || ''
);

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
	private client = client;

	/**
	 * Search across all indices
	 */
	async searchAll(query: string, options?: {
		hitsPerPage?: number;
		page?: number;
		filters?: string;
	}): Promise<SearchResponse[]> {
		try {
			const searchPromises = Object.values(SEARCH_INDICES).map(indexName =>
				this.search(indexName, query, options)
			);

			const results = await Promise.all(searchPromises);
			return results;
		} catch (error) {
			console.error('Search all indices error:', error);
			return [];
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
			const index = this.client.initIndex(indexName);

			const searchParams: any = {
				query,
				hitsPerPage: options?.hitsPerPage || 20,
				page: options?.page || 0,
			};

			if (options?.filters) {
				searchParams.filters = options.filters;
			}

			if (options?.facetFilters) {
				searchParams.facetFilters = options.facetFilters;
			}

			if (options?.numericFilters) {
				searchParams.numericFilters = options.numericFilters;
			}

			const response = await index.search(searchParams);

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
			console.error(`Search error for index ${indexName}:`, error);
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
		try {
			const index = this.client.initIndex(indexName);

			const response = await index.search(query, {
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
		} catch (error) {
			console.error('Suggestions error:', error);
			return [];
		}
	}
}

export default AlgoliaSearchService;
