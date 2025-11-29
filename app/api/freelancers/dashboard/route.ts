/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { db } from '@/lib/db';
import { freelancers } from '@/lib/db/schemas/freelancers.schema';
import { projects } from '@/lib/db/schemas/projects.schema';
import { tasks } from '@/lib/db/schemas/tasks.schema';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { eq, and, desc, sql, gte, count } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// GET /api/freelancers/dashboard - Get freelancer platform dashboard statistics
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Get top freelancers by rating and projects
    const topFreelancersResult = await db
      .select({
        id: freelancers.id,
        userId: freelancers.userId,
        displayName: freelancers.displayName,
        title: freelancers.title,
        rating: freelancers.rating,
        specialties: freelancers.specialties,
        avatarUrl: freelancers.avatarUrl,
      })
      .from(freelancers)
      .where(eq(freelancers.status, 'available'))
      .orderBy(desc(freelancers.rating))
      .limit(10);

    // Get project counts per freelancer (using freelancer's userId)
    const freelancerStats = await Promise.all(
      topFreelancersResult.map(async (freelancer) => {
        // Count projects for this freelancer (using freelancer userId)
        const [projectCount] = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.userId, freelancer.userId));

        // Get total earnings from invoices (using freelancer userId)
        const [earningsData] = await db
          .select({
            total: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
          })
          .from(invoices)
          .where(eq(invoices.userId, freelancer.userId));

        // Get specialty from specialties array
        const specialty = Array.isArray(freelancer.specialties) && freelancer.specialties.length > 0
          ? String(freelancer.specialties[0])
          : freelancer.title;

        return {
          id: freelancer.id,
          name: freelancer.displayName,
          skill: specialty,
          rating: Number(freelancer.rating || 0),
          earnings: `$${Number(earningsData?.total || 0).toLocaleString()}`,
          projects: Number(projectCount?.count || 0),
          avatar: freelancer.avatarUrl || undefined,
        };
      })
    );

    // Get dashboard statistics
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(freelancers);

    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, 'active'));

    const [completedProjectsResult] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, 'completed'));

    // Calculate platform earnings (total from paid invoices)
    const [platformEarningsResult] = await db
      .select({
        total: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
      })
      .from(invoices);

    // Get recent jobs (projects)
    const recentJobsResult = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        budget: projects.budget,
        status: projects.status,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(10);

    // Get recent activities (from tasks and projects)
    const recentTasksResult = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        completedDate: tasks.completedDate,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(20);

    const dashboardStats = {
      total_users: Number(totalUsersResult?.count || 0),
      active_jobs: Number(activeJobsResult?.count || 0),
      completed_projects: Number(completedProjectsResult?.count || 0),
      platform_earnings: Number(platformEarningsResult?.total || 0),
      total_revenue: Number(platformEarningsResult?.total || 0),
    };

    const recentJobs = recentJobsResult.map((job) => ({
      id: job.id,
      title: job.name,
      description: job.description || '',
      budget: job.budget ? `$${Number(job.budget).toLocaleString()}` : 'Not specified',
      posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
      proposals: 0, // Would need proposals table
    }));

    const recentActivities = recentTasksResult.slice(0, 10).map((task, index) => ({
      id: task.id,
      user: 'User', // Would need to join with users table
      action: task.status === 'completed' ? 'completed project' : 'updated task',
      project: task.title,
      time: task.createdAt 
        ? `${Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60))} minutes ago`
        : 'Recently',
      avatar: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        topFreelancers: freelancerStats,
        dashboardStats,
        recentJobs,
        recentActivities,
      },
    });

  } catch (error) {
    logger.error('Failed to fetch freelancer dashboard data:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

