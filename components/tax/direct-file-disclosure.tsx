/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ExternalLink, Shield } from "lucide-react";

export function DirectFileDisclosure() {
	return (
		<div className="space-y-4 mb-6">
			<Alert>
				<Shield className="h-4 w-4" />
				<AlertTitle>Important Information About Federal Tax Filing</AlertTitle>
				<AlertDescription className="space-y-2 mt-2">
					<p>
						<strong>You are filing directly with the IRS.</strong> This service uses the IRS Direct File 
						open-source software to help you prepare and file your federal tax return. Financbase does not 
						submit your return on your behalf.
					</p>
					<p>
						<strong>Financbase does not provide tax advice.</strong> This is a self-service tool. We do not 
						provide personal tax advice, recommendations, or guidance on your specific tax situation.
					</p>
					<p>
						<strong>Federal returns only.</strong> This service is for federal tax returns only. You will need 
						to file your state and local taxes separately.
					</p>
					<p>
						<strong>No PII/FTI storage.</strong> Your personal information and tax return data are not stored 
						on Financbase servers. All data is processed in your browser session and cleared when you exit.
					</p>
				</AlertDescription>
			</Alert>

			<Alert variant="outline">
				<Info className="h-4 w-4" />
				<AlertTitle>About IRS Direct File</AlertTitle>
				<AlertDescription className="mt-2">
					This service is powered by{" "}
					<a
						href="https://github.com/IRS-Public/direct-file"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline inline-flex items-center gap-1"
					>
						IRS Direct File <ExternalLink className="h-3 w-3" />
					</a>
					, an open-source project from the United States Government. Direct File is in the public domain 
					and available for use under CC0 1.0 Universal.
				</AlertDescription>
			</Alert>
		</div>
	);
}

