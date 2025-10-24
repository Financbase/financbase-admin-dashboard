import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MFAService } from '@/lib/security/mfa-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mfaSettings = await MFAService.getMFASettings(userId);
    return NextResponse.json(mfaSettings);
  } catch (error) {
    console.error('Error fetching MFA settings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch MFA settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
