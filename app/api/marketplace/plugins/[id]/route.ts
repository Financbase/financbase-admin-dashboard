import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pluginId = parseInt(params.id);
    if (Number.isNaN(pluginId)) {
      return NextResponse.json({ error: 'Invalid plugin ID' }, { status: 400 });
    }

    const plugin = await db
      .select()
      .from(marketplacePlugins)
      .where(and(
        eq(marketplacePlugins.id, pluginId),
        eq(marketplacePlugins.isActive, true)
      ))
      .limit(1);

    if (plugin.length === 0) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    return NextResponse.json(plugin[0]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching plugin details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch plugin details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
