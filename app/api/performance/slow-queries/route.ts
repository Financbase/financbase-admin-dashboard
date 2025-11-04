import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PerformanceService } from '@/lib/services/performance-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const slowQueries = await PerformanceService.analyzeSlowQueries(limit);
    return NextResponse.json(slowQueries);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
