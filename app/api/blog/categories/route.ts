import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBlogCategorySchema, updateBlogCategorySchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * GET /api/blog/categories
 * Get all blog categories (public)
 */
export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	try {
		const categories = await blogService.getCategories();

		return NextResponse.json({
			success: true,
			data: categories,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/blog/categories
 * Create a new blog category (admin only)
 */
export async function POST(req: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can create blog categories');
		}

		// Parse JSON body with proper error handling
		let body;
		try {
			body = await req.json();
		} catch (error) {
			// Handle JSON parse errors (malformed JSON)
			if (error instanceof SyntaxError || error instanceof TypeError) {
				return ApiErrorHandler.badRequest('Invalid JSON in request body');
			}
			// Re-throw other errors to be handled by outer catch
			throw error;
		}

		try {
			const validatedData = createBlogCategorySchema.parse(body);

			const newCategory = await blogService.createCategory(validatedData);

			return NextResponse.json({
				success: true,
				message: 'Blog category created successfully',
				data: newCategory,
			}, { status: 201 });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

