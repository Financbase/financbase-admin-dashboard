import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MFAService } from '@/lib/security/mfa-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { token } = body;

    if (!token) {
      return ApiErrorHandler.badRequest('Verification token is required');
    }

    const verification = await MFAService.verifyMFA(userId, token);

    if (!verification.isValid) {
      return ApiErrorHandler.badRequest(
        `Invalid verification token. ${verification.remainingAttempts !== undefined ? `Remaining attempts: ${verification.remainingAttempts}` : ''}`
      );
    }

    return NextResponse.json({
      success: true,
      isBackupCode: verification.isBackupCode
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
