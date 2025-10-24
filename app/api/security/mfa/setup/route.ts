import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MFAService } from '@/lib/security/mfa-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mfaType, phoneNumber } = body;

    if (!mfaType || !['totp', 'sms', 'email'].includes(mfaType)) {
      return NextResponse.json({ 
        error: 'Invalid MFA type. Must be totp, sms, or email' 
      }, { status: 400 });
    }

    const mfaSetup = await MFAService.setupMFA(
      userId,
      mfaType,
      phoneNumber
    );

    return NextResponse.json(mfaSetup);
  } catch (error) {
    console.error('Error setting up MFA:', error);
    return NextResponse.json({ 
      error: 'Failed to setup MFA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
