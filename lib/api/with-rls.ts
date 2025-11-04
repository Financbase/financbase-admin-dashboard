/**
 * API Route Helper: Automatically set RLS context for authenticated requests
 * 
 * Usage:
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   return withRLS(async (userId) => {
 *     // Your API logic here - RLS is already set
 *     const users = await db.select().from(financbase.users);
 *     return NextResponse.json({ users });
 *   });
 * }
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest, NextResponse } from 'next/server';
import { setRLSContextFromClerkId } from '@/lib/db/rls-context';
import { ApiErrorHandler } from '@/lib/api-error-handler';

export interface WithRLSOptions {
  /**
   * If true, requires user to exist in financbase.users table
   * If false, allows requests even if user not found (sets only clerk_id)
   */
  requireDatabaseUser?: boolean;
  
  /**
   * Custom error message when user not found
   */
  userNotFoundMessage?: string;
}

/**
 * Wraps an API route handler and automatically sets RLS context
 */
export async function withRLS<T = unknown>(
  handler: (userId: string, clerkUser?: Awaited<ReturnType<typeof currentUser>>) => Promise<NextResponse<T>>,
  options: WithRLSOptions = {}
): Promise<NextResponse<T | { error: string }>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Fetch Clerk user for additional context
    const clerkUser = await currentUser();

    // Set RLS context using Clerk user ID
    const userFound = await setRLSContextFromClerkId(userId);
    
    if (options.requireDatabaseUser && !userFound) {
      return NextResponse.json(
        { 
          error: options.userNotFoundMessage || 'User not found in database. Please complete your profile setup.',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Execute the handler with RLS context already set
    return await handler(userId, clerkUser || undefined);
  } catch (error) {
    console.error('[withRLS] Error:', error);
    return ApiErrorHandler.handle(error);
  }
}

/**
 * Helper to get current user ID from context
 * Useful for API routes that need the financbase.users.id (not just Clerk ID)
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    // Get user from database
    const { getUserFromDatabase } = await import('@/lib/db/rls-context');
    const user = await getUserFromDatabase(clerkId);
    
    return user?.id || null;
  } catch (error) {
    console.error('[getCurrentUserId] Error:', error);
    return null;
  }
}

