import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PaymentService } from '@/lib/services/payment-service';
import { z } from 'zod';

const processPaymentSchema = z.object({
	paymentMethodId: z.string().min(1, 'Payment method ID is required'),
	invoiceId: z.string().optional(),
	paymentType: z.enum(['invoice_payment', 'refund', 'chargeback', 'adjustment', 'transfer']),
	amount: z.number().min(0.01, 'Amount must be greater than 0'),
	currency: z.string().default('USD'),
	description: z.string().optional(),
	reference: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const paymentMethodId = searchParams.get('paymentMethodId') || undefined;
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;

		const result = await PaymentService.getPaginatedPayments(userId, {
			page,
			limit,
			search,
			status,
			paymentMethodId,
			startDate,
			endDate,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching payments:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch payments' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = processPaymentSchema.parse(body);

		const payment = await PaymentService.processPayment({
			...validatedData,
			userId,
		});

		return NextResponse.json({ payment }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('Error processing payment:', error);
		return NextResponse.json(
			{ error: 'Failed to process payment' },
			{ status: 500 }
		);
	}
}
