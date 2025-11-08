/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { DirectFileWrapper } from "@/components/tax/direct-file-wrapper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DirectFilePage() {
	const router = useRouter();

	const handleExportComplete = (metadata: {
		filename: string;
		exportDate: string;
		format: "mef-xml" | "json";
	}) => {
		// Store only metadata (no PII/FTI) for user reference
		// This could be stored in a database for user's export history
		toast.success("Tax return exported successfully", {
			description: `File: ${metadata.filename} (${metadata.format.toUpperCase()})`,
		});

		// Optionally navigate back to tax page
		// router.push("/tax");
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight mb-2">File Your Federal Taxes</h1>
				<p className="text-muted-foreground">
					Use the IRS Direct File service to prepare and file your federal tax return directly with the IRS.
				</p>
			</div>

			<DirectFileWrapper onExportComplete={handleExportComplete} />
		</div>
	);
}

