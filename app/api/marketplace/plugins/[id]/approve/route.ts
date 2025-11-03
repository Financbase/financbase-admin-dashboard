import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * POST /api/marketplace/plugins/[id]/approve
 * Approve a plugin (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return ApiErrorHandler.forbidden('Admin access required');
    }

    const pluginId = parseInt(id);
    if (Number.isNaN(pluginId)) {
      return ApiErrorHandler.badRequest('Invalid plugin ID', requestId);
    }

    // Get the plugin
    const [plugin] = await db
      .select()
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.id, pluginId))
      .limit(1);

    if (!plugin) {
      return ApiErrorHandler.notFound('Plugin not found');
    }

    // Approve the plugin
    const [approvedPlugin] = await db
      .update(marketplacePlugins)
      .set({
        isApproved: true,
        isActive: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(marketplacePlugins.id, pluginId))
      .returning();

    return NextResponse.json({
      success: true,
      plugin: approvedPlugin,
      message: 'Plugin approved successfully',
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
