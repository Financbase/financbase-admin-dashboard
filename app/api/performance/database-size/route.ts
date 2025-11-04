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

    const dbSize = await PerformanceService.getDatabaseSize();
    return NextResponse.json(dbSize);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
