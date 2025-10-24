import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PluginSystem } from '@/lib/plugins/plugin-system';

export async function POST(
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

    const body = await request.json();
    const { organizationId } = body;

    // Install the plugin
    const installationId = await PluginSystem.installPlugin(
      pluginId,
      userId,
      organizationId
    );

    return NextResponse.json({
      success: true,
      installationId,
      message: 'Plugin installed successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error installing plugin:', error);
    return NextResponse.json({ 
      error: 'Failed to install plugin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
