/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cn } from "@/lib/utils";
import {
	Bookmark,
	Heart,
	Link as LinkIcon,
	MessageCircle,
	Share2,
} from "lucide-react";

interface SocialPostCardProps {
	id?: string | number;
	author?: {
		name?: string;
		username?: string;
		avatar?: string;
		timeAgo?: string;
	};
	content?: {
		text?: string;
		link?: {
			title?: string;
			description?: string;
			icon?: React.ReactNode;
		};
	};
	engagement?: {
		likes?: number;
		comments?: number;
		shares?: number;
		isLiked?: boolean;
		isBookmarked?: boolean;
	};
	onLike?: () => void;
	onComment?: () => void;
	onShare?: () => void;
	onBookmark?: () => void;
	className?: string;
}

const defaultProps: SocialPostCardProps = {
	author: {
		name: "Anonymous User",
		username: "user",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
		timeAgo: "Just now",
	},
	content: {
		text: "Share something interesting...",
		link: {
			title: "Link Preview",
			description: "Link description will appear here",
			icon: <LinkIcon className="w-5 h-5 text-blue-500" />,
		},
	},
	engagement: {
		likes: 0,
		comments: 0,
		shares: 0,
		isLiked: false,
		isBookmarked: false,
	},
};

export default function SocialPostCard({
	author = defaultProps.author,
	content = defaultProps.content,
	engagement = defaultProps.engagement,
	onLike,
	onComment,
	onShare,
	onBookmark,
	id = author?.username || "card-02",
	className,
}: SocialPostCardProps) {
	return (
		<div
			className={cn(
				"w-full max-w-lg mx-auto rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 shadow-xl backdrop-blur-lg transition-all",
				className,
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-5 pt-4">
				<div className="flex items-center gap-3">
					<img
						src={author?.avatar}
						alt={author?.name}
						className="w-11 h-11 rounded-full border border-zinc-300 dark:border-zinc-600 object-cover"
					/>
					<div>
						<p className="text-sm font-semibold text-zinc-900 dark:text-white">
							{author?.name}
						</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							@{author?.username} · {author?.timeAgo}
						</p>
					</div>
				</div>
				<div>
					<Bookmark
						onClick={onBookmark}
						className={cn(
							"w-5 h-5 cursor-pointer transition hover:text-yellow-500",
							engagement?.isBookmarked ? "text-yellow-500" : "text-zinc-400",
						)}
					/>
				</div>
			</div>

			{/* Content */}
			<div className="px-5 py-4 text-zinc-700 dark:text-zinc-300 text-base">
				{content?.text}
			</div>

			{/* Optional Link Box */}
			{content?.link && (
				<div className="mx-5 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/40 transition">
					<div className="flex items-start gap-3">
						<div className="p-2 rounded-md bg-white dark:bg-zinc-700">
							{content.link.icon}
						</div>
						<div>
							<h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
								{content.link.title}
							</h4>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								{content.link.description}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Reactions Footer */}
			<div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700 text-sm text-center">
				<button
					onClick={onLike}
					className={cn(
						"py-3 flex items-center justify-center gap-2 transition hover:bg-rose-50 dark:hover:bg-rose-900",
						engagement?.isLiked
							? "text-rose-600 font-semibold"
							: "text-zinc-500 dark:text-zinc-400",
					)}
				>
					<Heart
						className={cn("w-4 h-4", engagement?.isLiked && "fill-current")}
					/>
					{engagement?.likes || 0}
				</button>
				<button
					onClick={onComment}
					className="py-3 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
				>
					<MessageCircle className="w-4 h-4" />
					{engagement?.comments || 0}
				</button>
				<button
					onClick={onShare}
					className="py-3 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 hover:bg-green-50 dark:hover:bg-green-900 transition"
				>
					<Share2 className="w-4 h-4" />
					{engagement?.shares || 0}
				</button>
			</div>
		</div>
	);
}
