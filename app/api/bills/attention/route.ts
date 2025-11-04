/**
 * Bills Requiring Attention API
 * Returns bills that need immediate attention (overdue, pending approval, etc.)
 */

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
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bills requiring attention
    const attentionBills = await billPayService.getBillsRequiringAttention(userId);

    return NextResponse.json(attentionBills);

  } catch (error) {
    console.error('Failed to fetch bills requiring attention:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills requiring attention' },
      { status: 500 }
    );
  }
}