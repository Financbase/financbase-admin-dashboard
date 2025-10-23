/**
 * Bills Attention API Route
 * Get bills that require user attention (overdue, pending approval, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';

// GET /api/bills/attention - Get bills requiring attention
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bills requiring attention using service
    const attentionBills = await billPayService.getBillsRequiringAttention(userId);

    return NextResponse.json({
      overdue: attentionBills.overdue,
      pendingApproval: attentionBills.pendingApproval,
      scheduledToday: attentionBills.scheduledToday,
      disputed: attentionBills.disputed,
      summary: {
        totalOverdue: attentionBills.overdue.length,
        totalPendingApproval: attentionBills.pendingApproval.length,
        totalScheduledToday: attentionBills.scheduledToday.length,
        totalDisputed: attentionBills.disputed.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch bills requiring attention:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills requiring attention' },
      { status: 500 }
    );
  }
}
