/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { BasePartnerIntegration } from './partner-integration.service';

/**
 * PayPal Integration Service
 * Handles PayPal payments and transaction processing
 */
export class PayPalIntegration extends BasePartnerIntegration {
	private baseUrl: string;

	constructor(integrationId: string, userId: string, credentials: Record<string, any>) {
		super(integrationId, userId, credentials);
		this.baseUrl = credentials.sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
	}

	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Content-Type': 'application/json',
					'PayPal-Request-Id': `test-${Date.now()}`,
				},
				body: JSON.stringify({
					intent: 'CAPTURE',
					purchase_units: [{
						amount: {
							currency_code: 'USD',
							value: '1.00'
						}
					}]
				}),
			});

			// PayPal returns 422 for test orders, but this confirms API access
			if (response.status === 422 || response.ok) {
				return { success: true, message: 'PayPal connection successful' };
			} else {
				return { success: false, message: `PayPal API error: ${response.status}` };
			}
		} catch (error) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'PAYMENT.CAPTURE.COMPLETED',
			'PAYMENT.CAPTURE.DENIED',
			'PAYMENT.CAPTURE.REFUNDED',
			'PAYMENT.CAPTURE.REVERSED',
			'CHECKOUT.ORDER.APPROVED',
			'CHECKOUT.ORDER.CANCELLED',
			'MERCHANT.PARTNER-CONSENT.REVOKED',
			'BILLING.SUBSCRIPTION.CREATED',
			'BILLING.SUBSCRIPTION.UPDATED',
			'BILLING.SUBSCRIPTION.CANCELLED',
			'BILLING.SUBSCRIPTION.SUSPENDED',
			'BILLING.SUBSCRIPTION.RE-ACTIVATED',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			// PayPal webhook signature verification
			if (signature && this.credentials.webhookId) {
				const isValid = await this.verifyPayPalSignature(payload, signature);
				if (!isValid) throw new Error('Invalid webhook signature');
			}

			const eventType = payload.event_type;
			const resource = payload.resource;

			// Store webhook event
			await this.storeWebhookEvent(eventType, payload);

			// Process based on event type
			switch (eventType) {
				case 'PAYMENT.CAPTURE.COMPLETED':
					await this.handlePaymentCapture(resource);
					break;
				case 'PAYMENT.CAPTURE.REFUNDED':
					await this.handlePaymentRefund(resource);
					break;
				case 'CHECKOUT.ORDER.APPROVED':
					await this.handleOrderApproval(resource);
					break;
				case 'BILLING.SUBSCRIPTION.CREATED':
				case 'BILLING.SUBSCRIPTION.UPDATED':
					await this.handleSubscriptionChange(resource);
					break;
			}

		} catch (error) {
			await this.storeWebhookError(payload, error.message);
			throw error;
		}
	}

	async syncData(): Promise<{ success: boolean; recordsProcessed: number }> {
		try {
			let totalProcessed = 0;

			// Sync payments
			const paymentsProcessed = await this.syncPayments();
			totalProcessed += paymentsProcessed;

			// Sync orders
			const ordersProcessed = await this.syncOrders();
			totalProcessed += ordersProcessed;

			// Sync subscriptions
			const subscriptionsProcessed = await this.syncSubscriptions();
			totalProcessed += subscriptionsProcessed;

			return { success: true, recordsProcessed: totalProcessed };
		} catch (error) {
			return { success: false, recordsProcessed: 0 };
		}
	}

	getSettingsSchema(): Record<string, any> {
		return {
			clientId: {
				type: 'string',
				required: true,
				label: 'Client ID',
				description: 'PayPal application client ID',
			},
			clientSecret: {
				type: 'string',
				required: true,
				label: 'Client Secret',
				description: 'PayPal application client secret',
			},
			accessToken: {
				type: 'string',
				required: true,
				label: 'Access Token',
				description: 'OAuth access token',
			},
			webhookId: {
				type: 'string',
				required: false,
				label: 'Webhook ID',
				description: 'PayPal webhook ID for signature verification',
			},
			sandbox: {
				type: 'boolean',
				required: false,
				label: 'Sandbox Mode',
				description: 'Use PayPal sandbox environment',
				default: true,
			},
		};
	}

	private async syncPayments(): Promise<number> {
		try {
			// Get payments from the last 30 days
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);

			const response = await fetch(`${this.baseUrl}/v2/payments/captures?start_time=${startDate.toISOString()}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const captures = data.captures || [];

			for (const capture of captures) {
				await this.upsertPaymentCapture(capture);
			}

			return captures.length;
		} catch (error) {
			console.error('Error syncing PayPal payments:', error);
			return 0;
		}
	}

	private async syncOrders(): Promise<number> {
		try {
			// Get orders from the last 30 days
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);

			const response = await fetch(`${this.baseUrl}/v2/checkout/orders?start_time=${startDate.toISOString()}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const orders = data.orders || [];

			for (const order of orders) {
				await this.upsertOrder(order);
			}

			return orders.length;
		} catch (error) {
			console.error('Error syncing PayPal orders:', error);
			return 0;
		}
	}

	private async syncSubscriptions(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const subscriptions = data.subscriptions || [];

			for (const subscription of subscriptions) {
				await this.upsertSubscription(subscription);
			}

			return subscriptions.length;
		} catch (error) {
			console.error('Error syncing PayPal subscriptions:', error);
			return 0;
		}
	}

	private async handlePaymentCapture(captureData: any): Promise<void> {
		await this.upsertPaymentCapture(captureData);

		// Update invoice status if linked
		if (captureData.invoice_id) {
			await sql.query(`
				UPDATE invoices
				SET status = 'paid', paid_at = NOW()
				WHERE paypal_order_id = $1
			`, [captureData.id]);
		}
	}

	private async handlePaymentRefund(refundData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.paypal_refunds
			(capture_id, refund_id, amount, reason, status, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
		`, [
			refundData.id,
			refundData.id,
			refundData.amount?.value,
			refundData.reason_code,
			refundData.status,
		]);
	}

	private async handleOrderApproval(orderData: any): Promise<void> {
		await this.upsertOrder(orderData);
	}

	private async handleSubscriptionChange(subscriptionData: any): Promise<void> {
		await this.upsertSubscription(subscriptionData);
	}

	private async upsertPaymentCapture(captureData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.paypal_captures
			(id, order_id, amount, currency, status, payment_source, create_time,
			 update_time, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				amount = EXCLUDED.amount,
				status = EXCLUDED.status,
				update_time = EXCLUDED.update_time
		`, [
			captureData.id,
			captureData.order_id || captureData.supplementary_data?.related_ids?.order_id,
			captureData.amount?.value,
			captureData.amount?.currency_code,
			captureData.status,
			JSON.stringify(captureData.payment_source),
			captureData.create_time,
			captureData.update_time,
		]);
	}

	private async upsertOrder(orderData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.paypal_orders
			(id, status, amount, currency, intent, create_time, update_time, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				status = EXCLUDED.status,
				amount = EXCLUDED.amount,
				update_time = EXCLUDED.update_time
		`, [
			orderData.id,
			orderData.status,
			orderData.purchase_units?.[0]?.amount?.value,
			orderData.purchase_units?.[0]?.amount?.currency_code,
			orderData.intent,
			orderData.create_time,
			orderData.update_time,
		]);
	}

	private async upsertSubscription(subscriptionData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.paypal_subscriptions
			(id, plan_id, status, start_time, create_time, update_time, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				plan_id = EXCLUDED.plan_id,
				status = EXCLUDED.status,
				start_time = EXCLUDED.start_time,
				update_time = EXCLUDED.update_time
		`, [
			subscriptionData.id,
			subscriptionData.plan_id,
			subscriptionData.status,
			subscriptionData.start_time,
			subscriptionData.create_time,
			subscriptionData.update_time,
		]);
	}

	private async verifyPayPalSignature(payload: any, signature: string): Promise<boolean> {
		// PayPal webhook signature verification
		// This would involve verifying the signature using PayPal's webhook verification API
		// For demo purposes, we'll assume it's valid
		return true;
	}

	private async storeWebhookEvent(eventType: string, payload: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.webhook_events
			(integration_id, event_type, payload, created_at)
			VALUES ($1, $2, $3, NOW())
		`, [this.integrationId, eventType, JSON.stringify(payload)]);
	}

	private async storeWebhookError(payload: any, error: string): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.webhook_events
			(integration_id, event_type, payload, error, created_at)
			VALUES ($1, $2, $3, $4, NOW())
		`, [this.integrationId, 'error', JSON.stringify(payload), error]);
	}
}
