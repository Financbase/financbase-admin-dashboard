import { algoliasearch } from "algoliasearch";

/**
 * Algolia Configuration Service
 * Centralized configuration for Algolia client and index settings
 */
export class AlgoliaConfig {
	private static client: ReturnType<typeof algoliasearch> | null = null;
	private static searchClient: ReturnType<typeof algoliasearch> | null = null;

	/**
	 * Initialize Algolia client with environment variables
	 */
	static getClient() {
		if (!AlgoliaConfig.client) {
			const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
			const adminKey = process.env.ALGOLIA_ADMIN_KEY;

			if (!appId || !adminKey) {
				throw new Error(
					"Algolia configuration missing: NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY required",
				);
			}

			AlgoliaConfig.client = algoliasearch(appId, adminKey);
		}

		return AlgoliaConfig.client;
	}

	/**
	 * Get search-only client for frontend
	 */
	static getSearchClient() {
		if (!AlgoliaConfig.searchClient) {
			const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
			const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

			if (!appId || !searchKey) {
				throw new Error(
					"Algolia search configuration missing: NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY required",
				);
			}

			AlgoliaConfig.searchClient = algoliasearch(appId, searchKey);
		}

		return AlgoliaConfig.searchClient;
	}

	/**
	 * Index names configuration
	 */
	static getIndexNames() {
		return {
			products: process.env.ALGOLIA_PRODUCTS_INDEX || "products_index",
			vendors: process.env.ALGOLIA_VENDORS_INDEX || "vendors_index",
			customers: process.env.ALGOLIA_CUSTOMERS_INDEX || "customers_index",
			posts: process.env.ALGOLIA_POSTS_INDEX || "posts_index",
			landingPages:
				process.env.ALGOLIA_LANDING_PAGES_INDEX || "landing_pages_index",
		};
	}

	/**
	 * Configure index settings for products
	 */
	static getProductsIndexSettings() {
		return {
			searchableAttributes: [
				"name",
				"description",
				"category",
				"sku",
				"tags",
				"notes",
			],
			attributesForFaceting: ["category", "status", "vendor_type"],
			customRanking: ["desc(total_available)", "desc(created_at)"],
			typoTolerance: {
				enabled: true,
				minWordSizeForTypos: 4,
				disableOnWords: ["sku"],
			},
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>",
			snippetEllipsisText: "...",
			hitsPerPage: 20,
			maxValuesPerFacet: 100,
		};
	}

	/**
	 * Configure index settings for vendors
	 */
	static getVendorsIndexSettings() {
		return {
			searchableAttributes: [
				"company_name",
				"contact_person",
				"email",
				"address",
				"city",
				"state",
				"country",
				"vendor_type",
			],
			attributesForFaceting: ["vendor_type", "status", "country", "state"],
			customRanking: ["desc(created_at)"],
			typoTolerance: {
				enabled: true,
				minWordSizeForTypos: 4,
			},
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>",
			snippetEllipsisText: "...",
			hitsPerPage: 20,
			maxValuesPerFacet: 100,
		};
	}

	/**
	 * Configure index settings for customers
	 */
	static getCustomersIndexSettings() {
		return {
			searchableAttributes: [
				"first_name",
				"last_name",
				"email",
				"company",
				"phone",
			],
			attributesForFaceting: ["status", "company"],
			customRanking: ["desc(created_at)"],
			typoTolerance: {
				enabled: true,
				minWordSizeForTypos: 3,
			},
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>",
			snippetEllipsisText: "...",
			hitsPerPage: 20,
			maxValuesPerFacet: 100,
		};
	}

	/**
	 * Configure index settings for posts
	 */
	static getPostsIndexSettings() {
		return {
			searchableAttributes: ["title", "content", "excerpt", "tags", "author"],
			attributesForFaceting: ["category", "status", "author", "tags"],
			customRanking: ["desc(published_at)", "desc(created_at)"],
			typoTolerance: {
				enabled: true,
				minWordSizeForTypos: 4,
			},
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>",
			snippetEllipsisText: "...",
			hitsPerPage: 20,
			maxValuesPerFacet: 100,
		};
	}

	/**
	 * Configure index settings for landing pages
	 */
	static getLandingPagesIndexSettings() {
		return {
			searchableAttributes: ["title", "content", "meta_description", "tags"],
			attributesForFaceting: ["status", "template", "tags"],
			customRanking: ["desc(updated_at)", "desc(created_at)"],
			typoTolerance: {
				enabled: true,
				minWordSizeForTypos: 4,
			},
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>",
			snippetEllipsisText: "...",
			hitsPerPage: 20,
			maxValuesPerFacet: 100,
		};
	}

	/**
	 * Get all index settings
	 */
	static getAllIndexSettings() {
		const indexNames = AlgoliaConfig.getIndexNames();
		return {
			[indexNames.products]: AlgoliaConfig.getProductsIndexSettings(),
			[indexNames.vendors]: AlgoliaConfig.getVendorsIndexSettings(),
			[indexNames.customers]: AlgoliaConfig.getCustomersIndexSettings(),
			[indexNames.posts]: AlgoliaConfig.getPostsIndexSettings(),
			[indexNames.landingPages]: AlgoliaConfig.getLandingPagesIndexSettings(),
		};
	}

	/**
	 * Configure replica indices for different sort orders
	 */
	static getReplicaSettings() {
		const indexNames = AlgoliaConfig.getIndexNames();
		return {
			[`${indexNames.products}_price_asc`]: {
				ranking: ["asc(unit_price)", "desc(created_at)"],
			},
			[`${indexNames.products}_price_desc`]: {
				ranking: ["desc(unit_price)", "desc(created_at)"],
			},
			[`${indexNames.products}_name_asc`]: {
				ranking: ["asc(name)", "desc(created_at)"],
			},
			[`${indexNames.vendors}_name_asc`]: {
				ranking: ["asc(company_name)", "desc(created_at)"],
			},
			[`${indexNames.customers}_name_asc`]: {
				ranking: ["asc(last_name)", "asc(first_name)", "desc(created_at)"],
			},
		};
	}

	/**
	 * Initialize all indices with proper settings
	 */
	static async initializeIndices() {
		const client = AlgoliaConfig.getClient();
		const allSettings = AlgoliaConfig.getAllIndexSettings();
		const replicaSettings = AlgoliaConfig.getReplicaSettings();

		try {
			// Configure main indices
			for (const [indexName, settings] of Object.entries(allSettings)) {
				const index = client.initIndex(indexName);
				await index.setSettings(settings);
				console.log(`✅ Configured index: ${indexName}`);
			}

			// Configure replica indices
			for (const [replicaName, settings] of Object.entries(replicaSettings)) {
				const replica = client.initIndex(replicaName);
				await replica.setSettings(settings);
				console.log(`✅ Configured replica: ${replicaName}`);
			}

			console.log("🎉 All Algolia indices configured successfully");
		} catch (error) {
			console.error("❌ Failed to configure Algolia indices:", error);
			throw error;
		}
	}

	/**
	 * Check if Algolia is properly configured
	 */
	static isConfigured(): boolean {
		try {
			return !!(
				process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
				process.env.ALGOLIA_ADMIN_KEY &&
				process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
			);
		} catch {
			return false;
		}
	}

	/**
	 * Get search configuration for frontend
	 */
	static getSearchConfig() {
		return {
			appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
			searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
			indexNames: AlgoliaConfig.getIndexNames(),
			isConfigured: AlgoliaConfig.isConfigured(),
		};
	}
}

export default AlgoliaConfig;
