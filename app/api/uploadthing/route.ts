import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/upload/uploadthing';

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
});

// Additional configuration for error handling
export const runtime = 'nodejs';
