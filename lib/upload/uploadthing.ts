import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
	// Invoice attachments
	invoiceAttachment: f({ pdf: { maxFileSize: '4MB' } })
		.middleware(async ({ req }) => {
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

	// Receipt images
	receiptImage: f({ image: { maxFileSize: '2MB' } })
		.middleware(async ({ req }) => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Receipt image uploaded:', file.url);
			return { uploadedBy: metadata.userId, url: file.url };
		}),

	// Profile avatars
	avatarImage: f({ image: { maxFileSize: '1MB' } })
		.middleware(async ({ req }) => {
			const { userId } = await auth();

			if (!userId) {
				throw new UploadThingError('Unauthorized');
			}

			return { userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Avatar uploaded:', file.url);
			return { uploadedBy: metadata.userId, url: file.url };
		}),

	// General document uploads
	documentUpload: f({
		pdf: { maxFileSize: '8MB' },
		'document': { maxFileSize: '8MB' },
		'spreadsheet': { maxFileSize: '8MB' }
	})
		.middleware(async ({ req }) => {
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
