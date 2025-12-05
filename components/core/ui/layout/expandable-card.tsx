/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert-simple";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/core/ui/layout/tooltip";
import { useExpandable } from "@/hooks/use-expandable";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import {
	AlertCircle,
	Github,
	Loader2,
	Clock,
	Star,
	GitBranch,
	Users,
	CheckCircle2,
	MessageSquare,
} from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { logger } from '@/lib/logger';

interface ProjectStatusCardProps {
	title?: string;
	progress?: number;
	dueDate?: string;
	contributors?: Array<{ name: string; image?: string }>;
	tasks?: Array<{ title: string; completed: boolean }>;
	githubStars?: number;
	openIssues?: number;
	projectId?: string;
	onRefresh?: () => void;
	className?: string;
}

interface ProjectData {
	id: string;
	title: string;
	progress: number;
	dueDate: string;
	contributors: Array<{ name: string; image?: string }>;
	tasks: Array<{ title: string; completed: boolean }>;
	githubStars: number;
	openIssues: number;
	status: string;
	team: string;
	tech: string;
	repository?: string;
	budget?: string;
	priority: string;
	updatedAt?: string;
	createdAt?: string;
}

export function ProjectStatusCard({
	title,
	progress = 0,
	dueDate,
	contributors = [],
	tasks = [],
	githubStars = 0,
	openIssues = 0,
	projectId,
	onRefresh,
	className,
}: ProjectStatusCardProps) {
	const { isExpanded, toggleExpand } = useExpandable();
	const contentRef = useRef<HTMLDivElement>(null);
	const animatedHeight = useMotionValue<number | "auto">("auto");
	const [data, setData] = useState<ProjectData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch project data from API
	const fetchProjectData = async () => {
		if (!projectId) return;

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/projects/status?projectId=${projectId}`,
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch project data: ${response.status}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to fetch project data");
			}

			if (result.data && result.data.length > 0) {
				setData(result.data[0]);
			}
		} catch (err) {
			logger.error("Error fetching project data:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load project data",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (projectId) {
			fetchProjectData();
		}
	}, [projectId]);

	useEffect(() => {
		if (contentRef.current && isExpanded) {
			animatedHeight.set(contentRef.current.scrollHeight);
		} else {
			animatedHeight.set(0);
		}
	}, [isExpanded, animatedHeight, data, loading, error]);

	// Use provided props or API data
	const displayData = data || {
		id: projectId || "",
		title: title || "Project",
		progress,
		dueDate: dueDate || new Date().toISOString().split("T")[0],
		contributors,
		tasks,
		githubStars,
		openIssues,
		status: "active",
		team: "Team",
		tech: "Technology",
		priority: "medium",
	};

	const handleRetry = () => {
		if (onRefresh) {
			onRefresh();
		} else {
			fetchProjectData();
		}
	};

	if (error && !data) {
		return (
			<Card className={`w-full max-w-md ${className}`}>
				<CardContent className="pt-6">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="flex items-center justify-between">
							<span>{error}</span>
							<Button variant="outline" size="sm" onClick={handleRetry}>
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={`w-full max-w-md cursor-pointer transition-all duration-300 hover:shadow-lg ${className}`}
			onClick={toggleExpand}
		>
			<CardHeader className="space-y-1">
				<div className="flex justify-between items-start w-full">
					<div className="space-y-2">
						<Badge
							variant="secondary"
							className={
								displayData.progress === 100
									? "bg-green-100 text-green-600"
									: "bg-blue-100 text-blue-600"
							}
						>
							{displayData.progress === 100 ? "Completed" : "In Progress"}
						</Badge>
						<h3 className="text-2xl font-semibold">{displayData.title}</h3>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="icon" variant="outline" className="h-8 w-8">
									<Github className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>View on GitHub</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-gray-600">
							<span>Progress</span>
							<span>{displayData.progress}%</span>
						</div>
						<ProgressBar value={displayData.progress} className="h-2" />
					</div>

					{loading && (
						<div className="flex items-center justify-center py-4">
							<Loader2 className="h-6 w-6 animate-spin" />
							<span className="ml-2 text-sm text-gray-600">Loading...</span>
						</div>
					)}

					<motion.div
						animate={{ height: isExpanded ? (contentRef.current?.scrollHeight ?? "auto") : 0 }}
						transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
						className="overflow-hidden"
					>
						<div ref={contentRef}>
							<AnimatePresence>
								{isExpanded && !loading && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="space-y-4 pt-2"
									>
										<div className="flex items-center justify-between text-sm text-gray-600">
											<div className="flex items-center">
												<Clock className="h-4 w-4 mr-2" />
												<span>Due {displayData.dueDate}</span>
											</div>
											<div className="flex items-center gap-4">
												<div className="flex items-center">
													<Star className="h-4 w-4 mr-1 text-yellow-400" />
													<span>{displayData.githubStars}</span>
												</div>
												<div className="flex items-center">
													<GitBranch className="h-4 w-4 mr-1" />
													<span>{displayData.openIssues} issues</span>
												</div>
											</div>
										</div>

										{displayData.contributors.length > 0 && (
											<div className="space-y-2">
												<h4 className="font-medium text-sm flex items-center">
													<Users className="h-4 w-4 mr-2" />
													Contributors
												</h4>
												<div className="flex -space-x-2">
													{displayData.contributors.map(
														(contributor, index) => (
															<TooltipProvider key={index}>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<Avatar className="border-2 border-white">
																			<AvatarImage
																				src={
																					contributor.image ||
																					"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=80"
																				}
																				alt={contributor.name}
																			/>
																			<AvatarFallback>
																				{contributor.name[0]}
																			</AvatarFallback>
																		</Avatar>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>{contributor.name}</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														),
													)}
												</div>
											</div>
										)}

										{displayData.tasks.length > 0 && (
											<div className="space-y-2">
												<h4 className="font-medium text-sm">Recent Tasks</h4>
												{displayData.tasks.map((task, index) => (
													<div
														key={index}
														className="flex items-center justify-between text-sm"
													>
														<span className="text-gray-600">{task.title}</span>
														{task.completed && (
															<CheckCircle2 className="h-4 w-4 text-green-500" />
														)}
													</div>
												))}
											</div>
										)}

										<div className="space-y-2">
											<Button className="w-full">
												<MessageSquare className="h-4 w-4 mr-2" />
												View Discussion
											</Button>
										</div>

										{error && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription className="flex items-center justify-between">
													<span>{error}</span>
													<Button
														variant="outline"
														size="sm"
														onClick={handleRetry}
													>
														Retry
													</Button>
												</AlertDescription>
											</Alert>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</div>
			</CardContent>

			<CardFooter>
				<div className="flex items-center justify-between w-full text-sm text-gray-600">
					<span>
						Last updated:{" "}
						{displayData.updatedAt
							? new Date(displayData.updatedAt).toLocaleDateString()
							: "Recently"}
					</span>
					<span>{displayData.openIssues} open issues</span>
				</div>
			</CardFooter>
		</Card>
	);
}
