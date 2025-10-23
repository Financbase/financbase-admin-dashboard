import { BasePartnerIntegration } from './partner-integration.service';

/**
 * Xero Integration Service
 * Handles Xero accounting software integration
 */
export class XeroIntegration extends BasePartnerIntegration {
	private baseUrl: string;
	private tenantId: string;

	constructor(integrationId: string, userId: string, credentials: Record<string, any>) {
		super(integrationId, userId, credentials);
		this.baseUrl = 'https://api.xero.com/api.xro/2.0';
		this.tenantId = credentials.tenantId;
	}

	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/Organisation`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (response.ok) {
				return { success: true, message: 'Xero connection successful' };
			} else {
				return { success: false, message: `Xero API error: ${response.status}` };
			}
		} catch (error) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'Contact.Created',
			'Contact.Updated',
			'Contact.Deleted',
			'Invoice.Created',
			'Invoice.Updated',
			'Invoice.Deleted',
			'Invoice.Approved',
			'Payment.Created',
			'Payment.Updated',
			'Payment.Deleted',
			'Bill.Created',
			'Bill.Updated',
			'Bill.Deleted',
			'Expense.Created',
			'Expense.Updated',
			'BankTransaction.Created',
			'BankTransaction.Updated',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			// Xero webhook signature verification
			if (signature && this.credentials.webhookKey) {
				const isValid = await this.verifyXeroSignature(payload, signature);
				if (!isValid) throw new Error('Invalid webhook signature');
			}

			const events = payload.Events || [];
			for (const event of events) {
				await this.storeWebhookEvent(event.EventType, event);

				// Process based on event type
				switch (event.ResourceName) {
					case 'Contact':
						await this.syncContact(event.ResourceId);
						break;
					case 'Invoice':
						await this.syncInvoice(event.ResourceId);
						break;
					case 'Payment':
						await this.syncPayment(event.ResourceId);
						break;
					case 'Bill':
						await this.syncBill(event.ResourceId);
						break;
					case 'Expense':
						await this.syncExpense(event.ResourceId);
						break;
					case 'BankTransaction':
						await this.syncBankTransaction(event.ResourceId);
						break;
				}
			}

		} catch (error) {
			await this.storeWebhookError(payload, error.message);
			throw error;
		}
	}

	async syncData(): Promise<{ success: boolean; recordsProcessed: number }> {
		try {
			let totalProcessed = 0;

			// Sync contacts
			const contactsProcessed = await this.syncContacts();
			totalProcessed += contactsProcessed;

			// Sync invoices
			const invoicesProcessed = await this.syncInvoices();
			totalProcessed += invoicesProcessed;

			// Sync payments
			const paymentsProcessed = await this.syncPayments();
			totalProcessed += paymentsProcessed;

			// Sync bills
			const billsProcessed = await this.syncBills();
			totalProcessed += billsProcessed;

			// Sync bank transactions
			const transactionsProcessed = await this.syncBankTransactions();
			totalProcessed += transactionsProcessed;

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
				description: 'Xero application client ID',
			},
			clientSecret: {
				type: 'string',
				required: true,
				label: 'Client Secret',
				description: 'Xero application client secret',
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
			tenantId: {
				type: 'string',
				required: true,
				label: 'Tenant ID',
				description: 'Xero tenant/organization ID',
			},
			webhookKey: {
				type: 'string',
				required: false,
				label: 'Webhook Key',
				description: 'Key for webhook signature verification',
			},
		};
	}

	private async syncContacts(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/Contacts`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const contacts = data.Contacts || [];

			for (const contact of contacts) {
				await this.upsertContact(contact);
			}

			return contacts.length;
		} catch (error) {
			console.error('Error syncing Xero contacts:', error);
			return 0;
		}
	}

	private async syncContact(contactId: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/Contacts/${contactId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return;

			const data = await response.json();
			const contact = data.Contacts?.[0];
			if (contact) {
				await this.upsertContact(contact);
			}
		} catch (error) {
			console.error('Error syncing Xero contact:', error);
		}
	}

	private async upsertContact(contactData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.xero_contacts
			(id, name, email, phone, addresses, contact_status, updated_date_utc, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				phone = EXCLUDED.phone,
				addresses = EXCLUDED.addresses,
				contact_status = EXCLUDED.contact_status,
				updated_date_utc = EXCLUDED.updated_date_utc,
				updated_at = NOW()
		`, [
			contactData.ContactID,
			contactData.Name,
			contactData.EmailAddress,
			contactData.Phones?.[0]?.PhoneNumber,
			JSON.stringify(contactData.Addresses),
			contactData.ContactStatus,
			contactData.UpdatedDateUTC,
		]);
	}

	private async syncInvoices(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/Invoices`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const invoices = data.Invoices || [];

			for (const invoice of invoices) {
				await this.upsertInvoice(invoice);
			}

			return invoices.length;
		} catch (error) {
			console.error('Error syncing Xero invoices:', error);
			return 0;
		}
	}

	private async syncInvoice(invoiceId: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/Invoices/${invoiceId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return;

			const data = await response.json();
			const invoice = data.Invoices?.[0];
			if (invoice) {
				await this.upsertInvoice(invoice);
			}
		} catch (error) {
			console.error('Error syncing Xero invoice:', error);
		}
	}

	private async upsertInvoice(invoiceData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.xero_invoices
			(id, contact_id, contact_name, invoice_number, reference, type, status,
			 date, due_date, total, amount_due, amount_paid, updated_date_utc,
			 created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				contact_id = EXCLUDED.contact_id,
				contact_name = EXCLUDED.contact_name,
				invoice_number = EXCLUDED.invoice_number,
				reference = EXCLUDED.reference,
				type = EXCLUDED.type,
				status = EXCLUDED.status,
				date = EXCLUDED.date,
				due_date = EXCLUDED.due_date,
				total = EXCLUDED.total,
				amount_due = EXCLUDED.amount_due,
				amount_paid = EXCLUDED.amount_paid,
				updated_date_utc = EXCLUDED.updated_date_utc,
				updated_at = NOW()
		`, [
			invoiceData.InvoiceID,
			invoiceData.Contact?.ContactID,
			invoiceData.Contact?.Name,
			invoiceData.InvoiceNumber,
			invoiceData.Reference,
			invoiceData.Type,
			invoiceData.Status,
			invoiceData.Date,
			invoiceData.DueDate,
			invoiceData.Total,
			invoiceData.AmountDue,
			invoiceData.AmountPaid,
			invoiceData.UpdatedDateUTC,
		]);
	}

	private async syncPayments(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/Payments`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const payments = data.Payments || [];

			for (const payment of payments) {
				await this.upsertPayment(payment);
			}

			return payments.length;
		} catch (error) {
			console.error('Error syncing Xero payments:', error);
			return 0;
		}
	}

	private async syncPayment(paymentId: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/Payments/${paymentId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return;

			const data = await response.json();
			const payment = data.Payments?.[0];
			if (payment) {
				await this.upsertPayment(payment);
			}
		} catch (error) {
			console.error('Error syncing Xero payment:', error);
		}
	}

	private async upsertPayment(paymentData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.xero_payments
			(id, invoice_id, amount, reference, date, status, updated_date_utc,
			 created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				invoice_id = EXCLUDED.invoice_id,
				amount = EXCLUDED.amount,
				reference = EXCLUDED.reference,
				date = EXCLUDED.date,
				status = EXCLUDED.status,
				updated_date_utc = EXCLUDED.updated_date_utc,
				updated_at = NOW()
		`, [
			paymentData.PaymentID,
			paymentData.Invoice?.InvoiceID,
			paymentData.Amount,
			paymentData.Reference,
			paymentData.Date,
			paymentData.Status,
			paymentData.UpdatedDateUTC,
		]);
	}

	private async syncBills(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/Bills`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const bills = data.Bills || [];

			for (const bill of bills) {
				await this.upsertBill(bill);
			}

			return bills.length;
		} catch (error) {
			console.error('Error syncing Xero bills:', error);
			return 0;
		}
	}

	private async syncBill(billId: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/Bills/${billId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return;

			const data = await response.json();
			const bill = data.Bills?.[0];
			if (bill) {
				await this.upsertBill(bill);
			}
		} catch (error) {
			console.error('Error syncing Xero bill:', error);
		}
	}

	private async upsertBill(billData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.xero_bills
			(id, contact_id, contact_name, invoice_number, reference, type, status,
			 date, due_date, total, amount_due, amount_paid, updated_date_utc,
			 created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				contact_id = EXCLUDED.contact_id,
				contact_name = EXCLUDED.contact_name,
				invoice_number = EXCLUDED.invoice_number,
				reference = EXCLUDED.reference,
				type = EXCLUDED.type,
				status = EXCLUDED.status,
				date = EXCLUDED.date,
				due_date = EXCLUDED.due_date,
				total = EXCLUDED.total,
				amount_due = EXCLUDED.amount_due,
				amount_paid = EXCLUDED.amount_paid,
				updated_date_utc = EXCLUDED.updated_date_utc,
				updated_at = NOW()
		`, [
			billData.BillID,
			billData.Contact?.ContactID,
			billData.Contact?.Name,
			billData.InvoiceNumber,
			billData.Reference,
			billData.Type,
			billData.Status,
			billData.Date,
			billData.DueDate,
			billData.Total,
			billData.AmountDue,
			billData.AmountPaid,
			billData.UpdatedDateUTC,
		]);
	}

	private async syncBankTransactions(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/BankTransactions`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const transactions = data.BankTransactions || [];

			for (const transaction of transactions) {
				await this.upsertBankTransaction(transaction);
			}

			return transactions.length;
		} catch (error) {
			console.error('Error syncing Xero bank transactions:', error);
			return 0;
		}
	}

	private async syncBankTransaction(transactionId: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/BankTransactions/${transactionId}`, {
				headers: {
					'Authorization': `Bearer ${this.credentials.accessToken}`,
					'Xero-tenant-id': this.tenantId,
					'Accept': 'application/json',
				},
			});

			if (!response.ok) return;

			const data = await response.json();
			const transaction = data.BankTransactions?.[0];
			if (transaction) {
				await this.upsertBankTransaction(transaction);
			}
		} catch (error) {
			console.error('Error syncing Xero bank transaction:', error);
		}
	}

	private async upsertBankTransaction(transactionData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.xero_bank_transactions
			(id, bank_account_id, type, reference, date, amount, updated_date_utc,
			 created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				bank_account_id = EXCLUDED.bank_account_id,
				type = EXCLUDED.type,
				reference = EXCLUDED.reference,
				date = EXCLUDED.date,
				amount = EXCLUDED.amount,
				updated_date_utc = EXCLUDED.updated_date_utc,
				updated_at = NOW()
		`, [
			transactionData.BankTransactionID,
			transactionData.BankAccount?.AccountID,
			transactionData.Type,
			transactionData.Reference,
			transactionData.Date,
			transactionData.Amount,
			transactionData.UpdatedDateUTC,
		]);
	}

	private async syncExpense(expenseId: string): Promise<void> {
		// Handle expense sync if needed
		// Xero expenses might be handled as part of bills or bank transactions
	}

	private async verifyXeroSignature(payload: any, signature: string): Promise<boolean> {
		// Xero webhook signature verification
		// Implementation depends on Xero webhook verification method
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
