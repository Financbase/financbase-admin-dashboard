import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ClientService } from '@/lib/services/client-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const client = await ClientService.getById(id, userId);
		if (!client) {
			return ApiErrorHandler.notFound('Client not found');
		}

		return NextResponse.json({ client });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = updateClientSchema.parse(body);

		const client = await ClientService.update({
			id: id,
			userId,
			...validatedData,
		});

		return NextResponse.json({ client });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		await ClientService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
