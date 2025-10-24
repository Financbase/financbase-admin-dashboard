import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PluginSystem } from '@/lib/plugins/plugin-system';

export async function DELETE(
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

    // Get installation ID from query params or request body
    const { searchParams } = new URL(request.url);
    const installationId = parseInt(searchParams.get('installationId') || '0');
    
    if (Number.isNaN(installationId)) {
      return NextResponse.json({ error: 'Invalid installation ID' }, { status: 400 });
    }

    // Uninstall the plugin
    await PluginSystem.uninstallPlugin(installationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uninstalling plugin:', error);
    return NextResponse.json({ 
      error: 'Failed to uninstall plugin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
