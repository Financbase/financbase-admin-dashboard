import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PluginSystem } from '@/lib/plugins/plugin-system';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const pluginId = parseInt(id);
    if (Number.isNaN(pluginId)) {
      return ApiErrorHandler.badRequest('Invalid plugin ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

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
    if (error instanceof Error) {
      // Plugin not found or already installed
      if (error.message.includes('not found') || error.message.includes('already installed')) {
        return ApiErrorHandler.badRequest(error.message);
      }
      
      // Database errors
      if (error.message.includes('DATABASE_URL') || error.message.includes('connection')) {
        return ApiErrorHandler.databaseError(
          'Unable to connect to database. Please check your DATABASE_URL configuration.',
          requestId
        );
      }
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}
