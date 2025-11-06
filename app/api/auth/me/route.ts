/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { getUserFromDatabase } from '@/lib/db/rls-context';

/**
 * GET /api/auth/me
 * Get current authenticated user's database information including organizationId
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return ApiErrorHandler.unauthorized();
    }

    let user = await getUserFromDatabase(clerkId);
    
    // Auto-sync user if they don't exist (webhook might have missed them)
    if (!user) {
      try {
        // Import sync logic
        const { currentUser } = await import('@clerk/nextjs/server');
        const { db } = await import('@/lib/db');
        const { users, organizations } = await import('@/lib/db/schemas');
        const { eq } = await import('drizzle-orm');
        
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          if (email) {
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
              const [newOrg] = await db
                .insert(organizations)
                .values({
                  name: 'Default Organization',
                  description: 'Default organization for new users',
                })
                .returning();
              orgId = String(newOrg.id);
            }

            // Create user
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

            // Fetch the created user
            user = await getUserFromDatabase(clerkId);
          }
        }
      } catch (syncError: any) {
        // If sync fails (e.g., duplicate), try to fetch again
        if (syncError.code !== '23505') {
          console.error('[Auto-sync] Error:', syncError);
        }
        user = await getUserFromDatabase(clerkId);
      }
    }
    
    if (!user) {
      return ApiErrorHandler.notFound('User not found in database. Please call POST /api/auth/sync-user to sync your account.');
    }

    return NextResponse.json({
      id: user.id,
      clerkId: user.clerk_id,
      organizationId: user.organization_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

