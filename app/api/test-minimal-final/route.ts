/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    return Response.json({ message: 'Minimal test works' });
  } catch (error) {
    logger.error('Error in test-minimal-final route', { error });
    return ApiErrorHandler.handle(error);
  }
}
