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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getInitials, getColorFromName } from "@/lib/avatar-utils";

interface AvatarUploadProps {
	userName: string;
	currentAvatarUrl?: string | null;
	onAvatarUpdate?: (avatarUrl: string) => void;
	size?: number;
	className?: string;
}

export function AvatarUpload({
	userName,
	currentAvatarUrl,
	onAvatarUpdate,
	size = 100,
	className = "",
}: AvatarUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			// Validate file size (1MB limit)
			if (file.size > 1024 * 1024) {
				toast.error("Image must be smaller than 1MB");
				return;
			}

			setIsUploading(true);

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string);
			};
			reader.readAsDataURL(file);

			// Upload to UploadThing
			try {
				const formData = new FormData();
				formData.append("file", file);

				// Upload to the specific avatar endpoint
				const response = await fetch("/api/uploadthing?endpoint=avatarImage", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Upload failed");
				}

				const result = await response.json();

				if (result?.url) {
					setPreviewUrl(result.url);
					onAvatarUpdate?.(result.url);
					toast.success("Avatar uploaded successfully!");
				} else {
					throw new Error("No URL returned");
				}
			} catch (error) {
				console.error("Upload failed:", error);
				setPreviewUrl(null);
				toast.error("Failed to upload avatar. Please try again.");
			} finally {
				setIsUploading(false);
			}
		},
		[onAvatarUpdate]
	);

	const clearAvatar = () => {
		setPreviewUrl(null);
		onAvatarUpdate?.(null);
	};

	const displayUrl = previewUrl || currentAvatarUrl;

	return (
		<Card className={`w-fit ${className}`}>
			<CardContent className="p-6">
				<div className="flex flex-col items-center space-y-4">
					{/* Avatar Display */}
					<div className="relative">
						<Avatar
							className="ring-4 ring-background shadow-lg"
							style={{ width: size, height: size, minWidth: size, minHeight: size }}
						>
							{displayUrl ? (
								<AvatarImage
									src={displayUrl}
									alt={`${userName}'s avatar`}
									className="object-cover"
								/>
							) : (
								<AvatarFallback
									className="text-lg font-bold"
									style={{
										backgroundColor: getColorFromName(userName),
										color: 'white',
										fontSize: size * 0.4,
									}}
								>
									{getInitials(userName)}
								</AvatarFallback>
							)}
						</Avatar>

						{/* Upload Button */}
						<Button
							size="icon"
							variant="secondary"
							className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
							onClick={() => {
								const input = document.createElement("input");
								input.type = "file";
								input.accept = "image/*";
								input.onchange = (e) => {
									handleFileSelect((e.target as HTMLInputElement).files);
								};
								input.click();
							}}
							disabled={isUploading}
						>
							{isUploading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Camera className="h-4 w-4" />
							)}
						</Button>

						{/* Clear Button (only show if there's an uploaded image) */}
						{previewUrl && (
							<Button
								size="icon"
								variant="destructive"
								className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
								onClick={clearAvatar}
								disabled={isUploading}
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>

					{/* Upload Instructions */}
					<div className="text-center space-y-2">
						<p className="text-sm font-medium">
							{previewUrl ? "Avatar Preview" : "Upload Avatar"}
						</p>
						<p className="text-xs text-muted-foreground">
							Click the camera icon to upload a new avatar
						</p>
						<p className="text-xs text-muted-foreground">
							Max size: 1MB • JPG, PNG, GIF, WebP
						</p>
					</div>

					{/* Upload Status */}
					{isUploading && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Uploading...
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
