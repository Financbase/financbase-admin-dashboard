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
import { PluginSystem } from '@/lib/plugins/plugin-system';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // Get user's installed plugins
    const installedPlugins = await PluginSystem.getUserPlugins(
      userId,
      organizationId || undefined
    );

    return NextResponse.json(installedPlugins);
  } catch (error) {
    logger.error('Error fetching installed plugins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Database errors
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error',
          message: 'Unable to connect to database. Please check your DATABASE_URL configuration.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch installed plugins',
        message: 'An error occurred while fetching installed plugins',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
