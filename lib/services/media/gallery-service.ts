/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { galleryImages, galleryCategories } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, isNotNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateGalleryImageInput {
	url: string;
	name: string;
	size: number;
	type: string;
	category?: string;
	tags?: string[];
	metadata?: Record<string, any>;
}

export interface UpdateGalleryImageInput extends Partial<CreateGalleryImageInput> {
	id: string;
	favorite?: boolean;
	archived?: boolean;
}

export interface GalleryFilters {
	search?: string;
	category?: string;
	favorite?: boolean;
	archived?: boolean;
}

/**
 * Gallery Service - Handles all gallery-related operations
 */
export class GalleryService {
	/**
	 * Get all gallery images
	 */
	async getAll(filters?: GalleryFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(galleryImages).where(eq(galleryImages.userId, userId));

		if (filters) {
			if (filters.search) {
				const searchTerm = `%${filters.search}%`;
				query = query.where(
					and(
						eq(galleryImages.userId, userId),
						or(
							ilike(galleryImages.name, searchTerm),
							isNotNull(galleryImages.category),
							// Search in category only if it exists
							...(filters.search ? [eq(galleryImages.category, filters.search)] : [])
						)
					)
				);
			}

			if (filters.category) {
				query = query.where(
					and(eq(galleryImages.userId, userId), eq(galleryImages.category, filters.category))
				);
			}

			if (filters.favorite !== undefined) {
				query = query.where(
					and(eq(galleryImages.userId, userId), eq(galleryImages.favorite, filters.favorite))
				);
			}

			if (filters.archived !== undefined) {
				query = query.where(
					and(eq(galleryImages.userId, userId), eq(galleryImages.archived, filters.archived))
				);
			}
		}

		const results = await query.orderBy(desc(galleryImages.createdAt));
		return results;
	}

	/**
	 * Get image by ID
	 */
	async getById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(galleryImages)
			.where(and(eq(galleryImages.id, id), eq(galleryImages.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Image not found");
		}

		return result[0];
	}

	/**
	 * Create a new gallery image
	 */
	async create(organizationId: string, input: CreateGalleryImageInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newImage = {
			userId,
			organizationId,
			url: input.url,
			name: input.name,
			size: input.size,
			type: input.type,
			category: input.category,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			favorite: false,
			archived: false,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
		};

		const result = await db.insert(galleryImages).values(newImage).returning();
		return result[0];
	}

	/**
	 * Update a gallery image
	 */
	async update(input: UpdateGalleryImageInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.category !== undefined) updateData.category = input.category;
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
		if (input.favorite !== undefined) updateData.favorite = input.favorite;
		if (input.archived !== undefined) updateData.archived = input.archived;
		if (input.metadata !== undefined) updateData.metadata = JSON.stringify(input.metadata);

		const result = await db
			.update(galleryImages)
			.set(updateData)
			.where(and(eq(galleryImages.id, input.id), eq(galleryImages.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete a gallery image
	 */
	async delete(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(id);

		await db
			.delete(galleryImages)
			.where(and(eq(galleryImages.id, id), eq(galleryImages.userId, userId)));

		return { success: true };
	}

	/**
	 * Get images by category
	 */
	async getByCategory(category: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(galleryImages)
			.where(and(eq(galleryImages.userId, userId), eq(galleryImages.category, category)))
			.orderBy(desc(galleryImages.createdAt));

		return results;
	}

	/**
	 * Category management
	 */
	async createCategory(organizationId: string, name: string, description?: string, color?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.insert(galleryCategories)
			.values({
				organizationId,
				name,
				description,
				color,
			})
			.returning();

		return result[0];
	}

	async getCategories(organizationId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(galleryCategories)
			.where(eq(galleryCategories.organizationId, organizationId))
			.orderBy(desc(galleryCategories.createdAt));

		return results;
	}
}

