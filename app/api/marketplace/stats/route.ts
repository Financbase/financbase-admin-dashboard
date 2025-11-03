import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins, installedPlugins } from '@/lib/db/schemas';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total plugins count
    const [totalPluginsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.isActive, true));

    const totalPlugins = Number(totalPluginsResult?.count || 0);

    // Get installed plugins count for user
    const [installedPluginsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(installedPlugins)
      .where(
        and(
          eq(installedPlugins.userId, userId),
          eq(installedPlugins.isActive, true)
        )
      );

    const installedPluginsCount = Number(installedPluginsResult?.count || 0);

    // Get available plugins (total - installed)
    const availablePlugins = totalPlugins - installedPluginsCount;

    // Get total downloads
    const [downloadsResult] = await db
      .select({ 
        total: sql<number>`coalesce(sum(${marketplacePlugins.downloadCount}), 0)` 
      })
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.isActive, true));

    const totalDownloads = Number(downloadsResult?.total || 0);

    // Get average rating
    const [ratingResult] = await db
      .select({ 
        average: sql<number>`coalesce(avg(${marketplacePlugins.rating}), 0)` 
      })
      .from(marketplacePlugins)
      .where(
        and(
          eq(marketplacePlugins.isActive, true),
          sql`${marketplacePlugins.reviewCount} > 0`
        )
      );

    const averageRating = Number(ratingResult?.average || 0);

    // Get category counts - group plugins by category
    const categoryCountsResult = await db
      .select({
        category: marketplacePlugins.category,
        count: sql<number>`count(*)`
      })
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.isActive, true))
      .groupBy(marketplacePlugins.category);

    // Convert to a map for easy lookup
    const categoryCountsMap: Record<string, number> = {};
    categoryCountsResult.forEach((row) => {
      const category = row.category?.toLowerCase() || '';
      const count = Number(row.count || 0);
      categoryCountsMap[category] = count;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalPlugins,
        installedPlugins: installedPluginsCount,
        availablePlugins,
        totalDownloads,
        averageRating: Number(averageRating.toFixed(1)),
        categoryCounts: categoryCountsMap
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch marketplace statistics',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

