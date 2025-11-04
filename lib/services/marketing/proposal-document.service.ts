/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, desc, eq } from "drizzle-orm";
import {
	CheckCircle,
	Database,
	FileText,
	Filter,
	Folder,
	Info,
	Plus,
	Trash2,
} from "lucide-react";
import { db } from "../db/connection";
import {
	type NewProposalDocument,
	type ProposalDocument,
	proposalDocuments,
	proposals,
} from "../db/schema-proposals";
import { uploadFile } from "../upload-utils";

export interface DocumentUploadData {
	proposalId: string;
	file: File;
	documentType: "proposal" | "contract" | "attachment" | "invoice" | "other";
	description?: string;
	isPublic?: boolean;
}

export interface DocumentUpdateData {
	description?: string;
	isPublic?: boolean;
}

export class ProposalDocumentService {
	/**
	 * Upload a document for a proposal
	 */
	async uploadDocument(
		data: DocumentUploadData,
		userId: string,
	): Promise<ProposalDocument> {
		const {
			proposalId,
			file,
			documentType,
			description,
			isPublic = false,
		} = data;

		// Verify proposal exists and belongs to user
		const [proposal] = await db
			.select()
			.from(proposals)
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)))
			.limit(1);

		if (!proposal) {
			throw new Error("Proposal not found or access denied");
		}

		// Upload file to storage
		const uploadResult = await uploadFile(file, {
			folder: `proposals/${proposalId}`,
			public: isPublic,
		});

		if (!uploadResult.success || !uploadResult.url) {
			throw new Error("Failed to upload file");
		}

		// Create document record in database
		const documentData: NewProposalDocument = {
			proposalId,
			filename: file.name,
			originalName: file.name,
			mimeType: file.type,
			size: file.size,
			url: uploadResult.url,
			documentType,
			description,
			isPublic,
			uploadedBy: userId,
		};

		const [newDocument] = await db
			.insert(proposalDocuments)
			.values(documentData)
			.returning();

		// Update proposal with document reference based on type
		await this.updateProposalDocumentReference(
			proposalId,
			documentType,
			uploadResult.url,
		);

		return newDocument;
	}

	/**
	 * Get all documents for a proposal
	 */
	async getProposalDocuments(
		proposalId: string,
		userId: string,
	): Promise<ProposalDocument[]> {
		// Verify proposal access
		const [proposal] = await db
			.select()
			.from(proposals)
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)))
			.limit(1);

		if (!proposal) {
			throw new Error("Proposal not found or access denied");
		}

		return await db
			.select()
			.from(proposalDocuments)
			.where(eq(proposalDocuments.proposalId, proposalId))
			.orderBy(desc(proposalDocuments.createdAt));
	}

	/**
	 * Update document metadata
	 */
	async updateDocument(
		documentId: string,
		userId: string,
		updates: DocumentUpdateData,
	): Promise<ProposalDocument | null> {
		const [updatedDocument] = await db
			.update(proposalDocuments)
			.set({ ...updates, updatedAt: new Date() })
			.where(
				and(
					eq(proposalDocuments.id, documentId),
					eq(proposalDocuments.uploadedBy, userId),
				),
			)
			.returning();

		return updatedDocument || null;
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(documentId: string, userId: string): Promise<boolean> {
		// Get document info before deletion
		const [document] = await db
			.select()
			.from(proposalDocuments)
			.where(
				and(
					eq(proposalDocuments.id, documentId),
					eq(proposalDocuments.uploadedBy, userId),
				),
			)
			.limit(1);

		if (!document) {
			throw new Error("Document not found or access denied");
		}

		// Delete from database
		const result = await db
			.delete(proposalDocuments)
			.where(
				and(
					eq(proposalDocuments.id, documentId),
					eq(proposalDocuments.uploadedBy, userId),
				),
			);

		if (result.rowCount > 0) {
			// TODO: Delete from storage service as well
			// await deleteFile(document.url);

			// Clear proposal document reference if it was the main document
			await this.clearProposalDocumentReference(
				document.proposalId,
				document.documentType,
			);
		}

		return result.rowCount > 0;
	}

	/**
	 * Get document by ID
	 */
	async getDocumentById(
		documentId: string,
		userId: string,
	): Promise<ProposalDocument | null> {
		const [document] = await db
			.select()
			.from(proposalDocuments)
			.where(
				and(
					eq(proposalDocuments.id, documentId),
					eq(proposalDocuments.uploadedBy, userId),
				),
			)
			.limit(1);

		return document || null;
	}

	/**
	 * Update proposal document reference based on type
	 */
	private async updateProposalDocumentReference(
		proposalId: string,
		documentType: string,
		url: string,
	): Promise<void> {
		const updateData: any = {};

		switch (documentType) {
			case "proposal":
				updateData.proposalDocumentUrl = url;
				break;
			case "contract":
				updateData.contractTemplateUrl = url;
				break;
			default: {
				// For attachments, add to existing attachments array
				const [proposal] = await db
					.select({ attachments: proposals.attachments })
					.from(proposals)
					.where(eq(proposals.id, proposalId))
					.limit(1);

				const currentAttachments = proposal?.attachments || [];
				updateData.attachments = [...currentAttachments, url];
				break;
			}
		}

		if (Object.keys(updateData).length > 0) {
			await db
				.update(proposals)
				.set({ ...updateData, updatedAt: new Date() })
				.where(eq(proposals.id, proposalId));
		}
	}

	/**
	 * Clear proposal document reference
	 */
	private async clearProposalDocumentReference(
		proposalId: string,
		documentType: string,
	): Promise<void> {
		const updateData: any = {};

		switch (documentType) {
			case "proposal":
				updateData.proposalDocumentUrl = null;
				break;
			case "contract":
				updateData.contractTemplateUrl = null;
				break;
			default:
				// For attachments, this would be more complex - removing from array
				// For now, we'll leave this as is since attachments are stored as arrays
				break;
		}

		if (Object.keys(updateData).length > 0) {
			await db
				.update(proposals)
				.set({ ...updateData, updatedAt: new Date() })
				.where(eq(proposals.id, proposalId));
		}
	}

	/**
	 * Get storage usage for a proposal
	 */
	async getProposalStorageUsage(
		proposalId: string,
		userId: string,
	): Promise<{
		totalFiles: number;
		totalSize: number;
		documents: ProposalDocument[];
	}> {
		const documents = await this.getProposalDocuments(proposalId, userId);

		const totalFiles = documents.length;
		const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);

		return {
			totalFiles,
			totalSize,
			documents,
		};
	}

	/**
	 * Search documents by filename or description
	 */
	async searchDocuments(
		proposalId: string,
		userId: string,
		searchTerm: string,
	): Promise<ProposalDocument[]> {
		const documents = await this.getProposalDocuments(proposalId, userId);

		return documents.filter(
			(doc) =>
				doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
				doc.description?.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}
}
