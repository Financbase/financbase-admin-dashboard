/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserFromDatabase } from "@/lib/db/rls-context";

export interface CreateProductInput {
	name: string;
	sku: string;
	description?: string;
	category: string;
	price: string;
	cost?: string;
	stockQuantity?: number;
	lowStockThreshold?: number;
	status?: "active" | "inactive" | "low_stock" | "discontinued" | "out_of_stock";
	images?: string[];
	tags?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
	id: string;
}

export interface ProductFilters {
	search?: string;
	category?: string;
	status?: string;
	lowStock?: boolean;
}

/**
 * Products Service - Handles all product-related operations
 */
export class ProductsService {
	/**
	 * Get all products
	 */
	async getAll(filters?: ProductFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(products).where(eq(products.userId, userId));

		if (filters) {
			if (filters.search) {
				query = query.where(
					and(
						eq(products.userId, userId),
						or(
							ilike(products.name, `%${filters.search}%`),
							ilike(products.sku, `%${filters.search}%`),
							ilike(products.description || sql`''`, `%${filters.search}%`)
						)
					)
				);
			}

			if (filters.category) {
				query = query.where(
					and(eq(products.userId, userId), eq(products.category, filters.category))
				);
			}

			if (filters.status) {
				query = query.where(
					and(eq(products.userId, userId), eq(products.status, filters.status as any))
				);
			}

			if (filters.lowStock) {
				query = query.where(
					and(
						eq(products.userId, userId),
						sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
					)
				);
			}
		}

		const results = await query.orderBy(desc(products.createdAt));
		return results;
	}

	/**
	 * Get product by ID
	 */
	async getById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(products)
			.where(and(eq(products.id, id), eq(products.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Product not found");
		}

		return result[0];
	}

	/**
	 * Create a new product
	 */
	async create(input: CreateProductInput) {
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

		const newProduct = {
			userId: clerkId,
			organizationId,
			name: input.name,
			sku: input.sku,
			description: input.description,
			category: input.category,
			price: input.price,
			cost: input.cost,
			stockQuantity: input.stockQuantity || 0,
			lowStockThreshold: input.lowStockThreshold || 10,
			status: input.status || "active",
			images: input.images ? JSON.stringify(input.images) : null,
			tags: input.tags ? JSON.stringify(input.tags) : null,
		};

		const result = await db.insert(products).values(newProduct).returning();
		return result[0];
	}

	/**
	 * Update a product
	 */
	async update(input: UpdateProductInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.sku !== undefined) updateData.sku = input.sku;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.category !== undefined) updateData.category = input.category;
		if (input.price !== undefined) updateData.price = input.price;
		if (input.cost !== undefined) updateData.cost = input.cost;
		if (input.stockQuantity !== undefined) {
			updateData.stockQuantity = input.stockQuantity;
			// Auto-update status based on stock
			if (input.stockQuantity <= (updateData.lowStockThreshold || 10)) {
				updateData.status = "low_stock";
			} else if (input.stockQuantity === 0) {
				updateData.status = "out_of_stock";
			} else {
				updateData.status = "active";
			}
		}
		if (input.lowStockThreshold !== undefined)
			updateData.lowStockThreshold = input.lowStockThreshold;
		if (input.status !== undefined) updateData.status = input.status;
		if (input.images !== undefined) updateData.images = JSON.stringify(input.images);
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);

		const result = await db
			.update(products)
			.set(updateData)
			.where(and(eq(products.id, input.id), eq(products.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete a product
	 */
	async delete(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(id);

		await db
			.delete(products)
			.where(and(eq(products.id, id), eq(products.userId, userId)));

		return { success: true };
	}

	/**
	 * Get products by category
	 */
	async getByCategory(category: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(products)
			.where(and(eq(products.userId, userId), eq(products.category, category)))
			.orderBy(desc(products.createdAt));

		return results;
	}

	/**
	 * Update stock quantity
	 */
	async updateStock(id: string, quantity: number, operation: "add" | "set" = "set") {
		const product = await this.getById(id);
		const currentStock = product.stockQuantity || 0;
		const newStock = operation === "add" ? currentStock + quantity : quantity;

		const updateData: any = {
			stockQuantity: newStock,
			updatedAt: new Date(),
		};

		// Auto-update status
		if (newStock <= (product.lowStockThreshold || 10)) {
			updateData.status = "low_stock";
		} else if (newStock === 0) {
			updateData.status = "out_of_stock";
		} else {
			updateData.status = "active";
		}

		const result = await db
			.update(products)
			.set(updateData)
			.where(and(eq(products.id, id), eq(products.userId, product.userId)))
			.returning();

		return result[0];
	}

	/**
	 * Get analytics
	 */
	async getAnalytics() {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const allProducts = await this.getAll();

		const categoryStats = await db
			.select({
				category: products.category,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(products)
			.where(eq(products.userId, userId))
			.groupBy(products.category);

		const totalValue = allProducts.reduce(
			(sum, p) => sum + parseFloat(p.price.toString()) * (p.stockQuantity || 0),
			0
		);

		return {
			total: allProducts.length,
			active: allProducts.filter((p) => p.status === "active").length,
			lowStock: allProducts.filter((p) => p.status === "low_stock").length,
			outOfStock: allProducts.filter((p) => p.status === "out_of_stock").length,
			totalValue,
			categoryBreakdown: categoryStats,
		};
	}

	/**
	 * Category management
	 */
	async createCategory(organizationId: string, name: string, description?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.insert(productCategories)
			.values({
				organizationId,
				name,
				description,
			})
			.returning();

		return result[0];
	}

	async getCategories(organizationId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(productCategories)
			.where(eq(productCategories.organizationId, organizationId))
			.orderBy(desc(productCategories.createdAt));

		return results;
	}
}

