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
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const activities = pgTable("activities", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id),
	action: text("action").notNull(), // e.g., "created_invoice", "updated_client"
	entityType: text("entity_type").notNull(), // e.g., "invoice", "client", "expense"
	entityId: uuid("entity_id"),
	description: text("description").notNull(),
	metadata: text("metadata"), // JSON string for additional context
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").defaultNow(),
});
