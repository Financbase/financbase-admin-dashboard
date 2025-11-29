/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		return NextResponse.json({
			activities: [
				{
					id: '1',
					type: 'invoice',
					description: 'Invoice #INV-001 created',
					amount: 1500,
					status: 'Paid',
					createdAt: '2024-01-15T10:30:00Z'
				},
				{
					id: '2',
					type: 'expense',
					description: 'Office Supplies',
					amount: 45,
					status: 'Approved',
					createdAt: '2024-01-14T14:20:00Z'
				},
				{
					id: '3',
					type: 'client',
					description: 'New client added',
					amount: undefined,
					status: 'Active',
					createdAt: '2024-01-13T09:15:00Z'
				}
			]
		});
	} catch (error) {
		logger.error('Error in test-dashboard/recent-activity route', { error });
		return ApiErrorHandler.handle(error);
	}
}
