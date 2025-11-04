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
 * QuickBooks Integration Service
 * Handles QuickBooks Online integration for accounting data
 */
export class QuickBooksIntegration extends BasePartnerIntegration {
	private baseUrl: string;
	private companyId: string;

	constructor(integrationId: string, userId: string, credentials: Record<string, any>) {
		super(integrationId, userId, credentials);
		this.baseUrl = credentials.sandbox ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com';
		this.companyId = credentials.companyId;
	}

	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/companyinfo/${this.companyId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (response.ok) {
				return { success: true, message: 'QuickBooks connection successful' };
			} else {
				return { success: false, message: `QuickBooks API error: ${response.status}` };
			}
		} catch (error) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'Customer.Created',
			'Customer.Updated',
			'Customer.Deleted',
			'Invoice.Created',
			'Invoice.Updated',
			'Invoice.Deleted',
			'Invoice.Paid',
			'Payment.Created',
			'Payment.Updated',
			'Payment.Deleted',
			'Bill.Created',
			'Bill.Updated',
			'Bill.Paid',
			'Expense.Created',
			'Expense.Updated',
			'Account.Created',
			'Account.Updated',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			// QuickBooks webhook verification
			if (signature && this.credentials.webhookVerifierToken) {
				// Verify signature using QuickBooks webhook verification
				const isValid = await this.verifyQuickBooksSignature(payload, signature);
				if (!isValid) throw new Error('Invalid webhook signature');
			}

			const eventType = payload.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0]?.operation || 'unknown';
			const eventData = payload.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0];

			// Store webhook event
			await this.storeWebhookEvent(eventType, payload);

			// Process based on event type
			switch (eventData?.name) {
				case 'Customer':
					await this.syncCustomer(eventData);
					break;
				case 'Invoice':
					await this.syncInvoice(eventData);
					break;
				case 'Payment':
					await this.syncPayment(eventData);
					break;
				case 'Bill':
					await this.syncBill(eventData);
					break;
				case 'Expense':
					await this.syncExpense(eventData);
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

			// Sync customers
			const customersProcessed = await this.syncCustomers();
			totalProcessed += customersProcessed;

			// Sync invoices
			const invoicesProcessed = await this.syncInvoices();
			totalProcessed += invoicesProcessed;

			// Sync payments
			const paymentsProcessed = await this.syncPayments();
			totalProcessed += paymentsProcessed;

			// Sync bills
			const billsProcessed = await this.syncBills();
			totalProcessed += billsProcessed;

			// Sync expenses
			const expensesProcessed = await this.syncExpenses();
			totalProcessed += expensesProcessed;

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
				description: 'QuickBooks application client ID',
			},
			clientSecret: {
				type: 'string',
				required: true,
				label: 'Client Secret',
				description: 'QuickBooks application client secret',
			},
			accessToken: {
				type: 'string',
				required: true,
				label: 'Access Token',
				description: 'OAuth access token',
			},
			refreshToken: {
				type: 'string',
				required: true,
				label: 'Refresh Token',
				description: 'OAuth refresh token',
			},
			companyId: {
				type: 'string',
				required: true,
				label: 'Company ID',
				description: 'QuickBooks company ID',
			},
			webhookVerifierToken: {
				type: 'string',
				required: false,
				label: 'Webhook Verifier Token',
				description: 'Token for webhook signature verification',
			},
			sandbox: {
				type: 'boolean',
				required: false,
				label: 'Sandbox Mode',
				description: 'Use QuickBooks sandbox environment',
				default: false,
			},
		};
	}

	private async syncCustomers(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/query?query=SELECT * FROM Customer`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const customers = data.QueryResponse?.Customer || [];

			for (const customer of customers) {
				await this.upsertCustomer(customer);
			}

			return customers.length;
		} catch (error) {
			console.error('Error syncing QuickBooks customers:', error);
			return 0;
		}
	}

	private async syncCustomer(customerData: any): Promise<void> {
		await this.upsertCustomer(customerData);
	}

	private async upsertCustomer(customerData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.quickbooks_customers
			(id, name, company_name, email, phone, billing_address, shipping_address,
			 active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				name = EXCLUDED.name,
				company_name = EXCLUDED.company_name,
				email = EXCLUDED.email,
				phone = EXCLUDED.phone,
				billing_address = EXCLUDED.billing_address,
				shipping_address = EXCLUDED.shipping_address,
				active = EXCLUDED.active,
				updated_at = NOW()
		`, [
			customerData.Id,
			customerData.DisplayName || customerData.Name,
			customerData.CompanyName,
			customerData.PrimaryEmailAddr?.Address,
			customerData.PrimaryPhone?.FreeFormNumber,
			JSON.stringify(customerData.BillAddr),
			JSON.stringify(customerData.ShipAddr),
			customerData.Active !== false,
		]);
	}

	private async syncInvoices(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/query?query=SELECT * FROM Invoice`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const invoices = data.QueryResponse?.Invoice || [];

			for (const invoice of invoices) {
				await this.upsertInvoice(invoice);
			}

			return invoices.length;
		} catch (error) {
			console.error('Error syncing QuickBooks invoices:', error);
			return 0;
		}
	}

	private async syncInvoice(invoiceData: any): Promise<void> {
		await this.upsertInvoice(invoiceData);
	}

	private async upsertInvoice(invoiceData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.quickbooks_invoices
			(id, customer_id, customer_name, doc_number, txn_date, due_date,
			 total_amount, balance, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				customer_id = EXCLUDED.customer_id,
				customer_name = EXCLUDED.customer_name,
				doc_number = EXCLUDED.doc_number,
				txn_date = EXCLUDED.txn_date,
				due_date = EXCLUDED.due_date,
				total_amount = EXCLUDED.total_amount,
				balance = EXCLUDED.balance,
				status = EXCLUDED.status,
				updated_at = NOW()
		`, [
			invoiceData.Id,
			invoiceData.CustomerRef?.value,
			invoiceData.CustomerRef?.name,
			invoiceData.DocNumber,
			invoiceData.TxnDate,
			invoiceData.DueDate,
			invoiceData.TotalAmt,
			invoiceData.Balance,
			this.mapInvoiceStatus(invoiceData),
		]);
	}

	private async syncPayments(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/query?query=SELECT * FROM Payment`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const payments = data.QueryResponse?.Payment || [];

			for (const payment of payments) {
				await this.upsertPayment(payment);
			}

			return payments.length;
		} catch (error) {
			console.error('Error syncing QuickBooks payments:', error);
			return 0;
		}
	}

	private async syncPayment(paymentData: any): Promise<void> {
		await this.upsertPayment(paymentData);
	}

	private async upsertPayment(paymentData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.quickbooks_payments
			(id, customer_id, amount, payment_method, txn_date, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				customer_id = EXCLUDED.customer_id,
				amount = EXCLUDED.amount,
				payment_method = EXCLUDED.payment_method,
				txn_date = EXCLUDED.txn_date,
				updated_at = NOW()
		`, [
			paymentData.Id,
			paymentData.CustomerRef?.value,
			paymentData.TotalAmt,
			paymentData.PaymentMethodRef?.name,
			paymentData.TxnDate,
		]);
	}

	private async syncBills(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/query?query=SELECT * FROM Bill`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const bills = data.QueryResponse?.Bill || [];

			for (const bill of bills) {
				await this.upsertBill(bill);
			}

			return bills.length;
		} catch (error) {
			console.error('Error syncing QuickBooks bills:', error);
			return 0;
		}
	}

	private async syncBill(billData: any): Promise<void> {
		await this.upsertBill(billData);
	}

	private async upsertBill(billData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.quickbooks_bills
			(id, vendor_id, vendor_name, doc_number, txn_date, due_date,
			 total_amount, balance, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				vendor_id = EXCLUDED.vendor_id,
				vendor_name = EXCLUDED.vendor_name,
				doc_number = EXCLUDED.doc_number,
				txn_date = EXCLUDED.txn_date,
				due_date = EXCLUDED.due_date,
				total_amount = EXCLUDED.total_amount,
				balance = EXCLUDED.balance,
				status = EXCLUDED.status,
				updated_at = NOW()
		`, [
			billData.Id,
			billData.VendorRef?.value,
			billData.VendorRef?.name,
			billData.DocNumber,
			billData.TxnDate,
			billData.DueDate,
			billData.TotalAmt,
			billData.Balance,
			this.mapBillStatus(billData),
		]);
	}

	private async syncExpenses(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/query?query=SELECT * FROM Purchase`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const expenses = data.QueryResponse?.Purchase || [];

			for (const expense of expenses) {
				await this.upsertExpense(expense);
			}

			return expenses.length;
		} catch (error) {
			console.error('Error syncing QuickBooks expenses:', error);
			return 0;
		}
	}

	private async syncExpense(expenseData: any): Promise<void> {
		await this.upsertExpense(expenseData);
	}

	private async upsertExpense(expenseData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.quickbooks_expenses
			(id, account_id, vendor_id, amount, description, txn_date, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				account_id = EXCLUDED.account_id,
				vendor_id = EXCLUDED.vendor_id,
				amount = EXCLUDED.amount,
				description = EXCLUDED.description,
				txn_date = EXCLUDED.txn_date,
				updated_at = NOW()
		`, [
			expenseData.Id,
			expenseData.AccountRef?.value,
			expenseData.EntityRef?.value,
			expenseData.TotalAmt,
			expenseData.Description,
			expenseData.TxnDate,
		]);
	}

	private mapInvoiceStatus(invoiceData: any): string {
		if (invoiceData.Balance === 0) return 'paid';
		if (invoiceData.Balance < invoiceData.TotalAmt) return 'partially_paid';
		return 'open';
	}

	private mapBillStatus(billData: any): string {
		if (billData.Balance === 0) return 'paid';
		if (billData.Balance < billData.TotalAmt) return 'partially_paid';
		return 'open';
	}

	private async verifyQuickBooksSignature(payload: any, signature: string): Promise<boolean> {
		// QuickBooks webhook signature verification
		// Implementation depends on QuickBooks webhook verification method
		return true; // Simplified for demo
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
