/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { CheckCircle, Code, Key, MessageCircle, XCircle } from "lucide-react";
("use client");

import { useEffect, useState } from "react";
import RuixenCard from "./project-pulse-tracker";
import { logger } from '@/lib/logger';

interface ProjectPulseData {
	projectName: string;
	description: string;
	teamMembers: Array<{
		name: string;
		role: string;
		avatar: string;
		status: "online" | "busy" | "offline";
	}>;
	milestones: Array<{
		title: string;
		dueDate: string;
		completed: boolean;
	}>;
}

interface ProjectPulseTrackerProps {
	projectId?: string;
}

export default function ProjectPulseTracker({
	projectId,
}: ProjectPulseTrackerProps) {
	const [projectData, setProjectData] = useState<ProjectPulseData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProjectData = async () => {
			try {
				setLoading(true);
				setError(null);

				const endpoint = projectId
					? `/api/project-pulse/${projectId}`
					: "/api/project-pulse";

				const response = await fetch(endpoint);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch project data: ${response.statusText}`,
					);
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || "Failed to fetch project data");
				}

				setProjectData(result.data);
			} catch (err) {
				logger.error("Error fetching project data:", err);
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchProjectData();
	}, [projectId]);

	if (loading) {
		return (
			<div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/30 dark:border-zinc-800/30 rounded-3xl p-6 shadow-md dark:shadow-zinc-900">
				<div className="animate-pulse">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-6 h-6 bg-zinc-300 dark:bg-zinc-700 rounded" />
						<div className="h-6 bg-zinc-300 dark:bg-zinc-700 rounded w-48" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
						<div className="space-y-4">
							<div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-20" />
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
								>
									<div className="w-6 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
									<div className="space-y-2">
										<div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-32" />
										<div className="h-3 bg-zinc-300 dark:bg-zinc-700 rounded w-16" />
									</div>
								</div>
							))}
						</div>
						<div className="space-y-4">
							<div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-24" />
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
								>
									<div className="w-10 h-10 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
									<div className="space-y-2">
										<div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-24" />
										<div className="h-3 bg-zinc-300 dark:bg-zinc-700 rounded w-20" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !projectData) {
		return (
			<div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/30 dark:border-zinc-800/30 rounded-3xl p-6 shadow-md dark:shadow-zinc-900">
				<div className="text-center text-red-600 dark:text-red-400">
					<p>Error loading project data: {error || "No data available"}</p>
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
						Please try refreshing the page or check your connection.
					</p>
				</div>
			</div>
		);
	}

	return (
		<RuixenCard
			projectName={projectData.projectName}
			description={projectData.description}
			teamMembers={projectData.teamMembers}
			milestones={projectData.milestones}
		/>
	);
}
