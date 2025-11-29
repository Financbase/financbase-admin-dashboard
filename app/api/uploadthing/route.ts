/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/upload/uploadthing';

// Export routes for Next.js App Router
// Note: createRouteHandler from uploadthing/next handles errors internally
// and provides proper error responses, so no additional error handling is needed
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
});

// Additional configuration for error handling
export const runtime = 'nodejs';
