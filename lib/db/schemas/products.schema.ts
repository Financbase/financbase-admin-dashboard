/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	integer,
	jsonb,
	pgEnum,
	boolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema";

export const productStatusEnum = pgEnum("product_status", [
	"active",
	"inactive",
	"low_stock",
	"discontinued",
	"out_of_stock",
]);

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(), // Clerk user ID
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Product identification
	name: text("name").notNull(),
	sku: text("sku").notNull().unique(),
	barcode: text("barcode"),
	description: text("description"),

	// Categorization
	category: text("category").notNull(),
	subcategory: text("subcategory"),
	tags: jsonb("tags"), // Array of tags

	// Pricing
	price: numeric("price", { precision: 12, scale: 2 }).notNull(),
	cost: numeric("cost", { precision: 12, scale: 2 }), // Cost per unit
	currency: text("currency").default("USD"),
	compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }), // Original price for discounts

	// Inventory
	stockQuantity: integer("stock_quantity").default(0),
	lowStockThreshold: integer("low_stock_threshold").default(10),
	reorderPoint: integer("reorder_point").default(5),
	trackInventory: boolean("track_inventory").default(true),
	allowBackorders: boolean("allow_backorders").default(false),

	// Status
	status: productStatusEnum("status").notNull().default("active"),
	isActive: boolean("is_active").default(true),

	// Media
	images: jsonb("images"), // Array of image URLs
	primaryImage: text("primary_image"),

	// Product details
	weight: numeric("weight", { precision: 10, scale: 2 }), // in kg
	dimensions: jsonb("dimensions"), // { length, width, height }
	vendor: text("vendor"),
	brand: text("brand"),

	// SEO and metadata
	slug: text("slug").unique(),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Define product categories with self-reference
export const productCategories = pgTable("product_categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	parentId: uuid("parent_id"), // Self-reference - foreign key constraint added separately
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

