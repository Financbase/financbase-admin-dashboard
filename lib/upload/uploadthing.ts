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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
