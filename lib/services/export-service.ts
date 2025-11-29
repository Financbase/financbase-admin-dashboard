/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';

export interface ExportOptions {
	format: ExportFormat;
	filename?: string;
	includeHeaders?: boolean;
	dateFormat?: string;
}

export class ExportService {
	/**
	 * Export data to CSV
	 */
	static exportToCSV(data: any[], options: ExportOptions): string {
		if (data.length === 0) {
			return '';
		}

		const headers = Object.keys(data[0]);
		const rows = data.map(row => 
			headers.map(header => {
				const value = row[header];
				if (value === null || value === undefined) {
					return '';
				}
				// Escape quotes and wrap in quotes
				return `"${String(value).replace(/"/g, '""')}"`;
			}).join(',')
		);

		if (options.includeHeaders !== false) {
			return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
		}

		return rows.join('\n');
	}

	/**
	 * Export data to JSON
	 */
	static exportToJSON(data: any[], options: ExportOptions): string {
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Get content type for export format
	 */
	static getContentType(format: ExportFormat): string {
		switch (format) {
			case 'csv':
				return 'text/csv';
			case 'pdf':
				return 'application/pdf';
			case 'excel':
				return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			case 'json':
				return 'application/json';
			default:
				return 'application/octet-stream';
		}
	}

	/**
	 * Get file extension for export format
	 */
	static getFileExtension(format: ExportFormat): string {
		switch (format) {
			case 'csv':
				return 'csv';
			case 'pdf':
				return 'pdf';
			case 'excel':
				return 'xlsx';
			case 'json':
				return 'json';
			default:
				return 'txt';
		}
	}
}

