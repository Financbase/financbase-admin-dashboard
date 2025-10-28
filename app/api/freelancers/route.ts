import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { freelancers } from '@/lib/db/schemas/freelancers.schema';
import { eq, and, desc, ilike, or, sql, gte, lte, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
			conditions.push(
				or(
					ilike(freelancers.displayName, `%${search}%`),
					ilike(freelancers.title, `%${search}%`),
					ilike(freelancers.bio, `%${search}%`),
					sql`${freelancers.skills}::text ILIKE ${`%${search}%`}`
				)
			);
		}

		// Add specialty filter
		if (specialty) {
			conditions.push(
				sql`${freelancers.specialties}::text ILIKE ${`%${specialty}%`}`
			);
		}

		// Add rate filters
		if (minRate) {
			conditions.push(gte(freelancers.hourlyRate, parseFloat(minRate)));
		}
		if (maxRate) {
			conditions.push(lte(freelancers.hourlyRate, parseFloat(maxRate)));
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
		console.error('Error fetching freelancers:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch freelancers' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
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
			return NextResponse.json(
				{ error: 'Freelancer profile already exists for this user' },
				{ status: 409 }
			);
		}

		const newFreelancer = await db
			.insert(freelancers)
			.values({
				userId,
				displayName,
				title,
				bio,
				avatarUrl,
				bannerUrl,
				specialties: specialties || [],
				skills: skills || [],
				tools: tools || [],
				hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
				projectRateMin: projectRateMin ? parseFloat(projectRateMin) : null,
				projectRateMax: projectRateMax ? parseFloat(projectRateMax) : null,
				currency,
				status,
				availability,
				timezone,
				yearsExperience: yearsExperience ? parseFloat(yearsExperience) : null,
				portfolioUrl,
				linkedinUrl,
				githubUrl,
				websiteUrl,
				country,
				city,
				remoteWork,
				preferredProjectTypes: preferredProjectTypes || [],
				minProjectBudget: minProjectBudget ? parseFloat(minProjectBudget) : null,
				maxProjectBudget: maxProjectBudget ? parseFloat(maxProjectBudget) : null,
				tags: tags || [],
			})
			.returning();

		return NextResponse.json({ freelancer: newFreelancer[0] }, { status: 201 });
	} catch (error) {
		console.error('Error creating freelancer profile:', error);
		return NextResponse.json(
			{ error: 'Failed to create freelancer profile' },
			{ status: 500 }
		);
	}
}
