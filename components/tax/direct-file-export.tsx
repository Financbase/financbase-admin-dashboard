/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { logger } from '@/lib/logger';

interface DirectFileExportProps {
	/**
	 * Callback when export is triggered
	 * Receives the format type and should return the export data
	 */
	onExport: (format: "mef-xml" | "json") => Promise<{ data: string; filename: string }>;
}

/**
 * Component for handling Direct File export functionality
 * 
 * This component provides UI for exporting tax returns in:
 * - MeF XML format (for submission to IRS)
 * - Enriched JSON format (for state filing handoff)
 */
export function DirectFileExport({ onExport }: DirectFileExportProps) {
	const handleExport = async (format: "mef-xml" | "json") => {
		try {
			const result = await onExport(format);
			
			// Create download link
			const blob = new Blob([result.data], {
				type: format === "mef-xml" ? "application/xml" : "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = result.filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			logger.error("Export failed:", error);
			// Error handling would be done by parent component
		}
	};

	return (
		<div className="flex gap-2 p-4 border-t">
			<Button
				variant="outline"
				onClick={() => handleExport("mef-xml")}
				className="flex-1"
			>
				<Download className="h-4 w-4 mr-2" />
				Export MeF XML
			</Button>
			<Button
				variant="outline"
				onClick={() => handleExport("json")}
				className="flex-1"
			>
				<FileText className="h-4 w-4 mr-2" />
				Export JSON
			</Button>
		</div>
	);
}

