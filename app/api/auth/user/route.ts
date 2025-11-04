import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
