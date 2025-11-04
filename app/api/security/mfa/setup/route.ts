/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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

    const { mfaType, phoneNumber } = body;

    if (!mfaType || !['totp', 'sms', 'email'].includes(mfaType)) {
      return ApiErrorHandler.badRequest('Invalid MFA type. Must be totp, sms, or email');
    }

    const mfaSetup = await MFAService.setupMFA(
      userId,
      mfaType,
      phoneNumber
    );

    return NextResponse.json(mfaSetup);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
