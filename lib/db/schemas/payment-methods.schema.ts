import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { accounts } from "./accounts.schema";

export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
	"stripe",
	"paypal",
	"square",
	"bank_transfer",
	"check",
	"cash",
	"other"
]);

export const paymentMethodStatusEnum = pgEnum("payment_method_status", [
	"active",
	"inactive",
	"suspended",
	"failed"
]);

export const paymentMethods = pgTable("payment_methods", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	accountId: uuid("account_id").references(() => accounts.id),
	paymentMethodType: paymentMethodTypeEnum("payment_method_type").notNull(),
	name: text("name").notNull(), // User-friendly name
	description: text("description"),
	
	// Stripe-specific fields
	stripePaymentMethodId: text("stripe_payment_method_id"),
	stripeCustomerId: text("stripe_customer_id"),
	stripeAccountId: text("stripe_account_id"), // For connected accounts
	
	// PayPal-specific fields
	paypalMerchantId: text("paypal_merchant_id"),
	paypalEmail: text("paypal_email"),
	
	// Square-specific fields
	squareApplicationId: text("square_application_id"),
	squareLocationId: text("square_location_id"),
	
	// Bank transfer fields
	bankName: text("bank_name"),
	bankAccountNumber: text("bank_account_number"),
	bankRoutingNumber: text("bank_routing_number"),
	
	// Configuration
	isDefault: boolean("is_default").default(false),
	processingFee: numeric("processing_fee", { precision: 5, scale: 4 }), // Percentage
	fixedFee: numeric("fixed_fee", { precision: 8, scale: 2 }), // Fixed amount
	currency: text("currency").default("USD").notNull(),
	
	// Status and metadata
	status: paymentMethodStatusEnum("status").default("active").notNull(),
	isTestMode: boolean("is_test_mode").default(false),
	lastUsedAt: timestamp("last_used_at"),
	metadata: text("metadata"), // JSON string for additional configuration
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
