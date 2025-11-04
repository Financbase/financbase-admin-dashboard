/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, BookmarkPlus } from 'lucide-react';

interface BlogCommunityHubCardProps {
	title: string;
	excerpt: string;
	author: {
		name: string;
		avatar?: string;
		role?: string;
	};
	category: string;
	readTime: string;
	publishedAt: string;
	likes?: number;
	comments?: number;
	tags?: string[];
	onLike?: () => void;
	onComment?: () => void;
	onShare?: () => void;
	onBookmark?: () => void;
}

export function BlogCommunityHubCard({
	title,
	excerpt,
	author,
	category,
	readTime,
	publishedAt,
	likes = 0,
	comments = 0,
	tags = [],
	onLike,
	onComment,
	onShare,
	onBookmark,
}: BlogCommunityHubCardProps) {
	return (
		<Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<Badge variant="secondary" className="text-xs">
								{category}
							</Badge>
							<span className="text-xs text-muted-foreground">
								{readTime} read
							</span>
						</div>
						<CardTitle className="text-lg leading-tight line-clamp-2">
							{title}
						</CardTitle>
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col">
				<CardDescription className="flex-1 mb-4 line-clamp-3">
					{excerpt}
				</CardDescription>

				{/* Tags */}
				{tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-4">
						{tags.slice(0, 3).map((tag, index) => (
							<Badge key={index} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))}
						{tags.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{tags.length - 3}
							</Badge>
						)}
					</div>
				)}

				{/* Author and Date */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarImage src={author.avatar} alt={author.name} />
							<AvatarFallback className="text-xs">
								{author.name.split(' ').map(n => n[0]).join('')}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{author.name}</span>
							<span className="text-xs text-muted-foreground">
								{author.role && `${author.role} • `}
								{publishedAt}
							</span>
						</div>
					</div>
				</div>

				{/* Engagement Actions */}
				<div className="flex items-center justify-between pt-3 border-t">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={onLike}
							className="flex items-center gap-1"
						>
							<Heart className="h-4 w-4" />
							<span className="text-xs">{likes}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onComment}
							className="flex items-center gap-1"
						>
							<MessageCircle className="h-4 w-4" />
							<span className="text-xs">{comments}</span>
						</Button>
					</div>

					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" onClick={onShare}>
							<Share2 className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="sm" onClick={onBookmark}>
							<BookmarkPlus className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
