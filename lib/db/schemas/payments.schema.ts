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
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { paymentMethods } from "./payment-methods.schema";
import { invoices } from "./invoices.schema";

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"processing",
	"completed",
	"failed",
	"cancelled",
	"refunded",
	"partially_refunded"
]);

export const paymentTypeEnum = pgEnum("payment_type", [
	"invoice_payment",
	"refund",
	"chargeback",
	"adjustment",
	"transfer"
]);

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id),
	invoiceId: uuid("invoice_id").references(() => invoices.id),
	
	// Payment details
	paymentType: paymentTypeEnum("payment_type").notNull(),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD").notNull(),
	processingFee: numeric("processing_fee", { precision: 12, scale: 2 }).default("0"),
	netAmount: numeric("net_amount", { precision: 12, scale: 2 }).notNull(),
	
	// External payment processor IDs
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeChargeId: text("stripe_charge_id"),
	paypalTransactionId: text("paypal_transaction_id"),
	squarePaymentId: text("square_payment_id"),
	
	// Payment metadata
	description: text("description"),
	reference: text("reference"), // External reference number
	status: paymentStatusEnum("status").default("pending").notNull(),
	
	// Timestamps
	processedAt: timestamp("processed_at"),
	failedAt: timestamp("failed_at"),
	refundedAt: timestamp("refunded_at"),
	
	// Failure details
	failureReason: text("failure_reason"),
	failureCode: text("failure_code"),
	
	// Refund information
	refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).default("0"),
	refundReason: text("refund_reason"),
	
	// Additional data
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
