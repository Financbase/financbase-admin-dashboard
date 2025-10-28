import {
	pgTable,
	text,
	timestamp,
	uuid,
	pgEnum,
	boolean as pgBoolean,
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const notificationTypeEnum = pgEnum("notification_type", [
	"invoice",
	"expense", 
	"alert",
	"report",
	"system"
]);

export const notificationCategoryEnum = pgEnum("notification_category", [
	"financial",
	"system",
	"security",
	"general"
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
	"low",
	"normal",
	"high",
	"urgent"
]);

export const notifications = pgTable("notifications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	
	// Notification details
	type: notificationTypeEnum("type").notNull(),
	category: notificationCategoryEnum("category").default("general"),
	priority: notificationPriorityEnum("priority").default("normal"),
	
	// Content
	title: text("title").notNull(),
	message: text("message").notNull(),
	
	// Action and data
	actionUrl: text("action_url"),
	actionLabel: text("action_label"),
	data: jsonb("data"), // Additional data for the notification
	metadata: jsonb("metadata"), // Additional metadata
	
	// Status and timing
	isRead: pgBoolean("is_read").default(false),
	isArchived: pgBoolean("is_archived").default(false),
	expiresAt: timestamp("expires_at"),
	
	// Tracking
	readAt: timestamp("read_at"),
	archivedAt: timestamp("archived_at"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
