/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, sql, gte, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserFromDatabase } from "@/lib/db/rls-context";

export interface OrderItem {
	productId: string;
	name: string;
	quantity: number;
	price: string;
	total: string;
}

export interface CreateOrderInput {
	customerId?: string;
	orderNumber?: string;
	products: OrderItem[];
	status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	priority?: "low" | "normal" | "high" | "urgent";
	shippingAddress?: Record<string, any>;
	billingAddress?: Record<string, any>;
	shippingMethod?: string;
	dueDate?: Date;
	notes?: string;
	tags?: string[];
}

export interface UpdateOrderInput extends Partial<CreateOrderInput> {
	id: string;
}

export interface OrderFilters {
	search?: string;
	status?: string;
	customerId?: string;
	dateFrom?: Date;
	dateTo?: Date;
}

/**
 * Orders Service - Handles all order-related operations
 */
export class OrdersService {
	/**
	 * Generate unique order number
	 */
	private async generateOrderNumber(userId: string): Promise<string> {
		const year = new Date().getFullYear();
		const month = String(new Date().getMonth() + 1).padStart(2, "0");

		const lastOrder = await db
			.select()
			.from(orders)
			.where(eq(orders.userId, userId))
			.orderBy(desc(orders.createdAt))
			.limit(1);

		let sequence = 1;
		if (lastOrder.length > 0 && lastOrder[0].orderNumber) {
			const parts = lastOrder[0].orderNumber.split("-");
			const lastPart = parts[parts.length - 1];
			sequence = parseInt(lastPart || "1", 10) + 1;
		}

		return `ORD-${year}${month}-${String(sequence).padStart(4, "0")}`;
	}

	/**
	 * Get all orders
	 */
	async getAll(filters?: OrderFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(orders).where(eq(orders.userId, userId));

		if (filters) {
			if (filters.search) {
				query = query.where(
					and(
						eq(orders.userId, userId),
						or(
							ilike(orders.orderNumber, `%${filters.search}%`),
							ilike(orders.poNumber || sql`''`, `%${filters.search}%`)
						)
					)
				);
			}

			if (filters.status) {
				query = query.where(
					and(eq(orders.userId, userId), eq(orders.status, filters.status as any))
				);
			}

			if (filters.customerId) {
				query = query.where(
					and(eq(orders.userId, userId), eq(orders.customerId, filters.customerId))
				);
			}

			if (filters.dateFrom || filters.dateTo) {
				const conditions = [eq(orders.userId, userId)];
				if (filters.dateFrom) {
					conditions.push(gte(orders.orderDate, filters.dateFrom));
				}
				if (filters.dateTo) {
					conditions.push(lte(orders.orderDate, filters.dateTo));
				}
				query = query.where(and(...conditions));
			}
		}

		const results = await query.orderBy(desc(orders.createdAt));
		return results;
	}

	/**
	 * Get order by ID
	 */
	async getById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(orders)
			.where(and(eq(orders.id, id), eq(orders.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Order not found");
		}

		return result[0];
	}

	/**
	 * Create a new order
	 */
	async create(input: CreateOrderInput) {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			throw new Error("Unauthorized");
		}

		// Get organizationId from user context
		const user = await getUserFromDatabase(clerkId);
		if (!user) {
			throw new Error("User not found in database");
		}
		const organizationId = user.organization_id || null;
		if (!organizationId) {
			throw new Error("User organization not found");
		}

		const orderNumber = input.orderNumber || (await this.generateOrderNumber(clerkId));

		const totalAmount = input.products.reduce(
			(sum, item) => sum + parseFloat(item.total),
			0
		);
		const subtotal = totalAmount;
		const tax = 0;
		const shipping = 0;
		const discount = 0;

		const newOrder = {
			userId: clerkId,
			organizationId,
			customerId: input.customerId,
			orderNumber,
			status: input.status || "pending",
			priority: input.priority || "normal",
			products: JSON.stringify(input.products),
			totalAmount: totalAmount.toString(),
			subtotal: subtotal.toString(),
			tax: tax.toString(),
			shipping: shipping.toString(),
			discount: discount.toString(),
			shippingAddress: input.shippingAddress ? JSON.stringify(input.shippingAddress) : null,
			billingAddress: input.billingAddress ? JSON.stringify(input.billingAddress) : null,
			shippingMethod: input.shippingMethod,
			dueDate: input.dueDate,
			notes: input.notes,
			tags: input.tags ? JSON.stringify(input.tags) : null,
		};

		const result = await db.insert(orders).values(newOrder).returning();
		return result[0];
	}

	/**
	 * Update an order
	 */
	async update(input: UpdateOrderInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.status !== undefined) updateData.status = input.status;
		if (input.priority !== undefined) updateData.priority = input.priority;
		if (input.products !== undefined) {
			updateData.products = JSON.stringify(input.products);
			const totalAmount = input.products.reduce(
				(sum, item) => sum + parseFloat(item.total),
				0
			);
			updateData.totalAmount = totalAmount.toString();
		}
		if (input.shippingAddress !== undefined)
			updateData.shippingAddress = JSON.stringify(input.shippingAddress);
		if (input.billingAddress !== undefined)
			updateData.billingAddress = JSON.stringify(input.billingAddress);
		if (input.shippingMethod !== undefined) updateData.shippingMethod = input.shippingMethod;
		if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);

		const result = await db
			.update(orders)
			.set(updateData)
			.where(and(eq(orders.id, input.id), eq(orders.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Cancel an order
	 */
	async cancel(id: string) {
		return this.update({ id, status: "cancelled" });
	}

	/**
	 * Fulfill an order (mark as shipped)
	 */
	async fulfill(id: string, trackingNumber?: string, carrier?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const updateData: any = {
			status: "shipped",
			shippedDate: new Date(),
			updatedAt: new Date(),
		};

		if (trackingNumber) updateData.trackingNumber = trackingNumber;
		if (carrier) updateData.carrier = carrier;

		const result = await db
			.update(orders)
			.set(updateData)
			.where(and(eq(orders.id, id), eq(orders.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Get orders by status
	 */
	async getByStatus(status: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(orders)
			.where(and(eq(orders.userId, userId), eq(orders.status, status as any)))
			.orderBy(desc(orders.createdAt));

		return results;
	}

	/**
	 * Get analytics
	 */
	async getAnalytics() {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const allOrders = await this.getAll();

		const statusStats = await db
			.select({
				status: orders.status,
				count: sql<number>`count(*)`.as("count"),
				total: sql<number>`sum(${orders.totalAmount}::numeric)`.as("total"),
			})
			.from(orders)
			.where(eq(orders.userId, userId))
			.groupBy(orders.status);

		const totalRevenue = allOrders.reduce(
			(sum, o) => sum + parseFloat(o.totalAmount.toString()),
			0
		);

		return {
			total: allOrders.length,
			totalRevenue,
			statusBreakdown: statusStats,
			pending: allOrders.filter((o) => o.status === "pending").length,
			processing: allOrders.filter((o) => o.status === "processing").length,
			shipped: allOrders.filter((o) => o.status === "shipped").length,
			delivered: allOrders.filter((o) => o.status === "delivered").length,
		};
	}
}

