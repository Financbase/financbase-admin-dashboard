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
import { ClientService } from '@/lib/services/client-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await ClientService.getStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching client stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch client statistics' },
			{ status: 500 }
		);
	}
}
