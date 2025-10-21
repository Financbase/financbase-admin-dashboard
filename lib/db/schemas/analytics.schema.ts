import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const analytics = pgTable("analytics", {
	id: uuid("id").primaryKey().defaultRandom(),
	metric: text("metric").notNull(), // e.g., "revenue", "expenses", "profit"
	value: decimal("value", { precision: 15, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	period: text("period").notNull(), // e.g., "2024-01", "2024-Q1", "2024"
	periodType: text("period_type", { enum: ["daily", "weekly", "monthly", "quarterly", "yearly"] }).notNull(),
	entityType: text("entity_type"), // e.g., "invoice", "expense", "client"
	entityId: uuid("entity_id"), // Reference to specific entity if applicable
	metadata: text("metadata"), // JSON string for additional data
	createdAt: timestamp("created_at").defaultNow(),
});
