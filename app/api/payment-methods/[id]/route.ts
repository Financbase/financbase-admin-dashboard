import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PaymentService } from '@/lib/services/payment-service';
import { z } from 'zod';

const updatePaymentMethodSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	processingFee: z.number().min(0).max(100).optional(),
	fixedFee: z.number().min(0).optional(),
	isDefault: z.boolean().optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const paymentMethod = await PaymentService.getPaymentMethodById(params.id, userId);

		if (!paymentMethod) {
			return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
		}

		return NextResponse.json({ paymentMethod });
	} catch (error) {
		console.error('Error fetching payment method:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch payment method' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updatePaymentMethodSchema.parse(body);

		const paymentMethod = await PaymentService.updatePaymentMethod(params.id, userId, validatedData);

		return NextResponse.json({ paymentMethod });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating payment method:', error);
		return NextResponse.json(
			{ error: 'Failed to update payment method' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await PaymentService.deletePaymentMethod(params.id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting payment method:', error);
		return NextResponse.json(
			{ error: 'Failed to delete payment method' },
			{ status: 500 }
		);
	}
}
