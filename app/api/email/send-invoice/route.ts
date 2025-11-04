/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';

/**
 * POST /api/email/send-invoice
 * Send invoice email to client
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { clientEmail, invoiceData } = body;

		if (!clientEmail || !invoiceData) {
			return NextResponse.json(
				{ error: 'Missing required fields: clientEmail, invoiceData' },
				{ status: 400 }
			);
		}

		const result = await EmailService.sendInvoiceEmail(clientEmail, invoiceData);

		if (result.success) {
			return NextResponse.json({
				success: true,
				messageId: result.messageId,
			});
		} else {
			return NextResponse.json(
				{ error: result.error },
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error('Send Invoice Email API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to send invoice email' },
			{ status: 500 }
		);
	}
}
