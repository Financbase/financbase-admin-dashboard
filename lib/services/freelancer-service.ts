/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { freelancers } from '@/lib/db/schemas/freelancers.schema';
import { eq, and, desc, ilike, or, sql, gte, lte } from 'drizzle-orm';

export interface FreelancerFilters {
	search?: string;
	specialty?: string;
	minRate?: number;
	maxRate?: number;
	status?: string;
	country?: string;
	sortBy?: 'rating' | 'rate' | 'experience' | 'projects' | 'created';
	sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
	page: number;
	limit: number;
}

export const FreelancerService = {
	/**
	 * Get paginated list of freelancers with filters
	 */
	async getFreelancers(filters: FreelancerFilters = {}, pagination: PaginationParams = { page: 1, limit: 12 }) {
		const { page, limit } = pagination;
		const offset = (page - 1) * limit;

		// Build query conditions
		const conditions = [
			eq(freelancers.isPublic, true),
			eq(freelancers.allowMessages, true),
		];

		// Add search condition
		if (filters.search) {
			conditions.push(
				or(
					ilike(freelancers.displayName, `%${filters.search}%`),
					ilike(freelancers.title, `%${filters.search}%`),
					ilike(freelancers.bio, `%${filters.search}%`),
					sql`${freelancers.skills}::text ILIKE ${`%${filters.search}%`}`
				)
			);
		}

		// Add specialty filter
		if (filters.specialty) {
			conditions.push(
				sql`${freelancers.specialties}::text ILIKE ${`%${filters.specialty}%`}`
			);
		}

		// Add rate filters
		if (filters.minRate !== undefined) {
			conditions.push(gte(freelancers.hourlyRate, filters.minRate));
		}
		if (filters.maxRate !== undefined) {
			conditions.push(lte(freelancers.hourlyRate, filters.maxRate));
		}

		// Add status filter
		if (filters.status) {
			conditions.push(eq(freelancers.status, filters.status as any));
		}

		// Add country filter
		if (filters.country) {
			conditions.push(eq(freelancers.country, filters.country));
		}

		// Build order by clause
		let orderBy;
		switch (filters.sortBy) {
			case 'rating':
				orderBy = filters.sortOrder === 'desc' ? desc(freelancers.rating) : freelancers.rating;
				break;
			case 'rate':
				orderBy = filters.sortOrder === 'desc' ? desc(freelancers.hourlyRate) : freelancers.hourlyRate;
				break;
			case 'experience':
				orderBy = filters.sortOrder === 'desc' ? desc(freelancers.yearsExperience) : freelancers.yearsExperience;
				break;
			case 'projects':
				orderBy = filters.sortOrder === 'desc' ? desc(freelancers.projectsCompleted) : freelancers.projectsCompleted;
				break;
			case 'created':
				orderBy = filters.sortOrder === 'desc' ? desc(freelancers.createdAt) : freelancers.createdAt;
				break;
			default:
				orderBy = desc(freelancers.rating);
		}

		// Execute query
		const freelancersList = await db
			.select()
			.from(freelancers)
			.where(and(...conditions))
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const totalCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(freelancers)
			.where(and(...conditions));

		const totalCount = totalCountResult[0]?.count || 0;
		const totalPages = Math.ceil(totalCount / limit);

		return {
			freelancers: freelancersList,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	},

	/**
	 * Get freelancer by ID
	 */
	async getFreelancerById(id: string) {
		const result = await db
			.select()
			.from(freelancers)
			.where(eq(freelancers.id, id))
			.limit(1);

		return result[0] || null;
	},

	/**
	 * Get freelancer by user ID
	 */
	async getFreelancerByUserId(userId: string) {
		const result = await db
			.select()
			.from(freelancers)
			.where(eq(freelancers.userId, userId))
			.limit(1);

		return result[0] || null;
	},

	/**
	 * Create freelancer profile
	 */
	async createFreelancer(userId: string, data: any) {
		const newFreelancer = await db
			.insert(freelancers)
			.values({
				userId,
				...data,
			})
			.returning();

		return newFreelancer[0];
	},

	/**
	 * Update freelancer profile
	 */
	async updateFreelancer(id: string, data: any) {
		const updatedFreelancer = await db
			.update(freelancers)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(freelancers.id, id))
			.returning();

		return updatedFreelancer[0];
	},

	/**
	 * Delete freelancer profile
	 */
	async deleteFreelancer(id: string) {
		await db
			.delete(freelancers)
			.where(eq(freelancers.id, id));
	},

	/**
	 * Get freelancer statistics
	 */
	async getFreelancerStats() {
		const stats = await db
			.select({
				totalFreelancers: sql<number>`count(*)`,
				availableFreelancers: sql<number>`count(*) filter (where status = 'available')`,
				averageRating: sql<number>`avg(rating)`,
				averageRate: sql<number>`avg(hourly_rate)`,
			})
			.from(freelancers)
			.where(eq(freelancers.isPublic, true));

		return stats[0];
	},

	/**
	 * Get popular specialties
	 */
	async getPopularSpecialties(limit = 10) {
		// This would require a more complex query to extract specialties from JSONB
		// For now, return a static list
		return [
			'web_development',
			'ui_ux_design',
			'mobile_development',
			'digital_marketing',
			'content_writing',
			'graphic_design',
			'data_analysis',
			'project_management',
			'consulting',
		].slice(0, limit);
	},

	/**
	 * Get countries with freelancers
	 */
	async getCountriesWithFreelancers() {
		const countries = await db
			.selectDistinct({ country: freelancers.country })
			.from(freelancers)
			.where(and(
				eq(freelancers.isPublic, true),
				sql`${freelancers.country} IS NOT NULL`
			));

		return countries.map(c => c.country).filter(Boolean);
	},
};
