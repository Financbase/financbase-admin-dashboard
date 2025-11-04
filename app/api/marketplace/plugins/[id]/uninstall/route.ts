import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PluginSystem } from '@/lib/plugins/plugin-system';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function DELETE(
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

    // Get installation ID from query params or request body
    const { searchParams } = new URL(request.url);
    const installationId = parseInt(searchParams.get('installationId') || '0');
    
    if (Number.isNaN(installationId) || installationId === 0) {
      return ApiErrorHandler.badRequest('Installation ID is required');
    }

    // Uninstall the plugin
    await PluginSystem.uninstallPlugin(installationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      // Installation not found
      if (error.message.includes('not found')) {
        return ApiErrorHandler.notFound(error.message);
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
