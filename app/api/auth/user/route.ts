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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get current authenticated user information
 *     description: Returns detailed information about the currently authenticated user from Clerk
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: user_123
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://img.clerk.com/...
 *                 createdAt:
 *                   type: integer
 *                   format: int64
 *                   example: 1704067200000
 *                 updatedAt:
 *                   type: integer
 *                   format: int64
 *                 emailVerified:
 *                   type: boolean
 *                   example: true
 *                 phoneVerified:
 *                   type: boolean
 *                   example: false
 *                 hasImage:
 *                   type: boolean
 *                   example: true
 *                 primaryEmail:
 *                   type: string
 *                   format: email
 *                 primaryPhone:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const user = await currentUser();
    if (!user) {
      return ApiErrorHandler.notFound('User not found');
    }

    // Return user data in a consistent format
    const userData = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      imageUrl: user.imageUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
      phoneVerified: user.phoneNumbers[0]?.verification?.status === 'verified',
      hasImage: !!user.imageUrl,
      primaryEmail: user.emailAddresses[0]?.emailAddress || '',
      primaryPhone: user.phoneNumbers[0]?.phoneNumber || '',
    };

    return NextResponse.json(userData);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
