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
 * Gusto HR Integration Service
 * Handles HR, payroll, and employee management integrations
 */
export class GustoIntegration extends BasePartnerIntegration {
	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch('https://api.gusto.com/v1/me', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				return { success: true, message: 'Gusto connection successful' };
			} else {
				return { success: false, message: `Gusto API error: ${response.status}` };
			}
		} catch (error) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'employee.created',
			'employee.updated',
			'employee.terminated',
			'payroll.created',
			'payroll.updated',
			'payroll.completed',
			'payroll.cancelled',
			'company.updated',
			'time_off.created',
			'time_off.updated',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			const eventType = payload.event_type || payload.type;
			const eventData = payload.event_data || payload.data;

			// Store webhook event
			await this.storeWebhookEvent(eventType, payload);

			// Process based on event type
			switch (eventType) {
				case 'employee.created':
				case 'employee.updated':
					await this.syncEmployee(eventData);
					break;
				case 'payroll.completed':
					await this.handlePayrollCompletion(eventData);
					break;
				case 'company.updated':
					await this.syncCompany(eventData);
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

			// Sync employees
			const employeesProcessed = await this.syncEmployees();
			totalProcessed += employeesProcessed;

			// Sync company info
			const companyProcessed = await this.syncCompanyData();
			totalProcessed += companyProcessed;

			// Sync payroll history
			const payrollProcessed = await this.syncPayrollHistory();
			totalProcessed += payrollProcessed;

			return { success: true, recordsProcessed: totalProcessed };
		} catch (error) {
			return { success: false, recordsProcessed: 0 };
		}
	}

	getSettingsSchema(): Record<string, any> {
		return {
			apiToken: {
				type: 'string',
				required: true,
				label: 'Gusto API Token',
				description: 'Your Gusto API token with appropriate permissions',
			},
			webhookSecret: {
				type: 'string',
				required: false,
				label: 'Webhook Secret',
				description: 'Webhook secret for signature verification',
			},
			syncEmployees: {
				type: 'boolean',
				required: false,
				label: 'Sync Employees',
				description: 'Automatically sync employee data',
				default: true,
			},
			syncPayroll: {
				type: 'boolean',
				required: false,
				label: 'Sync Payroll',
				description: 'Automatically sync payroll data',
				default: true,
			},
		};
	}

	private async syncEmployees(): Promise<number> {
		try {
			const response = await fetch('https://api.gusto.com/v1/employees', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiToken}`,
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const employees = data.employees || [];

			for (const employee of employees) {
				await this.upsertEmployee(employee);
			}

			return employees.length;
		} catch (error) {
			console.error('Error syncing Gusto employees:', error);
			return 0;
		}
	}

	private async syncEmployee(employeeData: any): Promise<void> {
		await this.upsertEmployee(employeeData);
	}

	private async upsertEmployee(employeeData: any): Promise<void> {
		const sql = `
			INSERT INTO integrations.gusto_employees
			(id, first_name, last_name, email, status, hire_date, termination_date,
			 department, job_title, work_location, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				first_name = EXCLUDED.first_name,
				last_name = EXCLUDED.last_name,
				email = EXCLUDED.email,
				status = EXCLUDED.status,
				termination_date = EXCLUDED.termination_date,
				department = EXCLUDED.department,
				job_title = EXCLUDED.job_title,
				work_location = EXCLUDED.work_location,
				updated_at = NOW()
		`;

		await sql.query(sql, [
			employeeData.id,
			employeeData.first_name,
			employeeData.last_name,
			employeeData.email,
			employeeData.status,
			employeeData.hire_date,
			employeeData.termination_date,
			employeeData.department,
			employeeData.job_title,
			employeeData.work_location,
		]);
	}

	private async handlePayrollCompletion(payrollData: any): Promise<void> {
		// Mark payroll as completed in database
		await sql.query(`
			UPDATE integrations.gusto_payrolls
			SET status = 'completed', completed_at = NOW()
			WHERE id = $1
		`, [payrollData.id]);
	}

	private async syncCompanyData(): Promise<number> {
		try {
			const response = await fetch('https://api.gusto.com/v1/companies/me', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiToken}`,
				},
			});

			if (!response.ok) return 0;

			const companyData = await response.json();

			await sql.query(`
				INSERT INTO integrations.gusto_companies
				(id, name, trade_name, ein, address, phone, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
				ON CONFLICT (id)
				DO UPDATE SET
					name = EXCLUDED.name,
					trade_name = EXCLUDED.trade_name,
					address = EXCLUDED.address,
					phone = EXCLUDED.phone,
					updated_at = NOW()
			`, [
				companyData.id,
				companyData.name,
				companyData.trade_name,
				companyData.ein,
				JSON.stringify(companyData.address),
				companyData.phone,
			]);

			return 1;
		} catch (error) {
			console.error('Error syncing Gusto company data:', error);
			return 0;
		}
	}

	private async syncCompany(companyData: any): Promise<void> {
		await this.syncCompanyData();
	}

	private async syncPayrollHistory(): Promise<number> {
		try {
			const response = await fetch('https://api.gusto.com/v1/payrolls', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiToken}`,
				},
			});

			if (!response.ok) return 0;

			const data = await response.json();
			const payrolls = data.payrolls || [];

			for (const payroll of payrolls) {
				await this.upsertPayroll(payroll);
			}

			return payrolls.length;
		} catch (error) {
			console.error('Error syncing Gusto payroll history:', error);
			return 0;
		}
	}

	private async upsertPayroll(payrollData: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.gusto_payrolls
			(id, check_date, payroll_deadline, status, total_gross_pay,
			 total_employee_taxes, total_employer_taxes, total_deductions,
			 created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
			ON CONFLICT (id)
			DO UPDATE SET
				check_date = EXCLUDED.check_date,
				payroll_deadline = EXCLUDED.payroll_deadline,
				status = EXCLUDED.status,
				total_gross_pay = EXCLUDED.total_gross_pay,
				total_employee_taxes = EXCLUDED.total_employee_taxes,
				total_employer_taxes = EXCLUDED.total_employer_taxes,
				total_deductions = EXCLUDED.total_deductions,
				updated_at = NOW()
		`, [
			payrollData.id,
			payrollData.check_date,
			payrollData.payroll_deadline,
			payrollData.status,
			payrollData.total_gross_pay,
			payrollData.total_employee_taxes,
			payrollData.total_employer_taxes,
			payrollData.total_deductions,
		]);
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
