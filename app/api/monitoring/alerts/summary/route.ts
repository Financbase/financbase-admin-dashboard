import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AlertService } from '@/lib/services/alert-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const organizationId = searchParams.get('organizationId');

    const statistics = await AlertService.getAlertStatistics(
      userId, 
      organizationId || undefined, 
      timeRange as any
    );

    return NextResponse.json(statistics);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
