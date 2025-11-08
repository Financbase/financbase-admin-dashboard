/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import {
  helpArticles,
  helpCategories,
  helpArticleFeedback,
  helpSearchAnalytics,
  supportTickets,
  supportTicketMessages,
  videoTutorials,
  faqItems,
  users
} from '@/lib/db/schemas';
import { eq, and, like, desc, asc, sql, or, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export interface SearchFilters {
  category?: string;
  tags?: string[];
  status?: string;
  featured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  type: 'article' | 'faq' | 'video';
  relevanceScore: number;
  viewCount: number;
  helpfulCount: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  priority: number;
  featured: boolean;
  tags: string[];
  keywords: string[];
  tableOfContents: any[];
  attachments: any[];
  version: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  customFields: Record<string, any>;
  responseTime: number | null;
  resolutionTime: number | null;
  satisfactionRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentationService {
  /**
   * Search help content
   */
  static async searchHelpContent(
    query: string,
    filters: SearchFilters = {},
    userId?: string,
    sessionId?: string
  ): Promise<SearchResult[]> {
    try {
      // Track search analytics
      if (userId || sessionId) {
        await this.trackSearch(query, userId, sessionId);
      }

      const results: SearchResult[] = [];

      // Search articles
      const articles = await this.searchArticles(query, filters);
      results.push(...articles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        category: article.category.name,
        tags: article.tags,
        type: 'article' as const,
        relevanceScore: this.calculateRelevanceScore(query, article.title, article.content),
        viewCount: article.viewCount,
        helpfulCount: article.helpfulCount,
      })));

      // Search FAQ items
      const faqs = await this.searchFAQ(query, filters);
      results.push(...faqs.map(faq => ({
        id: faq.id,
        title: faq.question,
        slug: `faq-${faq.id}`,
        excerpt: faq.answer.substring(0, 200) + '...',
        category: faq.category?.name || 'FAQ',
        tags: faq.tags,
        type: 'faq' as const,
        relevanceScore: this.calculateRelevanceScore(query, faq.question, faq.answer),
        viewCount: faq.viewCount,
        helpfulCount: faq.helpfulCount,
      })));

      // Search video tutorials
      const videos = await this.searchVideos(query, filters);
      results.push(...videos.map(video => ({
        id: video.id,
        title: video.title,
        slug: `video-${video.id}`,
        excerpt: video.description || '',
        category: video.category?.name || 'Videos',
        tags: video.tags,
        type: 'video' as const,
        relevanceScore: this.calculateRelevanceScore(query, video.title, video.description || ''),
        viewCount: video.viewCount,
        helpfulCount: video.likeCount,
      })));

      // Sort by relevance score
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Error searching help content:', error);
      throw new Error('Failed to search help content');
    }
  }

  /**
   * Get article by slug
   */
  static async getArticle(slug: string, userId?: string): Promise<Article | null> {
    try {
      const article = await db
        .select({
          id: helpArticles.id,
          title: helpArticles.title,
          slug: helpArticles.slug,
          content: helpArticles.content,
          excerpt: helpArticles.excerpt,
          category: {
            id: helpCategories.id,
            name: helpCategories.name,
            slug: helpCategories.slug,
          },
          author: {
            id: users.id,
            name: users.firstName,
            email: users.emailAddress,
          },
          status: helpArticles.status,
          priority: helpArticles.priority,
          featured: helpArticles.featured,
          tags: helpArticles.tags,
          keywords: helpArticles.keywords,
          tableOfContents: helpArticles.tableOfContents,
          attachments: helpArticles.attachments,
          version: helpArticles.version,
          viewCount: helpArticles.viewCount,
          helpfulCount: helpArticles.helpfulCount,
          notHelpfulCount: helpArticles.notHelpfulCount,
          publishedAt: helpArticles.publishedAt,
          createdAt: helpArticles.createdAt,
          updatedAt: helpArticles.updatedAt,
        })
        .from(helpArticles)
        .innerJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
        .innerJoin(users, eq(helpArticles.authorId, users.id))
        .where(and(
          eq(helpArticles.slug, slug),
          eq(helpArticles.status, 'published'),
          eq(helpArticles.isLatest, true)
        ))
        .limit(1);

      if (article.length === 0) {
        return null;
      }

      // Increment view count
      await db
        .update(helpArticles)
        .set({
          viewCount: sql`${helpArticles.viewCount} + 1`,
          lastViewedAt: new Date(),
        })
        .where(eq(helpArticles.id, article[0].id));

      return article[0];
    } catch (error) {
      console.error('Error getting article:', error);
      throw new Error('Failed to get article');
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(helpCategories)
        .where(and(
          eq(helpCategories.isActive, true),
          eq(helpCategories.isPublic, true)
        ))
        .orderBy(asc(helpCategories.sortOrder), asc(helpCategories.name));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Get articles by category
   */
  static async getArticlesByCategory(
    categorySlug: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Article[]> {
    try {
      const articles = await db
        .select({
          id: helpArticles.id,
          title: helpArticles.title,
          slug: helpArticles.slug,
          content: helpArticles.content,
          excerpt: helpArticles.excerpt,
          category: {
            id: helpCategories.id,
            name: helpCategories.name,
            slug: helpCategories.slug,
          },
          author: {
            id: users.id,
            name: users.firstName,
            email: users.emailAddress,
          },
          status: helpArticles.status,
          priority: helpArticles.priority,
          featured: helpArticles.featured,
          tags: helpArticles.tags,
          keywords: helpArticles.keywords,
          tableOfContents: helpArticles.tableOfContents,
          attachments: helpArticles.attachments,
          version: helpArticles.version,
          viewCount: helpArticles.viewCount,
          helpfulCount: helpArticles.helpfulCount,
          notHelpfulCount: helpArticles.notHelpfulCount,
          publishedAt: helpArticles.publishedAt,
          createdAt: helpArticles.createdAt,
          updatedAt: helpArticles.updatedAt,
        })
        .from(helpArticles)
        .innerJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
        .innerJoin(users, eq(helpArticles.authorId, users.id))
        .where(and(
          eq(helpCategories.slug, categorySlug),
          eq(helpArticles.status, 'published'),
          eq(helpArticles.isLatest, true)
        ))
        .orderBy(desc(helpArticles.featured), desc(helpArticles.priority), desc(helpArticles.publishedAt))
        .limit(limit)
        .offset(offset);

      return articles;
    } catch (error) {
      console.error('Error getting articles by category:', error);
      throw new Error('Failed to get articles by category');
    }
  }

  /**
   * Submit article feedback
   */
  static async submitArticleFeedback(
    articleId: number,
    userId: string,
    isHelpful: boolean,
    rating?: number,
    comment?: string,
    userAgent?: string,
    ipAddress?: string,
    referrer?: string
  ): Promise<void> {
    try {
      await db.insert(helpArticleFeedback).values({
        articleId,
        userId,
        isHelpful,
        rating,
        comment,
        userAgent,
        ipAddress,
        referrer,
      });

      // Update article feedback counts
      if (isHelpful) {
        await db
          .update(helpArticles)
          .set({
            helpfulCount: sql`${helpArticles.helpfulCount} + 1`,
          })
          .where(eq(helpArticles.id, articleId));
      } else {
        await db
          .update(helpArticles)
          .set({
            notHelpfulCount: sql`${helpArticles.notHelpfulCount} + 1`,
          })
          .where(eq(helpArticles.id, articleId));
      }
    } catch (error) {
      console.error('Error submitting article feedback:', error);
      throw new Error('Failed to submit article feedback');
    }
  }

  /**
   * Create support ticket
   */
  static async createSupportTicket(
    userId: string,
    subject: string,
    description: string,
    category: string,
    priority: string = 'medium',
    organizationId?: string,
    attachments: any[] = [],
    tags: string[] = [],
    customFields: Record<string, any> = {}
  ): Promise<SupportTicket> {
    try {
      // Generate ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const ticket = await db.insert(supportTickets).values({
        ticketNumber,
        userId,
        organizationId,
        subject,
        description,
        priority,
        status: 'open',
        category,
        attachments,
        tags,
        customFields,
      }).returning();

      return ticket[0];
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  }

  /**
   * Get user's support tickets
   * @param userId - Clerk user ID (string), not database UUID
   */
  static async getUserTickets(
    userId: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SupportTicket[]> {
    try {
      // Build where conditions
      // Note: supportTickets.userId stores Clerk ID (text), so we filter directly
      const whereConditions = [eq(supportTickets.userId, userId)];
      if (status) {
        whereConditions.push(eq(supportTickets.status, status));
      }

      // First, try to get tickets with user joins
      // Use LEFT JOINs to handle cases where user data might not exist
      const creatorUsers = alias(users, 'creator_users');
      const assigneeUsers = alias(users, 'assignee_users');

      try {
        const tickets = await db
          .select({
            id: supportTickets.id,
            ticketNumber: supportTickets.ticketNumber,
            subject: supportTickets.subject,
            description: supportTickets.description,
            priority: supportTickets.priority,
            status: supportTickets.status,
            category: supportTickets.category,
            user: {
              id: creatorUsers.id,
              name: creatorUsers.firstName,
              email: creatorUsers.email,
            },
            assignee: {
              id: assigneeUsers.id,
              name: assigneeUsers.firstName,
              email: assigneeUsers.email,
            },
            tags: supportTickets.tags,
            customFields: supportTickets.customFields,
            responseTime: supportTickets.responseTime,
            resolutionTime: supportTickets.resolutionTime,
            satisfactionRating: supportTickets.satisfactionRating,
            createdAt: supportTickets.createdAt,
            updatedAt: supportTickets.updatedAt,
          })
          .from(supportTickets)
          .leftJoin(creatorUsers, eq(supportTickets.userId, creatorUsers.clerkId))
          .leftJoin(assigneeUsers, eq(supportTickets.assignedTo, assigneeUsers.clerkId))
          .where(and(...whereConditions))
          .orderBy(desc(supportTickets.createdAt))
          .limit(limit)
          .offset(offset);

        return tickets;
      } catch (joinError) {
        // If join fails (e.g., schema issue), fall back to query without joins
        console.warn('[DocumentationService] Join query failed, using fallback query:', joinError instanceof Error ? joinError.message : joinError);
        
        const simpleTickets = await db
          .select({
            id: supportTickets.id,
            ticketNumber: supportTickets.ticketNumber,
            subject: supportTickets.subject,
            description: supportTickets.description,
            priority: supportTickets.priority,
            status: supportTickets.status,
            category: supportTickets.category,
            tags: supportTickets.tags,
            customFields: supportTickets.customFields,
            responseTime: supportTickets.responseTime,
            resolutionTime: supportTickets.resolutionTime,
            satisfactionRating: supportTickets.satisfactionRating,
            createdAt: supportTickets.createdAt,
            updatedAt: supportTickets.updatedAt,
          })
          .from(supportTickets)
          .where(and(...whereConditions))
          .orderBy(desc(supportTickets.createdAt))
          .limit(limit)
          .offset(offset);
        
        // Return tickets without user/assignee info
        return simpleTickets.map(ticket => ({
          ...ticket,
          user: null,
          assignee: null,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log the full error for debugging
      console.error('[DocumentationService] Error getting user tickets:', {
        message: errorMessage,
        error: error instanceof Error ? {
          name: error.name,
          stack: error.stack,
        } : error,
      });
      
      // If table doesn't exist, return empty array instead of throwing
      if (errorMessage.includes('relation "financbase_support_tickets" does not exist') ||
          (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
        console.warn('[DocumentationService] Support tickets table does not exist, returning empty array');
        return [];
      }
      
      // For any other error, return empty array to prevent breaking the UI
      console.warn('[DocumentationService] Unexpected error, returning empty array to prevent UI breakage');
      return [];
    }
  }

  /**
   * Get all support tickets (admin only)
   * @param filters - Filter options
   * @param limit - Number of tickets to return
   * @param offset - Number of tickets to skip
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order (asc or desc)
   */
  static async getAllTickets(
    filters: {
      status?: string;
      priority?: string;
      category?: string;
      assignedTo?: string;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    limit: number = 20,
    offset: number = 0,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<SupportTicket[]> {
    try {
      const whereConditions = [];
      
      if (filters.status) {
        whereConditions.push(eq(supportTickets.status, filters.status));
      }
      if (filters.priority) {
        whereConditions.push(eq(supportTickets.priority, filters.priority));
      }
      if (filters.category) {
        whereConditions.push(eq(supportTickets.category, filters.category));
      }
      if (filters.assignedTo) {
        whereConditions.push(eq(supportTickets.assignedTo, filters.assignedTo));
      }
      if (filters.userId) {
        whereConditions.push(eq(supportTickets.userId, filters.userId));
      }
      if (filters.dateFrom) {
        whereConditions.push(sql`${supportTickets.createdAt} >= ${filters.dateFrom}`);
      }
      if (filters.dateTo) {
        whereConditions.push(sql`${supportTickets.createdAt} <= ${filters.dateTo}`);
      }

      const creatorUsers = alias(users, 'creator_users');
      const assigneeUsers = alias(users, 'assignee_users');

      // Map sortBy to actual column
      const sortColumnMap: Record<string, any> = {
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        status: supportTickets.status,
        priority: supportTickets.priority,
        subject: supportTickets.subject,
        ticketNumber: supportTickets.ticketNumber,
      };
      
      const sortColumn = sortColumnMap[sortBy] || supportTickets.createdAt;
      const orderByClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

      const tickets = await db
        .select({
          id: supportTickets.id,
          ticketNumber: supportTickets.ticketNumber,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          userId: supportTickets.userId,
          organizationId: supportTickets.organizationId,
          assignedTo: supportTickets.assignedTo,
          assignedAt: supportTickets.assignedAt,
          resolution: supportTickets.resolution,
          resolvedAt: supportTickets.resolvedAt,
          closedAt: supportTickets.closedAt,
          attachments: supportTickets.attachments,
          tags: supportTickets.tags,
          customFields: supportTickets.customFields,
          responseTime: supportTickets.responseTime,
          resolutionTime: supportTickets.resolutionTime,
          satisfactionRating: supportTickets.satisfactionRating,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          user: {
            id: creatorUsers.id,
            name: creatorUsers.firstName,
            email: creatorUsers.email,
            clerkId: creatorUsers.clerkId,
          },
          assignee: {
            id: assigneeUsers.id,
            name: assigneeUsers.firstName,
            email: assigneeUsers.email,
            clerkId: assigneeUsers.clerkId,
          },
        })
        .from(supportTickets)
        .leftJoin(creatorUsers, eq(supportTickets.userId, creatorUsers.clerkId))
        .leftJoin(assigneeUsers, eq(supportTickets.assignedTo, assigneeUsers.clerkId))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      return tickets;
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw new Error('Failed to get tickets');
    }
  }

  /**
   * Get ticket by ID with messages
   */
  static async getTicketById(ticketId: number): Promise<SupportTicket & { messages: any[] } | null> {
    try {
      const creatorUsers = alias(users, 'creator_users');
      const assigneeUsers = alias(users, 'assignee_users');
      const messageAuthors = alias(users, 'message_authors');

      const ticket = await db
        .select({
          id: supportTickets.id,
          ticketNumber: supportTickets.ticketNumber,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          userId: supportTickets.userId,
          organizationId: supportTickets.organizationId,
          assignedTo: supportTickets.assignedTo,
          assignedAt: supportTickets.assignedAt,
          resolution: supportTickets.resolution,
          resolvedAt: supportTickets.resolvedAt,
          closedAt: supportTickets.closedAt,
          attachments: supportTickets.attachments,
          tags: supportTickets.tags,
          customFields: supportTickets.customFields,
          responseTime: supportTickets.responseTime,
          resolutionTime: supportTickets.resolutionTime,
          satisfactionRating: supportTickets.satisfactionRating,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          user: {
            id: creatorUsers.id,
            name: creatorUsers.firstName,
            email: creatorUsers.email,
            clerkId: creatorUsers.clerkId,
          },
          assignee: {
            id: assigneeUsers.id,
            name: assigneeUsers.firstName,
            email: assigneeUsers.email,
            clerkId: assigneeUsers.clerkId,
          },
        })
        .from(supportTickets)
        .leftJoin(creatorUsers, eq(supportTickets.userId, creatorUsers.clerkId))
        .leftJoin(assigneeUsers, eq(supportTickets.assignedTo, assigneeUsers.clerkId))
        .where(eq(supportTickets.id, ticketId))
        .limit(1);

      if (!ticket[0]) {
        return null;
      }

      // Get messages for this ticket
      const messages = await db
        .select({
          id: supportTicketMessages.id,
          ticketId: supportTicketMessages.ticketId,
          authorId: supportTicketMessages.authorId,
          content: supportTicketMessages.content,
          messageType: supportTicketMessages.messageType,
          attachments: supportTicketMessages.attachments,
          isInternal: supportTicketMessages.isInternal,
          isRead: supportTicketMessages.isRead,
          readAt: supportTicketMessages.readAt,
          userAgent: supportTicketMessages.userAgent,
          ipAddress: supportTicketMessages.ipAddress,
          createdAt: supportTicketMessages.createdAt,
          author: {
            id: messageAuthors.id,
            name: messageAuthors.firstName,
            email: messageAuthors.email,
            clerkId: messageAuthors.clerkId,
          },
        })
        .from(supportTicketMessages)
        .leftJoin(messageAuthors, eq(supportTicketMessages.authorId, messageAuthors.clerkId))
        .where(eq(supportTicketMessages.ticketId, ticketId))
        .orderBy(asc(supportTicketMessages.createdAt));

      return {
        ...ticket[0],
        messages,
      };
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      throw new Error('Failed to get ticket');
    }
  }

  /**
   * Update ticket
   */
  static async updateTicket(
    ticketId: number,
    updates: {
      status?: string;
      priority?: string;
      assignee?: string | null;
      tags?: string[];
      customFields?: Record<string, any>;
      resolution?: string;
    }
  ): Promise<SupportTicket> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.status !== undefined) {
        updateData.status = updates.status;
        if (updates.status === 'resolved' && !updateData.resolvedAt) {
          updateData.resolvedAt = new Date();
        }
        if (updates.status === 'closed' && !updateData.closedAt) {
          updateData.closedAt = new Date();
        }
      }
      if (updates.priority !== undefined) {
        updateData.priority = updates.priority;
      }
      if (updates.assignee !== undefined) {
        updateData.assignedTo = updates.assignee;
        updateData.assignedAt = updates.assignee ? new Date() : null;
      }
      if (updates.tags !== undefined) {
        updateData.tags = updates.tags;
      }
      if (updates.customFields !== undefined) {
        updateData.customFields = updates.customFields;
      }
      if (updates.resolution !== undefined) {
        updateData.resolution = updates.resolution;
      }

      const updated = await db
        .update(supportTickets)
        .set(updateData)
        .where(eq(supportTickets.id, ticketId))
        .returning();

      if (!updated[0]) {
        throw new Error('Ticket not found');
      }

      return updated[0];
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw new Error('Failed to update ticket');
    }
  }

  /**
   * Assign ticket to agent
   */
  static async assignTicket(
    ticketId: number,
    assignedTo: string | null
  ): Promise<SupportTicket> {
    try {
      const updateData: any = {
        assignedTo,
        assignedAt: assignedTo ? new Date() : null,
        updatedAt: new Date(),
      };

      const updated = await db
        .update(supportTickets)
        .set(updateData)
        .where(eq(supportTickets.id, ticketId))
        .returning();

      if (!updated[0]) {
        throw new Error('Ticket not found');
      }

      return updated[0];
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw new Error('Failed to assign ticket');
    }
  }

  /**
   * Add message to ticket
   */
  static async addTicketMessage(
    ticketId: number,
    authorId: string,
    content: string,
    messageType: 'message' | 'note' | 'system' = 'message',
    isInternal: boolean = false,
    attachments: any[] = [],
    userAgent?: string,
    ipAddress?: string
  ): Promise<any> {
    try {
      const message = await db
        .insert(supportTicketMessages)
        .values({
          ticketId,
          authorId,
          content,
          messageType,
          isInternal,
          attachments,
          userAgent,
          ipAddress,
        })
        .returning();

      // Update ticket updatedAt timestamp
      await db
        .update(supportTickets)
        .set({ updatedAt: new Date() })
        .where(eq(supportTickets.id, ticketId));

      // If this is the first message from support, calculate response time
      if (!isInternal && messageType === 'message') {
        const ticket = await db
          .select()
          .from(supportTickets)
          .where(eq(supportTickets.id, ticketId))
          .limit(1);

        if (ticket[0] && !ticket[0].responseTime) {
          const createdAt = ticket[0].createdAt;
          const now = new Date();
          const responseTimeMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
          
          await db
            .update(supportTickets)
            .set({ responseTime: responseTimeMinutes })
            .where(eq(supportTickets.id, ticketId));
        }
      }

      return message[0];
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw new Error('Failed to add message');
    }
  }

  /**
   * Get ticket analytics
   */
  static async getTicketAnalytics(dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      const whereConditions = [];
      if (dateFrom) {
        whereConditions.push(sql`${supportTickets.createdAt} >= ${dateFrom}`);
      }
      if (dateTo) {
        whereConditions.push(sql`${supportTickets.createdAt} <= ${dateTo}`);
      }

      const allTickets = await db
        .select()
        .from(supportTickets)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const totalTickets = allTickets.length;
      const byStatus = {
        open: allTickets.filter(t => t.status === 'open').length,
        in_progress: allTickets.filter(t => t.status === 'in_progress').length,
        resolved: allTickets.filter(t => t.status === 'resolved').length,
        closed: allTickets.filter(t => t.status === 'closed').length,
      };

      const byPriority = {
        low: allTickets.filter(t => t.priority === 'low').length,
        medium: allTickets.filter(t => t.priority === 'medium').length,
        high: allTickets.filter(t => t.priority === 'high').length,
        urgent: allTickets.filter(t => t.priority === 'urgent').length,
      };

      const byCategory = {
        technical: allTickets.filter(t => t.category === 'technical').length,
        billing: allTickets.filter(t => t.category === 'billing').length,
        feature_request: allTickets.filter(t => t.category === 'feature_request').length,
        bug_report: allTickets.filter(t => t.category === 'bug_report').length,
        general: allTickets.filter(t => t.category === 'general').length,
      };

      const ticketsWithResponseTime = allTickets.filter(t => t.responseTime !== null);
      const avgResponseTime = ticketsWithResponseTime.length > 0
        ? ticketsWithResponseTime.reduce((sum, t) => sum + (t.responseTime || 0), 0) / ticketsWithResponseTime.length
        : 0;

      const ticketsWithResolutionTime = allTickets.filter(t => t.resolutionTime !== null);
      const avgResolutionTime = ticketsWithResolutionTime.length > 0
        ? ticketsWithResolutionTime.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / ticketsWithResolutionTime.length
        : 0;

      const ticketsWithRating = allTickets.filter(t => t.satisfactionRating !== null);
      const avgSatisfactionRating = ticketsWithRating.length > 0
        ? ticketsWithRating.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ticketsWithRating.length
        : 0;

      return {
        totalTickets,
        byStatus,
        byPriority,
        byCategory,
        avgResponseTime: Math.round(avgResponseTime),
        avgResolutionTime: Math.round(avgResolutionTime),
        avgSatisfactionRating: Math.round(avgSatisfactionRating * 10) / 10,
        totalWithResponseTime: ticketsWithResponseTime.length,
        totalWithResolutionTime: ticketsWithResolutionTime.length,
        totalWithRating: ticketsWithRating.length,
      };
    } catch (error) {
      console.error('Error getting ticket analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  /**
   * Get FAQ items
   */
  static async getFAQItems(categoryId?: number, limit: number = 50): Promise<any[]> {
    try {
      let query = db
        .select()
        .from(faqItems)
        .where(and(
          eq(faqItems.isPublished, true)
        ));

      if (categoryId) {
        query = query.where(and(
          eq(faqItems.isPublished, true),
          eq(faqItems.categoryId, categoryId)
        ));
      }

      return await query
        .orderBy(desc(faqItems.featured), desc(faqItems.priority), asc(faqItems.question))
        .limit(limit);
    } catch (error) {
      console.error('Error getting FAQ items:', error);
      throw new Error('Failed to get FAQ items');
    }
  }

  /**
   * Get video tutorials
   */
  static async getVideoTutorials(
    categoryId?: number,
    difficulty?: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      let query = db
        .select()
        .from(videoTutorials)
        .where(eq(videoTutorials.isPublished, true));

      if (categoryId) {
        query = query.where(and(
          eq(videoTutorials.isPublished, true),
          eq(videoTutorials.categoryId, categoryId)
        ));
      }

      if (difficulty) {
        query = query.where(and(
          eq(videoTutorials.isPublished, true),
          eq(videoTutorials.difficulty, difficulty)
        ));
      }

      return await query
        .orderBy(desc(videoTutorials.featured), desc(videoTutorials.viewCount))
        .limit(limit);
    } catch (error) {
      console.error('Error getting video tutorials:', error);
      throw new Error('Failed to get video tutorials');
    }
  }

  /**
   * Track search analytics
   */
  private static async trackSearch(
    query: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      await db.insert(helpSearchAnalytics).values({
        userId,
        sessionId,
        query,
        resultsCount: 0, // Will be updated when results are clicked
        userAgent: 'Unknown',
        ipAddress: 'Unknown',
      });
    } catch (error) {
      console.error('Error tracking search:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Search articles
   */
  private static async searchArticles(query: string, filters: SearchFilters): Promise<any[]> {
    const searchTerm = `%${query}%`;
    
    let whereConditions = [
      eq(helpArticles.status, 'published'),
      eq(helpArticles.isLatest, true),
      or(
        like(helpArticles.title, searchTerm),
        like(helpArticles.content, searchTerm),
        like(helpArticles.excerpt, searchTerm)
      )
    ];

    if (filters.category) {
      whereConditions.push(eq(helpCategories.slug, filters.category));
    }

    if (filters.featured !== undefined) {
      whereConditions.push(eq(helpArticles.featured, filters.featured));
    }

    return await db
      .select({
        id: helpArticles.id,
        title: helpArticles.title,
        slug: helpArticles.slug,
        content: helpArticles.content,
        excerpt: helpArticles.excerpt,
        category: {
          id: helpCategories.id,
          name: helpCategories.name,
          slug: helpCategories.slug,
        },
        tags: helpArticles.tags,
        viewCount: helpArticles.viewCount,
        helpfulCount: helpArticles.helpfulCount,
      })
      .from(helpArticles)
      .innerJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
      .where(and(...whereConditions))
      .orderBy(desc(helpArticles.featured), desc(helpArticles.priority));
  }

  /**
   * Search FAQ items
   */
  private static async searchFAQ(query: string, filters: SearchFilters): Promise<any[]> {
    const searchTerm = `%${query}%`;
    
    let whereConditions = [
      eq(faqItems.isPublished, true),
      or(
        like(faqItems.question, searchTerm),
        like(faqItems.answer, searchTerm)
      )
    ];

    if (filters.category) {
      whereConditions.push(eq(helpCategories.slug, filters.category));
    }

    return await db
      .select({
        id: faqItems.id,
        question: faqItems.question,
        answer: faqItems.answer,
        category: {
          id: helpCategories.id,
          name: helpCategories.name,
          slug: helpCategories.slug,
        },
        tags: faqItems.tags,
        viewCount: faqItems.viewCount,
        helpfulCount: faqItems.helpfulCount,
      })
      .from(faqItems)
      .leftJoin(helpCategories, eq(faqItems.categoryId, helpCategories.id))
      .where(and(...whereConditions))
      .orderBy(desc(faqItems.featured), desc(faqItems.priority));
  }

  /**
   * Search videos
   */
  private static async searchVideos(query: string, filters: SearchFilters): Promise<any[]> {
    const searchTerm = `%${query}%`;
    
    let whereConditions = [
      eq(videoTutorials.isPublished, true),
      or(
        like(videoTutorials.title, searchTerm),
        like(videoTutorials.description, searchTerm)
      )
    ];

    if (filters.category) {
      whereConditions.push(eq(helpCategories.slug, filters.category));
    }

    return await db
      .select({
        id: videoTutorials.id,
        title: videoTutorials.title,
        description: videoTutorials.description,
        videoUrl: videoTutorials.videoUrl,
        thumbnailUrl: videoTutorials.thumbnailUrl,
        duration: videoTutorials.duration,
        category: {
          id: helpCategories.id,
          name: helpCategories.name,
          slug: helpCategories.slug,
        },
        tags: videoTutorials.tags,
        viewCount: videoTutorials.viewCount,
        likeCount: videoTutorials.likeCount,
      })
      .from(videoTutorials)
      .leftJoin(helpCategories, eq(videoTutorials.categoryId, helpCategories.id))
      .where(and(...whereConditions))
      .orderBy(desc(videoTutorials.featured), desc(videoTutorials.viewCount));
  }

  /**
   * Calculate relevance score for search results
   */
  private static calculateRelevanceScore(query: string, title: string, content: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    let score = 0;

    // Title matches are worth more
    if (titleLower.includes(queryLower)) {
      score += 10;
    }

    // Content matches
    if (contentLower.includes(queryLower)) {
      score += 5;
    }

    // Exact phrase matches
    if (titleLower.includes(queryLower)) {
      score += 15;
    }

    return score;
  }
}
