/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
	// Invoice attachments (no image optimization needed for PDFs)
	invoiceAttachment: f({ pdf: { maxFileSize: '4MB' } })
		.middleware(async () => {
			// Check if user is authenticated
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Invoice attachment uploaded:', file.url);
			return { uploadedBy: metadata.userId, url: file.url };
		}),

	// Receipt images with optimization
	receiptImage: f({ image: { maxFileSize: '4MB' } }) // Standard size for receipt images
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Receipt image uploaded:', file.url);
			return {
				uploadedBy: metadata.userId,
				url: file.url,
				optimized: true,
				endpoint: 'receiptImage'
			};
		}),

	// Profile avatars with optimization
	avatarImage: f({ image: { maxFileSize: '2MB' } }) // Increased to allow for optimization overhead
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Avatar uploaded:', file.url);
			return {
				uploadedBy: metadata.userId,
				url: file.url,
				optimized: true,
				endpoint: 'avatarImage'
			};
		}),

	// General document uploads (no image optimization for non-images)
	documentUpload: f({
		pdf: { maxFileSize: '8MB' },
		video: { maxFileSize: '16MB' }
	})
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Document uploaded:', file.url);
			return { uploadedBy: metadata.userId, url: file.url };
		}),

	// Plugin package uploads (ZIP/TAR files)
	pluginPackage: f({ 
		blob: { 
			maxFileSize: '10MB',
			maxFileCount: 1,
		} 
	})
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Plugin package uploaded:', file.url);
			return { 
				uploadedBy: metadata.userId, 
				url: file.url,
				name: file.name,
				size: file.size,
			};
		}),

	// Plugin icon upload (optional image)
	pluginIcon: f({ image: { maxFileSize: '2MB' } })
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Plugin icon uploaded:', file.url);
			return {
				uploadedBy: metadata.userId,
				url: file.url,
				optimized: true,
			};
		}),

	// Plugin screenshots upload (multiple images)
	pluginScreenshots: f({ image: { maxFileSize: '4MB' } })
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Plugin screenshot uploaded:', file.url);
			return {
				uploadedBy: metadata.userId,
				url: file.url,
				optimized: true,
			};
		}),

	// Gallery images with optimization
	galleryImage: f({ image: { maxFileSize: '10MB' } })
		.middleware(async () => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Gallery image uploaded:', file.url);
			return {
				uploadedBy: metadata.userId,
				url: file.url,
				optimized: true,
				name: file.name,
				size: file.size,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
