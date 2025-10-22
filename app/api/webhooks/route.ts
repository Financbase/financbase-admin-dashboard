import { NextRequest, NextResponse } from 'next/server';
import { WorkflowEngine } from '@/lib/services/workflow-engine';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const signature = request.headers.get('x-signature');
		const webhookSecret = request.headers.get('x-webhook-secret');

		// Verify webhook signature (if provided)
		if (signature && webhookSecret) {
			// In a real implementation, verify the signature
			// const isValid = verifySignature(body, signature, webhookSecret);
			// if (!isValid) {
			//   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
			// }
		}

		// Extract event information from webhook payload
		const eventType = extractEventType(body);
		const entityId = extractEntityId(body);
		const entityType = extractEntityType(body);

		if (!eventType || !entityId || !entityType) {
			return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
		}

		// Create webhook event record
		await WorkflowEngine.createWebhookEvent(
			'user_12345', // Would get from webhook configuration
			eventType,
			entityId,
			entityType,
			body
		);

		// Acknowledge webhook
		return NextResponse.json({ received: true, eventType, entityId }, { status: 200 });

	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

function extractEventType(payload: any): string {
	// Extract event type from common webhook formats
	if (payload.event) return payload.event;
	if (payload.type) return payload.type;
	if (payload.action) return payload.action;

	// Stripe format
	if (payload.type && payload.type.startsWith('invoice.')) {
		return payload.type.replace('invoice.', 'invoice_');
	}

	// Generic format
	return payload.eventType || 'unknown';
}

function extractEntityId(payload: any): string {
	// Extract entity ID from common webhook formats
	if (payload.id) return payload.id;
	if (payload.data?.id) return payload.data.id;
	if (payload.data?.object?.id) return payload.data.object.id;

	return payload.entityId || 'unknown';
}

function extractEntityType(payload: any): string {
	// Extract entity type from common webhook formats
	if (payload.object) return payload.object;
	if (payload.data?.object) return payload.data.object;
	if (payload.resource) return payload.resource;

	return payload.entityType || 'unknown';
}
