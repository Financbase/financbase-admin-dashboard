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
	const response = await fetch("/api/tax/direct-file/exports", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			filename: metadata.filename,
			format: metadata.format,
			fileSize: metadata.fileSize,
		}),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Failed to store export metadata" }));
		throw new Error(error.error?.message || error.message || "Failed to store export metadata");
	}

	const result = await response.json();
	return result.data;
}

/**
 * Get export history for a user (metadata only, no PII/FTI)
 * Note: userId parameter is kept for API compatibility but the API uses RLS to get current user
 */
export async function getExportHistory(userId: string): Promise<DirectFileExportMetadata[]> {
	const response = await fetch("/api/tax/direct-file/exports", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Failed to fetch export history" }));
		throw new Error(error.error?.message || error.message || "Failed to fetch export history");
	}

	const result = await response.json();
	return result.data || [];
}

/**
 * Delete export metadata record
 */
export async function deleteExportMetadata(exportId: string): Promise<void> {
	const response = await fetch(`/api/tax/direct-file/exports/${exportId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Failed to delete export metadata" }));
		throw new Error(error.error?.message || error.message || "Failed to delete export metadata");
	}
}

