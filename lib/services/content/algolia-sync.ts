import { algoliasearch } from "algoliasearch";
import AlgoliaConfig from "./algolia-config";

interface SyncOptions {
	retryAttempts?: number;
	retryDelay?: number;
	batchSize?: number;
	dryRun?: boolean;
}

interface SyncResult {
	success: boolean;
	indexed: number;
	errors: string[];
	executionTime: number;
}

interface SyncQueueItem {
	id: string;
	operation: "create" | "update" | "delete";
	entityType: string;
	entityId: string;
	data?: any;
	timestamp: Date;
	retryCount: number;
}

/**
 * Real-time Algolia Sync Service
 * Handles synchronization of entities to Algolia indices
 */
export class AlgoliaSyncService {
	private client: any;
	private indexNames: Record<string, string>;
	private syncQueue: SyncQueueItem[] = [];
	private isProcessing = false;
	private retryQueue: SyncQueueItem[] = [];

	constructor() {
		this.client = AlgoliaConfig.getClient();
		this.indexNames = AlgoliaConfig.getIndexNames();
	}

	/**
	 * Sync product to Algolia
	 */
	async syncProductToAlgolia(
		product: any,
		operation: "create" | "update" | "delete" = "update",
		options: SyncOptions = {},
	): Promise<SyncResult> {
		const startTime = Date.now();
		const { retryAttempts = 3, retryDelay = 1000, dryRun = false } = options;

		try {
			if (dryRun) {
				console.log(`[DRY RUN] Would ${operation} product:`, product.id);
				return {
					success: true,
					indexed: 1,
					errors: [],
					executionTime: Date.now() - startTime,
				};
			}

			const indexName = this.indexNames.products;
			const index = this.client.initIndex(indexName);

			// Prepare product data for Algolia
			const algoliaProduct = {
				objectID: product.id,
				name: product.name,
				description: product.description,
				category: product.category,
				sku: product.sku,
				unit_price: product.unit_price,
				cost_price: product.cost_price,
				total_quantity: product.total_quantity,
				total_available: product.total_available,
				status: product.status,
				notes: product.notes,
				tags: product.tags || [],
				entity_type: "product",
				created_at: product.created_at,
				updated_at: product.updated_at,
				_tags: ["product", product.category, product.status],
			};

			if (operation === "delete") {
				await index.deleteObject(product.id);
			} else {
				await index.saveObject(algoliaProduct);
			}

			console.log(`✅ ${operation}d product ${product.id} in Algolia`);

			return {
				success: true,
				indexed: 1,
				errors: [],
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error(`❌ Failed to ${operation} product ${product.id}:`, error);

			// Add to retry queue
			this.addToRetryQueue({
				id: `product-${product.id}`,
				operation,
				entityType: "product",
				entityId: product.id,
				data: product,
				timestamp: new Date(),
				retryCount: 0,
			});

			return {
				success: false,
				indexed: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Sync vendor to Algolia
	 */
	async syncVendorToAlgolia(
		vendor: any,
		operation: "create" | "update" | "delete" = "update",
		options: SyncOptions = {},
	): Promise<SyncResult> {
		const startTime = Date.now();
		const { dryRun = false } = options;

		try {
			if (dryRun) {
				console.log(`[DRY RUN] Would ${operation} vendor:`, vendor.id);
				return {
					success: true,
					indexed: 1,
					errors: [],
					executionTime: Date.now() - startTime,
				};
			}

			const indexName = this.indexNames.vendors;
			const index = this.client.initIndex(indexName);

			// Prepare vendor data for Algolia
			const algoliaVendor = {
				objectID: vendor.id,
				company_name: vendor.company_name,
				contact_person: vendor.contact_person,
				email: vendor.email,
				phone: vendor.phone,
				address: vendor.address,
				city: vendor.city,
				state: vendor.state,
				country: vendor.country,
				vendor_type: vendor.vendor_type,
				status: vendor.status,
				entity_type: "vendor",
				created_at: vendor.created_at,
				updated_at: vendor.updated_at,
				_tags: ["vendor", vendor.vendor_type, vendor.status],
			};

			if (operation === "delete") {
				await index.deleteObject(vendor.id);
			} else {
				await index.saveObject(algoliaVendor);
			}

			console.log(`✅ ${operation}d vendor ${vendor.id} in Algolia`);

			return {
				success: true,
				indexed: 1,
				errors: [],
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error(`❌ Failed to ${operation} vendor ${vendor.id}:`, error);

			this.addToRetryQueue({
				id: `vendor-${vendor.id}`,
				operation,
				entityType: "vendor",
				entityId: vendor.id,
				data: vendor,
				timestamp: new Date(),
				retryCount: 0,
			});

			return {
				success: false,
				indexed: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Sync customer to Algolia
	 */
	async syncCustomerToAlgolia(
		customer: any,
		operation: "create" | "update" | "delete" = "update",
		options: SyncOptions = {},
	): Promise<SyncResult> {
		const startTime = Date.now();
		const { dryRun = false } = options;

		try {
			if (dryRun) {
				console.log(`[DRY RUN] Would ${operation} customer:`, customer.id);
				return {
					success: true,
					indexed: 1,
					errors: [],
					executionTime: Date.now() - startTime,
				};
			}

			const indexName = this.indexNames.customers;
			const index = this.client.initIndex(indexName);

			// Prepare customer data for Algolia
			const algoliaCustomer = {
				objectID: customer.id,
				first_name: customer.first_name,
				last_name: customer.last_name,
				email: customer.email,
				phone: customer.phone,
				company: customer.company,
				address: customer.address,
				city: customer.city,
				state: customer.state,
				country: customer.country,
				status: customer.status,
				entity_type: "customer",
				created_at: customer.created_at,
				updated_at: customer.updated_at,
				_tags: ["customer", customer.status],
			};

			if (operation === "delete") {
				await index.deleteObject(customer.id);
			} else {
				await index.saveObject(algoliaCustomer);
			}

			console.log(`✅ ${operation}d customer ${customer.id} in Algolia`);

			return {
				success: true,
				indexed: 1,
				errors: [],
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error(
				`❌ Failed to ${operation} customer ${customer.id}:`,
				error,
			);

			this.addToRetryQueue({
				id: `customer-${customer.id}`,
				operation,
				entityType: "customer",
				entityId: customer.id,
				data: customer,
				timestamp: new Date(),
				retryCount: 0,
			});

			return {
				success: false,
				indexed: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Remove entity from Algolia
	 */
	async removeFromAlgolia(
		entityType: string,
		entityId: string,
		options: SyncOptions = {},
	): Promise<SyncResult> {
		const startTime = Date.now();
		const { dryRun = false } = options;

		try {
			if (dryRun) {
				console.log(`[DRY RUN] Would remove ${entityType}:`, entityId);
				return {
					success: true,
					indexed: 1,
					errors: [],
					executionTime: Date.now() - startTime,
				};
			}

			const indexName = this.getIndexNameForEntityType(entityType);
			const index = this.client.initIndex(indexName);

			await index.deleteObject(entityId);
			console.log(`✅ Removed ${entityType} ${entityId} from Algolia`);

			return {
				success: true,
				indexed: 1,
				errors: [],
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error(`❌ Failed to remove ${entityType} ${entityId}:`, error);

			return {
				success: false,
				indexed: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Batch sync multiple entities
	 */
	async batchSync(
		entities: Array<{
			entityType: string;
			entity: any;
			operation: "create" | "update" | "delete";
		}>,
		options: SyncOptions = {},
	): Promise<SyncResult> {
		const startTime = Date.now();
		const { batchSize = 100, dryRun = false } = options;
		const results: SyncResult[] = [];
		const errors: string[] = [];

		try {
			// Group entities by type for batch operations
			const groupedEntities = entities.reduce(
				(acc, item) => {
					if (!acc[item.entityType]) {
						acc[item.entityType] = [];
					}
					acc[item.entityType].push(item);
					return acc;
				},
				{} as Record<string, typeof entities>,
			);

			// Process each entity type in batches
			for (const [entityType, entityGroup] of Object.entries(groupedEntities)) {
				const indexName = this.getIndexNameForEntityType(entityType);
				const index = this.client.initIndex(indexName);

				// Process in batches
				for (let i = 0; i < entityGroup.length; i += batchSize) {
					const batch = entityGroup.slice(i, i + batchSize);
					const algoliaObjects = batch
						.filter((item) => item.operation !== "delete")
						.map((item) =>
							this.prepareEntityForAlgolia(item.entityType, item.entity),
						);

					const deleteIds = batch
						.filter((item) => item.operation === "delete")
						.map((item) => item.entity.id);

					if (algoliaObjects.length > 0) {
						await index.saveObjects(algoliaObjects);
					}

					if (deleteIds.length > 0) {
						await index.deleteObjects(deleteIds);
					}
				}
			}

			console.log(`✅ Batch synced ${entities.length} entities to Algolia`);

			return {
				success: true,
				indexed: entities.length,
				errors: [],
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error("❌ Batch sync failed:", error);

			return {
				success: false,
				indexed: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Process retry queue
	 */
	async processRetryQueue(): Promise<void> {
		if (this.isProcessing || this.retryQueue.length === 0) return;

		this.isProcessing = true;
		console.log(`🔄 Processing ${this.retryQueue.length} retry items`);

		const itemsToProcess = [...this.retryQueue];
		this.retryQueue = [];

		for (const item of itemsToProcess) {
			try {
				let result: SyncResult;

				switch (item.entityType) {
					case "product":
						result = await this.syncProductToAlgolia(item.data, item.operation);
						break;
					case "vendor":
						result = await this.syncVendorToAlgolia(item.data, item.operation);
						break;
					case "customer":
						result = await this.syncCustomerToAlgolia(
							item.data,
							item.operation,
						);
						break;
					default:
						result = await this.removeFromAlgolia(
							item.entityType,
							item.entityId,
						);
				}

				if (!result.success && item.retryCount < 3) {
					// Re-queue for retry
					this.addToRetryQueue({
						...item,
						retryCount: item.retryCount + 1,
					});
				}
			} catch (error) {
				console.error(
					`❌ Retry failed for ${item.entityType} ${item.entityId}:`,
					error,
				);
			}
		}

		this.isProcessing = false;
	}

	/**
	 * Add item to retry queue
	 */
	private addToRetryQueue(item: SyncQueueItem): void {
		this.retryQueue.push(item);

		// Process queue after a short delay
		setTimeout(() => this.processRetryQueue(), 5000);
	}

	/**
	 * Get index name for entity type
	 */
	private getIndexNameForEntityType(entityType: string): string {
		const typeMap: Record<string, string> = {
			product: this.indexNames.products,
			vendor: this.indexNames.vendors,
			customer: this.indexNames.customers,
			post: this.indexNames.posts,
			landingPage: this.indexNames.landingPages,
		};

		return typeMap[entityType] || this.indexNames.products;
	}

	/**
	 * Prepare entity data for Algolia
	 */
	private prepareEntityForAlgolia(entityType: string, entity: any): any {
		const baseData = {
			objectID: entity.id,
			entity_type: entityType,
			created_at: entity.created_at,
			updated_at: entity.updated_at,
		};

		switch (entityType) {
			case "product":
				return {
					...baseData,
					name: entity.name,
					description: entity.description,
					category: entity.category,
					sku: entity.sku,
					unit_price: entity.unit_price,
					cost_price: entity.cost_price,
					total_quantity: entity.total_quantity,
					total_available: entity.total_available,
					status: entity.status,
					notes: entity.notes,
					tags: entity.tags || [],
					_tags: ["product", entity.category, entity.status],
				};

			case "vendor":
				return {
					...baseData,
					company_name: entity.company_name,
					contact_person: entity.contact_person,
					email: entity.email,
					phone: entity.phone,
					address: entity.address,
					city: entity.city,
					state: entity.state,
					country: entity.country,
					vendor_type: entity.vendor_type,
					status: entity.status,
					_tags: ["vendor", entity.vendor_type, entity.status],
				};

			case "customer":
				return {
					...baseData,
					first_name: entity.first_name,
					last_name: entity.last_name,
					email: entity.email,
					phone: entity.phone,
					company: entity.company,
					address: entity.address,
					city: entity.city,
					state: entity.state,
					country: entity.country,
					status: entity.status,
					_tags: ["customer", entity.status],
				};

			default:
				return { ...baseData, ...entity };
		}
	}

	/**
	 * Get sync queue status
	 */
	getQueueStatus(): {
		pending: number;
		retry: number;
		isProcessing: boolean;
	} {
		return {
			pending: this.syncQueue.length,
			retry: this.retryQueue.length,
			isProcessing: this.isProcessing,
		};
	}

	/**
	 * Clear sync queues
	 */
	clearQueues(): void {
		this.syncQueue = [];
		this.retryQueue = [];
	}
}

// Export singleton instance
export const algoliaSyncService = new AlgoliaSyncService();
export default AlgoliaSyncService;
