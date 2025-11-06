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
	boolean,
	serial,
	index,
	jsonb,
} from "drizzle-orm/pg-core";

/**
 * Job Postings Table
 * Stores career/job postings for the public careers page
 */
export const jobPostings = pgTable(
	"financbase_job_postings",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id").notNull(), // User who created/updated the posting
		title: text("title").notNull(),
		department: text("department").notNull(), // Engineering, Design, Product, Sales, Marketing, Operations
		location: text("location").notNull(), // e.g., "San Francisco, CA", "Remote"
		type: text("type").notNull(), // Full-time, Part-time, Contract
		experience: text("experience").notNull(), // e.g., "5+ years", "3+ years"
		description: text("description").notNull(), // Short description
		fullDescription: text("full_description"), // Full job description
		requirements: jsonb("requirements").$type<string[]>().notNull().default("[]"), // Array of requirements
		responsibilities: jsonb("responsibilities").$type<string[]>().default("[]"), // Array of responsibilities
		qualifications: jsonb("qualifications").$type<string[]>().default("[]"), // Array of qualifications
		salary: text("salary"), // e.g., "$140,000 - $180,000"
		benefits: jsonb("benefits").$type<string[]>().default("[]"), // Array of benefits
		status: text("status", {
			enum: ["draft", "published", "closed", "archived"],
		})
			.notNull()
			.default("draft"),
		isFeatured: boolean("is_featured").notNull().default(false),
		applicants: integer("applicants").notNull().default(0), // Number of applicants
		postedAt: timestamp("posted_at"), // When the job was posted
		closedAt: timestamp("closed_at"), // When the job was closed
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		userIdIdx: index("job_postings_user_id_idx").on(table.userId),
		departmentIdx: index("job_postings_department_idx").on(table.department),
		statusIdx: index("job_postings_status_idx").on(table.status),
		featuredIdx: index("job_postings_featured_idx").on(table.isFeatured),
		postedAtIdx: index("job_postings_posted_at_idx").on(table.postedAt),
	})
);

/**
 * Job Applications Table
 * Stores applications submitted for job postings
 */
export const jobApplications = pgTable(
	"financbase_job_applications",
	{
		id: serial("id").primaryKey(),
		jobId: integer("job_id")
			.notNull()
			.references(() => jobPostings.id, { onDelete: "cascade" }),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text("email").notNull(),
		phone: text("phone"),
		linkedin: text("linkedin"),
		portfolio: text("portfolio"),
		resume: text("resume"), // URL to uploaded resume
		coverLetter: text("cover_letter"),
		status: text("status", {
			enum: ["pending", "reviewing", "interviewing", "accepted", "rejected"],
		})
			.notNull()
			.default("pending"),
		notes: text("notes"), // Internal notes from recruiters
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		jobIdIdx: index("job_applications_job_id_idx").on(table.jobId),
		emailIdx: index("job_applications_email_idx").on(table.email),
		statusIdx: index("job_applications_status_idx").on(table.status),
	})
);

// Type exports for TypeScript
export type JobPosting = typeof jobPostings.$inferSelect;
export type NewJobPosting = typeof jobPostings.$inferInsert;
export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;

