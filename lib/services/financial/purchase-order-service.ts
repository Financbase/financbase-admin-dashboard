/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { sql } from "@/lib/neon";
import { Clock, Phone } from "lucide-react";

export interface PurchaseOrder {
	id: number;
	poNumber: string;
	vendorId: number;
	status: string;
	orderDate: Date;
	expectedDelivery?: Date;
	totalAmount: number;
	notes?: string;
	createdBy: string;
	approvedBy?: string;
	approvedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface PurchaseOrderItem {
	id: number;
	poId: number;
	productId: string;
	productName: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	receivedQuantity: number;
	createdAt: Date;
}

export interface Vendor {
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

export interface CreatePurchaseOrderData {
	vendorId: number;
	items: Array<{
		productId: string;
		productName: string;
		description?: string;
		quantity: number;
		unitPrice: number;
	}>;
	notes?: string;
	expectedDelivery?: Date;
}

export interface UpdatePurchaseOrderData {
	vendorId?: number;
	status?: string;
	notes?: string;
	expectedDelivery?: Date;
	items?: Array<{
		id?: number;
		productId: string;
		productName: string;
		description?: string;
		quantity: number;
		unitPrice: number;
	}>;
}

/**
 * Purchase Order Service
 * Handles all purchase order related operations
 */
export class PurchaseOrderService {
	/**
	 * Get all purchase orders with optional filtering
	 */
	async getPurchaseOrders(
		options: {
			status?: string;
			vendorId?: number;
			limit?: number;
			offset?: number;
		} = {},
	) {
		const { status, vendorId, limit = 50, offset = 0 } = options;

		let query = `
			SELECT po.*, v.name as vendor_name, v.email as vendor_email
			FROM cms.purchase_orders po
			LEFT JOIN cms.vendors v ON po.vendor_id = v.id
		`;
		const params: any[] = [];
		let paramCount = 0;

		const whereConditions: string[] = [];

		if (status) {
			paramCount++;
			whereConditions.push(`po.status = $${paramCount}`);
			params.push(status);
		}

		if (vendorId) {
			paramCount++;
			whereConditions.push(`po.vendor_id = $${paramCount}`);
			params.push(vendorId);
		}

		if (whereConditions.length > 0) {
			query += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		query += ` ORDER BY po.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
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

		return {
			purchaseOrders: result.rows,
			pagination: {
				total: Number.parseInt(countResult.rows[0].total),
				limit,
				offset,
				hasMore: offset + limit < Number.parseInt(countResult.rows[0].total),
			},
		};
	}

	/**
	 * Get a specific purchase order with its items
	 */
	async getPurchaseOrder(id: number) {
		// Get purchase order with vendor details
		const poResult = await sql.query(
			`SELECT po.*, v.name as vendor_name, v.email as vendor_email,
              v.phone as vendor_phone, v.address as vendor_address
       FROM cms.purchase_orders po
       LEFT JOIN cms.vendors v ON po.vendor_id = v.id
       WHERE po.id = $1`,
			[id],
		);

		if (poResult.rows.length === 0) {
			throw new Error("Purchase order not found");
		}

		const purchaseOrder = poResult.rows[0];

		// Get purchase order items
		const itemsResult = await sql.query(
			"SELECT * FROM cms.purchase_order_items WHERE po_id = $1 ORDER BY created_at",
			[id],
		);

		return {
			...purchaseOrder,
			items: itemsResult.rows,
		};
	}

	/**
	 * Create a new purchase order
	 */
	async createPurchaseOrder(data: CreatePurchaseOrderData, createdBy: string) {
		// Generate PO number
		const poNumberResult = await sql.query(
			"SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM '[0-9]+$') AS INTEGER)), 0) + 1 as next_number FROM cms.purchase_orders WHERE po_number ~ '^[A-Z]+[0-9]+$'",
		);
		const nextNumber = poNumberResult.rows[0].next_number;
		const poNumber = `PO${nextNumber.toString().padStart(6, "0")}`;

		// Calculate total amount
		const totalAmount = data.items.reduce(
			(sum, item) => sum + item.quantity * item.unitPrice,
			0,
		);

		// Create purchase order
		const poResult = await sql.query(
			`INSERT INTO cms.purchase_orders
       (po_number, vendor_id, status, total_amount, notes, expected_delivery, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
			[
				poNumber,
				data.vendorId,
				"draft",
				totalAmount,
				data.notes || null,
				data.expectedDelivery || null,
				createdBy,
			],
		);

		const purchaseOrder = poResult.rows[0];

		// Create purchase order items
		for (const item of data.items) {
			await sql.query(
				`INSERT INTO cms.purchase_order_items
         (po_id, product_id, product_name, description, quantity, unit_price, total_price, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
				[
					purchaseOrder.id,
					item.productId,
					item.productName,
					item.description || null,
					item.quantity,
					item.unitPrice,
					item.quantity * item.unitPrice,
				],
			);
		}

		return purchaseOrder;
	}

	/**
	 * Update a purchase order
	 */
	async updatePurchaseOrder(id: number, data: UpdatePurchaseOrderData) {
		// Build update query
		const updates: string[] = [];
		const params: any[] = [];
		let paramCount = 0;

		if (data.vendorId !== undefined) {
			paramCount++;
			updates.push(`vendor_id = $${paramCount}`);
			params.push(data.vendorId);
		}

		if (data.status !== undefined) {
			paramCount++;
			updates.push(`status = $${paramCount}`);
			params.push(data.status);
		}

		if (data.notes !== undefined) {
			paramCount++;
			updates.push(`notes = $${paramCount}`);
			params.push(data.notes);
		}

		if (data.expectedDelivery !== undefined) {
			paramCount++;
			updates.push(`expected_delivery = $${paramCount}`);
			params.push(data.expectedDelivery);
		}

		// Always update updated_at
		paramCount++;
		updates.push(`updated_at = $${paramCount}`);
		params.push(new Date());

		// Add ID parameter
		params.push(id);

		// Update purchase order
		await sql.query(
			`UPDATE cms.purchase_orders SET ${updates.join(", ")} WHERE id = $${paramCount + 1}`,
			params,
		);

		// Handle items update if provided
		if (data.items) {
			// Delete existing items
			await sql.query("DELETE FROM cms.purchase_order_items WHERE po_id = $1", [
				id,
			]);

			// Insert new items
			for (const item of data.items) {
				await sql.query(
					`INSERT INTO cms.purchase_order_items
           (po_id, product_id, product_name, description, quantity, unit_price, total_price, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
					[
						id,
						item.productId,
						item.productName,
						item.description || null,
						item.quantity,
						item.unitPrice,
						item.quantity * item.unitPrice,
					],
				);
			}

			// Recalculate total amount
			const totalAmount = data.items.reduce(
				(sum, item) => sum + item.quantity * item.unitPrice,
				0,
			);

			await sql.query(
				"UPDATE cms.purchase_orders SET total_amount = $1, updated_at = NOW() WHERE id = $2",
				[totalAmount, id],
			);
		}
	}

	/**
	 * Approve a purchase order
	 */
	async approvePurchaseOrder(id: number, approvedBy: string, notes?: string) {
		await sql.query(
			`UPDATE cms.purchase_orders
       SET status = 'approved',
           approved_by = $1,
           approved_at = NOW(),
           approval_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND status IN ('pending', 'submitted')`,
			[approvedBy, notes || null, id],
		);
	}

	/**
	 * Cancel a purchase order
	 */
	async cancelPurchaseOrder(id: number) {
		await sql.query(
			`UPDATE cms.purchase_orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1`,
			[id],
		);
	}

	/**
	 * Get vendors list
	 */
	async getVendors() {
		const result = await sql.query(
			"SELECT * FROM cms.vendors WHERE status = 'active' ORDER BY name",
		);
		return result.rows;
	}

	/**
	 * Get purchase order statistics
	 */
	async getPurchaseOrderStats() {
		const result = await sql.query(`
			SELECT
				COUNT(*) as total_orders,
				COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_orders,
				COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
				COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_orders,
				COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
				COALESCE(SUM(total_amount), 0) as total_amount,
				COALESCE(SUM(CASE WHEN status = 'approved' THEN total_amount END), 0) as approved_amount
			FROM cms.purchase_orders
		`);

		return result.rows[0];
	}
}

// Export singleton instance
export const purchaseOrderService = new PurchaseOrderService();
