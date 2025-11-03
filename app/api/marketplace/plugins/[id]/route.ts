import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pluginId = parseInt(id);
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
    console.error('Error fetching plugin details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a database connection error
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch plugin details',
        message: 'An error occurred while fetching plugin details',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
