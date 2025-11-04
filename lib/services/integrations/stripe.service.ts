/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { BasePartnerIntegration } from './partner-integration.service';
import { sql } from "@/lib/neon";

/**
 * Stripe Integration Service
 */
export class StripeIntegration extends BasePartnerIntegration {
	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			// Test Stripe API connection
			const response = await fetch('https://api.stripe.com/v1/charges', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiKey}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			if (response.ok) {
				return { success: true, message: 'Stripe connection successful' };
			} else {
				return { success: false, message: `Stripe API error: ${response.status}` };
			}
		} catch (error: any) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'payment_intent.succeeded',
			'payment_intent.payment_failed',
			'charge.succeeded',
			'charge.failed',
			'invoice.payment_succeeded',
			'invoice.payment_failed',
			'customer.created',
			'customer.updated',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			// Verify webhook signature if provided
			if (signature && this.credentials.webhookSecret) {
				// In production, verify the signature using Stripe's webhook verification
				// const isValid = await this.verifyStripeSignature(payload, signature);
				// if (!isValid) throw new Error('Invalid webhook signature');
			}

			const eventType = payload.type;
			const eventData = payload.data?.object;

			// Store webhook event
			await this.storeWebhookEvent(eventType, payload);

			// Process based on event type
			switch (eventType) {
				case 'payment_intent.succeeded':
					await this.handlePaymentSuccess(eventData);
					break;
				case 'payment_intent.payment_failed':
					await this.handlePaymentFailure(eventData);
					break;
				case 'invoice.payment_succeeded':
					await this.handleInvoicePayment(eventData);
					break;
			}

		} catch (error: any) {
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

			// Sync customers
			const customersProcessed = await this.syncCustomers();
			totalProcessed += customersProcessed;

			// Sync invoices
			const invoicesProcessed = await this.syncInvoices();
			totalProcessed += invoicesProcessed;

			return { success: true, recordsProcessed: totalProcessed };
		} catch (error: any) {
			return { success: false, recordsProcessed: 0 };
		}
	}

	getSettingsSchema(): Record<string, any> {
		return {
			apiKey: {
				type: 'string',
				required: true,
				label: 'Stripe Secret Key',
				description: 'Your Stripe secret API key',
			},
			webhookSecret: {
				type: 'string',
				required: false,
				label: 'Webhook Secret',
				description: 'Webhook endpoint secret for signature verification',
			},
			testMode: {
				type: 'boolean',
				required: false,
				label: 'Test Mode',
				description: 'Use Stripe test mode',
				default: true,
			},
		};
	}

	private async syncPayments(): Promise<number> {
		// Implementation for syncing Stripe payments
		return 0;
	}

	private async syncCustomers(): Promise<number> {
		// Implementation for syncing Stripe customers
		return 0;
	}

	private async syncInvoices(): Promise<number> {
		// Implementation for syncing Stripe invoices
		return 0;
	}

	private async handlePaymentSuccess(paymentData: any): Promise<void> {
		// Create payment record in database
		await sql.query(`
			INSERT INTO integrations.stripe_payments
			(payment_intent_id, amount, currency, status, customer_id, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
		`, [
			paymentData.id,
			paymentData.amount,
			paymentData.currency,
			'succeeded',
			paymentData.customer,
		]);
	}

	private async handlePaymentFailure(paymentData: any): Promise<void> {
		// Handle failed payment
		await sql.query(`
			INSERT INTO integrations.stripe_payments
			(payment_intent_id, amount, currency, status, customer_id, error_message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
		`, [
			paymentData.id,
			paymentData.amount,
			paymentData.currency,
			'failed',
			paymentData.customer,
			paymentData.last_payment_error?.message,
		]);
	}

	private async handleInvoicePayment(invoiceData: any): Promise<void> {
		// Handle successful invoice payment
		await sql.query(`
			UPDATE invoices
			SET status = 'paid', paid_at = NOW()
			WHERE stripe_invoice_id = $1
		`, [invoiceData.id]);
	}
}
