import { db } from '@/lib/db';
import {
  customDashboards,
  dashboardWidgets,
  dashboardWidgetData,
  dashboardShares,
  widgetTemplates,
  dashboardAnalytics
} from '@/lib/db/schemas';
import { eq, and, desc, asc, sql, inArray } from 'drizzle-orm';

export interface DashboardLayout {
  columns: number;
  rows: number;
  cellSize: { width: number; height: number };
  gap: number;
  padding: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  type: string;
  title: string;
  dataSource?: string;
  filters?: Record<string, any>;
  appearance?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
  behavior?: {
    refreshInterval?: number;
    isCollapsible?: boolean;
    isResizable?: boolean;
    isMovable?: boolean;
  };
}

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layout: DashboardLayout;
  widgets: Array<{
    id: number;
    type: string;
    title: string;
    position: WidgetPosition;
    config: WidgetConfig;
    isVisible: boolean;
  }>;
  theme: string;
  colorScheme: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  type: string;
  defaultConfig: WidgetConfig;
  defaultSize: WidgetPosition;
  isOfficial: boolean;
  usageCount: number;
  rating: number;
}

export class DashboardBuilderService {
  /**
   * Create a new dashboard
   */
  static async createDashboard(
    userId: string,
    name: string,
    description?: string,
    organizationId?: string,
    layout?: DashboardLayout
  ): Promise<Dashboard> {
    try {
      const defaultLayout: DashboardLayout = {
        columns: 12,
        rows: 8,
        cellSize: { width: 200, height: 150 },
        gap: 16,
        padding: 16,
      };

      const dashboard = await db.insert(customDashboards).values({
        userId,
        organizationId,
        name,
        description,
        layout: layout || defaultLayout,
        widgets: [],
        settings: {},
        permissions: {},
        theme: 'light',
        colorScheme: 'blue',
      }).returning();

      return dashboard[0];
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw new Error('Failed to create dashboard');
    }
  }

  /**
   * Get user's dashboards
   */
  static async getUserDashboards(
    userId: string,
    organizationId?: string
  ): Promise<Dashboard[]> {
    try {
      const dashboards = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.userId, userId),
          organizationId ? eq(customDashboards.organizationId, organizationId) : undefined
        ))
        .orderBy(desc(customDashboards.updatedAt));

      return dashboards;
    } catch (error) {
      console.error('Error fetching user dashboards:', error);
      throw new Error('Failed to fetch dashboards');
    }
  }

  /**
   * Get dashboard by ID
   */
  static async getDashboard(
    dashboardId: number,
    userId: string
  ): Promise<Dashboard | null> {
    try {
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.userId, userId)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        return null;
      }

      // Get widgets for this dashboard
      const widgets = await db
        .select()
        .from(dashboardWidgets)
        .where(eq(dashboardWidgets.dashboardId, dashboardId))
        .orderBy(asc(dashboardWidgets.position));

      return {
        ...dashboard[0],
        widgets: widgets.map(widget => ({
          id: widget.id,
          type: widget.type,
          title: widget.title,
          position: widget.position as WidgetPosition,
          config: widget.config as WidgetConfig,
          isVisible: widget.isVisible,
        })),
      };
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw new Error('Failed to fetch dashboard');
    }
  }

  /**
   * Update dashboard
   */
  static async updateDashboard(
    dashboardId: number,
    userId: string,
    updates: Partial<{
      name: string;
      description: string;
      layout: DashboardLayout;
      theme: string;
      colorScheme: string;
      isPublic: boolean;
    }>
  ): Promise<Dashboard> {
    try {
      const dashboard = await db
        .update(customDashboards)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.userId, userId)
        ))
        .returning();

      if (dashboard.length === 0) {
        throw new Error('Dashboard not found');
      }

      return dashboard[0];
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw new Error('Failed to update dashboard');
    }
  }

  /**
   * Delete dashboard
   */
  static async deleteDashboard(
    dashboardId: number,
    userId: string
  ): Promise<void> {
    try {
      await db
        .delete(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.userId, userId)
        ));
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw new Error('Failed to delete dashboard');
    }
  }

  /**
   * Add widget to dashboard
   */
  static async addWidget(
    dashboardId: number,
    userId: string,
    widget: {
      type: string;
      title: string;
      position: WidgetPosition;
      config: WidgetConfig;
      dataSource?: string;
    }
  ): Promise<number> {
    try {
      // Verify dashboard ownership
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.userId, userId)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        throw new Error('Dashboard not found');
      }

      const newWidget = await db.insert(dashboardWidgets).values({
        dashboardId,
        type: widget.type,
        title: widget.title,
        position: widget.position,
        size: { width: widget.position.w, height: widget.position.h },
        config: widget.config,
        dataSource: widget.dataSource,
        filters: {},
        isVisible: true,
        isCollapsible: true,
        isResizable: true,
        isMovable: true,
      }).returning();

      return newWidget[0].id;
    } catch (error) {
      console.error('Error adding widget:', error);
      throw new Error('Failed to add widget');
    }
  }

  /**
   * Update widget
   */
  static async updateWidget(
    widgetId: number,
    userId: string,
    updates: Partial<{
      title: string;
      position: WidgetPosition;
      config: WidgetConfig;
      filters: Record<string, any>;
      isVisible: boolean;
    }>
  ): Promise<void> {
    try {
      // Verify widget ownership through dashboard
      const widget = await db
        .select()
        .from(dashboardWidgets)
        .innerJoin(customDashboards, eq(dashboardWidgets.dashboardId, customDashboards.id))
        .where(and(
          eq(dashboardWidgets.id, widgetId),
          eq(customDashboards.userId, userId)
        ))
        .limit(1);

      if (widget.length === 0) {
        throw new Error('Widget not found');
      }

      await db
        .update(dashboardWidgets)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(dashboardWidgets.id, widgetId));
    } catch (error) {
      console.error('Error updating widget:', error);
      throw new Error('Failed to update widget');
    }
  }

  /**
   * Remove widget from dashboard
   */
  static async removeWidget(
    widgetId: number,
    userId: string
  ): Promise<void> {
    try {
      // Verify widget ownership through dashboard
      const widget = await db
        .select()
        .from(dashboardWidgets)
        .innerJoin(customDashboards, eq(dashboardWidgets.dashboardId, customDashboards.id))
        .where(and(
          eq(dashboardWidgets.id, widgetId),
          eq(customDashboards.userId, userId)
        ))
        .limit(1);

      if (widget.length === 0) {
        throw new Error('Widget not found');
      }

      await db
        .delete(dashboardWidgets)
        .where(eq(dashboardWidgets.id, widgetId));
    } catch (error) {
      console.error('Error removing widget:', error);
      throw new Error('Failed to remove widget');
    }
  }

  /**
   * Get widget templates
   */
  static async getWidgetTemplates(
    category?: string,
    limit: number = 50
  ): Promise<WidgetTemplate[]> {
    try {
      let query = db
        .select()
        .from(widgetTemplates)
        .where(eq(widgetTemplates.isActive, true));

      if (category) {
        query = query.where(and(
          eq(widgetTemplates.isActive, true),
          eq(widgetTemplates.category, category)
        ));
      }

      const templates = await query
        .orderBy(desc(widgetTemplates.usageCount), desc(widgetTemplates.rating))
        .limit(limit);

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        type: template.type,
        defaultConfig: template.defaultConfig as WidgetConfig,
        defaultSize: template.defaultSize as WidgetPosition,
        isOfficial: template.isOfficial,
        usageCount: template.usageCount,
        rating: template.rating,
      }));
    } catch (error) {
      console.error('Error fetching widget templates:', error);
      throw new Error('Failed to fetch widget templates');
    }
  }

  /**
   * Share dashboard
   */
  static async shareDashboard(
    dashboardId: number,
    userId: string,
    shareConfig: {
      shareType: 'user' | 'organization' | 'public' | 'link';
      shareWith?: string;
      permissions: {
        canView: boolean;
        canEdit: boolean;
        canShare: boolean;
        canExport: boolean;
      };
      expiresAt?: Date;
      password?: string;
      maxViews?: number;
    }
  ): Promise<string> {
    try {
      // Verify dashboard ownership
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.userId, userId)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        throw new Error('Dashboard not found');
      }

      // Generate share token for link sharing
      const shareToken = shareConfig.shareType === 'link' 
        ? `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : undefined;

      await db.insert(dashboardShares).values({
        dashboardId,
        shareType: shareConfig.shareType,
        shareWith: shareConfig.shareWith,
        shareToken,
        canView: shareConfig.permissions.canView,
        canEdit: shareConfig.permissions.canEdit,
        canShare: shareConfig.permissions.canShare,
        canExport: shareConfig.permissions.canExport,
        expiresAt: shareConfig.expiresAt,
        password: shareConfig.password,
        maxViews: shareConfig.maxViews,
      });

      return shareToken || '';
    } catch (error) {
      console.error('Error sharing dashboard:', error);
      throw new Error('Failed to share dashboard');
    }
  }

  /**
   * Get shared dashboard
   */
  static async getSharedDashboard(
    shareToken: string,
    password?: string
  ): Promise<Dashboard | null> {
    try {
      const share = await db
        .select()
        .from(dashboardShares)
        .innerJoin(customDashboards, eq(dashboardShares.dashboardId, customDashboards.id))
        .where(and(
          eq(dashboardShares.shareToken, shareToken),
          eq(dashboardShares.isActive, true)
        ))
        .limit(1);

      if (share.length === 0) {
        return null;
      }

      // Check password if required
      if (share[0].password && share[0].password !== password) {
        throw new Error('Invalid password');
      }

      // Check expiration
      if (share[0].expiresAt && new Date() > share[0].expiresAt) {
        throw new Error('Share link has expired');
      }

      // Check view limit
      if (share[0].maxViews && share[0].viewCount >= share[0].maxViews) {
        throw new Error('Share link has reached maximum views');
      }

      // Update view count
      await db
        .update(dashboardShares)
        .set({
          viewCount: sql`${dashboardShares.viewCount} + 1`,
          lastAccessedAt: new Date(),
        })
        .where(eq(dashboardShares.id, share[0].id));

      // Get dashboard with widgets
      return await this.getDashboard(share[0].dashboardId, share[0].userId);
    } catch (error) {
      console.error('Error fetching shared dashboard:', error);
      throw new Error('Failed to fetch shared dashboard');
    }
  }

  /**
   * Track dashboard analytics
   */
  static async trackDashboardEvent(
    dashboardId: number,
    userId: string,
    eventType: 'view' | 'edit' | 'share' | 'export',
    eventData: Record<string, any> = {},
    sessionId?: string
  ): Promise<void> {
    try {
      await db.insert(dashboardAnalytics).values({
        dashboardId,
        userId,
        eventType,
        eventData,
        sessionId,
        timestamp: new Date(),
      });

      // Update dashboard view count
      if (eventType === 'view') {
        await db
          .update(customDashboards)
          .set({
            viewCount: sql`${customDashboards.viewCount} + 1`,
            lastViewedAt: new Date(),
          })
          .where(eq(customDashboards.id, dashboardId));
      }
    } catch (error) {
      console.error('Error tracking dashboard event:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get dashboard analytics
   */
  static async getDashboardAnalytics(
    dashboardId: number,
    userId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<any[]> {
    try {
      let query = db
        .select()
        .from(dashboardAnalytics)
        .where(eq(dashboardAnalytics.dashboardId, dashboardId));

      if (dateFrom) {
        query = query.where(sql`${dashboardAnalytics.timestamp} >= ${dateFrom}`);
      }

      if (dateTo) {
        query = query.where(sql`${dashboardAnalytics.timestamp} <= ${dateTo}`);
      }

      return await query
        .orderBy(desc(dashboardAnalytics.timestamp));
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw new Error('Failed to fetch dashboard analytics');
    }
  }

  /**
   * Duplicate dashboard
   */
  static async duplicateDashboard(
    dashboardId: number,
    userId: string,
    newName: string
  ): Promise<Dashboard> {
    try {
      // Get original dashboard
      const originalDashboard = await this.getDashboard(dashboardId, userId);
      if (!originalDashboard) {
        throw new Error('Dashboard not found');
      }

      // Create new dashboard
      const newDashboard = await this.createDashboard(
        userId,
        newName,
        `Copy of ${originalDashboard.name}`,
        undefined,
        originalDashboard.layout
      );

      // Copy widgets
      for (const widget of originalDashboard.widgets) {
        await this.addWidget(newDashboard.id, userId, {
          type: widget.type,
          title: widget.title,
          position: widget.position,
          config: widget.config,
        });
      }

      return newDashboard;
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
      throw new Error('Failed to duplicate dashboard');
    }
  }
}
