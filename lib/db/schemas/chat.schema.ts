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
	jsonb,
	pgEnum,
	boolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema";

export const channelTypeEnum = pgEnum("channel_type", [
	"public",
	"private",
	"direct",
]);

export const messageTypeEnum = pgEnum("message_type", [
	"message",
	"file",
	"system",
	"reply",
]);

// Chat channels table
export const chatChannels = pgTable("chat_channels", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	name: text("name").notNull(),
	description: text("description"),
	type: channelTypeEnum("type").notNull().default("public"),

	// Channel members (JSONB array of user IDs)
	members: jsonb("members").notNull().default("[]"), // Array of { userId, joinedAt, role }
	createdBy: text("created_by").notNull(), // Clerk user ID

	// Settings
	settings: jsonb("settings").default("{}"), // { notifications, permissions, etc. }
	isArchived: boolean("is_archived").default(false),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
});

// Chat messages table - using const first to break circular reference
const chatMessagesTable = pgTable("chat_messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	channelId: uuid("channel_id")
		.notNull()
		.references(() => chatChannels.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull(), // Clerk user ID
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Message content
	message: text("message").notNull(),
	type: messageTypeEnum("type").notNull().default("message"),

	// Threading and replies - using string literal to avoid circular reference
	replyTo: uuid("reply_to"), // For reply threads - foreign key constraint added separately

	// Mentions and reactions
	mentions: jsonb("mentions").default("[]"), // Array of user IDs mentioned
	reactions: jsonb("reactions").default("{}"), // { emoji: [userIds] }

	// Read receipts
	readBy: jsonb("read_by").default("[]"), // Array of { userId, readAt }

	// File attachments
	attachments: jsonb("attachments").default("[]"), // Array of { url, name, type, size }

	// Additional metadata
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete
});

// Export to break circular reference
export const chatMessages = chatMessagesTable;

export type ChatChannel = typeof chatChannels.$inferSelect;
export type NewChatChannel = typeof chatChannels.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

