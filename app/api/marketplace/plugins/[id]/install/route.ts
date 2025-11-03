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
    console.error('Error installing plugin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Plugin not found or already installed
    if (errorMessage.includes('not found') || errorMessage.includes('already installed')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Installation failed',
          message: errorMessage
        },
        { status: 400 }
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
        error: 'Failed to install plugin',
        message: 'An error occurred while installing the plugin',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
