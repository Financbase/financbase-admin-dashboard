/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { TaxService } from "@/lib/services/business/tax-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { withRLS } from "@/lib/api/with-rls";
import { formatCurrency } from "@/lib/utils/tax-utils";
import { createSuccessResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/export
 * Export tax data in CSV or PDF format
 * 
 * Query parameters:
 * - format: 'csv' | 'pdf' (default: 'csv')
 * - type: 'obligations' | 'summary' (default: 'obligations')
 * - year: optional year filter
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		try {
			const { searchParams } = new URL(request.url);
			const format = searchParams.get("format") || "csv";
			const type = searchParams.get("type") || "obligations";
			const year = searchParams.get("year")
				? parseInt(searchParams.get("year")!)
				: undefined;

			const service = new TaxService();

			if (format === "csv") {
				if (type === "obligations") {
					const obligations = await service.getObligations(clerkUserId, {
						year,
					});
					const obligationsList = Array.isArray(obligations)
						? obligations
						: obligations.data;

					// Generate CSV
					const csvHeaders = [
						"Name",
						"Type",
						"Amount",
						"Paid",
						"Remaining",
						"Status",
						"Due Date",
						"Year",
						"Quarter",
					];
					const csvRows = obligationsList.map((ob) => {
						const amount = parseFloat(ob.amount?.toString() || "0");
						const paid = parseFloat(ob.paid?.toString() || "0");
						const remaining = amount - paid;
						return [
							ob.name,
							ob.type,
							formatCurrency(amount),
							formatCurrency(paid),
							formatCurrency(remaining),
							ob.status,
							new Date(ob.dueDate).toLocaleDateString(),
							ob.year.toString(),
							ob.quarter || "",
						];
					});

					const csvContent = [
						csvHeaders.join(","),
						...csvRows.map((row) =>
							row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
						),
					].join("\n");

					return new NextResponse(csvContent, {
						headers: {
							"Content-Type": "text/csv",
							"Content-Disposition": `attachment; filename="tax-obligations-${year || "all"}-${new Date().toISOString().split("T")[0]}.csv"`,
						},
					});
				} else if (type === "summary") {
					const summary = await service.getTaxSummary(clerkUserId, year);

					// Generate CSV for summary
					const csvContent = [
						"Tax Summary",
						`Year: ${year || new Date().getFullYear()}`,
						"",
						"Metric,Value",
						`Total Obligations,${formatCurrency(summary.totalObligations)}`,
						`Total Paid,${formatCurrency(summary.totalPaid)}`,
						`Total Pending,${formatCurrency(summary.totalPending)}`,
						`Total Deductions,${formatCurrency(summary.totalDeductions)}`,
						"",
						"Obligations by Status",
						`Pending,${summary.obligationsByStatus.pending}`,
						`Paid,${summary.obligationsByStatus.paid}`,
						`Overdue,${summary.obligationsByStatus.overdue}`,
					].join("\n");

					return new NextResponse(csvContent, {
						headers: {
							"Content-Type": "text/csv",
							"Content-Disposition": `attachment; filename="tax-summary-${year || "all"}-${new Date().toISOString().split("T")[0]}.csv"`,
						},
					});
				}
			} else if (format === "pdf") {
				// PDF export would require a PDF library like pdfkit or puppeteer
				// For now, return a JSON response indicating PDF export is not yet implemented
				return ApiErrorHandler.notImplemented("PDF export is not yet implemented", requestId);
			}

			return ApiErrorHandler.badRequest("Invalid format or type");
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

