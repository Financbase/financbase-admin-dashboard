/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Service for handling Direct File export metadata storage
 * 
 * IMPORTANT: This service only stores export metadata (filename, export date, format).
 * NO PII or FTI is stored in the database.
 */

export interface DirectFileExportMetadata {
	id: string;
	userId: string;
	filename: string;
	exportDate: string;
	format: "mef-xml" | "json";
	fileSize?: number;
	// NO PII or FTI fields allowed
}

/**
 * Store export metadata (no PII/FTI)
 * This allows users to track their export history
 */
export async function storeExportMetadata(
	metadata: Omit<DirectFileExportMetadata, "id" | "exportDate">
): Promise<DirectFileExportMetadata> {
	// In a real implementation, this would call an API endpoint
	// that stores only the metadata in the database
	
	const fullMetadata: DirectFileExportMetadata = {
		...metadata,
		id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		exportDate: new Date().toISOString(),
	};

	// TODO: Implement API call to store metadata
	// Example:
	// const response = await fetch("/api/tax/direct-file/exports", {
	//   method: "POST",
	//   headers: { "Content-Type": "application/json" },
	//   body: JSON.stringify(fullMetadata),
	// });
	// return response.json();

	return fullMetadata;
}

/**
 * Get export history for a user (metadata only, no PII/FTI)
 */
export async function getExportHistory(userId: string): Promise<DirectFileExportMetadata[]> {
	// TODO: Implement API call to fetch export history
	// Example:
	// const response = await fetch(`/api/tax/direct-file/exports?userId=${userId}`);
	// return response.json();
	
	return [];
}

/**
 * Delete export metadata record
 */
export async function deleteExportMetadata(exportId: string): Promise<void> {
	// TODO: Implement API call to delete export metadata
	// Example:
	// await fetch(`/api/tax/direct-file/exports/${exportId}`, {
	//   method: "DELETE",
	// });
}

