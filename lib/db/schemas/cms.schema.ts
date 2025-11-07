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
	integer,
	serial,
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";

// Enums
export const landingPageStatusEnum = pgEnum("landing_page_status", [
	"draft",
	"published",
	"archived",
]);

// Landing Pages Table
export const landingPages = pgTable("landing_pages", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content"),
	template: text("template"),
	status: landingPageStatusEnum("status").default("draft").notNull(),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	seoKeywords: text("seo_keywords"),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Landing Page Versions Table
export const landingPageVersions = pgTable("landing_page_versions", {
	id: serial("id").primaryKey(),
	landingPageId: integer("landing_page_id").notNull().references(() => landingPages.id, { onDelete: "cascade" }),
	versionNumber: integer("version_number").notNull(),
	title: text("title").notNull(),
	slug: text("slug").notNull(),
	content: text("content"),
	template: text("template"),
	status: landingPageStatusEnum("status"),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	seoKeywords: text("seo_keywords"),
	metadata: jsonb("metadata"),
	changeMessage: text("change_message"),
	createdBy: text("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type LandingPage = typeof landingPages.$inferSelect;
export type NewLandingPage = typeof landingPages.$inferInsert;
export type LandingPageVersion = typeof landingPageVersions.$inferSelect;
export type NewLandingPageVersion = typeof landingPageVersions.$inferInsert;

// Relations
export const landingPagesRelations = relations(landingPages, ({ many }) => ({
	versions: many(landingPageVersions),
}));

export const landingPageVersionsRelations = relations(landingPageVersions, ({ one }) => ({
	landingPage: one(landingPages, {
		fields: [landingPageVersions.landingPageId],
		references: [landingPages.id],
	}),
}));

