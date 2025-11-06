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
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema";

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"refunded",
]);

export const orderPriorityEnum = pgEnum("order_priority", [
	"low",
	"normal",
	"high",
	"urgent",
]);

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(), // Clerk user ID
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	customerId: uuid("customer_id"), // Reference to customers/clients table

	// Order identification
	orderNumber: text("order_number").notNull().unique(),
	poNumber: text("po_number"), // Purchase order number

	// Order details
	status: orderStatusEnum("status").notNull().default("pending"),
	priority: orderPriorityEnum("priority").default("normal"),

	// Products/Items (JSONB array of order items)
	products: jsonb("products").notNull().default("[]"), // Array of { productId, name, quantity, price, total }

	// Financial information
	totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
	subtotal: numeric("subtotal", { precision: 12, scale: 2 }),
	tax: numeric("tax", { precision: 12, scale: 2 }).default("0"),
	shipping: numeric("shipping", { precision: 12, scale: 2 }).default("0"),
	discount: numeric("discount", { precision: 12, scale: 2 }).default("0"),
	currency: text("currency").default("USD"),

	// Shipping information
	shippingAddress: jsonb("shipping_address"), // { street, city, state, zip, country }
	billingAddress: jsonb("billing_address"),
	shippingMethod: text("shipping_method"),
	trackingNumber: text("tracking_number"),
	carrier: text("carrier"), // UPS, FedEx, etc.

	// Dates
	orderDate: timestamp("order_date", { withTimezone: true })
		.notNull()
		.defaultNow(),
	dueDate: timestamp("due_date", { withTimezone: true }),
	fulfillmentDate: timestamp("fulfillment_date", { withTimezone: true }),
	shippedDate: timestamp("shipped_date", { withTimezone: true }),
	deliveredDate: timestamp("delivered_date", { withTimezone: true }),

	// Additional information
	notes: text("notes"),
	tags: jsonb("tags"),
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

