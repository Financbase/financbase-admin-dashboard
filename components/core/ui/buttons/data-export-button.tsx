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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportData } from "@/lib/export-utils";
import {
	CheckCircle,
	Download,
	File,
	FileSpreadsheet,
	FileText,
	XCircle,
} from "lucide-react";
import type * as React from "react";
import { toast } from "sonner";

interface DataExportButtonProps {
	data: unknown[];
	filename: string;
	headers?: string[];
	dateRange?: {
		from: Date;
		to: Date;
	};
	className?: string;
	variant?:
		| "default"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "destructive";
	size?: "default" | "sm" | "lg" | "icon";
	disabled?: boolean;
}

export function DataExportButton({
	data,
	filename,
	headers,
	dateRange,
	className,
	variant = "outline",
	size = "default",
	disabled = false,
}: DataExportButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async (format: "csv" | "pdf" | "excel") => {
		if (!data || data.length === 0) {
			toast.error("No data to export");
			return;
		}

		setIsExporting(true);
		try {
			await exportData(data as Record<string, any>[], {
				format,
				filename,
				includeHeaders: true,
				dateRange: dateRange ? { start: dateRange.from, end: dateRange.to } : undefined,
			});
			toast.success(`${format.toUpperCase()} file exported successfully`);
		} catch (_error) {
			toast.error(`Failed to export ${format.toUpperCase()} file`);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button
					variant={variant}
					size={size}
					className={className}
					disabled={disabled || isExporting || data.length === 0}
				>
					<Download className="mr-2 h-4 w-4" />
					{isExporting ? "Exporting..." : "Export"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => handleExport("csv")}>
					<FileText className="mr-2 h-4 w-4" />
					Export as CSV
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleExport("excel")}>
					<FileSpreadsheet className="mr-2 h-4 w-4" />
					Export as Excel
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleExport("pdf")}>
					<File className="mr-2 h-4 w-4" />
					Export as PDF
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Simple export button for single format exports
 */
interface SimpleExportButtonProps {
	data: unknown[];
	filename: string;
	format: "csv" | "pdf" | "excel";
	headers?: string[];
	dateRange?: {
		from: Date;
		to: Date;
	};
	className?: string;
	variant?:
		| "default"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "destructive";
	size?: "default" | "sm" | "lg" | "icon";
	disabled?: boolean;
	children?: React.ReactNode;
}

export function SimpleExportButton({
	data,
	filename,
	format,
	headers,
	dateRange,
	className,
	variant = "outline",
	size = "default",
	disabled = false,
	children,
}: SimpleExportButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		if (!data || data.length === 0) {
			toast.error("No data to export");
			return;
		}

		setIsExporting(true);
		try {
			await exportData(data as Record<string, any>[], {
				format,
				filename,
				includeHeaders: true,
				dateRange: dateRange ? { start: dateRange.from, end: dateRange.to } : undefined,
			});
			toast.success(`${format.toUpperCase()} file exported successfully`);
		} catch (_error) {
			toast.error(`Failed to export ${format.toUpperCase()} file`);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			disabled={disabled || isExporting || data.length === 0}
			onClick={handleExport}
		>
			<Download className="mr-2 h-4 w-4" />
			{isExporting ? "Exporting..." : children || "Export"}
		</Button>
	);
}

// Import useState
import { useState } from "react";
