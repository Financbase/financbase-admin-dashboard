"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
	Video,
	Play,
	Pause,
	Upload,
	X,
	Download,
	Settings,
	Clock,
	AlertCircle,
	CheckCircle,
	Image as ImageIcon,
	Film
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploadProps {
	onVideoUpdate?: (videoUrl: string, thumbnailUrl?: string, metadata?: any) => void;
	maxSize?: number; // in MB
	acceptedTypes?: string[];
	className?: string;
	uploadEndpoint?: string;
	generateThumbnail?: boolean;
}

interface VideoMetadata {
	duration: number;
	width: number;
	height: number;
	codec: string;
	bitrate: number;
	framerate: number;
}

export function VideoUpload({
	onVideoUpdate,
	maxSize = 100,
	acceptedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv'],
	className = '',
	uploadEndpoint = '/api/uploadthing?endpoint=documentUpload',
	generateThumbnail = true,
}: VideoUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
	const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
	const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];

			// Validate file type
			if (!acceptedTypes.some(type => file.type === type || file.type.startsWith('video/'))) {
				toast.error(`Please select a valid video file (${acceptedTypes.join(', ')})`);
				return;
			}

			// Validate file size
			const maxSizeBytes = maxSize * 1024 * 1024;
			if (file.size > maxSizeBytes) {
				toast.error(`Video must be smaller than ${maxSize}MB`);
				return;
			}

			await uploadVideo(file);
		},
		[maxSize, acceptedTypes, uploadEndpoint, onVideoUpdate, generateThumbnail]
	);

	const uploadVideo = async (file: File) => {
		setIsUploading(true);
		setUploadProgress(0);

		// Create preview URL
		const videoPreviewUrl = URL.createObjectURL(file);
		setPreviewUrl(videoPreviewUrl);

		try {
			const formData = new FormData();
			formData.append('file', file);

			setUploadProgress(25);

			const response = await fetch(uploadEndpoint, {
				method: 'POST',
				body: formData,
			});

			setUploadProgress(75);

			if (!response.ok) {
				// Try to get error message from response
				let errorMessage = 'Upload failed';
				try {
					const errorData = await response.json();
					errorMessage = errorData?.error || errorData?.message || errorMessage;
				} catch {
					// If response is not JSON, use status text
					errorMessage = response.statusText || `Server error (${response.status})`;
				}
				throw new Error(errorMessage);
			}

			const result = await response.json();
			setUploadProgress(100);

			if (result?.url) {
				const videoUrl = result.url;

				// Generate thumbnail if enabled
				let thumbnail: string | undefined;
				if (generateThumbnail) {
					try {
						setIsGeneratingThumbnail(true);
						thumbnail = await generateVideoThumbnail(videoPreviewUrl, file.name);
						setThumbnailUrl(thumbnail);
					} catch (error) {
						console.warn('Thumbnail generation failed:', error);
					} finally {
						setIsGeneratingThumbnail(false);
					}
				}

				// Get video metadata
				const metadata = await getVideoMetadata(videoPreviewUrl);

				setVideoMetadata(metadata);
				onVideoUpdate?.(videoUrl, thumbnail, { ...metadata, fileName: file.name });
				toast.success('Video uploaded successfully!');
			} else {
				throw new Error('No URL returned');
			}
		} catch (error) {
			console.error('Upload failed:', error);
			setPreviewUrl(null);
			setThumbnailUrl(null);
			setVideoMetadata(null);
			
			// Show more specific error message
			const errorMessage = error instanceof Error 
				? error.message 
				: 'Failed to upload video. Please try again.';
			toast.error(errorMessage);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const generateVideoThumbnail = async (videoUrl: string, filename: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				reject(new Error('Canvas context not available'));
				return;
			}

			video.crossOrigin = 'anonymous';
			video.src = videoUrl;

			video.onloadedmetadata = () => {
				// Set canvas size (use video dimensions or max 320px width)
				const maxWidth = 320;
				const aspectRatio = video.videoWidth / video.videoHeight;
				canvas.width = Math.min(video.videoWidth, maxWidth);
				canvas.height = canvas.width / aspectRatio;

				// Seek to 10% of video duration for thumbnail
				video.currentTime = video.duration * 0.1;
			};

			video.onseeked = () => {
				// Draw video frame to canvas
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				// Convert to blob and create data URL
				canvas.toBlob((blob) => {
					if (blob) {
						const thumbnailUrl = URL.createObjectURL(blob);
						resolve(thumbnailUrl);
					} else {
						reject(new Error('Failed to generate thumbnail'));
					}
				}, 'image/jpeg', 0.8);
			};

			video.onerror = () => {
				reject(new Error('Failed to load video for thumbnail generation'));
			};

			// Timeout after 10 seconds
			setTimeout(() => {
				reject(new Error('Thumbnail generation timeout'));
			}, 10000);
		});
	};

	const getVideoMetadata = async (videoUrl: string): Promise<VideoMetadata> => {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');

			video.crossOrigin = 'anonymous';
			video.src = videoUrl;

			video.onloadedmetadata = () => {
				resolve({
					duration: video.duration,
					width: video.videoWidth,
					height: video.videoHeight,
					codec: 'unknown', // Would need more complex detection
					bitrate: 0, // Would need file analysis
					framerate: 0, // Would need more complex detection
				});
			};

			video.onerror = () => {
				reject(new Error('Failed to load video metadata'));
			};

			// Timeout after 5 seconds
			setTimeout(() => {
				reject(new Error('Metadata loading timeout'));
			}, 5000);
		});
	};

	const clearVideo = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		if (thumbnailUrl) {
			URL.revokeObjectURL(thumbnailUrl);
		}
		setPreviewUrl(null);
		setThumbnailUrl(null);
		setVideoMetadata(null);
		onVideoUpdate?.(null);
	};

	const downloadVideo = () => {
		if (!previewUrl) return;

		const link = document.createElement('a');
		link.href = previewUrl;
		link.download = videoMetadata?.fileName || 'video';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success('Download started');
	};

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Film className="h-5 w-5" />
					Video Upload
					<Badge variant="secondary">Beta</Badge>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Upload Area */}
				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
					>
						<div className="flex flex-col items-center gap-2">
							{isUploading ? (
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							) : (
								<Video className="h-8 w-8 text-muted-foreground" />
							)}
							<div className="text-center">
								<p className="text-sm font-medium">
									{isUploading ? 'Uploading...' : 'Upload Video'}
								</p>
								<p className="text-xs text-muted-foreground">
									Max size: {maxSize}MB • {acceptedTypes.join(', ')}
								</p>
							</div>
						</div>
					</Button>

					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						accept={acceptedTypes.join(',')}
						onChange={(e) => handleFileSelect(e.target.files)}
						className="hidden"
					/>

					{/* Upload Progress */}
					{isUploading && uploadProgress > 0 && (
						<div className="space-y-2">
							<Progress value={uploadProgress} className="h-2" />
							<p className="text-xs text-muted-foreground text-center">
								{uploadProgress}% uploaded
							</p>
						</div>
					)}

					{/* Thumbnail Generation Progress */}
					{isGeneratingThumbnail && (
						<div className="space-y-2">
							<Progress value={50} className="h-2" />
							<p className="text-xs text-muted-foreground text-center">
								Generating thumbnail...
							</p>
						</div>
					)}
				</div>

				{/* Video Preview */}
				{previewUrl && (
					<div className="space-y-3">
						<div className="relative bg-muted rounded-lg overflow-hidden">
							<video
								ref={videoRef}
								src={previewUrl}
								controls
								className="w-full max-h-64 object-contain"
								poster={thumbnailUrl || undefined}
							/>

							{/* Video Controls Overlay */}
							<div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
								<Button size="sm" variant="secondary" onClick={downloadVideo}>
									<Download className="h-3 w-3 mr-1" />
									Download
								</Button>
								<Button size="sm" variant="destructive" onClick={clearVideo}>
									<X className="h-3 w-3" />
								</Button>
							</div>
						</div>

						{/* Video Metadata */}
						{videoMetadata && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span>{formatDuration(videoMetadata.duration)}</span>
								</div>
								<div className="flex items-center gap-2">
									<Settings className="h-4 w-4 text-muted-foreground" />
									<span>{videoMetadata.width}×{videoMetadata.height}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">Size:</span>
									<span>{formatFileSize(0)}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">Type:</span>
									<span>Video</span>
								</div>
							</div>
						)}

						{/* Thumbnail Preview */}
						{thumbnailUrl && (
							<div className="space-y-2">
								<p className="text-sm font-medium">Generated Thumbnail:</p>
								<div className="relative w-32 h-20 rounded border overflow-hidden">
									<img
										src={thumbnailUrl}
										alt="Video thumbnail"
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Empty State */}
				{!previewUrl && !isUploading && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Video className="h-4 w-4" />
						<span>No video uploaded yet</span>
					</div>
				)}

				{/* Error State */}
				{!previewUrl && !isUploading && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<AlertCircle className="h-4 w-4" />
						<span>Upload a video to get started</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
