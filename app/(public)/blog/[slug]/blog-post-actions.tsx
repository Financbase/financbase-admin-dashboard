/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface BlogPostActionsProps {
	postId: number;
	initialLikeCount: number;
	slug: string;
	title: string;
}

export function BlogPostActions({
	postId,
	initialLikeCount,
	slug,
	title,
}: BlogPostActionsProps) {
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const [isLiked, setIsLiked] = useState(false);
	const [isSharing, setIsSharing] = useState(false);

	const handleLike = async () => {
		if (isLiked) return;

		try {
			// Optimistic update
			setIsLiked(true);
			setLikeCount((prev) => prev + 1);

			// Call API to increment like count
			const response = await fetch(`/api/blog/${postId}/like`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Revert optimistic update on error
				setIsLiked(false);
				setLikeCount((prev) => prev - 1);
				throw new Error("Failed to like post");
			}

			toast.success("Post liked!");
		} catch (error) {
			console.error("Error liking post:", error);
			toast.error("Failed to like post. Please try again.");
		}
	};

	const handleShare = async () => {
		if (isSharing) return;

		setIsSharing(true);

		const url = `${window.location.origin}/blog/${slug}`;
		const shareData = {
			title: title,
			text: `Check out this article: ${title}`,
			url: url,
		};

		try {
			// Use Web Share API if available
			if (navigator.share && navigator.canShare(shareData)) {
				await navigator.share(shareData);
				toast.success("Shared successfully!");
			} else {
				// Fallback: Copy to clipboard
				await navigator.clipboard.writeText(url);
				toast.success("Link copied to clipboard!");
			}
		} catch (error: any) {
			// User cancelled share or error occurred
			if (error.name !== "AbortError") {
				// Fallback: Copy to clipboard
				try {
					await navigator.clipboard.writeText(url);
					toast.success("Link copied to clipboard!");
				} catch (clipboardError) {
					console.error("Error sharing post:", clipboardError);
					toast.error("Failed to share. Please copy the link manually.");
				}
			}
		} finally {
			setIsSharing(false);
		}
	};

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					size="sm"
					onClick={handleLike}
					disabled={isLiked}
					className={isLiked ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400" : ""}
				>
					{isLiked ? (
						<>
							<Check className="h-4 w-4 mr-2" />
							Liked ({likeCount})
						</>
					) : (
						<>
							<Heart className="h-4 w-4 mr-2" />
							Like ({likeCount})
						</>
					)}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleShare}
					disabled={isSharing}
				>
					<Share2 className="h-4 w-4 mr-2" />
					{isSharing ? "Sharing..." : "Share"}
				</Button>
			</div>
		</div>
	);
}

