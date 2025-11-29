/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, organizations } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/sync-user
 * 
 * Automatically syncs the current authenticated Clerk user to the database.
 * This is useful when:
 * - The webhook didn't fire
 * - User was created before webhook was set up
 * - Manual sync is needed
 * 
 * Requires: Authenticated Clerk session
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    // Get current authenticated user from Clerk
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return ApiErrorHandler.unauthorized('You must be authenticated to sync your user');
    }

    // Check if user already exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'User already exists in database',
        user: {
          id: existingUser[0].id,
          clerkId: existingUser[0].clerkId,
          email: existingUser[0].email,
          organizationId: existingUser[0].organizationId,
        },
      });
    }

    // Fetch full user details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return ApiErrorHandler.notFound('User not found in Clerk');
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return ApiErrorHandler.badRequest('User email not found in Clerk account');
    }

    // Get or create default organization
    const defaultOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, 'Default Organization'))
      .limit(1);

    let orgId: string;
    if (defaultOrg.length > 0) {
      orgId = String(defaultOrg[0].id);
    } else {
      // Create default organization
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: 'Default Organization',
          description: 'Default organization for new users',
        })
        .returning();
      orgId = String(newOrg.id);
    }

    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkId,
        email: email,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        role: 'user',
        isActive: true,
        organizationId: orgId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: newUser.id,
        clerkId: newUser.clerkId,
        email: newUser.email,
        organizationId: newUser.organizationId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error: any) {
    logger.error('[Sync User] Error:', error);
    
    if (error.code === '23505') {
      // Unique constraint violation - user might have been created in parallel
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkId))
          .limit(1);
        
        if (existingUser.length > 0) {
          return NextResponse.json({
            success: true,
            message: 'User already exists (created in parallel)',
            user: {
              id: existingUser[0].id,
              clerkId: existingUser[0].clerkId,
              email: existingUser[0].email,
            },
          });
        }
      }
      
      return ApiErrorHandler.badRequest('User with this email or Clerk ID already exists');
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * GET /api/auth/sync-user
 * 
 * Checks if the current user exists in the database and returns sync status.
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return ApiErrorHandler.unauthorized('You must be authenticated');
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        synced: true,
        user: {
          id: existingUser[0].id,
          clerkId: existingUser[0].clerkId,
          email: existingUser[0].email,
          organizationId: existingUser[0].organizationId,
        },
      });
    }

    // Get user info from Clerk to show what would be synced
    const clerkUser = await currentUser();
    return NextResponse.json({
      synced: false,
      clerkUser: clerkUser ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      } : null,
      message: 'User not synced. Call POST /api/auth/sync-user to sync.',
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

