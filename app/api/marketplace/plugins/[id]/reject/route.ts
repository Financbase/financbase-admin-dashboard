import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/financbase-rbac';

/**
 * POST /api/marketplace/plugins/[id]/reject
 * Reject a plugin (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const pluginId = parseInt(id);
    if (Number.isNaN(pluginId)) {
      return NextResponse.json({ error: 'Invalid plugin ID' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // Get the plugin
    const [plugin] = await db
      .select()
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.id, pluginId))
      .limit(1);

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
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
    console.error('Error rejecting plugin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to reject plugin',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
