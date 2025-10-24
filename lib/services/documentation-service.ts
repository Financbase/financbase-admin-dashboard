import { db } from '@/lib/db';
import {
  helpArticles,
  helpCategories,
  helpArticleFeedback,
  helpSearchAnalytics,
  supportTickets,
  supportTicketMessages,
  videoTutorials,
  faqItems
} from '@/lib/db/schemas';
import { eq, and, like, desc, asc, sql, or, inArray } from 'drizzle-orm';

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
   */
  static async getUserTickets(
    userId: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SupportTicket[]> {
    try {
      let query = db
        .select({
          id: supportTickets.id,
          ticketNumber: supportTickets.ticketNumber,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          user: {
            id: users.id,
            name: users.firstName,
            email: users.emailAddress,
          },
          assignee: {
            id: users.id,
            name: users.firstName,
            email: users.emailAddress,
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
        .innerJoin(users, eq(supportTickets.userId, users.id))
        .leftJoin(users, eq(supportTickets.assignedTo, users.id))
        .where(eq(supportTickets.userId, userId));

      if (status) {
        query = query.where(and(
          eq(supportTickets.userId, userId),
          eq(supportTickets.status, status)
        ));
      }

      const tickets = await query
        .orderBy(desc(supportTickets.createdAt))
        .limit(limit)
        .offset(offset);

      return tickets;
    } catch (error) {
      console.error('Error getting user tickets:', error);
      throw new Error('Failed to get user tickets');
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
