import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardBuilderService } from '@/lib/services/dashboard-builder-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const templates = await DashboardBuilderService.getWidgetTemplates(
      category || undefined,
      limit
    );

    return NextResponse.json(templates);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
