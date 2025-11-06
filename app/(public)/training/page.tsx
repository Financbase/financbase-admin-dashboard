/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import {
	BookOpen,
	Video,
	Users,
	Clock,
	CheckCircle2,
	ArrowRight,
	GraduationCap,
	Target,
	Zap,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface TrainingProgram {
	id: string;
	title: string;
	description: string | null;
	duration: string | null;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
	icon: string | null;
	href: string | null;
	topics: string[] | null;
	progress?: {
		id: string;
		status: "not_started" | "in_progress" | "completed";
		progress: string | null;
		completedAt: Date | null;
	};
}

interface LearningPath {
	id: string;
	title: string;
	description: string | null;
	duration: string | null;
	icon: string | null;
	programIds: string[] | null;
	progress?: {
		id: string;
		status: "not_started" | "in_progress" | "completed";
		progress: string | null;
	};
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ReactNode> = {
	Zap: <Zap className="w-8 h-8" />,
	Target: <Target className="w-8 h-8" />,
	BookOpen: <BookOpen className="w-8 h-8" />,
	Users: <Users className="w-8 h-8" />,
	GraduationCap: <GraduationCap className="w-8 h-8" />,
	Video: <Video className="w-8 h-8" />,
};

const pathIconMap: Record<string, React.ReactNode> = {
	Users: <Users className="w-6 h-6" />,
	GraduationCap: <GraduationCap className="w-6 h-6" />,
	Target: <Target className="w-6 h-6" />,
};

export default function TrainingPage() {
	const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
	const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTrainingData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch programs with progress
				const programsResponse = await fetch("/api/training/programs-with-progress");
				if (!programsResponse.ok) {
					throw new Error("Failed to fetch training programs");
				}
				const programsData = await programsResponse.json();
				if (!programsData.success) {
					throw new Error(programsData.error || "Failed to fetch training programs");
				}
				setTrainingPrograms(programsData.data || []);

				// Fetch learning paths with progress
				const pathsResponse = await fetch("/api/training/paths-with-progress");
				if (!pathsResponse.ok) {
					throw new Error("Failed to fetch learning paths");
				}
				const pathsData = await pathsResponse.json();
				if (!pathsData.success) {
					throw new Error(pathsData.error || "Failed to fetch learning paths");
				}
				setLearningPaths(pathsData.data || []);
			} catch (err) {
				console.error("Error fetching training data:", err);
				setError(err instanceof Error ? err.message : "Failed to load training data");
				// Fallback to empty arrays on error
				setTrainingPrograms([]);
				setLearningPaths([]);
			} finally {
				setLoading(false);
			}
		};

		fetchTrainingData();
	}, []);

	const handleStartTraining = async (programId: string) => {
		try {
			const response = await fetch("/api/training/progress", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					programId,
					status: "in_progress",
					progress: 0,
				}),
			});

			if (response.ok) {
				// Refresh the data
				const programsResponse = await fetch("/api/training/programs-with-progress");
				if (programsResponse.ok) {
					const programsData = await programsResponse.json();
					if (programsData.success) {
						setTrainingPrograms(programsData.data || []);
					}
				}
			}
		} catch (err) {
			console.error("Error starting training:", err);
		}
	};

	const getIcon = (iconName: string | null) => {
		if (!iconName) return <BookOpen className="w-8 h-8" />;
		return iconMap[iconName] || <BookOpen className="w-8 h-8" />;
	};

	const getPathIcon = (iconName: string | null) => {
		if (!iconName) return <Users className="w-6 h-6" />;
		return pathIconMap[iconName] || <Users className="w-6 h-6" />;
	};

	const getStatusBadge = (status?: string) => {
		if (!status || status === "not_started") return null;
		if (status === "completed") {
			return (
				<span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
					Completed
				</span>
			);
		}
		return (
			<span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-400">
				In Progress
			</span>
		);
	};

	const benefits = [
		"Self-paced learning at your own speed",
		"Step-by-step guides with screenshots",
		"Comprehensive training materials",
		"Role-based learning paths",
		"Video tutorials for visual learners",
		"Troubleshooting guides and support",
	];

	// Show loading state
	if (loading) {
		return (
			<PublicPageTemplate
				hero={{
					title: "Training Programs",
					description: "Comprehensive training materials to help you and your team master Financbase.",
				}}
			>
				<PublicSection title="Loading Training Programs...">
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
					</div>
				</PublicSection>
			</PublicPageTemplate>
		);
	}

	// Show error state
	if (error && trainingPrograms.length === 0) {
		return (
			<PublicPageTemplate
				hero={{
					title: "Training Programs",
					description: "Comprehensive training materials to help you and your team master Financbase.",
				}}
			>
				<PublicSection title="Error Loading Training">
					<div className="text-center py-12">
						<p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
						<Button onClick={() => window.location.reload()}>Retry</Button>
					</div>
				</PublicSection>
			</PublicPageTemplate>
		);
	}

	return (
		<PublicPageTemplate
			hero={{
				title: "Training Programs",
				description: "Comprehensive training materials to help you and your team master Financbase. From beginner guides to advanced features, we've got you covered.",
				primaryAction: {
					text: "Start Learning",
					href: "#programs",
				},
				secondaryAction: {
					text: "View Documentation",
					href: "/docs",
				},
			}}
			cta={{
				title: "Ready to Master Financbase?",
				description: "Start your training journey today and unlock the full potential of Financbase.",
				primaryAction: {
					text: "Browse Training Materials",
					href: "#programs",
				},
				secondaryAction: {
					text: "Get Support",
					href: "/support",
				},
			}}
		>
			{/* Training Programs Section */}
			<PublicSection
				id="programs"
				title="Training Programs"
				description="Choose from our comprehensive training programs designed for different skill levels and roles"
			>
				<PublicGrid columns={3}>
					{trainingPrograms.length > 0 ? (
						trainingPrograms.map((program) => {
							const progressValue = program.progress
								? Number.parseFloat(program.progress.progress || "0")
								: 0;
							const isCompleted = program.progress?.status === "completed";

							return (
								<PublicCard key={program.id} className="h-full">
									<div className="flex flex-col h-full">
										<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
											{getIcon(program.icon)}
										</div>
										<div className="flex items-center gap-2 mb-3">
											<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
												{program.title}
											</h3>
											{getStatusBadge(program.progress?.status)}
										</div>
										<div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
											{program.duration && (
												<span className="flex items-center gap-1">
													<Clock className="w-4 h-4" />
													{program.duration}
												</span>
											)}
											<span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
												{program.difficulty}
											</span>
										</div>
										{program.description && (
											<p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
												{program.description}
											</p>
										)}
										{program.progress && progressValue > 0 && (
											<div className="mb-4">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Progress
													</span>
													<span className="text-sm text-gray-600 dark:text-gray-400">
														{Math.round(progressValue)}%
													</span>
												</div>
												<Progress value={progressValue} className="h-2" />
											</div>
										)}
										{program.topics && program.topics.length > 0 && (
											<div className="mb-4">
												<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Topics covered:
												</p>
												<ul className="space-y-1">
													{program.topics.map((topic, index) => (
														<li
															key={index}
															className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
														>
															<CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
															{topic}
														</li>
													))}
												</ul>
											</div>
										)}
										{program.href ? (
											<Link href={program.href}>
												<Button
													className="w-full mt-auto"
													variant={isCompleted ? "outline" : "default"}
													onClick={() => handleStartTraining(program.id)}
												>
													{isCompleted ? "Review Training" : "Start Training"}
													<ArrowRight className="w-4 h-4 ml-2" />
												</Button>
											</Link>
										) : (
											<Button
												className="w-full mt-auto"
												variant={isCompleted ? "outline" : "default"}
												onClick={() => handleStartTraining(program.id)}
											>
												{isCompleted ? "Review Training" : "Start Training"}
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										)}
									</div>
								</PublicCard>
							);
						})
					) : (
						<div className="col-span-3 text-center py-12">
							<p className="text-gray-600 dark:text-gray-400">
								No training programs available at this time.
							</p>
						</div>
					)}
				</PublicGrid>
			</PublicSection>

			{/* Learning Paths Section */}
			<PublicSection
				title="Learning Paths by Role"
				description="Structured learning paths designed for specific roles and responsibilities"
				background="muted"
			>
				<PublicGrid columns={3}>
					{learningPaths.length > 0 ? (
						learningPaths.map((path) => {
							const progressValue = path.progress
								? Number.parseFloat(path.progress.progress || "0")
								: 0;
							const isCompleted = path.progress?.status === "completed";

							return (
								<PublicCard key={path.id} className="h-full">
									<div className="flex flex-col h-full">
										<div className="w-16 h-16 mb-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
											{getPathIcon(path.icon)}
										</div>
										<div className="flex items-center gap-2 mb-3">
											<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
												{path.title}
											</h3>
											{getStatusBadge(path.progress?.status)}
										</div>
										{path.description && (
											<p className="text-gray-600 dark:text-gray-400 mb-4">
												{path.description}
											</p>
										)}
										{path.duration && (
											<div className="mb-4">
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
													Duration: {path.duration}
												</span>
											</div>
										)}
										{path.progress && progressValue > 0 && (
											<div className="mb-4">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Progress
													</span>
													<span className="text-sm text-gray-600 dark:text-gray-400">
														{Math.round(progressValue)}%
													</span>
												</div>
												<Progress value={progressValue} className="h-2" />
											</div>
										)}
										{path.programIds && path.programIds.length > 0 && (
											<div className="mb-4">
												<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Includes {path.programIds.length} program
													{path.programIds.length !== 1 ? "s" : ""}
												</p>
											</div>
										)}
										<Link href="/docs">
											<Button
												variant={isCompleted ? "default" : "outline"}
												className="w-full mt-auto"
											>
												{isCompleted ? "Review Path" : "View Full Path"}
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</div>
								</PublicCard>
							);
						})
					) : (
						<div className="col-span-3 text-center py-12">
							<p className="text-gray-600 dark:text-gray-400">
								No learning paths available at this time.
							</p>
						</div>
					)}
				</PublicGrid>
			</PublicSection>

			{/* Benefits Section */}
			<PublicSection
				title="Why Choose Our Training Programs"
				description="Comprehensive, accessible, and designed for success"
			>
				<PublicGrid columns={3}>
					{benefits.map((benefit, index) => (
						<PublicCard key={index}>
							<div className="flex items-start space-x-3">
								<CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
								<p className="text-gray-700 dark:text-gray-300 font-medium">
									{benefit}
								</p>
							</div>
						</PublicCard>
					))}
				</PublicGrid>
			</PublicSection>

			{/* Resources Section */}
			<PublicSection
				title="Additional Resources"
				description="Explore more learning materials and support options"
				background="muted"
			>
				<PublicGrid columns={3}>
					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<Video className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Watch step-by-step video tutorials for visual learners
							</p>
							<Link href="/docs">
								<Button variant="outline">
									Watch Videos
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>

					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<BookOpen className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">User Guides</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Comprehensive guides for getting started and workflows
							</p>
							<Link href="/guides">
								<Button variant="outline">
									Read Guides
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>

					<PublicCard>
						<div className="flex flex-col items-center text-center">
							<Users className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-lg font-semibold mb-2">Get Support</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Need help? Contact our support team for assistance
							</p>
							<Link href="/support">
								<Button variant="outline">
									Contact Support
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>
					</PublicCard>
				</PublicGrid>
			</PublicSection>
		</PublicPageTemplate>
	);
}

