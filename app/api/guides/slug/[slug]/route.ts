/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GuidesService } from '@/lib/services/guides-service';
import { SecurityService } from '@/lib/security/arcjet-service';

export async function GET(
	request: NextRequest,
	{ params }: { params: { slug: string } }
) {
	try {
		// Apply security checks
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/guides/slug/[slug]'
		);

		if (securityCheck.denied) {
			return NextResponse.json(
				{
					error: 'Request denied for security reasons',
					details: securityCheck.reasons,
				},
				{
					status: securityCheck.status || 403,
					headers: {
						'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
							? String(securityCheck.rateLimitRemaining)
							: '0',
					},
				}
			);
		}

		const slug = decodeURIComponent(params.slug);

		if (!slug) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid guide slug',
				},
				{ status: 400 }
			);
		}

		const guide = await GuidesService.getGuideBySlug(slug);

		if (!guide) {
			return NextResponse.json(
				{
					success: false,
					error: 'Guide not found',
				},
				{ status: 404 }
			);
		}

		// Increment view count (async, don't wait)
		GuidesService.incrementViewCount(guide.id).catch((error) => {
			console.error('Error incrementing view count:', error);
		});

		return NextResponse.json(
			{
				success: true,
				data: guide,
			},
			{
				status: 200,
				headers: {
					'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
						? String(securityCheck.rateLimitRemaining)
						: '0',
				},
			}
		);
	} catch (error) {
		console.error('Guide API error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch guide. Please try again later.',
			},
			{ status: 500 }
		);
	}
}

