import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MFAService } from '@/lib/security/mfa-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const mfaSettings = await MFAService.getMFASettings(userId);
    return NextResponse.json(mfaSettings);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
