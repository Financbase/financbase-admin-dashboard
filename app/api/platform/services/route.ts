/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  platformServices, 
  platformServiceInstances, 
  platformServiceMetrics,
  platformServiceLogs,
  workflows,
  webhooks,
  integrations,
  integrationConnections
} from '@/lib/db/schemas';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';

/**
 * GET /api/platform/services
 * Get comprehensive Platform Services overview
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';
    const includeLogs = searchParams.get('includeLogs') === 'true';

    // Get Platform Services overview
    const servicesOverview = await db
      .select({
        service: platformServices,
        instanceCount: count(platformServiceInstances.id),
        activeInstances: sql<number>`count(case when ${platformServiceInstances.status} = 'active' then 1 end)`,
      })
      .from(platformServices)
      .leftJoin(platformServiceInstances, eq(platformServices.id, platformServiceInstances.serviceId))
      .where(
        organizationId 
          ? and(
              eq(platformServices.organizationId, organizationId),
              eq(platformServices.isActive, true)
            )
          : eq(platformServices.isActive, true)
      )
      .groupBy(platformServices.id)
      .orderBy(desc(platformServices.createdAt));

    // Get service statistics
    const serviceStats = await db
      .select({
        totalServices: count(platformServices.id),
        activeServices: sql<number>`count(case when ${platformServices.isActive} = true then 1 end)`,
        totalInstances: count(platformServiceInstances.id),
        activeInstances: sql<number>`count(case when ${platformServiceInstances.status} = 'active' then 1 end)`,
      })
      .from(platformServices)
      .leftJoin(platformServiceInstances, eq(platformServices.id, platformServiceInstances.serviceId))
      .where(
        organizationId 
          ? eq(platformServices.organizationId, organizationId)
          : undefined
      );

    // Get workflows statistics
    const workflowsStats = await db
      .select({
        totalWorkflows: count(workflows.id),
        activeWorkflows: sql<number>`count(case when ${workflows.isActive} = true then 1 end)`,
        totalExecutions: sql<number>`sum(${workflows.executionCount})`,
        successRate: sql<number>`
          case 
            when sum(${workflows.executionCount}) > 0 
            then (sum(${workflows.successCount})::float / sum(${workflows.executionCount})::float) * 100
            else 0
          end
        `,
      })
      .from(workflows)
      .where(
        organizationId 
          ? and(
              eq(workflows.userId, userId),
              // Add organizationId filter when available in workflows schema
            )
          : eq(workflows.userId, userId)
      );

    // Get webhooks statistics
    const webhooksStats = await db
      .select({
        totalWebhooks: count(webhooks.id),
        activeWebhooks: sql<number>`count(case when ${webhooks.isActive} = true then 1 end)`,
        totalDeliveries: sql<number>`sum(${webhooks.deliveryCount})`,
        successRate: sql<number>`
          case 
            when sum(${webhooks.deliveryCount}) > 0 
            then (sum(${webhooks.successCount})::float / sum(${webhooks.deliveryCount})::float) * 100
            else 0
          end
        `,
      })
      .from(webhooks)
      .where(
        organizationId 
          ? and(
              eq(webhooks.userId, userId),
              eq(webhooks.organizationId, organizationId)
            )
          : eq(webhooks.userId, userId)
      );

    // Get integrations statistics
    const integrationsStats = await db
      .select({
        totalIntegrations: count(integrations.id),
        activeIntegrations: sql<number>`count(case when ${integrations.isActive} = true then 1 end)`,
        totalConnections: count(integrationConnections.id),
        activeConnections: sql<number>`count(case when ${integrationConnections.isActive} = true then 1 end)`,
      })
      .from(integrations)
      .leftJoin(integrationConnections, eq(integrations.id, integrationConnections.integrationId))
      .where(
        organizationId 
          ? and(
              eq(integrationConnections.userId, userId),
              eq(integrationConnections.organizationId, organizationId)
            )
          : eq(integrationConnections.userId, userId)
      );

    // Get recent metrics if requested
    let recentMetrics = null;
    if (includeMetrics) {
      recentMetrics = await db
        .select()
        .from(platformServiceMetrics)
        .where(
          organizationId 
            ? and(
                eq(platformServiceMetrics.organizationId, organizationId),
                sql`${platformServiceMetrics.timestamp} > NOW() - INTERVAL '24 hours'`
              )
            : sql`${platformServiceMetrics.timestamp} > NOW() - INTERVAL '24 hours'`
        )
        .orderBy(desc(platformServiceMetrics.timestamp))
        .limit(100);
    }

    // Get recent logs if requested
    let recentLogs = null;
    if (includeLogs) {
      recentLogs = await db
        .select()
        .from(platformServiceLogs)
        .where(
          organizationId 
            ? and(
                eq(platformServiceLogs.organizationId, organizationId),
                sql`${platformServiceLogs.timestamp} > NOW() - INTERVAL '24 hours'`
              )
            : sql`${platformServiceLogs.timestamp} > NOW() - INTERVAL '24 hours'`
        )
        .orderBy(desc(platformServiceLogs.timestamp))
        .limit(100);
    }

    return NextResponse.json({
      overview: {
        services: servicesOverview,
        statistics: {
          platform: serviceStats[0] || {
            totalServices: 0,
            activeServices: 0,
            totalInstances: 0,
            activeInstances: 0,
          },
          workflows: workflowsStats[0] || {
            totalWorkflows: 0,
            activeWorkflows: 0,
            totalExecutions: 0,
            successRate: 0,
          },
          webhooks: webhooksStats[0] || {
            totalWebhooks: 0,
            activeWebhooks: 0,
            totalDeliveries: 0,
            successRate: 0,
          },
          integrations: integrationsStats[0] || {
            totalIntegrations: 0,
            activeIntegrations: 0,
            totalConnections: 0,
            activeConnections: 0,
          },
        },
      },
      metrics: recentMetrics,
      logs: recentLogs,
      metadata: {
        userId,
        organizationId,
        timestamp: new Date().toISOString(),
        includeMetrics,
        includeLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching Platform Services overview:', error);
    return ApiErrorHandler.handle(error, {
      userId: (await auth()).userId,
      organizationId: new URL(request.url).searchParams.get('organizationId') || undefined,
      endpoint: '/api/platform/services',
      method: 'GET',
    });
  }
}

/**
 * POST /api/platform/services
 * Create a new platform service
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      type,
      category,
      configuration,
      capabilities,
      dependencies,
      icon,
      color,
      tags,
      healthCheckUrl,
      rateLimit,
      quotaLimit,
    } = body;

    // Validate required fields
    if (!name || !slug || !type || !category) {
      return ApiErrorHandler.badRequest('Name, slug, type, and category are required');
    }

    // Check if slug already exists
    const existingService = await db
      .select()
      .from(platformServices)
      .where(eq(platformServices.slug, slug))
      .limit(1);

    if (existingService.length > 0) {
      return ApiErrorHandler.conflict('Service with this slug already exists');
    }

    // Create new platform service
    const newService = await db.insert(platformServices).values({
      userId,
      name,
      slug,
      description,
      type,
      category,
      configuration: configuration || {},
      capabilities: capabilities || [],
      dependencies: dependencies || [],
      icon,
      color,
      tags: tags || [],
      healthCheckUrl,
      rateLimit,
      quotaLimit,
      status: 'active',
      isActive: true,
    }).returning();

    return NextResponse.json({
      service: newService[0],
      message: 'Platform service created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating platform service:', error);
    return ApiErrorHandler.handle(error, {
      userId: (await auth()).userId,
      endpoint: '/api/platform/services',
      method: 'POST',
    });
  }
}
