import {
	pgTable,
	text,
	timestamp,
	integer,
	boolean,
	serial,
	index,
	uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Blog Categories Table
 * Stores blog post categories for organization
 */
export const blogCategories = pgTable(
	"financbase_blog_categories",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		description: text("description"),
		color: text("color"), // For UI display (e.g., "bg-blue-500")
		postCount: integer("post_count").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		nameUnique: uniqueIndex("blog_categories_name_unique").on(table.name),
		slugUnique: uniqueIndex("blog_categories_slug_unique").on(table.slug),
	})
);

/**
 * Blog Posts Table
 * Main table for blog content management
 */
export const blogPosts = pgTable(
	"financbase_blog_posts",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id").notNull(),
		title: text("title").notNull(),
		slug: text("slug").notNull(),
		excerpt: text("excerpt"),
		content: text("content").notNull(), // Rich text content (can be HTML/markdown)
		featuredImage: text("featured_image"), // URL to featured image
		categoryId: integer("category_id").references(() => blogCategories.id),
		status: text("status", {
			enum: ["draft", "published", "scheduled", "archived"],
		})
			.notNull()
			.default("draft"),
		isFeatured: boolean("is_featured").notNull().default(false),
		viewCount: integer("view_count").notNull().default(0),
		likeCount: integer("like_count").notNull().default(0),
		commentCount: integer("comment_count").notNull().default(0),
		publishedAt: timestamp("published_at"),
		scheduledAt: timestamp("scheduled_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		slugUnique: uniqueIndex("blog_posts_slug_unique").on(table.slug),
		userIdIdx: index("blog_posts_user_id_idx").on(table.userId),
		categoryIdIdx: index("blog_posts_category_id_idx").on(table.categoryId),
		statusIdx: index("blog_posts_status_idx").on(table.status),
		publishedAtIdx: index("blog_posts_published_at_idx").on(table.publishedAt),
	})
);

/**
 * Blog Comments Table
 * Stores comments on blog posts (optional for future implementation)
 */
export const blogComments = pgTable(
	"financbase_blog_comments",
	{
		id: serial("id").primaryKey(),
		postId: integer("post_id")
			.notNull()
			.references(() => blogPosts.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		content: text("content").notNull(),
		status: text("status", {
			enum: ["pending", "approved", "rejected"],
		})
			.notNull()
			.default("pending"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		postIdIdx: index("blog_comments_post_id_idx").on(table.postId),
		userIdIdx: index("blog_comments_user_id_idx").on(table.userId),
		statusIdx: index("blog_comments_status_idx").on(table.status),
	})
);

// Type exports for TypeScript
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;

