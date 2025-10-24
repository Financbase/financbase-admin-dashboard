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
    const { token } = body;

    if (!token) {
      return NextResponse.json({ 
        error: 'Verification token is required' 
      }, { status: 400 });
    }

    const verification = await MFAService.verifyMFA(userId, token);

    if (!verification.isValid) {
      return NextResponse.json({ 
        error: 'Invalid verification token',
        remainingAttempts: verification.remainingAttempts
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      isBackupCode: verification.isBackupCode
    });
  } catch (error) {
    console.error('Error verifying MFA:', error);
    return NextResponse.json({ 
      error: 'Failed to verify MFA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
