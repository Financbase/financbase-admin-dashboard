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
    console.error('Error uninstalling plugin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Installation not found
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Uninstall failed',
          message: errorMessage
        },
        { status: 404 }
      );
    }
    
    // Database errors
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
        error: 'Failed to uninstall plugin',
        message: 'An error occurred while uninstalling the plugin',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
