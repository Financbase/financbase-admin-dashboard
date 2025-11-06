/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { sql } from "@/lib/neon";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Database, Landmark, Shield, XCircle } from "lucide-react";

export interface DataBankFile {
	id: number;
	fileKey: string;
	filename: string;
	originalName: string;
	contentType: string;
	fileSize: number;
	publicUrl?: string;
	category: string;
	description?: string;
	tags?: string[];
	uploadedBy: string;
	organizationId?: number;
	downloadCount: number;
	isPublic: boolean;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateFileData {
	filename: string;
	originalName: string;
	contentType: string;
	fileData: Buffer;
	category?: string;
	description?: string;
	tags?: string[];
	isPublic?: boolean;
	expiresAt?: Date;
}

export interface UpdateFileData {
	category?: string;
	description?: string;
	tags?: string[];
	isPublic?: boolean;
	expiresAt?: Date;
}

export interface FileFilters {
	category?: string;
	search?: string;
	limit?: number;
	offset?: number;
	sortBy?: "created_at" | "filename" | "file_size" | "download_count";
	sortOrder?: "asc" | "desc";
}

// Cloudflare R2 configuration
const r2Client = new S3Client({
	region: "auto",
	endpoint:
		process.env.R2_ENDPOINT ||
		`https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

/**
 * Data Bank Service
 * Handles all data bank file operations including upload, storage, and retrieval
 */
export class DataBankService {
	/**
	 * Upload a file to the data bank
	 */
	async uploadFile(
		data: CreateFileData,
		uploadedBy: string,
		organizationId?: number,
	): Promise<DataBankFile> {
		// Generate unique file key
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const sanitizedFilename = data.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
		const fileKey = `data-bank/${organizationId || "default"}/${timestamp}-${randomStr}-${sanitizedFilename}`;

		// Upload to R2
		try {
			await r2Client.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET || "cms-admin-files",
					Key: fileKey,
					Body: data.fileData,
					ContentType: data.contentType,
					Metadata: {
						userId: uploadedBy,
						organizationId: organizationId?.toString() || "",
						originalFilename: data.filename,
						uploadedAt: new Date().toISOString(),
					},
				}),
			);
		} catch (uploadError) {
			console.error("Error uploading to R2:", uploadError);
			throw new Error("Failed to upload file to storage");
		}

		// Generate public URL
		const publicUrl = `${process.env.R2_PUBLIC_DOMAIN || ""}/${fileKey}`;

		// Store file metadata in database
		const fileResult = await sql.query(
			`INSERT INTO cms.data_bank_files
       (file_key, filename, original_name, content_type, file_size, public_url,
        category, description, tags, uploaded_by, organization_id, is_public, expires_at,
        created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
			[
				fileKey,
				data.filename,
				data.originalName,
				data.contentType,
				data.fileData.length,
				publicUrl,
				data.category || "uncategorized",
				data.description || null,
				data.tags ? JSON.stringify(data.tags) : null,
				uploadedBy,
				organizationId,
				data.isPublic ? 1 : 0,
				data.expiresAt || null,
			],
		);

		return fileResult.rows[0];
	}

	/**
	 * Get files with optional filtering
	 */
	async getFiles(
		filters: FileFilters = {},
		organizationId?: number,
	): Promise<{
		files: DataBankFile[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	}> {
		const {
			category,
			search,
			limit = 50,
			offset = 0,
			sortBy = "created_at",
			sortOrder = "desc",
		} = filters;

		// Build query with filters
		let query = `
			SELECT f.*, u.first_name, u.last_name,
						 COALESCE(u.first_name || ' ' || u.last_name, 'Unknown User') as uploaded_by_name
			FROM cms.data_bank_files f
			LEFT JOIN auth.users u ON f.uploaded_by = u.id
		`;
		const params: any[] = [];
		let paramCount = 0;

		const whereConditions: string[] = [];

		// Organization filter
		if (organizationId) {
			paramCount++;
			whereConditions.push(`f.organization_id = $${paramCount}`);
			params.push(organizationId);
		}

		// Category filter
		if (category) {
			paramCount++;
			whereConditions.push(`f.category = $${paramCount}`);
			params.push(category);
		}

		// Search filter (filename, description, tags)
		if (search) {
			paramCount++;
			whereConditions.push(`(
				f.filename ILIKE $${paramCount} OR
				f.description ILIKE $${paramCount} OR
				f.tags ILIKE $${paramCount}
			)`);
			params.push(`%${search}%`);
		}

		if (whereConditions.length > 0) {
			query += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		// Sorting
		const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";
		query += ` ORDER BY f.${sortBy} ${sortDirection}`;

		// Pagination
		query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
		params.push(limit, offset);

		const result = await sql.query(query, params);

		// Get total count for pagination
		let countQuery = "SELECT COUNT(*) as total FROM cms.data_bank_files f";
		if (whereConditions.length > 0) {
			countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
		}

		const countResult = await sql.query(
			countQuery,
			params.slice(0, paramCount),
		);

		return {
			files: result.rows.map((row) => ({
				...row,
				tags: row.tags ? JSON.parse(row.tags) : [],
			})),
			pagination: {
				total: Number.parseInt(countResult.rows[0].total),
				limit,
				offset,
				hasMore: offset + limit < Number.parseInt(countResult.rows[0].total),
			},
		};
	}

	/**
	 * Get a specific file by ID
	 */
	async getFile(
		id: number,
		organizationId?: number,
	): Promise<DataBankFile | null> {
		let query = `
			SELECT f.*, u.first_name, u.last_name,
						 COALESCE(u.first_name || ' ' || u.last_name, 'Unknown User') as uploaded_by_name
			FROM cms.data_bank_files f
			LEFT JOIN auth.users u ON f.uploaded_by = u.id
			WHERE f.id = $1
		`;
		const params: any[] = [id];

		// Organization filter for security
		if (organizationId) {
			query += " AND (f.organization_id = $2 OR f.is_public = 1)";
			params.push(organizationId);
		} else {
			query += " AND f.is_public = 1";
		}

		const result = await sql.query(query, params);

		if (result.rows.length === 0) {
			return null;
		}

		const row = result.rows[0];
		return {
			...row,
			tags: row.tags ? JSON.parse(row.tags) : [],
		};
	}

	/**
	 * Update file metadata
	 */
	async updateFile(
		id: number,
		data: UpdateFileData,
		updatedBy: string,
	): Promise<void> {
		// Build update query
		const updates: string[] = [];
		const params: any[] = [];
		let paramCount = 0;

		if (data.category !== undefined) {
			paramCount++;
			updates.push(`category = $${paramCount}`);
			params.push(data.category);
		}

		if (data.description !== undefined) {
			paramCount++;
			updates.push(`description = $${paramCount}`);
			params.push(data.description);
		}

		if (data.tags !== undefined) {
			paramCount++;
			updates.push(`tags = $${paramCount}`);
			params.push(JSON.stringify(data.tags));
		}

		if (data.isPublic !== undefined) {
			paramCount++;
			updates.push(`is_public = $${paramCount}`);
			params.push(data.isPublic ? 1 : 0);
		}

		if (data.expiresAt !== undefined) {
			paramCount++;
			updates.push(`expires_at = $${paramCount}`);
			params.push(data.expiresAt);
		}

		// Always update updated_at
		paramCount++;
		updates.push(`updated_at = $${paramCount}`);
		params.push(new Date());

		// Add ID parameter
		params.push(id);

		await sql.query(
			`UPDATE cms.data_bank_files SET ${updates.join(", ")} WHERE id = $${paramCount + 1}`,
			params,
		);
	}

	/**
	 * Delete a file
	 */
	async deleteFile(id: number, deletedBy: string): Promise<void> {
		// Get file details for R2 deletion
		const fileResult = await sql.query(
			"SELECT * FROM cms.data_bank_files WHERE id = $1",
			[id],
		);

		if (fileResult.rows.length === 0) {
			throw new Error("File not found");
		}

		const file = fileResult.rows[0];

		// Delete from R2 storage
		try {
			await r2Client.send(
				new DeleteObjectCommand({
					Bucket: process.env.R2_BUCKET || "cms-admin-files",
					Key: file.file_key,
				}),
			);
		} catch (storageError) {
			console.error("Error deleting from R2:", storageError);
			// Continue with database deletion even if storage deletion fails
		}

		// Delete from database
		await sql.query("DELETE FROM cms.data_bank_files WHERE id = $1", [id]);
	}

	/**
	 * Download a file (returns file buffer)
	 */
	async downloadFile(id: number, organizationId?: number): Promise<Buffer> {
		const file = await this.getFile(id, organizationId);

		if (!file) {
			throw new Error("File not found or access denied");
		}

		// Check if file is expired
		if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
			throw new Error("File has expired");
		}

		// Get file from R2
		try {
			const getObjectCommand = new GetObjectCommand({
				Bucket: process.env.R2_BUCKET || "cms-admin-files",
				Key: file.fileKey,
			});

			const response = await r2Client.send(getObjectCommand);

			if (!response.Body) {
				throw new Error("File not found in storage");
			}

			// Convert the stream to buffer
			const chunks: Buffer[] = [];
			const reader = response.Body.transformToByteArray();
			const buffer = Buffer.from(await reader);

			// Update download count
			await sql.query(
				"UPDATE cms.data_bank_files SET download_count = download_count + 1 WHERE id = $1",
				[id],
			);

			return buffer;
		} catch (error) {
			console.error("Error downloading from R2:", error);
			throw new Error("Failed to download file from storage");
		}
	}

	/**
	 * Get file statistics
	 */
	async getFileStats(organizationId?: number) {
		let query = `
			SELECT
				COUNT(*) as total_files,
				SUM(file_size) as total_size,
				AVG(file_size) as avg_file_size,
				COUNT(CASE WHEN is_public = 1 THEN 1 END) as public_files,
				COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 END) as expired_files,
				MAX(created_at) as latest_upload
			FROM cms.data_bank_files
		`;
		const params: any[] = [];

		if (organizationId) {
			query += " WHERE organization_id = $1";
			params.push(organizationId);
		}

		const result = await sql.query(query, params);
		return result.rows[0];
	}

	/**
	 * Get categories and their file counts
	 */
	async getCategories(organizationId?: number) {
		let query = `
			SELECT
				category,
				COUNT(*) as file_count,
				SUM(file_size) as total_size
			FROM cms.data_bank_files
		`;
		const params: any[] = [];

		if (organizationId) {
			query += " WHERE organization_id = $1";
			params.push(organizationId);
		}

		query += `
			GROUP BY category
			ORDER BY file_count DESC
		`;

		const result = await sql.query(query, params);
		return result.rows;
	}
}

// Export singleton instance
export const dataBankService = new DataBankService();
