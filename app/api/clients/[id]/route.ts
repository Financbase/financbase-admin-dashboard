import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ClientService } from '@/lib/services/client-service';
import { z } from 'zod';

const updateClientSchema = z.object({
	companyName: z.string().min(1).optional(),
	contactName: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
	taxId: z.string().optional(),
	currency: z.string().optional(),
	paymentTerms: z.string().optional(),
	notes: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const client = await ClientService.getById(id, userId);
		if (!client) {
			return NextResponse.json({ error: 'Client not found' }, { status: 404 });
		}

		return NextResponse.json({ client });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error fetching client:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch client' },
			{ status: 500 }
		);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateClientSchema.parse(body);

		const client = await ClientService.update({
			id: id,
			userId,
			...validatedData,
		});

		return NextResponse.json({ client });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		 
    // eslint-disable-next-line no-console
    console.error('Error updating client:', error);
		return NextResponse.json(
			{ error: 'Failed to update client' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await ClientService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error deleting client:', error);
		return NextResponse.json(
			{ error: 'Failed to delete client' },
			{ status: 500 }
		);
	}
}
