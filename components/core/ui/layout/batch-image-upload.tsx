"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	Upload,
	X,
	Image as ImageIcon,
	AlertCircle,
	CheckCircle,
	Clock,
	Trash2
} from "lucide-react";
import { toast } from "sonner";

interface BatchUploadItem {
	file: File;
	id: string;
	status: 'pending' | 'uploading' | 'completed' | 'error' | 'analyzing';
	progress: number;
	url?: string;
	error?: string;
	analysis?: any;
}

import { analyzeImageWithAI } from '@/lib/ai/client';

interface BatchImageUploadProps {
	onImagesUpdate?: (imageUrls: string[], analyses?: any[]) => void;
	maxFiles?: number;
	maxSize?: number; // in MB
	acceptedTypes?: string[];
	className?: string;
	uploadEndpoint?: string;
	enableAITagging?: boolean;
}

export function BatchImageUpload({
	onImagesUpdate,
	maxFiles = 10,
	maxSize = 5,
	acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
	className = "",
	uploadEndpoint = "/api/uploadthing?endpoint=receiptImage",
	enableAITagging = false,
}: BatchImageUploadProps) {
	const [uploadItems, setUploadItems] = useState<BatchUploadItem[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files) return;

			const fileArray = Array.from(files);

			// Validate max files
			if (uploadItems.length + fileArray.length > maxFiles) {
				toast.error(`Maximum ${maxFiles} files allowed`);
				return;
			}

			// Validate each file
			const validFiles: File[] = [];
			const errors: string[] = [];

			fileArray.forEach((file) => {
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
			}

			// Add valid files to upload queue
			if (validFiles.length > 0) {
				const newItems: BatchUploadItem[] = validFiles.map(file => ({
					file,
					id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					status: 'pending',
					progress: 0,
				}));

				setUploadItems(prev => [...prev, ...newItems]);
			}
		},
		[uploadItems.length, maxFiles, maxSize, acceptedTypes, enableAITagging]
	);

	const uploadFile = async (item: BatchUploadItem): Promise<string | null> => {
		try {
			const formData = new FormData();
			formData.append("file", item.file);

			const response = await fetch(uploadEndpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const result = await response.json();

			if (result?.url) {
				return result.url;
			} else {
				throw new Error("No URL returned");
			}
		} catch (error) {
			console.error("Upload failed:", error);
			throw error;
		}
	};

	const startBatchUpload = async () => {
		if (uploadItems.length === 0) return;

		setIsUploading(true);
		const completedUrls: string[] = [];
		const analyses: any[] = [];

		for (const item of uploadItems) {
			if (item.status === 'completed' || item.status === 'uploading') continue;

			// Update status to uploading
			setUploadItems(prev =>
				prev.map(uploadItem =>
					uploadItem.id === item.id
						? { ...uploadItem, status: 'uploading' as const, progress: 0 }
						: uploadItem
				)
			);

			try {
				// Simulate progress updates
				const progressInterval = setInterval(() => {
					setUploadItems(prev =>
						prev.map(uploadItem =>
							uploadItem.id === item.id && uploadItem.status === 'uploading'
								? { ...uploadItem, progress: Math.min(uploadItem.progress + 10, 75) }
								: uploadItem
						)
					);
				}, 200);

				const url = await uploadFile(item);

				clearInterval(progressInterval);

				// Update as completed
				setUploadItems(prev =>
					prev.map(uploadItem =>
						uploadItem.id === item.id
							? {
								...uploadItem,
								status: 'completed' as const,
								progress: 85,
								url
							}
							: uploadItem
					)
				);

				if (url) {
					completedUrls.push(url);

					// Analyze with AI if enabled
					if (enableAITagging) {
						setUploadItems(prev =>
							prev.map(uploadItem =>
								uploadItem.id === item.id
									? { ...uploadItem, status: 'analyzing' as const, progress: 90 }
									: uploadItem
							)
						);

						try {
							const analysis = await analyzeImageWithAI(url, item.file.name);
							analyses.push({ url, analysis });

							setUploadItems(prev =>
								prev.map(uploadItem =>
									uploadItem.id === item.id
										? {
											...uploadItem,
											status: 'completed' as const,
											progress: 100,
											analysis
										}
										: uploadItem
								)
							);
						} catch (error) {
							console.warn("AI analysis failed for", item.file.name, error);
							setUploadItems(prev =>
								prev.map(uploadItem =>
									uploadItem.id === item.id
										? {
											...uploadItem,
											status: 'completed' as const,
											progress: 100,
											analysis: null
										}
										: uploadItem
								)
							);
							analyses.push({ url, analysis: null });
						}
					} else {
						setUploadItems(prev =>
							prev.map(uploadItem =>
								uploadItem.id === item.id
									? { ...uploadItem, status: 'completed' as const, progress: 100 }
									: uploadItem
							)
						);
					}
				}

			} catch (error) {
				// Update as error
				setUploadItems(prev =>
					prev.map(uploadItem =>
						uploadItem.id === item.id
							? {
								...uploadItem,
								status: 'error' as const,
								progress: 0,
								error: error instanceof Error ? error.message : 'Upload failed'
							}
							: uploadItem
					)
				);
			}
		}

		setIsUploading(false);

		// Notify parent component
		if (completedUrls.length > 0) {
			if (enableAITagging) {
				toast.success(`Successfully uploaded and analyzed ${completedUrls.length} image(s)`);
			} else {
				toast.success(`Successfully uploaded ${completedUrls.length} image(s)`);
			}
			onImagesUpdate?.(completedUrls, analyses.length > 0 ? analyses : undefined);
		}

		if (completedUrls.length < uploadItems.length) {
			toast.error(`Failed to upload ${uploadItems.length - completedUrls.length} image(s)`);
		}
	};

	const removeItem = (id: string) => {
		setUploadItems(prev => prev.filter(item => item.id !== id));
	};

	const clearCompleted = () => {
		setUploadItems(prev => prev.filter(item => item.status !== 'completed'));
	};

	const retryFailed = async () => {
		const failedItems = uploadItems.filter(item => item.status === 'error');
		if (failedItems.length === 0) return;

		// Reset failed items
		setUploadItems(prev =>
			prev.map(item =>
				item.status === 'error'
					? { ...item, status: 'pending' as const, progress: 0, error: undefined }
					: item
			)
		);

		// Start upload
		await startBatchUpload();
	};

	const getStatusIcon = (status: BatchUploadItem['status']) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4 text-muted-foreground" />;
			case 'uploading':
				return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
			case 'analyzing':
				return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'error':
				return <AlertCircle className="h-4 w-4 text-red-500" />;
		}
	};

	const getStatusBadge = (status: BatchUploadItem['status']) => {
		switch (status) {
			case 'pending':
				return <Badge variant="secondary">Pending</Badge>;
			case 'uploading':
				return <Badge variant="default">Uploading</Badge>;
			case 'analyzing':
				return <Badge variant="default" className="bg-purple-500">Analyzing</Badge>;
			case 'completed':
				return <Badge variant="default" className="bg-green-500">Completed</Badge>;
			case 'error':
				return <Badge variant="destructive">Error</Badge>;
		}
	};

	const completedCount = uploadItems.filter(item => item.status === 'completed').length;
	const errorCount = uploadItems.filter(item => item.status === 'error').length;

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Batch Image Upload</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const input = document.createElement("input");
								input.type = "file";
								input.multiple = true;
								input.accept = acceptedTypes.join(",");
								input.onchange = (e) => {
									handleFileSelect((e.target as HTMLInputElement).files);
								};
								input.click();
							}}
							disabled={isUploading}
						>
							<Upload className="h-4 w-4 mr-2" />
							Select Files
						</Button>

						{uploadItems.length > 0 && (
							<Button
								variant="default"
								size="sm"
								onClick={startBatchUpload}
								disabled={isUploading || uploadItems.every(item => item.status === 'completed')}
							>
								{isUploading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Uploading...
									</>
								) : (
									'Start Upload'
								)}
							</Button>
						)}
					</div>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Upload Area */}
				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
						onClick={() => {
							const input = document.createElement("input");
							input.type = "file";
							input.multiple = true;
							input.accept = acceptedTypes.join(",");
							input.onchange = (e) => {
								handleFileSelect((e.target as HTMLInputElement).files);
							};
							input.click();
						}}
						disabled={isUploading || uploadItems.length >= maxFiles}
					>
						<div className="flex flex-col items-center gap-2">
							<ImageIcon className="h-8 w-8 text-muted-foreground" />
							<div className="text-center">
								<p className="text-sm font-medium">
									Drop files here or click to select
								</p>
								<p className="text-xs text-muted-foreground">
									Max {maxFiles} files • Max {maxSize}MB each • {acceptedTypes.join(", ")}
								</p>
							</div>
						</div>
					</Button>
				</div>

				{/* Upload Queue */}
				{uploadItems.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<span>
								{completedCount} of {uploadItems.length} completed
								{errorCount > 0 && ` • ${errorCount} errors`}
							</span>

							<div className="flex gap-2">
								{errorCount > 0 && (
									<Button variant="outline" size="sm" onClick={retryFailed}>
										Retry Failed
									</Button>
								)}
								{completedCount > 0 && (
									<Button variant="outline" size="sm" onClick={clearCompleted}>
										Clear Completed
									</Button>
								)}
							</div>
						</div>

						<div className="space-y-2 max-h-96 overflow-y-auto">
							{uploadItems.map((item) => (
								<div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
									{/* Preview */}
									<div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
										<Image
											src={URL.createObjectURL(item.file)}
											alt={item.file.name}
											fill
											className="object-cover"
										/>
									</div>

									{/* File Info */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{item.file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(item.file.size / 1024 / 1024).toFixed(2)} MB
										</p>

										{/* Progress */}
										{item.status === 'uploading' && (
											<div className="mt-1">
												<Progress value={item.progress} className="h-1" />
											</div>
										)}

										{/* Error */}
										{item.status === 'error' && item.error && (
											<p className="text-xs text-red-500 mt-1">{item.error}</p>
										)}
									</div>

									{/* Status */}
									<div className="flex items-center gap-2">
										{getStatusIcon(item.status)}
										{getStatusBadge(item.status)}

										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeItem(item.id)}
											disabled={item.status === 'uploading'}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{uploadItems.length === 0 && (
					<div className="flex items-center justify-center py-8 text-muted-foreground">
						<div className="text-center">
							<ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
							<p className="text-sm">No files selected</p>
							<p className="text-xs">Select files to start uploading</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
