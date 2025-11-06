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
	boolean,
	integer,
	numeric,
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

// Enums for training system
export const trainingDifficultyEnum = pgEnum("training_difficulty", [
	"Beginner",
	"Intermediate",
	"Advanced",
]);

export const trainingStatusEnum = pgEnum("training_status", [
	"not_started",
	"in_progress",
	"completed",
]);

// Training Programs table
export const trainingPrograms = pgTable("training_programs", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	duration: text("duration"), // e.g., "15 minutes", "20 minutes"
	difficulty: trainingDifficultyEnum("difficulty").notNull().default("Beginner"),
	icon: text("icon"), // Icon name or identifier
	href: text("href"), // Link to training content
	topics: jsonb("topics").$type<string[]>(), // Array of topics covered
	order: integer("order").default(0), // Display order
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Learning Paths table
export const learningPaths = pgTable("learning_paths", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	duration: text("duration"), // e.g., "1.5 hours", "3 hours"
	icon: text("icon"), // Icon name or identifier
	programIds: jsonb("program_ids").$type<string[]>(), // Array of training program IDs
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// User Training Progress table
export const trainingProgress = pgTable("training_progress", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	programId: uuid("program_id").notNull().references(() => trainingPrograms.id, { onDelete: "cascade" }),
	status: trainingStatusEnum("status").notNull().default("not_started"),
	progress: numeric("progress", { precision: 5, scale: 2 }).default("0"), // 0-100%
	startedAt: timestamp("started_at", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// User Learning Path Progress table
export const learningPathProgress = pgTable("learning_path_progress", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	pathId: uuid("path_id").notNull().references(() => learningPaths.id, { onDelete: "cascade" }),
	status: trainingStatusEnum("status").notNull().default("not_started"),
	progress: numeric("progress", { precision: 5, scale: 2 }).default("0"), // 0-100%
	startedAt: timestamp("started_at", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	completedPrograms: jsonb("completed_programs").$type<string[]>(), // Array of completed program IDs
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type NewTrainingProgram = typeof trainingPrograms.$inferInsert;
export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;
export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type NewTrainingProgress = typeof trainingProgress.$inferInsert;
export type LearningPathProgress = typeof learningPathProgress.$inferSelect;
export type NewLearningPathProgress = typeof learningPathProgress.$inferInsert;

