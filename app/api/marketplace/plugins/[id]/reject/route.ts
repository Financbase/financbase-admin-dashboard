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
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * POST /api/marketplace/plugins/[id]/reject
 * Reject a plugin (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }
    
    const { id } = await params;

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return ApiErrorHandler.forbidden('Admin access required');
    }

    const pluginId = parseInt(id);
    if (Number.isNaN(pluginId)) {
      return ApiErrorHandler.badRequest('Invalid plugin ID', requestId);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
    }

    const { reason } = body;

    // Get the plugin
    const [plugin] = await db
      .select()
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.id, pluginId))
      .limit(1);

    if (!plugin) {
      return ApiErrorHandler.notFound('Plugin not found');
    }

    // Reject the plugin by setting isApproved to false and isActive to false
    // Store rejection reason in manifest or a separate field if available
    const updatedManifest = {
      ...(typeof plugin.manifest === 'object' && plugin.manifest !== null ? plugin.manifest : {}),
      rejectionReason: reason || 'No reason provided',
      rejectedAt: new Date().toISOString(),
      rejectedBy: userId,
    };

    const [rejectedPlugin] = await db
      .update(marketplacePlugins)
      .set({
        isApproved: false,
        isActive: false, // Deactivate rejected plugins
        manifest: updatedManifest,
        updatedAt: new Date(),
      })
      .where(eq(marketplacePlugins.id, pluginId))
      .returning();

    return NextResponse.json({
      success: true,
      plugin: rejectedPlugin,
      message: 'Plugin rejected successfully',
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
