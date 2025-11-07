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
	integer,
	numeric,
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";
import { clients } from "./clients.schema";

// Enums
export const interactionTypeEnum = pgEnum("interaction_type", [
	"email",
	"call",
	"meeting",
	"note",
	"task",
	"event",
]);

export const communicationTypeEnum = pgEnum("communication_type", [
	"email",
	"call",
	"meeting",
	"message",
]);

// Lead Scores Table
export const leadScores = pgTable("lead_scores", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
	score: integer("score").notNull().default(0),
	factors: jsonb("factors").notNull().default({}).notNull(), // { engagement, recency, frequency, monetary, behavior }
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client Interactions Table
export const clientInteractions = pgTable("client_interactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
	interactionType: interactionTypeEnum("interaction_type").notNull(),
	title: text("title").notNull(),
	description: text("description"),
	value: numeric("value", { precision: 12, scale: 2 }),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client Communications Table
export const clientCommunications = pgTable("client_communications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
	communicationType: communicationTypeEnum("communication_type").notNull(),
	subject: text("subject").notNull(),
	content: text("content"),
	direction: text("direction", { enum: ["inbound", "outbound"] }).notNull(),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type LeadScore = typeof leadScores.$inferSelect;
export type NewLeadScore = typeof leadScores.$inferInsert;
export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type NewClientInteraction = typeof clientInteractions.$inferInsert;
export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type NewClientCommunication = typeof clientCommunications.$inferInsert;

// Relations
export const leadScoresRelations = relations(leadScores, ({ one }) => ({
	client: one(clients, {
		fields: [leadScores.clientId],
		references: [clients.id],
	}),
}));

export const clientInteractionsRelations = relations(clientInteractions, ({ one }) => ({
	client: one(clients, {
		fields: [clientInteractions.clientId],
		references: [clients.id],
	}),
}));

export const clientCommunicationsRelations = relations(clientCommunications, ({ one }) => ({
	client: one(clients, {
		fields: [clientCommunications.clientId],
		references: [clients.id],
	}),
}));

