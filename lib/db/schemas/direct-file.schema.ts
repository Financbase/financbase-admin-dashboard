/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * Direct File Export Metadata Table
 * 
 * IMPORTANT: This table stores ONLY export metadata (filename, export date, format).
 * NO PII (Personally Identifiable Information) or FTI (Federal Tax Information) is stored.
 * 
 * This allows users to track their export history without storing sensitive tax data.
 */
export const directFileExports = pgTable("direct_file_exports", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id").notNull(), // Clerk user ID - not PII
	filename: text("filename").notNull(), // Just the filename, not the file content
	format: text("format").notNull(), // "mef-xml" or "json"
	fileSize: integer("file_size"), // Size in bytes
	exportDate: timestamp("export_date", { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

