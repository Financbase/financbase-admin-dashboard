/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const galleryImages = pgTable("gallery_images", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	organizationId: uuid("organization_id").notNull(),
	url: text("url").notNull(),
	name: text("name").notNull(),
	size: integer("size").notNull(),
	type: text("type").notNull(),
	category: text("category"),
	tags: jsonb("tags").$type<string[]>(),
	favorite: boolean("favorite").default(false),
	archived: boolean("archived").default(false),
	metadata: jsonb("metadata").$type<Record<string, any>>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryCategories = pgTable("gallery_categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	color: text("color"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
export type GalleryCategory = typeof galleryCategories.$inferSelect;
export type NewGalleryCategory = typeof galleryCategories.$inferInsert;

