/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { ImageGallery } from '@/components/core/ui/layout/image-gallery';
import type { UploadedImage } from '@/components/core/ui/layout/image-gallery';
import { ImageUpload } from '@/components/core/ui/layout/image-upload';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logger } from '@/lib/logger';

interface GalleryImage {
	id: string;
	url: string;
	name: string;
	size: number;
	type: string;
	uploadDate: string;
	category?: string;
	tags?: string[];
	favorite?: boolean;
	archived?: boolean;
}

export default function ImageGalleryDemo() {
	const [images, setImages] = useState<UploadedImage[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: userData } = useCurrentUser();
	const organizationId = userData?.organizationId || null;

	// Fetch images
	const fetchImages = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/gallery");
			if (!response.ok) throw new Error("Failed to fetch images");
			const data: GalleryImage[] = await response.json();
			
			// Convert to UploadedImage format
			const convertedImages: UploadedImage[] = data.map((img) => ({
				id: img.id,
				url: img.url,
				name: img.name,
				size: img.size,
				type: img.type,
				uploadDate: new Date(img.uploadDate),
				category: img.category,
				tags: Array.isArray(img.tags) ? img.tags : (typeof img.tags === "string" ? JSON.parse(img.tags || "[]") : []),
				favorite: img.favorite || false,
				archived: img.archived || false,
			}));
			
			setImages(convertedImages);
		} catch (error) {
			logger.error("Error fetching images:", error);
			toast.error("Failed to load images");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchImages();
	}, []);

	const handleDelete = async (imageId: string) => {
		try {
			const response = await fetch(`/api/gallery/${imageId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete image");
			toast.success("Image deleted");
			fetchImages();
		} catch (error) {
			logger.error("Error deleting image:", error);
			toast.error("Failed to delete image");
		}
	};

	const handleUpdate = async (imageId: string, updates: Partial<UploadedImage>) => {
		try {
			const response = await fetch(`/api/gallery/${imageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});
			if (!response.ok) throw new Error("Failed to update image");
			toast.success("Image updated");
			fetchImages();
		} catch (error) {
			logger.error("Error updating image:", error);
			toast.error("Failed to update image");
		}
	};

	const handleUploadComplete = async (res: any) => {
		try {
			// Save image metadata to database
			const response = await fetch("/api/gallery", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					organizationId,
					url: res[0].url,
					name: res[0].name,
					size: res[0].size,
					type: res[0].type || "image/jpeg",
				}),
			});
			if (!response.ok) throw new Error("Failed to save image");
			toast.success("Image uploaded successfully");
			fetchImages();
		} catch (error) {
			logger.error("Error saving image:", error);
			toast.error("Failed to save image");
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold mb-2">Image Gallery</h1>
					<p className="text-muted-foreground">
						Manage and organize your uploaded images with advanced filtering, search, and bulk operations.
					</p>
				</div>
			</div>

			{/* Image Upload Component */}
			<div className="mb-6">
				<ImageUpload
					uploadEndpoint="/api/uploadthing?endpoint=galleryImage"
					onImageUpdate={async (uploadedUrls) => {
						// Handle multiple uploads
						if (Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
							for (const url of uploadedUrls) {
								await handleUploadComplete([{ url, name: '', size: 0, type: 'image/jpeg' }]);
							}
						} else if (typeof uploadedUrls === 'string' && uploadedUrls) {
							await handleUploadComplete([{ url: uploadedUrls, name: '', size: 0, type: 'image/jpeg' }]);
						}
					}}
					multiple={true}
					maxFiles={10}
					maxSize={10}
					acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
				/>
			</div>

			<ImageGallery
				images={images}
				onDelete={handleDelete}
				onUpdate={handleUpdate}
			/>

			{/* Usage Examples */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Usage Examples</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">Basic Gallery</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageGallery
  images={uploadedImages}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
/>`}
						</pre>
					</div>

					<div className="p-4 border rounded-lg">
						<h3 className="font-medium mb-2">With Custom Styling</h3>
						<pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`<ImageGallery
  images={images}
  className="max-w-4xl"
  onDelete={handleDelete}
/>`}
						</pre>
					</div>
				</div>
			</div>

			{/* Features */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Features</h2>

				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔍</span>
						</div>
						<div>
							<h4 className="font-medium">Advanced Search</h4>
							<p className="text-sm text-muted-foreground">Search by filename and tags</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🏷️</span>
						</div>
						<div>
							<h4 className="font-medium">Category Filtering</h4>
							<p className="text-sm text-muted-foreground">Filter by categories and tags</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">⭐</span>
						</div>
						<div>
							<h4 className="font-medium">Favorites & Archive</h4>
							<p className="text-sm text-muted-foreground">Mark favorites and archive images</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">📱</span>
						</div>
						<div>
							<h4 className="font-medium">Responsive Design</h4>
							<p className="text-sm text-muted-foreground">Works on all device sizes</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">⚡</span>
						</div>
						<div>
							<h4 className="font-medium">Bulk Operations</h4>
							<p className="text-sm text-muted-foreground">Select and manage multiple images</p>
						</div>
					</div>

					<div className="flex items-start gap-3 p-3 border rounded-lg">
						<div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary font-bold text-sm">🔧</span>
						</div>
						<div>
							<h4 className="font-medium">Multiple Views</h4>
							<p className="text-sm text-muted-foreground">Grid and list view modes</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
