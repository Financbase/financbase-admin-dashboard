/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { freelancers, type NewFreelancer } from '@/lib/db/schemas/freelancers.schema';
import { eq, and, desc, ilike, or, sql, gte, lte, inArray, type SQL } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '12');
		const search = searchParams.get('search') || undefined;
		const specialty = searchParams.get('specialty') || undefined;
		const minRate = searchParams.get('minRate') || undefined;
		const maxRate = searchParams.get('maxRate') || undefined;
		const status = searchParams.get('status') || undefined;
		const country = searchParams.get('country') || undefined;
		const sortBy = searchParams.get('sortBy') || 'rating';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		const offset = (page - 1) * limit;

		// Build query conditions
		const conditions = [
			eq(freelancers.isPublic, true),
			eq(freelancers.allowMessages, true),
		];

		// Add search condition
		if (search) {
			const searchCondition = or(
				ilike(freelancers.displayName, `%${search}%`) as SQL<unknown>,
				ilike(freelancers.title, `%${search}%`) as SQL<unknown>,
				ilike(freelancers.bio, `%${search}%`) as SQL<unknown>,
				sql`${freelancers.skills}::text ILIKE ${`%${search}%`}` as SQL<unknown>
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}

		// Add specialty filter
		if (specialty) {
			conditions.push(
				sql`${freelancers.specialties}::text ILIKE ${`%${specialty}%`}`
			);
		}

		// Add rate filters
		if (minRate) {
			conditions.push(
				sql`${freelancers.hourlyRate}::numeric >= ${parseFloat(minRate)}`
			);
		}
		if (maxRate) {
			conditions.push(
				sql`${freelancers.hourlyRate}::numeric <= ${parseFloat(maxRate)}`
			);
		}

		// Add status filter
		if (status) {
			conditions.push(eq(freelancers.status, status as any));
		}

		// Add country filter
		if (country) {
			conditions.push(eq(freelancers.country, country));
		}

		// Build order by clause
		let orderBy;
		switch (sortBy) {
			case 'rating':
				orderBy = sortOrder === 'desc' ? desc(freelancers.rating) : freelancers.rating;
				break;
			case 'rate':
				orderBy = sortOrder === 'desc' ? desc(freelancers.hourlyRate) : freelancers.hourlyRate;
				break;
			case 'experience':
				orderBy = sortOrder === 'desc' ? desc(freelancers.yearsExperience) : freelancers.yearsExperience;
				break;
			case 'projects':
				orderBy = sortOrder === 'desc' ? desc(freelancers.projectsCompleted) : freelancers.projectsCompleted;
				break;
			case 'created':
				orderBy = sortOrder === 'desc' ? desc(freelancers.createdAt) : freelancers.createdAt;
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

		return NextResponse.json({
			freelancers: freelancersList,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}
		const {
			displayName,
			title,
			bio,
			avatarUrl,
			bannerUrl,
			specialties,
			skills,
			tools,
			hourlyRate,
			projectRateMin,
			projectRateMax,
			currency = 'USD',
			status = 'available',
			availability,
			timezone = 'UTC',
			yearsExperience,
			portfolioUrl,
			linkedinUrl,
			githubUrl,
			websiteUrl,
			country,
			city,
			remoteWork = true,
			preferredProjectTypes,
			minProjectBudget,
			maxProjectBudget,
			tags,
		} = body;

		// Check if freelancer profile already exists for this user
		const existingFreelancer = await db
			.select()
			.from(freelancers)
			.where(eq(freelancers.userId, userId))
			.limit(1);

		if (existingFreelancer.length > 0) {
			return ApiErrorHandler.conflict('Freelancer profile already exists for this user');
		}

		const insertData: NewFreelancer = {
			userId,
			displayName,
			title,
			bio: bio || null,
			avatarUrl: avatarUrl || null,
			bannerUrl: bannerUrl || null,
			specialties: specialties || [],
			skills: skills || [],
			tools: tools || [],
			hourlyRate: hourlyRate ? String(parseFloat(hourlyRate.toString())) : null,
			projectRateMin: projectRateMin ? String(parseFloat(projectRateMin.toString())) : null,
			projectRateMax: projectRateMax ? String(parseFloat(projectRateMax.toString())) : null,
			currency: currency || 'USD',
			status: (status as any) || 'available',
			availability: availability || null,
			timezone: timezone || 'UTC',
			yearsExperience: yearsExperience ? String(parseFloat(yearsExperience.toString())) : null,
			portfolioUrl: portfolioUrl || null,
			linkedinUrl: linkedinUrl || null,
			githubUrl: githubUrl || null,
			websiteUrl: websiteUrl || null,
			country: country || null,
			city: city || null,
			remoteWork: remoteWork ?? true,
			preferredProjectTypes: preferredProjectTypes || [],
			minProjectBudget: minProjectBudget ? String(parseFloat(minProjectBudget.toString())) : null,
			maxProjectBudget: maxProjectBudget ? String(parseFloat(maxProjectBudget.toString())) : null,
			tags: tags || [],
		};

		const newFreelancer = await db
			.insert(freelancers)
			.values(insertData)
			.returning();

		return NextResponse.json({ freelancer: newFreelancer[0] }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
