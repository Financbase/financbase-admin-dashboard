import { sql } from "@/lib/neon";
import { Clock, Key, Phone, Trash2 } from "lucide-react";

export interface MarketplaceProduct {
	id: string;
	sku?: string;
	name: string;
	description?: string;
	category?: string;
	unitOfMeasure?: string;
	unitPrice?: number;
	costPrice?: number;
	reorderPoint?: number;
	reorderQuantity?: number;
	totalQuantity?: number;
	totalAvailable?: number;
	status: string;
	notes?: string;
	createdBy?: string;
	organizationId?: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface MarketplaceVendor {
	id: number;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	taxId?: string;
	paymentTerms?: string;
	status: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface MarketplaceOrder {
	id: number;
	orderNumber: string;
	vendorId: number;
	vendorName: string;
	status: string;
	totalAmount: number;
	orderDate: Date;
	expectedDelivery?: Date;
	items: MarketplaceOrderItem[];
	notes?: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface MarketplaceOrderItem {
	id: number;
	orderId: number;
	productId: string;
	productName: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	receivedQuantity: number;
	createdAt: Date;
}

/**
 * Marketplace Service
 * Provides unified interface for products, vendors, and marketplace operations
 */
export class MarketplaceService {
	/**
	 * Get all products with optional filtering
	 */
	async getProducts(
		filters: {
			category?: string;
			status?: string;
			search?: string;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<{
		products: MarketplaceProduct[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	}> {
		const { category, status, search, limit = 50, offset = 0 } = filters;

		let query = "SELECT * FROM cms.products WHERE 1=1";
		const params: (string | number | null)[] = [];
		let paramCount = 0;

		const whereConditions: string[] = [];

		if (category) {
			paramCount++;
			whereConditions.push(`category = $${paramCount}`);
			params.push(category);
		}

		if (status) {
			paramCount++;
			whereConditions.push(`status = $${paramCount}`);
			params.push(status);
		}

		if (search) {
			paramCount++;
			whereConditions.push(
				`(name ILIKE $${paramCount} OR description ILIKE $${paramCount} OR sku ILIKE $${paramCount})`,
			);
			params.push(`%${search}%`);
		}

		if (whereConditions.length > 0) {
			query += ` AND ${whereConditions.join(" AND ")}`;
		}

		query += ` ORDER BY name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
		params.push(limit, offset);

		const result = await sql.query(query, params);

		// Get total count
		let countQuery = "SELECT COUNT(*) as total FROM cms.products WHERE 1=1";
		if (whereConditions.length > 0) {
			countQuery += ` AND ${whereConditions.join(" AND ")}`;
		}

		const countResult = await sql.query(
			countQuery,
			params.slice(0, paramCount),
		);

		return {
			products: result.rows,
			pagination: {
				total: Number.parseInt(countResult.rows[0].total),
				limit,
				offset,
				hasMore: offset + limit < Number.parseInt(countResult.rows[0].total),
			},
		};
	}

	/**
	 * Get a specific product by ID
	 */
	async getProduct(id: string): Promise<MarketplaceProduct | null> {
		const result = await sql.query("SELECT * FROM cms.products WHERE id = $1", [
			id,
		]);

		return result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Create a new product
	 */
	async createProduct(
		data: Omit<MarketplaceProduct, "id" | "createdAt" | "updatedAt">,
		createdBy: string,
	): Promise<MarketplaceProduct> {
		const result = await sql.query(
			`INSERT INTO cms.products
       (sku, name, description, category, unit_of_measure, unit_price, cost_price,
        reorder_point, reorder_quantity, total_quantity, total_available, status, notes, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING *`,
			[
				data.sku || null,
				data.name,
				data.description || null,
				data.category || null,
				data.unitOfMeasure || null,
				data.unitPrice || null,
				data.costPrice || null,
				data.reorderPoint || null,
				data.reorderQuantity || null,
				data.totalQuantity || 0,
				data.totalAvailable || 0,
				data.status,
				data.notes || null,
				createdBy,
			],
		);

		return result.rows[0];
	}

	/**
	 * Update a product
	 */
	async updateProduct(
		id: string,
		data: Partial<Omit<MarketplaceProduct, "id" | "createdAt" | "updatedAt">>,
	): Promise<MarketplaceProduct> {
		const updates: string[] = [];
		const params: (string | number | null | Date)[] = [];
		let paramCount = 0;

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				paramCount++;
				updates.push(`${key} = $${paramCount}`);
				params.push(value);
			}
		});

		// Always update updated_at
		paramCount++;
		updates.push(`updated_at = $${paramCount}`);
		params.push(new Date());

		// Add ID parameter
		params.push(id);

		const result = await sql.query(
			`UPDATE cms.products SET ${updates.join(", ")} WHERE id = $${paramCount + 1} RETURNING *`,
			params,
		);

		if (result.rows.length === 0) {
			throw new Error("Product not found");
		}

		return result.rows[0];
	}

	/**
	 * Delete a product (soft delete)
	 */
	async deleteProduct(id: string): Promise<void> {
		await sql.query(
			"UPDATE cms.products SET status = 'inactive', updated_at = NOW() WHERE id = $1",
			[id],
		);
	}

	/**
	 * Get all vendors
	 */
	async getVendors(): Promise<MarketplaceVendor[]> {
		const result = await sql.query(
			"SELECT * FROM cms.vendors WHERE status = 'active' ORDER BY name",
		);
		return result.rows;
	}

	/**
	 * Get a specific vendor by ID
	 */
	async getVendor(id: number): Promise<MarketplaceVendor | null> {
		const result = await sql.query("SELECT * FROM cms.vendors WHERE id = $1", [
			id,
		]);

		return result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Create a new vendor
	 */
	async createVendor(
		data: Omit<MarketplaceVendor, "id" | "createdAt" | "updatedAt">,
	): Promise<MarketplaceVendor> {
		const result = await sql.query(
			`INSERT INTO cms.vendors
       (name, email, phone, address, city, state, zip_code, country, tax_id, payment_terms, status, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
			[
				data.name,
				data.email || null,
				data.phone || null,
				data.address || null,
				data.city || null,
				data.state || null,
				data.zipCode || null,
				data.country || null,
				data.taxId || null,
				data.paymentTerms || null,
				data.status,
				data.notes || null,
			],
		);

		return result.rows[0];
	}

	/**
	 * Update a vendor
	 */
	async updateVendor(
		id: number,
		data: Partial<Omit<MarketplaceVendor, "id" | "createdAt" | "updatedAt">>,
	): Promise<MarketplaceVendor> {
		const updates: string[] = [];
		const params: (string | number | null | Date)[] = [];
		let paramCount = 0;

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				paramCount++;
				updates.push(`${key} = $${paramCount}`);
				params.push(value);
			}
		});

		// Always update updated_at
		paramCount++;
		updates.push(`updated_at = $${paramCount}`);
		params.push(new Date());

		// Add ID parameter
		params.push(id);

		const result = await sql.query(
			`UPDATE cms.vendors SET ${updates.join(", ")} WHERE id = $${paramCount + 1} RETURNING *`,
			params,
		);

		if (result.rows.length === 0) {
			throw new Error("Vendor not found");
		}

		return result.rows[0];
	}

	/**
	 * Get purchase orders for marketplace
	 */
	async getPurchaseOrders(
		filters: {
			vendorId?: number;
			status?: string;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<{
		orders: MarketplaceOrder[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	}> {
		const { vendorId, status, limit = 50, offset = 0 } = filters;

		let query = `
			SELECT po.*, v.name as vendor_name,
						 COUNT(poi.id) as item_count,
						 COALESCE(SUM(poi.total_price), 0) as calculated_total
			FROM cms.purchase_orders po
			LEFT JOIN cms.vendors v ON po.vendor_id = v.id
			LEFT JOIN cms.purchase_order_items poi ON po.id = poi.po_id
		`;
		const params: (string | number | null)[] = [];
		let paramCount = 0;

		const whereConditions: string[] = [];

		if (vendorId) {
			paramCount++;
			whereConditions.push(`po.vendor_id = $${paramCount}`);
			params.push(vendorId);
		}

		if (status) {
			paramCount++;
			whereConditions.push(`po.status = $${paramCount}`);
			params.push(status);
		}

		if (whereConditions.length > 0) {
			query += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		query += `
			GROUP BY po.id, v.name
			ORDER BY po.created_at DESC
			LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
		`;
		params.push(limit, offset);

		const result = await sql.query(query, params);

		// Get total count
		let countQuery = "SELECT COUNT(*) as total FROM cms.purchase_orders po";
		if (whereConditions.length > 0) {
			countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		const countResult = await sql.query(
			countQuery,
			params.slice(0, paramCount),
		);

		// Get items for each order
		const ordersWithItems = await Promise.all(
			result.rows.map(async (order) => {
				const itemsResult = await sql.query(
					"SELECT * FROM cms.purchase_order_items WHERE po_id = $1 ORDER BY created_at",
					[order.id],
				);

				return {
					...order,
					items: itemsResult.rows,
				};
			}),
		);

		return {
			orders: ordersWithItems,
			pagination: {
				total: Number.parseInt(countResult.rows[0].total),
				limit,
				offset,
				hasMore: offset + limit < Number.parseInt(countResult.rows[0].total),
			},
		};
	}

	/**
	 * Get marketplace statistics
	 */
	async getMarketplaceStats(): Promise<{
		totalProducts: number;
		activeProducts: number;
		totalVendors: number;
		activeVendors: number;
		totalOrders: number;
		pendingOrders: number;
		approvedOrders: number;
		totalOrderValue: number;
	}> {
		const result = await sql.query(`
			SELECT
				(SELECT COUNT(*) FROM cms.products) as total_products,
				(SELECT COUNT(*) FROM cms.products WHERE status = 'active') as active_products,
				(SELECT COUNT(*) FROM cms.vendors) as total_vendors,
				(SELECT COUNT(*) FROM cms.vendors WHERE status = 'active') as active_vendors,
				(SELECT COUNT(*) FROM cms.purchase_orders) as total_orders,
				(SELECT COUNT(*) FROM cms.purchase_orders WHERE status = 'pending') as pending_orders,
				(SELECT COUNT(*) FROM cms.purchase_orders WHERE status = 'approved') as approved_orders,
				(SELECT COALESCE(SUM(total_amount), 0) FROM cms.purchase_orders WHERE status = 'approved') as total_order_value
		`);

		return result.rows[0];
	}

	/**
	 * Search across products and vendors
	 */
	async search(
		query: string,
		filters: {
			entityTypes?: string[];
			limit?: number;
			offset?: number;
		} = {},
	): Promise<{
		products: MarketplaceProduct[];
		vendors: MarketplaceVendor[];
		total: number;
	}> {
		const {
			entityTypes = ["products", "vendors"],
			limit = 50,
			offset = 0,
		} = filters;

		const searchTerm = `%${query}%`;
		let products: MarketplaceProduct[] = [];
		let vendors: MarketplaceVendor[] = [];

		// Search products
		if (entityTypes.includes("products")) {
			const productResult = await sql.query(
				`SELECT * FROM cms.products
         WHERE name ILIKE $1 OR description ILIKE $1 OR sku ILIKE $1
         ORDER BY name
         LIMIT $2 OFFSET $3`,
				[searchTerm, limit, offset],
			);
			products = productResult.rows;
		}

		// Search vendors
		if (entityTypes.includes("vendors")) {
			const vendorResult = await sql.query(
				`SELECT * FROM cms.vendors
         WHERE name ILIKE $1 OR email ILIKE $1
         ORDER BY name
         LIMIT $2 OFFSET $3`,
				[searchTerm, limit, offset],
			);
			vendors = vendorResult.rows;
		}

		return {
			products,
			vendors,
			total: products.length + vendors.length,
		};
	}
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();
