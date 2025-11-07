/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Help Articles Table - Documentation articles
export const helpArticles = pgTable('financbase_help_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  categoryId: integer('category_id').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Article metadata
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  priority: integer('priority').default(0).notNull(), // Higher number = higher priority
  featured: boolean('featured').default(false).notNull(),
  
  // SEO and search
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  tags: jsonb('tags').default([]).notNull(), // Array of tag strings
  keywords: jsonb('keywords').default([]).notNull(), // Array of keyword strings
  
  // Content structure
  tableOfContents: jsonb('table_of_contents').default([]).notNull(), // Array of TOC items
  attachments: jsonb('attachments').default([]).notNull(), // Array of attachment objects
  
  // Versioning
  version: text('version').default('1.0.0').notNull(),
  parentId: integer('parent_id'), // For article versions
  isLatest: boolean('is_latest').default(true).notNull(),
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
  lastViewedAt: timestamp('last_viewed_at'),
  
  // Timestamps
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const helpArticlesRelations = relations(helpArticles, ({ one, many }) => ({
  category: one(helpCategories, { fields: [helpArticles.categoryId], references: [helpCategories.id] }),
  author: one(users, { fields: [helpArticles.authorId], references: [users.id] }),
  parent: one(helpArticles, { fields: [helpArticles.parentId], references: [helpArticles.id] }),
  children: many(helpArticles),
  feedback: many(helpArticleFeedback),
  searchAnalytics: many(helpSearchAnalytics),
}));

// Help Categories Table - Article categories
export const helpCategories = pgTable('financbase_help_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'), // Icon name or URL
  color: text('color').default('#3B82F6'), // Hex color code
  
  // Hierarchy
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0).notNull(),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  
  // Statistics
  articleCount: integer('article_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const helpCategoriesRelations = relations(helpCategories, ({ one, many }) => ({
  parent: one(helpCategories, { fields: [helpCategories.parentId], references: [helpCategories.id] }),
  children: many(helpCategories),
  articles: many(helpArticles),
}));

// Help Article Feedback Table - User feedback on articles
export const helpArticleFeedback = pgTable('financbase_help_article_feedback', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').notNull().references(() => helpArticles.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Feedback details
  isHelpful: boolean('is_helpful').notNull(),
  rating: integer('rating'), // 1-5 star rating
  comment: text('comment'),
  
  // Feedback metadata
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const helpArticleFeedbackRelations = relations(helpArticleFeedback, ({ one }) => ({
  article: one(helpArticles, { fields: [helpArticleFeedback.articleId], references: [helpArticles.id] }),
  user: one(users, { fields: [helpArticleFeedback.userId], references: [users.id] }),
}));

// Help Search Analytics Table - Search tracking
export const helpSearchAnalytics = pgTable('financbase_help_search_analytics', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  
  // Search details
  query: text('query').notNull(),
  resultsCount: integer('results_count').default(0).notNull(),
  clickedResultId: integer('clicked_result_id').references(() => helpArticles.id, { onDelete: 'cascade' }),
  clickedPosition: integer('clicked_position'), // Position in search results
  
  // Search metadata
  filters: jsonb('filters').default({}).notNull(), // Applied filters
  sortBy: text('sort_by').default('relevance'),
  timeSpent: integer('time_spent'), // Time spent on search in seconds
  
  // User context
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const helpSearchAnalyticsRelations = relations(helpSearchAnalytics, ({ one }) => ({
  user: one(users, { fields: [helpSearchAnalytics.userId], references: [users.id] }),
  clickedResult: one(helpArticles, { fields: [helpSearchAnalytics.clickedResultId], references: [helpArticles.id] }),
}));

// Support Tickets Table - User support requests
export const supportTickets = pgTable('financbase_support_tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Ticket details
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  category: text('category').notNull(), // 'technical', 'billing', 'feature_request', 'bug_report', 'general'
  
  // Assignment
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at'),
  
  // Resolution
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  
  // Attachments
  attachments: jsonb('attachments').default([]).notNull(), // Array of attachment objects
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(), // Array of tag strings
  customFields: jsonb('custom_fields').default({}).notNull(), // Custom form fields
  
  // Statistics
  responseTime: integer('response_time'), // First response time in minutes
  resolutionTime: integer('resolution_time'), // Resolution time in minutes
  satisfactionRating: integer('satisfaction_rating'), // 1-5 star rating
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  organization: one(organizations, { fields: [supportTickets.organizationId], references: [organizations.id] }),
  assignee: one(users, { fields: [supportTickets.assignedTo], references: [users.id] }),
  messages: many(supportTicketMessages),
}));

// Support Ticket Messages Table - Ticket conversation
export const supportTicketMessages = pgTable('financbase_support_ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Message content
  content: text('content').notNull(),
  messageType: text('message_type').notNull().default('message'), // 'message', 'note', 'system'
  
  // Attachments
  attachments: jsonb('attachments').default([]).notNull(), // Array of attachment objects
  
  // Status
  isInternal: boolean('is_internal').default(false).notNull(), // Internal notes not visible to user
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  
  // Metadata
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportTicketMessages.ticketId], references: [supportTickets.id] }),
  author: one(users, { fields: [supportTicketMessages.authorId], references: [users.id] }),
}));

// Video Tutorials Table - Video content
export const videoTutorials = pgTable('financbase_video_tutorials', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // Duration in seconds
  
  // Categorization
  categoryId: integer('category_id').references(() => helpCategories.id, { onDelete: 'set null' }),
  tags: jsonb('tags').default([]).notNull(), // Array of tag strings
  
  // Video metadata
  videoType: text('video_type').notNull().default('tutorial'), // 'tutorial', 'demo', 'webinar', 'training'
  difficulty: text('difficulty').default('beginner'), // 'beginner', 'intermediate', 'advanced'
  language: text('language').default('en'),
  
  // Status
  isPublished: boolean('is_published').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  shareCount: integer('share_count').default(0).notNull(),
  
  // Timestamps
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const videoTutorialsRelations = relations(videoTutorials, ({ one }) => ({
  category: one(helpCategories, { fields: [videoTutorials.categoryId], references: [helpCategories.id] }),
}));

// FAQ Items Table - Frequently asked questions
export const faqItems = pgTable('financbase_faq_items', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  categoryId: integer('category_id').references(() => helpCategories.id, { onDelete: 'set null' }),
  
  // FAQ metadata
  priority: integer('priority').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
  
  // Tags and keywords
  tags: jsonb('tags').default([]).notNull(),
  keywords: jsonb('keywords').default([]).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const faqItemsRelations = relations(faqItems, ({ one }) => ({
  category: one(helpCategories, { fields: [faqItems.categoryId], references: [helpCategories.id] }),
}));

// Guides Table - User guides and tutorials
export const guides = pgTable('financbase_guides', {
  id: serial('id').primaryKey(),
  
  // Core content
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(), // Markdown content
  excerpt: text('excerpt'),
  description: text('description'),
  
  // Metadata
  category: text('category').notNull(), // 'getting-started', 'advanced', 'integrations', 'api', 'troubleshooting'
  type: text('type').notNull().default('guide'), // 'tutorial', 'guide', 'documentation'
  difficulty: text('difficulty').notNull().default('beginner'), // 'beginner', 'intermediate', 'advanced'
  
  // Media
  imageUrl: text('image_url'),
  thumbnailUrl: text('thumbnail_url'),
  videoUrl: text('video_url'), // Optional video URL
  
  // Authoring
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  
  // Guide-specific
  duration: text('duration'), // String like "15 min"
  estimatedReadTime: integer('estimated_read_time'), // Integer in minutes
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  tags: jsonb('tags').default([]).notNull(), // Array of tag strings
  keywords: jsonb('keywords').default([]).notNull(), // Array of keyword strings
  
  // Engagement
  viewCount: integer('view_count').default(0).notNull(),
  rating: integer('rating').default(0).notNull(), // Average rating (0-5, stored as integer * 10 for precision)
  helpfulCount: integer('helpful_count').default(0).notNull(),
  notHelpfulCount: integer('not_helpful_count').default(0).notNull(),
  
  // Organization
  featured: boolean('featured').default(false).notNull(),
  priority: integer('priority').default(0).notNull(), // Higher number = higher priority
  sortOrder: integer('sort_order').default(0).notNull(),
  
  // Timestamps
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const guidesRelations = relations(guides, ({ one }) => ({
  author: one(users, { fields: [guides.authorId], references: [users.id] }),
}));
