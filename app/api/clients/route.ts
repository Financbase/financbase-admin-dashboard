import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ClientService } from '@/lib/services/client-service';
import { z } from 'zod';

const createClientSchema = z.object({
	companyName: z.string().min(1, 'Company name is required'),
	contactName: z.string().optional(),
	email: z.string().email('Invalid email address'),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().default('US'),
	taxId: z.string().optional(),
	currency: z.string().default('USD'),
	paymentTerms: z.string().default('net30'),
	notes: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const search = searchParams.get('search') || undefined;
		const isActive = searchParams.get('isActive');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

		const clients = await ClientService.getAll(userId, {
			search,
			isActive: isActive ? isActive === 'true' : undefined,
			limit,
			offset,
		});

		return NextResponse.json({ clients });
	} catch (error) {
		console.error('Error fetching clients:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch clients' },
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
		const validatedData = createClientSchema.parse(body);

		const client = await ClientService.create({
			...validatedData,
			userId,
		});

		return NextResponse.json({ client }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('Error creating client:', error);
		return NextResponse.json(
			{ error: 'Failed to create client' },
			{ status: 500 }
		);
	}
}
