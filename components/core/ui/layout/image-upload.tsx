/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Loader2,
	X,
	Image as ImageIcon,
	AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { analyzeImageWithAI } from '@/lib/ai/client';

interface ImageUploadProps {
	onImageUpdate?: (imageUrl: string | string[], analysis?: any) => void;
	maxSize?: number; // in MB
	acceptedTypes?: string[];
	className?: string;
	showPreview?: boolean;
	uploadEndpoint?: string;
	multiple?: boolean;
	maxFiles?: number;
	enableAITagging?: boolean;
}

export function ImageUpload({
	onImageUpdate,
	maxSize = 5,
	acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
	className = "",
	showPreview = true,
	uploadEndpoint = "/api/uploadthing?endpoint=receiptImage",
	multiple = false,
	maxFiles = 10,
	enableAITagging = false,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			const fileArray = Array.from(files);

			// Validate max files for multiple upload
			if (multiple && previewUrls.length + fileArray.length > maxFiles) {
				toast.error(`Maximum ${maxFiles} files allowed`);
				return;
			}

			// For single upload, only take first file
			const filesToProcess = multiple ? fileArray : [fileArray[0]];

			// Validate each file
			const validFiles: File[] = [];
			const errors: string[] = [];

			filesToProcess.forEach((file) => {
				// Validate file type
				if (!acceptedTypes.some(type => file.type === type || file.type.startsWith("image/"))) {
					errors.push(`${file.name}: Invalid file type`);
					return;
				}

				// Validate file size
				const maxSizeBytes = maxSize * 1024 * 1024;
				if (file.size > maxSizeBytes) {
					errors.push(`${file.name}: File too large (max ${maxSize}MB)`);
					return;
				}

				validFiles.push(file);
			});

			// Show errors
			if (errors.length > 0) {
				toast.error(`Some files were rejected:\n${errors.join('\n')}`);
				return;
			}

			// For single upload
			if (!multiple) {
				await uploadSingleFile(validFiles[0]);
				return;
			}

			// For multiple upload
			await uploadMultipleFiles(validFiles);
		},
		[maxSize, acceptedTypes, uploadEndpoint, onImageUpdate, multiple, previewUrls.length, maxFiles, enableAITagging]
	);

	const uploadSingleFile = async (file: File) => {
		setIsUploading(true);
		setUploadProgress(0);

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewUrls([e.target?.result as string]);
		};
		reader.readAsDataURL(file);

		try {
			const formData = new FormData();
			formData.append("file", file);

			setUploadProgress(25);

			const response = await fetch(uploadEndpoint, {
				method: "POST",
				body: formData,
			});

			setUploadProgress(75);

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const result = await response.json();
			setUploadProgress(90);

			if (result?.url) {
				const finalUrl = result.url;
				setPreviewUrls([finalUrl]);

				// Analyze with AI if enabled
				let analysis = undefined;
				if (enableAITagging) {
					try {
						analysis = await analyzeImageWithAI(finalUrl, file.name);
						toast.success("Image analyzed with AI!");
					} catch (error) {
						console.warn("AI analysis failed:", error);
						// Continue without analysis
					}
				}

				onImageUpdate?.(finalUrl, analysis);
				toast.success("Image uploaded successfully!");
			} else {
				throw new Error("No URL returned");
			}
		} catch (error) {
			console.error("Upload failed:", error);
			setPreviewUrls([]);
			toast.error("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const uploadMultipleFiles = async (files: File[]) => {
		setIsUploading(true);
		const uploadedUrls: string[] = [];
		const analyses: any[] = [];

		for (const file of files) {
			try {
				// Create preview
				const reader = new FileReader();
				reader.onload = (e) => {
					setPreviewUrls(prev => [...prev, e.target?.result as string]);
				};
				reader.readAsDataURL(file);

				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch(uploadEndpoint, {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Upload failed");
				}

				const result = await response.json();

				if (result?.url) {
					uploadedUrls.push(result.url);
					// Update preview to use uploaded URL
					setPreviewUrls(prev =>
						prev.map(url => url === reader.result ? result.url : url)
					);

					// Analyze with AI if enabled
					if (enableAITagging) {
						try {
							const analysis = await analyzeImageWithAI(result.url, file.name);
							analyses.push({ url: result.url, analysis });
						} catch (error) {
							console.warn("AI analysis failed for", file.name, error);
							analyses.push({ url: result.url, analysis: null });
						}
					}
				} else {
					throw new Error("No URL returned");
				}
			} catch (error) {
				console.error("Upload failed:", error);
				toast.error(`Failed to upload ${file.name}`);
			}
		}

		setIsUploading(false);

		if (uploadedUrls.length > 0) {
			if (enableAITagging) {
				toast.success(`Successfully uploaded and analyzed ${uploadedUrls.length} image(s)`);
			} else {
				toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
			}

			onImageUpdate?.(uploadedUrls, analyses.length > 0 ? analyses : undefined);
		}
	};

	const clearImage = (index?: number) => {
		if (multiple && typeof index === 'number') {
			setPreviewUrls(prev => prev.filter((_, i) => i !== index));
			// Update parent with remaining URLs
			onImageUpdate?.(previewUrls.filter((_, i) => i !== index));
		} else {
			setPreviewUrls([]);
			onImageUpdate?.(multiple ? [] : "");
		}
	};

	return (
		<Card className={`w-full ${className}`}>
			<CardContent className="p-6">
				<div className="space-y-4">
					{/* Upload Area */}
					<div className="space-y-2">
						<Button
							variant="outline"
							className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
							onClick={() => {
								const input = document.createElement("input");
								input.type = "file";
								input.multiple = multiple;
								input.accept = acceptedTypes.join(",");
								input.onchange = (e) => {
									handleFileSelect((e.target as HTMLInputElement).files);
								};
								input.click();
							}}
							disabled={isUploading}
						>
							<div className="flex flex-col items-center gap-2">
								{isUploading ? (
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								) : (
									<ImageIcon className="h-8 w-8 text-muted-foreground" />
								)}
								<div className="text-center">
									<p className="text-sm font-medium">
										{isUploading ? "Uploading..." : multiple ? "Upload Images" : "Upload Image"}
									</p>
									<p className="text-xs text-muted-foreground">
										{multiple ? `Max ${maxFiles} files • ` : ""}Max size: {maxSize}MB • {acceptedTypes.join(", ")}
									</p>
								</div>
							</div>
						</Button>

						{/* Upload Progress */}
						{isUploading && uploadProgress > 0 && (
							<div className="space-y-2">
								<Progress value={uploadProgress} className="h-2" />
								<p className="text-xs text-muted-foreground text-center">
									{uploadProgress}% uploaded
								</p>
							</div>
						)}
					</div>

					{/* Preview */}
					{showPreview && previewUrls.length > 0 && (
						<div className="space-y-3">
							<div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
								{previewUrls.map((url, index) => (
									<div key={`preview-${index}-${url.slice(-10)}`} className="relative group">
										<Image
											src={url}
											alt={`Preview ${index + 1}`}
											width={300}
											height={200}
											className="w-full h-32 object-cover rounded-lg border"
										/>
										<Button
											size="icon"
											variant="destructive"
											className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={() => clearImage(index)}
											disabled={isUploading}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>
							{!multiple && (
								<p className="text-xs text-muted-foreground text-center">
									Click the X to remove this image
								</p>
							)}
							{multiple && previewUrls.length > 1 && (
								<p className="text-xs text-muted-foreground text-center">
									Click the X on any image to remove it
								</p>
							)}
						</div>
					)}

					{/* Error State */}
					{previewUrls.length === 0 && !isUploading && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<AlertCircle className="h-4 w-4" />
							<span>No {multiple ? 'images' : 'image'} uploaded yet</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
