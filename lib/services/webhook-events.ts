/**
 * Webhook Event Service
 * Handles webhook events and triggers workflows
 */

import { WorkflowEngine } from '@/lib/services/workflow-engine';
import { NotificationService } from '@/lib/services/notification-service';

export class WebhookEventService {
	/**
	 * Create invoice-related webhook events
	 */
	static async createInvoiceEvent(
		eventType: 'created' | 'updated' | 'sent' | 'paid' | 'overdue',
		invoiceData: {
			id: string;
			invoiceNumber: string;
			amount: number;
			clientName: string;
			clientEmail: string;
			status: string;
			dueDate: string;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `invoice.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				invoiceData.id,
				'invoice',
				{
					...invoiceData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send notification for significant events
			if (eventType === 'overdue') {
				await NotificationService.createFinancialNotification(
					userId,
					'invoice',
					'Invoice Overdue',
					`Invoice ${invoiceData.invoiceNumber} is now overdue. Please follow up with ${invoiceData.clientName}.`,
					{
						invoiceNumber: invoiceData.invoiceNumber,
						amount: invoiceData.amount,
						clientName: invoiceData.clientName,
						daysOverdue: this.calculateDaysOverdue(invoiceData.dueDate),
						urgent: true,
					},
					`/invoices/${invoiceData.id}`
				);
			}

			if (eventType === 'paid') {
				await NotificationService.createFinancialNotification(
					userId,
					'invoice',
					'Invoice Paid',
					`Great news! Invoice ${invoiceData.invoiceNumber} has been paid by ${invoiceData.clientName}.`,
					{
						invoiceNumber: invoiceData.invoiceNumber,
						amount: invoiceData.amount,
						clientName: invoiceData.clientName,
						paymentReceived: true,
					},
					`/invoices/${invoiceData.id}`
				);
			}

		} catch (error) {
			console.error('Error creating invoice webhook event:', error);
		}
	}

	/**
	 * Create expense-related webhook events
	 */
	static async createExpenseEvent(
		eventType: 'created' | 'approved' | 'rejected' | 'reimbursed',
		expenseData: {
			id: string;
			description: string;
			amount: number;
			category: string;
			vendor: string;
			submittedBy: string;
			approvedBy?: string;
			rejectionReason?: string;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `expense.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				expenseData.id,
				'expense',
				{
					...expenseData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send notifications
			if (eventType === 'approved') {
				await NotificationService.createFinancialNotification(
					expenseData.submittedBy,
					'expense',
					'Expense Approved',
					`Your expense "${expenseData.description}" has been approved for $${expenseData.amount}.`,
					{
						expenseId: expenseData.id,
						amount: expenseData.amount,
						approvedBy: expenseData.approvedBy,
					},
					`/expenses/${expenseData.id}`
				);
			}

			if (eventType === 'rejected') {
				await NotificationService.createSystemAlert(
					expenseData.submittedBy,
					'Expense Requires Changes',
					`Your expense "${expenseData.description}" needs revision: ${expenseData.rejectionReason}`,
					'normal',
					`/expenses/${expenseData.id}`
				);
			}

		} catch (error) {
			console.error('Error creating expense webhook event:', error);
		}
	}

	/**
	 * Create report-related webhook events
	 */
	static async createReportEvent(
		eventType: 'generated' | 'scheduled' | 'failed',
		reportData: {
			id: string;
			name: string;
			type: string;
			period: string;
			generatedBy: string;
			recipients: string[];
			fileUrl?: string;
			error?: string;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `report.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				reportData.id,
				'report',
				{
					...reportData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send notifications
			if (eventType === 'generated') {
				await NotificationService.createFinancialNotification(
					userId,
					'report',
					'Report Generated',
					`Your ${reportData.name} report for ${reportData.period} has been generated successfully.`,
					{
						reportName: reportData.name,
						period: reportData.period,
						recipients: reportData.recipients,
					},
					`/reports/${reportData.id}`
				);
			}

			if (eventType === 'failed') {
				await NotificationService.createSystemAlert(
					userId,
					'Report Generation Failed',
					`Failed to generate ${reportData.name} report: ${reportData.error}`,
					'high',
					`/reports/${reportData.id}`
				);
			}

		} catch (error) {
			console.error('Error creating report webhook event:', error);
		}
	}

	/**
	 * Create payment-related webhook events
	 */
	static async createPaymentEvent(
		eventType: 'received' | 'failed' | 'refunded',
		paymentData: {
			id: string;
			invoiceId: string;
			amount: number;
			currency: string;
			paymentMethod: string;
			transactionId: string;
			clientName: string;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `payment.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				paymentData.id,
				'payment',
				{
					...paymentData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send notifications
			if (eventType === 'received') {
				await NotificationService.createFinancialNotification(
					userId,
					'invoice',
					'Payment Received',
					`Payment of $${paymentData.amount} received from ${paymentData.clientName} via ${paymentData.paymentMethod}.`,
					{
						amount: paymentData.amount,
						clientName: paymentData.clientName,
						paymentMethod: paymentData.paymentMethod,
						transactionId: paymentData.transactionId,
						paymentReceived: true,
					},
					`/invoices/${paymentData.invoiceId}`
				);
			}

			if (eventType === 'failed') {
				await NotificationService.createSystemAlert(
					userId,
					'Payment Failed',
					`Payment processing failed for $${paymentData.amount}. Please check your payment settings.`,
					'urgent',
					`/settings/billing`
				);
			}

		} catch (error) {
			console.error('Error creating payment webhook event:', error);
		}
	}

	/**
	 * Create user-related webhook events
	 */
	static async createUserEvent(
		eventType: 'created' | 'updated' | 'login' | 'logout',
		userData: {
			id: string;
			email: string;
			name: string;
			role: string;
			lastLogin?: string;
			loginLocation?: string;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `user.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				userData.id,
				'user',
				{
					...userData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send security notifications for sensitive events
			if (eventType === 'login' && userData.loginLocation) {
				await NotificationService.createSystemAlert(
					userId,
					'New Login Detected',
					`Account login from ${userData.loginLocation}. If this wasn't you, please secure your account.`,
					'normal',
					'/settings/security'
				);
			}

		} catch (error) {
			console.error('Error creating user webhook event:', error);
		}
	}

	/**
	 * Create system-related webhook events
	 */
	static async createSystemEvent(
		eventType: 'backup_completed' | 'maintenance_scheduled' | 'error_occurred' | 'performance_alert',
		systemData: {
			id: string;
			message: string;
			severity: 'low' | 'medium' | 'high' | 'critical';
			details?: Record<string, any>;
		},
		userId: string = 'user_12345'
	) {
		try {
			const webhookEventType = `system.${eventType}`;

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				webhookEventType,
				systemData.id,
				'system',
				{
					...systemData,
					eventType: webhookEventType,
					timestamp: new Date().toISOString(),
				}
			);

			// Send system alerts
			if (systemData.severity === 'high' || systemData.severity === 'critical') {
				await NotificationService.createSystemAlert(
					userId,
					'System Alert',
					systemData.message,
					systemData.severity === 'critical' ? 'urgent' : 'high',
					'/admin/system-status'
				);
			}

		} catch (error) {
			console.error('Error creating system webhook event:', error);
		}
	}

	/**
	 * Process incoming webhook from external services
	 */
	static async processIncomingWebhook(
		service: string,
		payload: Record<string, any>,
		headers: Record<string, string>,
		userId: string = 'user_12345'
	) {
		try {
			let eventType: string;
			let entityId: string;
			let entityType: string;

			// Handle different webhook formats based on service
			switch (service) {
				case 'stripe':
					({ eventType, entityId, entityType } = this.parseStripeWebhook(payload));
					break;

				case 'paypal':
					({ eventType, entityId, entityType } = this.parsePayPalWebhook(payload));
					break;

				case 'quickbooks':
					({ eventType, entityId, entityType } = this.parseQuickBooksWebhook(payload));
					break;

				case 'xero':
					({ eventType, entityId, entityType } = this.parseXeroWebhook(payload));
					break;

				default:
					// Generic webhook processing
					eventType = payload.event || payload.type || 'webhook.received';
					entityId = payload.id || payload.data?.id || 'unknown';
					entityType = payload.object || payload.resource || 'unknown';
			}

			// Create webhook event
			await WorkflowEngine.createWebhookEvent(
				userId,
				eventType,
				entityId,
				entityType,
				{
					...payload,
					service,
					processedAt: new Date().toISOString(),
				}
			);

			// Send notification for important events
			if (this.isImportantEvent(eventType)) {
				await this.sendWebhookNotification(userId, eventType, payload);
			}

		} catch (error) {
			console.error('Error processing incoming webhook:', error);
		}
	}

	/**
	 * Parse Stripe webhook payload
	 */
	private static parseStripeWebhook(payload: any) {
		const eventType = payload.type;
		const data = payload.data?.object;

		return {
			eventType,
			entityId: data?.id || payload.id,
			entityType: data?.object || 'unknown',
		};
	}

	/**
	 * Parse PayPal webhook payload
	 */
	private static parsePayPalWebhook(payload: any) {
		const eventType = payload.event_type;
		const resource = payload.resource;

		return {
			eventType,
			entityId: resource?.id || payload.id,
			entityType: resource?.resource_type || 'unknown',
		};
	}

	/**
	 * Parse QuickBooks webhook payload
	 */
	private static parseQuickBooksWebhook(payload: any) {
		const eventType = payload.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0]?.operation || 'quickbooks.event';
		const entities = payload.eventNotifications?.[0]?.dataChangeEvent?.entities || [];

		return {
			eventType,
			entityId: entities[0]?.id || payload.id,
			entityType: entities[0]?.name || 'unknown',
		};
	}

	/**
	 * Parse Xero webhook payload
	 */
	private static parseXeroWebhook(payload: any) {
		const eventType = payload.Events?.[0]?.EventType || 'xero.event';
		const resourceId = payload.Events?.[0]?.ResourceId;

		return {
			eventType,
			entityId: resourceId || payload.id,
			entityType: payload.Events?.[0]?.ResourceName || 'unknown',
		};
	}

	/**
	 * Check if event is important enough for notification
	 */
	private static isImportantEvent(eventType: string): boolean {
		const importantEvents = [
			'payment.received',
			'payment.failed',
			'invoice.paid',
			'invoice.overdue',
			'expense.approved',
			'system.error',
			'user.login',
		];

		return importantEvents.some(important => eventType.includes(important));
	}

	/**
	 * Send webhook notification
	 */
	private static async sendWebhookNotification(
		userId: string,
		eventType: string,
		payload: Record<string, any>
	) {
		let title: string;
		let message: string;

		switch (eventType) {
			case 'payment.received':
				title = 'Payment Received';
				message = `Payment of $${payload.amount} received via ${payload.paymentMethod}.`;
				break;

			case 'payment.failed':
				title = 'Payment Failed';
				message = `Payment processing failed for $${payload.amount}. Please check your payment settings.`;
				break;

			case 'invoice.paid':
				title = 'Invoice Paid';
				message = `Invoice ${payload.invoiceNumber} has been paid in full.`;
				break;

			case 'invoice.overdue':
				title = 'Invoice Overdue';
				message = `Invoice ${payload.invoiceNumber} is now overdue.`;
				break;

			default:
				title = 'Webhook Event';
				message = `Received ${eventType} webhook event.`;
		}

		await NotificationService.createSystemAlert(
			userId,
			title,
			message,
			'normal',
			'/dashboard'
		);
	}

	/**
	 * Calculate days overdue
	 */
	private static calculateDaysOverdue(dueDate: string): number {
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = today.getTime() - due.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}
}
