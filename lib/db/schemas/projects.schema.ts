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
import { clients } from "./clients.schema";

export const projectStatusEnum = pgEnum("project_status", [
	"planning",
	"active",
	"on_hold",
	"completed",
	"cancelled"
]);

export const projectPriorityEnum = pgEnum("project_priority", [
	"low",
	"medium",
	"high",
	"urgent"
]);

export const projects = pgTable("projects", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	clientId: uuid("client_id").references(() => clients.id),
	
	// Project details
	name: text("name").notNull(),
	description: text("description"),
	status: projectStatusEnum("status").default("planning").notNull(),
	priority: projectPriorityEnum("priority").default("medium").notNull(),
	
	// Project timeline
	startDate: timestamp("start_date"),
	dueDate: timestamp("due_date"),
	completedDate: timestamp("completed_date"),
	
	// Budget and billing
	budget: numeric("budget", { precision: 12, scale: 2 }),
	hourlyRate: numeric("hourly_rate", { precision: 8, scale: 2 }),
	currency: text("currency").default("USD").notNull(),
	
	// Project settings
	isBillable: boolean("is_billable").default(true),
	allowOvertime: boolean("allow_overtime").default(false),
	requireApproval: boolean("require_approval").default(false),
	
	// Progress tracking
	progress: numeric("progress", { precision: 5, scale: 2 }).default("0"), // 0-100%
	estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
	actualHours: numeric("actual_hours", { precision: 8, scale: 2 }).default("0"),
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
