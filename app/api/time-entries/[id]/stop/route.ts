/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const timeEntry = await FreelanceHubService.stopTimeTracking(id, userId);

		return NextResponse.json({ timeEntry });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error stopping time tracking:', error);
		return NextResponse.json(
			{ error: 'Failed to stop time tracking' },
			{ status: 500 }
		);
	}
}
