/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion } from "framer-motion";
import {
	BookOpen,
	Check,
	Copy,
	Eye,
	Heart,
	Key,
	LayoutDashboard,
	Mail,
	TrendingUp,
	Users,
} from "lucide-react";
import * as React from "react";

// Shadcn UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Import new animation library
import {
	AnimatedCard,
	AnimatedProgressBar,
	FadeInUp,
	animationPresets,
	cardVariants,
	fadeInUpVariants,
	smoothTransition,
	staggerContainerVariants,
} from "@/lib/animations";

// Prop Types for the blog community component
interface BlogCommunityHubCardProps {
	// Main card details
	title: string;
	subtitle: string;
	subscriberCount: number;
	topAuthors: {
		name: string;
		role: string;
		avatar: string;
		articlesCount: number;
		totalViews: number;
	}[];

	// Newsletter subscription details
	newsletterLink: string;

	// Current newsletter growth details
	currentGrowth: {
		title: string;
		progress: number;
		newSubscribers: number;
	};

	// Featured articles list
	featuredArticles: {
		title: string;
		author: string;
		category: string;
		views: string;
	}[];

	className?: string;
}

/**
 * A responsive and animated card component to display blog community information.
 * It's adapted for blog authors/readers and shows engagement metrics.
 * Built with shadcn/ui and styled with Tailwind CSS.
 * Animations are handled by framer-motion.
 */
export function BlogCommunityHubCard({
	title,
	subtitle,
	subscriberCount,
	topAuthors,
	newsletterLink,
	currentGrowth,
	featuredArticles,
	className,
}: BlogCommunityHubCardProps) {
	const [hasCopied, setHasCopied] = React.useState(false);

	// Function to handle copying the newsletter link
	const copyToClipboard = () => {
		navigator.clipboard.writeText(newsletterLink).then(() => {
			setHasCopied(true);
			setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
		});
	};

	// Animation variants for framer-motion - now using optimized variants from library
	// Using the enhanced dashboard card preset with layout animations
	const cardVariants = {
		...animationPresets.dashboardCard,
		layout: true, // Enable layout animations for better performance
	};

	return (
		<AnimatedCard
			className="w-full max-w-2xl mx-auto"
			layoutId="blog-community-card"
		>
			<Card
				className={cn("overflow-hidden border-2", className)}
				style={{ willChange: "transform, opacity" }}
			>
				<CardHeader className="text-center p-6">
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.1 }}
					>
						<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
					</FadeInUp>
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.2 }}
					>
						<p className="text-sm text-muted-foreground">{subtitle}</p>
					</FadeInUp>
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.3 }}
					>
						<div className="flex justify-center -space-x-2 my-4">
							{topAuthors.map((author, index) => (
								<div key={index} className="relative group">
									<Avatar className="border-2 border-background">
										<AvatarImage src={author.avatar} alt={author.name} />
										<AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
										{author.name}
									</div>
								</div>
							))}
						</div>
					</FadeInUp>
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.4 }}
					>
						<p className="text-sm font-medium">
							Total Subscribers: {subscriberCount.toLocaleString()}
						</p>
					</FadeInUp>
				</CardHeader>

				<CardContent className="p-6 space-y-6">
					<Separator />

					{/* Newsletter Subscription Section */}
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.5 }}
					>
						<div className="space-y-3">
							<h2 className="font-semibold">Join Our Newsletter</h2>
							<p className="text-sm text-muted-foreground">
								Get the latest financial insights, product updates, and industry
								news delivered to your inbox.
							</p>
							<div className="flex flex-col sm:flex-row gap-2">
								<Input
									value={newsletterLink}
									readOnly
									className="flex-grow"
									aria-label="Newsletter Link"
								/>
								<Button onClick={copyToClipboard} className="w-full sm:w-auto">
									{hasCopied ? (
										<Check className="mr-2 h-4 w-4" />
									) : (
										<Copy className="mr-2 h-4 w-4" />
									)}
									{hasCopied ? "Copied!" : "Copy Newsletter Link"}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Join {currentGrowth.newSubscribers.toLocaleString()} new readers
								this month!
							</p>
						</div>
					</FadeInUp>

					<Separator />

					{/* Newsletter Growth Progress Section */}
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.6 }}
					>
						<div className="space-y-3">
							<h2 className="font-semibold">Newsletter Growth Progress</h2>
							<AnimatedProgressBar
								initial="hidden"
								animate="visible"
								variants={fadeInUpVariants}
								transition={{ delay: 0.8 }}
							>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full transition-all"
										style={{ width: `${currentGrowth.progress}%` }}
									/>
								</div>
							</AnimatedProgressBar>
							<div className="flex justify-between text-sm">
								<span className="font-medium text-foreground">
									{currentGrowth.title}
								</span>
								<span className="text-muted-foreground">
									Growth: {currentGrowth.progress}% this month
								</span>
							</div>
						</div>
					</FadeInUp>

					<Separator />

					{/* Featured Articles Section */}
					<FadeInUp
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.7 }}
					>
						<div className="space-y-4">
							<h2 className="font-semibold">Featured Articles</h2>
							<div className="space-y-3">
								{featuredArticles.map((article, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											delay: 0.8 + index * 0.1,
											...smoothTransition,
										}}
										whileHover={{
											scale: 1.02,
											x: 4,
											transition: { duration: 0.2 },
										}}
										className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
									>
										<div className="p-1.5 bg-primary/10 rounded-md">
											<BookOpen className="h-4 w-4 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm text-foreground truncate">
												{article.title}
											</h4>
											<p className="text-xs text-muted-foreground">
												by {article.author}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												{article.category}
											</Badge>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Eye className="h-3 w-3" />
												<span>{article.views}</span>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</FadeInUp>
				</CardContent>
			</Card>
		</AnimatedCard>
	);
}
