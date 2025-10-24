import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PaymentService } from '@/lib/services/payment-service';
import { z } from 'zod';

const createPaymentMethodSchema = z.object({
	accountId: z.string().optional(),
	paymentMethodType: z.enum(['stripe', 'paypal', 'square', 'bank_transfer', 'check', 'cash', 'other']),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	
	// Stripe fields
	stripePaymentMethodId: z.string().optional(),
	stripeCustomerId: z.string().optional(),
	stripeAccountId: z.string().optional(),
	
	// PayPal fields
	paypalMerchantId: z.string().optional(),
	paypalEmail: z.string().email().optional(),
	
	// Square fields
	squareApplicationId: z.string().optional(),
	squareLocationId: z.string().optional(),
	
	// Bank transfer fields
	bankName: z.string().optional(),
	bankAccountNumber: z.string().optional(),
	bankRoutingNumber: z.string().optional(),
	
	// Configuration
	isDefault: z.boolean().default(false),
	processingFee: z.number().min(0).max(100).optional(),
	fixedFee: z.number().min(0).optional(),
	currency: z.string().default('USD'),
	isTestMode: z.boolean().default(false),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const paymentMethods = await PaymentService.getPaymentMethods(userId);

		return NextResponse.json({ paymentMethods });
	} catch (error) {
		console.error('Error fetching payment methods:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch payment methods' },
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
		const validatedData = createPaymentMethodSchema.parse(body);

		const paymentMethod = await PaymentService.createPaymentMethod({
			...validatedData,
			userId,
		});

		return NextResponse.json({ paymentMethod }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('Error creating payment method:', error);
		return NextResponse.json(
			{ error: 'Failed to create payment method' },
			{ status: 500 }
		);
	}
}
