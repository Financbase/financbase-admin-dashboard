import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PluginSystem } from '@/lib/plugins/plugin-system';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // Get user's installed plugins
    const installedPlugins = await PluginSystem.getUserPlugins(
      userId,
      organizationId || undefined
    );

    return NextResponse.json(installedPlugins);
  } catch (error) {
    console.error('Error fetching installed plugins:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch installed plugins',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
