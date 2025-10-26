import type { OurFileRouter } from "@/lib/upload/uploadthing";

export const uploadthingConfig = {
	endpoint: "/api/uploadthing",
} satisfies { endpoint: string };

// Re-export types for convenience
export type { OurFileRouter };
