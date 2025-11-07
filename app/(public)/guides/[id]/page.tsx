/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Star, BookOpen, Play, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/guides/markdown-renderer";

const getDifficultyColor = (difficulty: string) => {
	switch (difficulty) {
		case "beginner":
			return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
		case "intermediate":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
		case "advanced":
			return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
		default:
			return "bg-muted text-muted-foreground";
	}
};

const getTypeIcon = (type: string) => {
	switch (type) {
		case "tutorial":
			return <Play className="w-5 h-5" />;
		case "guide":
			return <BookOpen className="w-5 h-5" />;
		case "documentation":
			return <FileText className="w-5 h-5" />;
		default:
			return <BookOpen className="w-5 h-5" />;
	}
};

export default function GuideDetailPage() {
	const params = useParams();
	const router = useRouter();
	const guideId = parseInt(params.id as string);

	// Fetch guide from API
	const { data: guideData, isLoading, error } = useQuery({
		queryKey: ['guide', guideId],
		queryFn: async () => {
			const response = await fetch(`/api/guides/${guideId}`);
			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error('Failed to fetch guide');
			}
			const data = await response.json();
			return data.data;
		},
		retry: 2,
		staleTime: 5 * 60 * 1000,
	});

	const guide = guideData;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-6 py-16">
					<div className="animate-pulse space-y-8">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="h-12 bg-muted rounded"></div>
						<div className="h-64 bg-muted rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !guide) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-6 py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center"
					>
						<AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
						<h1 className="text-3xl font-bold mb-4 text-foreground">
							Guide Not Found
						</h1>
						<p className="text-muted-foreground mb-8">
							{error instanceof Error ? error.message : "The guide you're looking for doesn't exist or has been removed."}
						</p>
						<Button asChild>
							<Link href="/guides">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Guides
							</Link>
						</Button>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-6 py-8">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-6"
				>
					<Button variant="ghost" asChild>
						<Link href="/guides">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Guides
						</Link>
					</Button>
				</motion.div>

				{/* Guide Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card className="mb-8">
						<CardHeader>
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
										{getTypeIcon(guide.type)}
									</div>
									<div>
										<Badge variant="secondary" className="mb-2">
											{guide.type}
										</Badge>
										<CardTitle className="text-3xl">{guide.title}</CardTitle>
									</div>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<Badge className={getDifficultyColor(guide.difficulty)}>
									{guide.difficulty}
								</Badge>
								{guide.duration && (
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Clock className="w-4 h-4" />
										<span>{guide.duration}</span>
									</div>
								)}
								{guide.author && (
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<User className="w-4 h-4" />
										<span>{typeof guide.author === 'object' ? guide.author.name : guide.author}</span>
									</div>
								)}
								{guide.rating && (
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Star className="w-4 h-4 text-yellow-500 fill-current" />
										<span>{typeof guide.rating === 'number' && guide.rating > 10 ? (guide.rating / 10).toFixed(1) : guide.rating}</span>
									</div>
								)}
								{guide.viewCount !== undefined && (
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<span>{guide.viewCount} views</span>
									</div>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-lg text-foreground/80">
								{guide.description}
							</p>
						</CardContent>
					</Card>
				</motion.div>

				{/* Guide Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Card>
						<CardContent className="p-8">
							{guide.content ? (
								<MarkdownRenderer content={guide.content} />
							) : (
								<div className="text-center py-12">
									<BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-foreground mb-2">
										Content Not Available
									</h3>
									<p className="text-muted-foreground mb-6">
										This guide content is not currently available. Please explore our other guides or contact support for assistance.
									</p>
									<div className="flex flex-col sm:flex-row gap-3 justify-center">
										<Button asChild>
											<Link href="/guides">
												<ArrowLeft className="mr-2 h-4 w-4" />
												Back to Guides
											</Link>
										</Button>
										<Button variant="outline" asChild>
											<Link href="/support">
												Contact Support
											</Link>
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Navigation */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-8 flex justify-center"
				>
					<Button asChild>
						<Link href="/guides">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to All Guides
						</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}

