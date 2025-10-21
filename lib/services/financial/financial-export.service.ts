import { db } from "@/lib/db";
import { CurrencyService } from "@/lib/services/currency.service";
import { FinancialReconciliationService } from "@/lib/services/financial-reconciliation.service";
import { CurrencyUtils } from "@/lib/utils/currency-utils";
import { format } from "date-fns";
import Papa from "papaparse";

export interface ExportOptions {
	dateRange: {
		start: Date;
		end: Date;
	};
	currency?: string;
	userId?: string;
	organizationId?: string;
	includeInactive?: boolean;
	format: "csv" | "pdf" | "quickbooks" | "xero" | "json" | "irs";
	reportType:
		| "transactions"
		| "pnl"
		| "balance_sheet"
		| "cash_flow"
		| "tax_summary";
}

export interface ExportResult {
	filename: string;
	content: string | Buffer;
	contentType: string;
	size: number;
}

/**
 * Financial Data Export Service
 *
 * Exports financial data in multiple formats for accountants,
 * tax compliance, and integration with accounting software.
 */
export class FinancialExportService {
	private reconciliationService: FinancialReconciliationService;
	private currencyService: CurrencyService;

	constructor() {
		this.reconciliationService = new FinancialReconciliationService();
		this.currencyService = new CurrencyService();
	}

	/**
	 * Export financial data based on options
	 */
	async exportData(options: ExportOptions): Promise<ExportResult> {
		const data = await this.getFinancialData(options);

		switch (options.format) {
			case "csv":
				return this.exportToCSV(data, options);
			case "pdf":
				return this.exportToPDF(data, options);
			case "quickbooks":
				return this.exportToQuickBooks(data, options);
			case "xero":
				return this.exportToXero(data, options);
			case "json":
				return this.exportToJSON(data, options);
			case "irs":
				return this.exportToIRS(data, options);
			default:
				throw new Error(`Unsupported export format: ${options.format}`);
		}
	}

	/**
	 * Get financial data for export
	 */
	private async getFinancialData(options: ExportOptions): Promise<any[]> {
		const { dateRange, reportType, userId, organizationId } = options;

		switch (reportType) {
			case "transactions":
				return await this.getTransactionData(dateRange, userId, organizationId);
			case "pnl":
				return await this.getPnLData(dateRange, userId, organizationId);
			case "balance_sheet":
				return await this.getBalanceSheetData(
					dateRange,
					userId,
					organizationId,
				);
			case "cash_flow":
				return await this.getCashFlowData(dateRange, userId, organizationId);
			case "tax_summary":
				return await this.getTaxSummaryData(dateRange, userId, organizationId);
			default:
				throw new Error(`Unsupported report type: ${reportType}`);
		}
	}

	/**
	 * Get transaction data for export
	 */
	private async getTransactionData(
		dateRange: { start: Date; end: Date },
		userId?: string,
		organizationId?: string,
	): Promise<any[]> {
		// This would fetch from your transactions table
		// For now, returning mock data structure
		return [
			{
				date: "2024-01-15",
				description: "Office Supplies Purchase",
				amount: -125.5,
				currency: "USD",
				category: "Office Expenses",
				account: "Expense Account",
				reference: "TXN-001",
			},
			{
				date: "2024-01-16",
				description: "Client Payment Received",
				amount: 2500.0,
				currency: "USD",
				category: "Revenue",
				account: "Income Account",
				reference: "TXN-002",
			},
		];
	}

	/**
	 * Get P&L data for export
	 */
	private async getPnLData(
		dateRange: { start: Date; end: Date },
		userId?: string,
		organizationId?: string,
	): Promise<any[]> {
		// This would calculate P&L from your financial data
		// For now, returning mock data structure
		return [
			{
				category: "Revenue",
				subcategory: "Product Sales",
				amount: 50000.0,
				percentage: 65.0,
			},
			{
				category: "Revenue",
				subcategory: "Service Income",
				amount: 25000.0,
				percentage: 32.5,
			},
			{
				category: "Expenses",
				subcategory: "Cost of Goods Sold",
				amount: -15000.0,
				percentage: -19.5,
			},
			{
				category: "Expenses",
				subcategory: "Operating Expenses",
				amount: -12000.0,
				percentage: -15.6,
			},
			{
				category: "Net Profit",
				subcategory: "Total",
				amount: 48000.0,
				percentage: 62.3,
			},
		];
	}

	/**
	 * Get balance sheet data for export
	 */
	private async getBalanceSheetData(
		dateRange: { start: Date; end: Date },
		userId?: string,
		organizationId?: string,
	): Promise<any[]> {
		return [
			{
				category: "Assets",
				subcategory: "Cash and Cash Equivalents",
				amount: 25000.0,
			},
			{
				category: "Assets",
				subcategory: "Accounts Receivable",
				amount: 15000.0,
			},
			{
				category: "Assets",
				subcategory: "Inventory",
				amount: 8000.0,
			},
			{
				category: "Liabilities",
				subcategory: "Accounts Payable",
				amount: -5000.0,
			},
			{
				category: "Liabilities",
				subcategory: "Loans",
				amount: -10000.0,
			},
			{
				category: "Equity",
				subcategory: "Retained Earnings",
				amount: 22000.0,
			},
		];
	}

	/**
	 * Get cash flow data for export
	 */
	private async getCashFlowData(
		dateRange: { start: Date; end: Date },
		userId?: string,
		organizationId?: string,
	): Promise<any[]> {
		return [
			{
				category: "Operating Activities",
				subcategory: "Net Income",
				amount: 48000.0,
			},
			{
				category: "Operating Activities",
				subcategory: "Depreciation",
				amount: 2000.0,
			},
			{
				category: "Operating Activities",
				subcategory: "Changes in Working Capital",
				amount: -3000.0,
			},
			{
				category: "Investing Activities",
				subcategory: "Equipment Purchase",
				amount: -5000.0,
			},
			{
				category: "Financing Activities",
				subcategory: "Loan Proceeds",
				amount: 8000.0,
			},
			{
				category: "Net Cash Flow",
				subcategory: "Total",
				amount: 49000.0,
			},
		];
	}

	/**
	 * Get tax summary data for IRS compliance
	 */
	private async getTaxSummaryData(
		dateRange: { start: Date; end: Date },
		userId?: string,
		organizationId?: string,
	): Promise<any[]> {
		return [
			{
				taxYear: 2024,
				totalIncome: 75000.0,
				totalExpenses: 27000.0,
				taxableIncome: 48000.0,
				taxCategory: "Business Income",
				form: "Schedule C",
			},
		];
	}

	/**
	 * Export to CSV format
	 */
	private async exportToCSV(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		const csv = Papa.unparse(data);

		return {
			filename: this.generateFilename(options, "csv"),
			content: csv,
			contentType: "text/csv",
			size: Buffer.byteLength(csv, "utf8"),
		};
	}

	/**
	 * Export to PDF format (simplified - would need PDF library)
	 */
	private async exportToPDF(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		// For now, return HTML that could be converted to PDF
		// In production, you'd use a library like Puppeteer or react-pdf
		const html = this.generatePDFHTML(data, options);

		return {
			filename: this.generateFilename(options, "pdf"),
			content: html,
			contentType: "text/html",
			size: Buffer.byteLength(html, "utf8"),
		};
	}

	/**
	 * Export to QuickBooks IIF format
	 */
	private async exportToQuickBooks(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		let iifContent =
			"!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO\tTOPRINT\n";
		iifContent += "!SPL\tSPLTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO\n";
		iifContent += "!ENDTRNS\n";

		// Add transaction data in QuickBooks IIF format
		for (const item of data) {
			if (item.amount !== undefined) {
				iifContent += `TRNS\t\t${item.date}\t${item.account}\t${item.description}\t${item.amount}\t${item.reference || ""}\n`;
			}
		}

		return {
			filename: this.generateFilename(options, "iif"),
			content: iifContent,
			contentType: "text/plain",
			size: Buffer.byteLength(iifContent, "utf8"),
		};
	}

	/**
	 * Export to Xero CSV format
	 */
	private async exportToXero(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		const xeroData = data.map((item) => ({
			"*Date": item.date,
			"*Description": item.description,
			"*Amount": item.amount,
			"*Reference": item.reference || "",
			"Account Code": this.mapToXeroAccountCode(item.account),
			"Tax Type": this.mapToXeroTaxType(item.category),
		}));

		const csv = Papa.unparse(xeroData);

		return {
			filename: this.generateFilename(options, "csv"),
			content: csv,
			contentType: "text/csv",
			size: Buffer.byteLength(csv, "utf8"),
		};
	}

	/**
	 * Export to JSON format
	 */
	private async exportToJSON(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		const jsonData = {
			metadata: {
				exportDate: new Date().toISOString(),
				dateRange: options.dateRange,
				reportType: options.reportType,
				currency: options.currency || "USD",
				totalRecords: data.length,
			},
			data,
		};

		const jsonContent = JSON.stringify(jsonData, null, 2);

		return {
			filename: this.generateFilename(options, "json"),
			content: jsonContent,
			contentType: "application/json",
			size: Buffer.byteLength(jsonContent, "utf8"),
		};
	}

	/**
	 * Export to IRS-ready format
	 */
	private async exportToIRS(
		data: any[],
		options: ExportOptions,
	): Promise<ExportResult> {
		// IRS Form 1099/1040 ready format
		const irsData = {
			taxYear: new Date().getFullYear(),
			taxpayerInfo: {
				// Would include taxpayer identification
				ein: "XX-XXXXXXX", // Placeholder
				businessName: "Your Business Name",
			},
			income: {
				total: data.reduce((sum, item) => sum + (item.totalIncome || 0), 0),
				breakdown: data.filter(
					(item) => item.taxCategory === "Business Income",
				),
			},
			expenses: {
				total: data.reduce((sum, item) => sum + (item.totalExpenses || 0), 0),
				breakdown: data.filter(
					(item) => item.taxCategory === "Business Expenses",
				),
			},
			scheduleC: {
				grossReceipts: data.reduce(
					(sum, item) => sum + (item.totalIncome || 0),
					0,
				),
				costOfGoodsSold: 0, // Would calculate from data
				grossProfit: data.reduce(
					(sum, item) => sum + (item.taxableIncome || 0),
					0,
				),
			},
		};

		const jsonContent = JSON.stringify(irsData, null, 2);

		return {
			filename: `irs-form-data-${options.dateRange.start.getFullYear()}.json`,
			content: jsonContent,
			contentType: "application/json",
			size: Buffer.byteLength(jsonContent, "utf8"),
		};
	}

	/**
	 * Generate HTML for PDF export
	 */
	private generatePDFHTML(data: any[], options: ExportOptions): string {
		const title = this.getReportTitle(options.reportType);

		return `
			<!DOCTYPE html>
			<html>
			<head>
				<title>${title}</title>
				<style>
					body { font-family: Arial, sans-serif; margin: 20px; }
					table { width: 100%; border-collapse: collapse; margin-top: 20px; }
					th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
					th { background-color: #f2f2f2; }
					.header { text-align: center; margin-bottom: 30px; }
					.summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
				</style>
			</head>
			<body>
				<div class="header">
					<h1>${title}</h1>
					<p>Period: ${format(options.dateRange.start, "MMM dd, yyyy")} - ${format(options.dateRange.end, "MMM dd, yyyy")}</p>
					<p>Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}</p>
				</div>

				<div class="summary">
					<h3>Report Summary</h3>
					<p>Total Records: ${data.length}</p>
					<p>Currency: ${options.currency || "USD"}</p>
				</div>

				<table>
					<thead>
						<tr>
							${Object.keys(data[0] || {})
								.map((key) => `<th>${key}</th>`)
								.join("")}
						</tr>
					</thead>
					<tbody>
						${data
							.map(
								(row) =>
									`<tr>${Object.values(row)
										.map((value) => `<td>${value}</td>`)
										.join("")}</tr>`,
							)
							.join("")}
					</tbody>
				</table>
			</body>
			</html>
		`;
	}

	/**
	 * Map account names to Xero account codes
	 */
	private mapToXeroAccountCode(accountName: string): string {
		const mappings: Record<string, string> = {
			"Income Account": "200",
			Revenue: "200",
			"Expense Account": "400",
			Cash: "001",
			"Accounts Receivable": "110",
			"Accounts Payable": "210",
		};

		return mappings[accountName] || "999"; // Default to miscellaneous
	}

	/**
	 * Map categories to Xero tax types
	 */
	private mapToXeroTaxType(category: string): string {
		const mappings: Record<string, string> = {
			Revenue: "OUTPUT",
			"Office Expenses": "INPUT",
			"Meals & Entertainment": "INPUT",
		};

		return mappings[category] || "NONE";
	}

	/**
	 * Generate filename for export
	 */
	private generateFilename(options: ExportOptions, extension: string): string {
		const dateStr = format(new Date(), "yyyy-MM-dd");
		const reportType = options.reportType;
		const period = `${format(options.dateRange.start, "yyyy-MM")}-${format(options.dateRange.end, "yyyy-MM")}`;

		return `${reportType}_${period}_${dateStr}.${extension}`;
	}

	/**
	 * Get report title based on type
	 */
	private getReportTitle(reportType: string): string {
		const titles: Record<string, string> = {
			transactions: "Transaction Report",
			pnl: "Profit & Loss Statement",
			balance_sheet: "Balance Sheet",
			cash_flow: "Cash Flow Statement",
			tax_summary: "Tax Summary Report",
		};

		return titles[reportType] || "Financial Report";
	}

	/**
	 * Validate export options
	 */
	static validateExportOptions(options: ExportOptions): void {
		if (options.dateRange.start > options.dateRange.end) {
			throw new Error("Start date must be before end date");
		}

		if (options.dateRange.end > new Date()) {
			throw new Error("End date cannot be in the future");
		}

		const maxDateRange = 365 * 24 * 60 * 60 * 1000; // 1 year
		if (
			options.dateRange.end.getTime() - options.dateRange.start.getTime() >
			maxDateRange
		) {
			throw new Error("Date range cannot exceed 1 year");
		}
	}
}
